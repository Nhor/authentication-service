const chai = require('chai');
const Helpers = require('../../../../Helpers');
const Manager = require('../../../../Manager');

describe('backend/routes/admin/ChangePassword', () => {
  describe('PUT', () => {
    let adminId;
    let adminPassword;
    let adminNewPassword;
    let sessionId;

    before('should create a new admin and session', () => Manager
      .createAdmin()
      .then(admin => {
        adminId = admin.id;
        adminPassword = admin.password;
        return Manager.createAdminSession(adminId);
      })
      .then(id => sessionId = id));

    it('should respond with `INVALID_SESSION_ID` error for missing Authorization header', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.PUT, '/api/v1/admin/change-password', {
          oldPassword: adminPassword,
          newPassword: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should fail on validation for invalid both old and new password', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.PUT, '/api/v1/admin/change-password', {
          oldPassword: '',
          newPassword: Helpers.random(Helpers.RANDOM_TYPE.LETTERS)
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([16, 17]);
        }));

    it('should respond with `INVALID_PASSWORD` error for invalid password', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.PUT, '/api/v1/admin/change-password', {
          oldPassword: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD),
          newPassword: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([15]);
        }));

    it('should succeed for valid data', () => {
      adminNewPassword = Helpers.random(Helpers.RANDOM_TYPE.PASSWORD);
      return Helpers
        .request(Helpers.REQUEST_METHOD.PUT, '/api/v1/admin/change-password', {
          oldPassword: adminPassword,
          newPassword: adminNewPassword
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
        })
    });

    it('should respond with `INVALID_PASSWORD` error for the outdated password', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.PUT, '/api/v1/admin/change-password', {
          oldPassword: adminPassword,
          newPassword: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([15]);
        }));

    it('should succeed again for the current password', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.PUT, '/api/v1/admin/change-password', {
          oldPassword: adminNewPassword,
          newPassword: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
        }));

    after('should delete created admin and session', () => Promise.all([
      Manager.removeAdmin(adminId),
      Manager.removeAdminSession(adminId, sessionId)
    ]));
  });
});
