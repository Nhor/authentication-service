const chai = require('chai');
const Helpers = require('../../../../Helpers');
const Manager = require('../../../../Manager');

describe('backend/routes/admin/Login', () => {
  describe('POST', () => {
    let adminId;
    let adminUsername;
    let adminPassword;
    let sessionId;

    before('should create a new admin', () => Manager
      .createAdmin()
      .then(admin => {
        adminId = admin.id;
        adminUsername = admin.username;
        adminPassword = admin.password;
      }));

    it('should fail on validation for missing password', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/login', {
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME)
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([3]);
        }));

    it('should respond with `INVALID_USERNAME_OR_PASSWORD` error for invalid username', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/login', {
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: adminPassword
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(401);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([4]);
        }));

    it('should respond with `INVALID_USERNAME_OR_PASSWORD` error for invalid password', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/login', {
          username: adminUsername,
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(401);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([4]);
        }));

    it('should succeed for valid data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/login', {
          username: adminUsername,
          password: adminPassword
        })
        .then(res => {
          sessionId = res.body.sessionId;
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
          chai.expect(res.body.sessionId).to.be.a('string');
        }));

    it('should respond with the same `sessionId` for the same data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/login', {
          username: adminUsername,
          password: adminPassword
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
          chai.expect(res.body.sessionId).to.be.equal(sessionId);
        }));

    after('should delete created admin and session', () => Manager
      .removeAdmin(adminId)
      .then(() => Manager.removeAdminSession(adminId, sessionId)));
  });
});
