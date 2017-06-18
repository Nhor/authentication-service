const _ = require('lodash');
const pg = require('pg');

class Database {

  /**
   * Handle class instance initialization.
   * @param {String} host - Database server host address.
   * @param {Number} port - Database server port.
   * @param {String} name - Database name.
   * @param {String} user - Database user.
   * @param {String} password - Database user password.
   * @param {String} schema - Database schema.
   */
  constructor(host, port, name, user, password, schema) {
    this._pool = new pg.Pool({
      host: host,
      port: port,
      database: name,
      user: user,
      password: password
    });
    this.schema = schema;
  }

  /**
   * Execute given SQL query with provided arguments.
   * @param {String} sql - SQL query to be executed.
   * @param {Array} [args] - Optional query arguments, defaults to `[]`.
   * @returns {Promise} Resolved promise with array of records on success,
   *                    rejected promise with error on failure.
   */
  execute(sql, args = []) {
    let result;
    return this._pool
      .connect()
      .then(client => client
        .query(sql, args)
        .then(res =>
          result = _.map(res.rows, row => _.mapKeys(row, (value, key) => _.camelCase(key))))
        .then(() => client.release())
        .then(() => result));
  }
}

module.exports = Database;
