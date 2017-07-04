const _ = require('lodash');
const chai = require('chai');
const Helpers = require('../../../../../Helpers');
const Manager = require('../../../../../Manager');

describe('backend/routes/admin/permissions/Revoke', () => {
  describe('DELETE', () => {
    let adminId;
    let sessionId;

    before('should create a new admin, admin permission xref and session', () => Manager
      .createAdmin()
      .then(admin => {
        adminId = admin.id;
        return Promise.all([
          Manager.grantAdminPermission(adminId, 1),
          Manager.createAdminSession(adminId)
        ]);
      })
      .then(results => sessionId = _.nth(results, 1)));

    it('should fail on validation for invalid id', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/permissions/revoke/id`)
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([10]);
        }));

    it('should respond with `INVALID_SESSION_ID` error for invalid Authorization header', () =>
      Helpers
        .generatePseudoRandomString(32)
        .then(pseudoRandomString => Helpers
          .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/permissions/revoke/1`, {}, {Authorization: pseudoRandomString}))
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should respond with `NOT_AUTHORIZED` error for missing admin permission', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/permissions/revoke/1`, {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(401);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([13]);
        }));

    it('should silently grant admin the \'REVOKE_ADMIN_PERMISSIONS\' permission to pass the test', () =>
      Manager.grantAdminPermission(adminId, 'REVOKE_ADMIN_PERMISSIONS'));

    it('should succeed for valid data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/permissions/revoke/1`, {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
        }));

    it('should respond with `ADMIN_PERMISSION_ALREADY_REVOKED` error for the same data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/permissions/revoke/1`, {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([14]);
        }));

    after('should delete created admin, admin permission xrefs and session', () => Manager
      .revokeAllAdminPermissions(adminId)
      .then(() => Manager.removeAdmin(adminId))
      .then(() => Manager.removeAdminSession(adminId, sessionId)));
  });
});
