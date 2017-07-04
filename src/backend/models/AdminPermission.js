const _ = require('lodash');
const utils = require('../utils');

class AdminPermission {

  /**
   * Handle class instance initialization.
   * @param {Database} database - `Database` class instance.
   */
  constructor(database) {
    this._database = database;

    this.CODE = {
      CREATE_ADMINS: 'CREATE_ADMINS',
      DELETE_ADMINS: 'DELETE_ADMINS',
      GRANT_ADMIN_PERMISSIONS: 'GRANT_ADMIN_PERMISSIONS',
      REVOKE_ADMIN_PERMISSIONS: 'REVOKE_ADMIN_PERMISSIONS',
      CREATE_SERVICES: 'CREATE_SERVICES',
      DELETE_SERVICES: 'DELETE_SERVICES',
      CREATE_USERS: 'CREATE_USERS',
      DELETE_USERS: 'DELETE_USERS',
      CREATE_USER_PERMISSIONS: 'CREATE_USER_PERMISSIONS',
      DELETE_USER_PERMISSIONS: 'DELETE_USER_PERMISSIONS',
      GRANT_USER_PERMISSIONS: 'GRANT_USER_PERMISSIONS',
      REVOKE_USER_PERMISSIONS: 'REVOKE_USER_PERMISSIONS'
    };
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

  /**
   * Revoke a permission from an existing admin.
   * @param {String} adminPermissionId - Permission identifier.
   * @param {Number} adminId - Admin identifier.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  revoke(adminPermissionId, adminId) {
    let sql = `DELETE FROM ${this._database.schema}.admin_permission_xref ` +
      'WHERE admin_id = $1 AND admin_permission_id = $2;';
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
        else if (!doesExist[2])
          throw new utils.Error.RecordAlreadyExists(utils.Error.Code.ADMIN_PERMISSION_ALREADY_REVOKED);
        return this._database.execute(sql, args);
      })
      .then(result => {});
  }

  /**
   * Check if admin has permission with given code.
   * @param {String} adminPermissionCode - Admin permission code.
   * @param {Number} adminId - Admin identifier.
   * @return {Promise} Resolved promise on success when admin has given permission,
   *                   rejected promise with error when there is missing permission.
   */
  has(adminPermissionCode, adminId) {
    let sql = `SELECT EXISTS(SELECT 1 FROM ${this._database.schema}.admin_permission_xref AS apx ` +
      `JOIN ${this._database.schema}.admin_permission AS ap ON apx.admin_permission_id = ap.id ` +
      `WHERE ap.code = $1 AND apx.admin_id = $2);`;
    let args = [adminPermissionCode, adminId];
    return this._database
      .execute(sql, args)
      .then(result => {
        if (!_.get(_.first(result), 'exists'))
          throw new utils.Error.AuthorizationFailed(utils.Error.Code.NOT_AUTHORIZED);
      });
  }
}

module.exports = AdminPermission;
