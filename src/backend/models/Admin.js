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
   * Create a new session for admin with given identifier.
   * @param {Number} id - Admin identifier.
   * @return {Promise} Resolved promise with session identifier on success,
   *                   rejected promise with error on failure.
   * @private
   */
  _createSession(id) {
    let sessionIdentifier;
    return utils.Crypt
      .generatePseudoRandomString(32)
      .then(pseudoRandomString => {
        sessionIdentifier = pseudoRandomString;
        return this._redis.transaction([
          ['set', `session:admin:${id}`, sessionIdentifier],
          ['set', `admin:session:${sessionIdentifier}`, id.toString()]
        ]);
      })
      .then(replies => sessionIdentifier);
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
