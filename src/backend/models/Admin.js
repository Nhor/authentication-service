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
    let args = [email, username, password];
    return Promise
      .all([this._doesExist({email: email}), this._doesExist({username: username})])
      .then(doesExist => {
        if (doesExist[0])
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.EMAIL_IN_USE);
        else if (doesExist[1])
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.USERNAME_IN_USE);
        return utils.Crypt.hashPlainText(password);
      })
      .then(hashedPassword => this._database.execute(sql, args))
      .then(result => parseInt(_.get(_.first(result), 'id'), 10));
  }

  /**
   * Does admin with given conditions exist.
   * @param {Object} conditions - Object containing field names as keys and related values.
   * @return {Promise} Resolved promise with `true` if admin exists,
   *                   resolved promise with `false` if not.
   * @private
   */
  _doesExist(conditions) {
    let where = '';
    let args = [];
    _.each(conditions, (value, field) => {
      where += `${_.size(args) ? ' AND ' : ''}${field} = $${_.size(args) + 1}`;
      args.push(value);
    });
    let sql = `SELECT EXISTS(SELECT 1 FROM ${this._database.schema}.admin ` +
      `WHERE ${where});`;
    return this._database
      .execute(sql, args)
      .then(result => _.get(_.first(result.rows), 'exists'));
  }
}

module.exports = Admin;
