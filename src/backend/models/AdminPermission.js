const _ = require('lodash');
const utils = require('../utils');

class AdminPermission {

  /**
   * Handle class instance initialization.
   * @param {Database} database - `Database` class instance.
   */
  constructor(database) {
    this._database = database;
  }

  /**
   * Grant a new permission to an existing admin.
   * @param {String} adminPermissionId - Permission identifier.
   * @param {Number} adminId - Admin identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  grant(adminPermissionId, adminId) {
    let sql = `INSERT INTO ${this._database.schema}.admin_permission_xref ` +
      '(admin_id, admin_permission_id) VALUES ($1, $2);';
    let args = [adminId, adminPermissionId];
    return Promise
      .all([
        this._database.doesExist('admin_permission', {id: adminPermissionId}),
        this._database.doesExist('admin', {id: adminId}),
        this._database.doesExist('admin_permission_xref', {admin_id: adminId, admin_permission_id: adminPermissionId})
      ])
      .then(doesExist => {
        if (!doesExist[0])
          throw new utils.Error.RecordNotFound(utils.Error.Code.ADMIN_PERMISSION_NOT_FOUND);
        else if (!doesExist[1])
          throw new utils.Error.RecordNotFound(utils.Error.Code.ADMIN_NOT_FOUND);
        else if (doesExist[2])
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.ADMIN_PERMISSION_ALREADY_GRANTED);
        return this._database.execute(sql, args);
      })
      .then(result => {});
  }
}

module.exports = AdminPermission;
