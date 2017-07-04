const chai = require('chai');
const Helpers = require('../../../../Helpers');
const Manager = require('../../../../Manager');

describe('backend/routes/admin/Deregister', () => {
  describe('DELETE', () => {
    let adminId;
    let sessionId;

    before('should create a new admin and session', () => Manager
      .createAdmin()
      .then(admin => {
        adminId = admin.id;
        return Manager.createAdminSession(adminId);
      })
      .then(id => sessionId = id));

    it('should respond with `INVALID_SESSION_ID` error for missing Authorization header', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/deregister`)
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should fail on validation for invalid ID', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, '/api/v1/admin/id/deregister', {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([10]);
        }));

    it('should respond with `NOT_AUTHORIZED` error for missing admin permission', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/deregister`, {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(401);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([13]);
        }));

    it('should silently grant admin the \'DELETE_ADMINS\' permission to pass the test', () =>
      Manager.grantAdminPermission(adminId, 'DELETE_ADMINS'));

    it('should succeed for valid data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/deregister`, {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
        }));

    it('should respond with `INVALID_SESSION_ID` error for the same data, because the admin and his session are already deleted', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.DELETE, `/api/v1/admin/${adminId}/deregister`, {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));
  });
});
