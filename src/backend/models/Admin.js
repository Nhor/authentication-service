const _ = require('lodash');
const utils = require('../utils');

class Admin {

  /**
   * Handle class instance initialization.
   * @param {Database} database - `Database` class instance.
   * @param {Redis} redis - `Redis` class instance.
   */
  constructor(database, redis) {
    this._database = database;
    this._redis = redis;
  }

  /**
   * Create a new admin.
   * @param {String} email - Admin email address.
   * @param {String} username - Admin username.
   * @param {String} password - Admin plain text password.
   * @return {Promise} Resolved promise with admin identifier on success,
   *                   rejected promise with error on failure.
   */
  create(email, username, password) {
    let sql = `INSERT INTO ${this._database.schema}.admin ` +
      `(email, username, password) VALUES ($1, $2, $3) ` +
      `RETURNING id;`;
    let args = [email, username];
    return Promise
      .all([
        this._database.doesExist('admin', {email: email}),
        this._database.doesExist('admin', {username: username})
      ])
      .then(doesExist => {
        if (doesExist[0])
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.EMAIL_IN_USE);
        else if (doesExist[1])
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.USERNAME_IN_USE);
        return utils.Crypt.hashPlainText(password);
      })
      .then(hashedPassword => this._database.execute(sql, _.concat(args, [hashedPassword])))
      .then(result => parseInt(_.get(_.first(result), 'id'), 10));
  }

  /**
   * Remove admin with given identifier.
   * @param {Number} id - Admin identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  remove(id) {
    let transaction = [{
      sql: `DELETE FROM ${this._database.schema}.admin_permission_xref WHERE admin_id = $1;`,
      args: [id]
    }, {
      sql: `DELETE FROM ${this._database.schema}.admin WHERE id = $1 RETURNING id;`,
      args: [id]
    }];
    return this._database
      .transaction(transaction)
      .then(results => {
        if (!_.get(_.first(_.nth(results, 1)), 'id'))
          throw new utils.Error.RecordNotFound(Error.Code.ADMIN_NOT_FOUND);
        return this._getSession(id);
      })
      .then(sessionId => sessionId ? this._deleteSession(id, sessionId) : undefined);
  }

  /**
   * Login admin with given credentials.
   * @param {String} username - Admin username or email (both are accepted).
   * @param {String} password - Plain text admin password.
   * @return {Promise} Resolved promise with session identifier on success,
   *                   rejected promise with error on failure.
   */
  login(username, password) {
    let admin;
    let sql = `SELECT id, password FROM ${this._database.schema}.admin ` +
      `WHERE email = $1 OR username = $1;`;
    let args = [username];
    return this._database
      .execute(sql, args)
      .then(res => {
        admin = _.first(res);
        if (!admin)
          throw new utils.Error.AuthorizationFailed(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
        return utils.Crypt.comparePlainTextWithHash(password, admin.password);
      })
      .then(match => {
        if (!match)
          throw new utils.Error.AuthorizationFailed(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
        return this._getSession(admin.id);
      })
      .then(session => session ? session : this._createSession(admin.id));
  }

  /**
   * Logout admin with given identifier and session identifier.
   * @param {Number} id - Admin identifier.
   * @param {String} sessionId - Admin session identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  logout(id, sessionId) {
    return this._deleteSession(id, sessionId);
  }

  /**
   * Authenticate admin with given session identifier.
   * @param {String} sessionId - Admin session identifier.
   * @return {Promise} Resolved promise with admin identifier on success,
   *                   rejected promise with error on failure.
   */
  authenticate(sessionId) {
    return this
      ._getId(sessionId)
      .then(adminId => {
        if (!adminId)
          throw new utils.Error.AuthenticationFailed(utils.Error.Code.INVALID_SESSION_ID);
        return adminId;
      });
  }

  /**
   * Create a new session for admin with given identifier.
   * @param {Number} id - Admin identifier.
   * @return {Promise} Resolved promise with session identifier on success,
   *                   rejected promise with error on failure.
   * @private
   */
  _createSession(id) {
    let sessionId;
    return utils.Crypt
      .generatePseudoRandomString(32)
      .then(pseudoRandomString => {
        sessionId = pseudoRandomString;
        return this._redis.transaction([
          ['set', `session:admin:${id}`, sessionId],
          ['set', `admin:session:${sessionId}`, id.toString()]
        ]);
      })
      .then(replies => sessionId);
  }

  /**
   * Delete existing session for admin with given identifier and session identifier.
   * @param {Number} id - Admin identifier.
   * @param {String} sessionId - Admin session identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   * @private
   */
  _deleteSession(id, sessionId) {
    return this._redis.transaction([
      ['del', `session:admin:${id}`],
      ['del', `admin:session:${sessionId}`]
    ]);
  }

  /**
   * Get admin session identifier from Redis.
   * @param {Number} id - Admin identifier.
   * @return {Promise} Resolved promise with admin session identifier on success,
   *                   rejected promise with error on failure.
   * @private
   */
  _getSession(id) {
    return this._redis
      .get(`session:admin:${id}`);
  }

  /**
   * Get admin identifier for given session identifier.
   * @param {String} sessionId - Admin session identifier.
   * @return {Promise} Resolved promise with admin identifier or `null` on success,
   *                   rejected promise with error on failure.
   * @private
   */
  _getId(sessionId) {
    return this._redis
      .get(`admin:session:${sessionId}`)
      .then(reply => reply ? parseInt(reply, 10) : reply);
  }
}

module.exports = Admin;
