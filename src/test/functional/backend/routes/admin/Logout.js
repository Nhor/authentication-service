const chai = require('chai');
const Helpers = require('../../../../Helpers');
const Manager = require('../../../../Manager');

describe('backend/routes/admin/Logout', () => {
  describe('POST', () => {
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
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/logout')
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should respond with `INVALID_SESSION_ID` error for invalid Authorization header', () =>
      Helpers
        .generatePseudoRandomString(32)
        .then(pseudoRandomString => Helpers
          .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/logout', {}, {Authorization: pseudoRandomString}))
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should succeed for valid data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/logout', {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
        }));

    it('should respond with `INVALID_SESSION_ID` error for the same data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/logout', {}, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    after('should delete created admin', () => Manager.removeAdmin(adminId));
  });
});
