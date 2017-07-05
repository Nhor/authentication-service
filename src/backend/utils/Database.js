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
        .then(res => result = this._getRows(res))
        .then(() => client.release())
        .then(() => result));
  }

  /**
   * Perform a transaction with provided actions.
   * @param {Array} actions - Array containing objects with `sql` and `args` to execute.
   * @return {Promise} Resolved promise with array of consecutive results rows on success,
   *                   rejected promise with error on failure.
   */
  transaction(actions) {
    let results = [];
    return this._pool
      .connect()
      .then(client => client
        .query('BEGIN')
        .then(() => new Promise((resolve, reject) => {
          let lastCall = _.size(actions) - 1;
          let recursiveCall = currentCall => currentCall > lastCall
            ? client
              .query('COMMIT')
              .then(() => resolve(results))
              .catch(err => reject(err))
            : client
              .query(actions[currentCall].sql, actions[currentCall].args)
              .then(res => {
                results.push(this._getRows(res));
                recursiveCall(currentCall + 1);
              })
              .catch(err => reject(err));
          recursiveCall(0);
        }))
        .catch(err => client.query('ROLLBACK').then(() => { throw err; })));
  }

  /**
   * Check if record with given conditions exist in given table.
   * @param {String} table - Database table name.
   * @param {Object} conditions - Object containing field names as keys and related values.
   * @param {String} [connector] - Optional conditions connector ('AND' or 'OR').
   * @return {Promise} Resolved promise with `true` if record exists,
   *                   resolved promise with `false` if not.
   */
  doesExist(table, conditions, connector = 'AND') {
    let where = '';
    let args = [];
    _.each(conditions, (value, field) => {
      where += `${_.size(args) ? ` ${connector} ` : ''}${field} = $${_.size(args) + 1}`;
      args.push(value);
    });
    let sql = `SELECT EXISTS(SELECT 1 FROM ${this.schema}.${table} WHERE ${where});`;
    return this
      .execute(sql, args)
      .then(result => _.get(_.first(result), 'exists'));
  }

  /**
   * Get rows from result object and rename all column names to camel case.
   * @param {Object} result - Database result object.
   * @return {Array} Array of result rows with columns in camel case.
   * @private
   */
  _getRows(result) {
    return _.map(result.rows, row => _.mapKeys(row, (value, key) => _.camelCase(key)));
  }
}

module.exports = Database;
