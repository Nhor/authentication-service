const _ = require('lodash');
const utils = require('../utils');

class Service {

  /**
   * Handle class instance initialization.
   * @param {Database} database - `Database` class instance.
   */
  constructor(database) {
    this._database = database;
  }

  /**
   * Create a new service.
   * @param {String} code - Service code name.
   * @param {String} name - Service full name.
   * @param {Number} adminId - Service creator admin identifier.
   * @return {Promise} Resolved promise with created service identifier on success,
   *                   rejected promise with error on failure.
   */
  create(code, name, adminId) {
    let serviceId;
    let sql = `INSERT INTO ${this._database.schema}.service (code, name) ` +
      `VALUES ($1, $2) RETURNING id;`;
    let args = [code, name];
    return Promise
      .all([
        this._database.doesExist('service', {code: code}),
        this._database.doesExist('service', {name: name})
      ])
      .then(results => {
        if (_.first(results))
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.CODE_IN_USE);
        else if (_.nth(results, 1))
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.NAME_IN_USE);
        return this._database.execute(sql, args);
      })
      .then(result => {
        serviceId = parseInt(_.get(_.first(result), 'id'), 10);
        return this._database.transaction([{
          sql: `INSERT INTO ${this._database.schema}.service_admin_xref (service_id, admin_id) VALUES ($1, $2);`,
          args: [serviceId, adminId]
        }, {
          sql: `CREATE TABLE ${this._database.schema}.service_${code}_user (` +
            `id          BIGSERIAL PRIMARY KEY, ` +
            `email       TEXT      NOT NULL UNIQUE, ` +
            `username    TEXT      NOT NULL UNIQUE, ` +
            `password    TEXT      NOT NULL, ` +
            `created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(), ` +
            `modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());`,
          args: []
        }]);
      })
      .then(() => serviceId)
      .catch(err => {
        if (serviceId)
          return this._database
            .execute(`DELETE FROM ${this._database.schema}.service WHERE id = $1;`, [serviceId])
            .then(() => { throw err; });
        throw err;
      });
  }
}

module.exports = Service;
