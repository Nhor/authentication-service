const _ = require('lodash');
const Helpers = require('./Helpers');

class Manager {

  /**
   * Create a new admin.
   * @return {Promise} Resolved promise with object containing created admin
   *                   `id`, `email`, `username` and `password`.
   */
  static createAdmin() {
    let id;
    let email = Helpers.random(Helpers.RANDOM_TYPE.EMAIL);
    let username = Helpers.random(Helpers.RANDOM_TYPE.USERNAME);
    let password = Helpers.random(Helpers.RANDOM_TYPE.PASSWORD);

    return Helpers
      .hashPlainText(password)
      .then(hashedPassword => Helpers.databaseExecute(
        `INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin ` +
        '(email, username, password) VALUES ($1, $2, $3) RETURNING id;',
        [email, username, hashedPassword]))
      .then(rows => {
        id = parseInt(_.get(_.first(rows), 'id'));
        return {id, email, username, password};
      });
  }

  /**
   * Remove admin with given identifier.
   * @param {Number} adminId - Admin identifier.
   * @return {Promise} Resolved promise.
   */
  static removeAdmin(adminId) {
    return Helpers.databaseExecute(
      `DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin WHERE id = $1;`,
      [adminId]);
  }

  /**
   * Create a new admin session for admin with given identifier.
   * @param {Number} adminId - Admin identifier.
   * @return {Promise} Resolved promise with created session identifier.
   */
  static createAdminSession(adminId) {
    let sessionId;

    return Helpers
      .generatePseudoRandomString(32)
      .then(pseudoRandomString => {
        sessionId = pseudoRandomString;
        return Helpers.redisTransaction([
          ['set', `session:admin:${adminId}`, sessionId],
          ['set', `admin:session:${sessionId}`, adminId.toString()]
        ]);
      })
      .then(() => sessionId);
  }

  /**
   * Remove admin session for admin with given identifier and session identifier.
   * @param {Number} adminId - Admin identifier.
   * @param {String} sessionId - Admin session identifier.
   * @return {Promise} Resolved promise.
   */
  static removeAdminSession(adminId, sessionId) {
    return Helpers.redisTransaction([
      ['del', `session:admin:${adminId}`],
      ['del', `admin:session:${sessionId}`]
    ]);
  }

  /**
   * Grant permission with given identifier or code to admin with given identifier.
   * @param {Number} adminId - Admin identifier.
   * @param {Number|String} permissionIdOrCode - Admin permission identifier or code.
   * @return {Promise} Resolved promise.
   */
  static grantAdminPermission(adminId, permissionIdOrCode) {
    return _.isInteger(parseInt(permissionIdOrCode, 10))
      ? Helpers.databaseExecute(
        `INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin_permission_xref ` +
        '(admin_id, admin_permission_id) VALUES ($1, $2);',
        [adminId, permissionIdOrCode])
      : Helpers.databaseExecute(
        `INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin_permission_xref ` +
        `(admin_id, admin_permission_id) SELECT $1, id FROM ${Helpers.DATABASE_SCHEMA}.admin_permission ` +
        `WHERE ${Helpers.DATABASE_SCHEMA}.admin_permission.code = $2;`,
        [adminId, permissionIdOrCode]);
  }

  /**
   * Revoke all admin permission from admin with given identifier.
   * @param {Number} adminId - Admin identifier.
   * @return {Promise} Resolved promise.
   */
  static revokeAllAdminPermissions(adminId) {
    return Helpers.databaseExecute(
      `DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin_permission_xref WHERE admin_id = $1;`,
      [adminId]);
  }
}

module.exports = Manager;
