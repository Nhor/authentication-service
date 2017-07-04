const chai = require('chai');
const Helpers = require('../../../../Helpers');
const Manager = require('../../../../Manager');

describe('backend/routes/admin/Register', () => {
  describe('POST', () => {
    let masterAdminId;
    let masterAdminSessionId;
    let adminEmail;
    let adminUsername;
    let adminId;

    before('should create a new master admin', () => Manager
      .createAdmin()
      .then(masterAdmin => {
        masterAdminId = masterAdmin.id;
        return Manager.createAdminSession(masterAdminId);
      })
      .then(masterAdminSession => masterAdminSessionId = masterAdminSession));

    it('should fail on validation for missing email', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: masterAdminSessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([1]);
        }));

    it('should fail on validation for invalid password format', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.LETTERS)
        }, {Authorization: masterAdminSessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([3]);
        }));

    it('should respond with \'INVALID_SESSION_ID\' error for missing Authorization header', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should respond with `NOT_AUTHORIZED` error for missing admin permission', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: masterAdminSessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(401);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([13]);
        }));

    it('should silently grant master admin the \'CREATE_ADMINS\' permission to pass the test', () =>
      Manager.grantAdminPermission(masterAdminId, 'CREATE_ADMINS'));

    it('should succeed for valid data', () => {
      adminEmail = Helpers.random(Helpers.RANDOM_TYPE.EMAIL);
      adminUsername = Helpers.random(Helpers.RANDOM_TYPE.USERNAME);
      return Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: adminEmail,
          username: adminUsername,
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: masterAdminSessionId})
        .then(res => {
          adminId = res.body.adminId;
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
          chai.expect(res.body.adminId).to.be.a('number');
        });
    });

    it('should respond with `EMAIL_IN_USE` error for the same email', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: adminEmail,
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: masterAdminSessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([5]);
        }));

    it('should respond with `USERNAME_IN_USE` error for the same username', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          username: adminUsername,
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        }, {Authorization: masterAdminSessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([6]);
        }));

    after('should delete created master admin, master admin session, master admin permissions xref and admin', () =>
      Manager
        .revokeAllAdminPermissions(masterAdminId)
        .then(() => Promise.all([
          Manager.removeAdmin(masterAdminId),
          Manager.removeAdminSession(masterAdminId, masterAdminSessionId),
          Manager.removeAdmin(adminId)
        ])));
  });
});
