const chai = require('chai');
const Helpers = require('../../../../Helpers');
const Manager = require('../../../../Manager');

describe('backend/routes/service', () => {
  describe('POST', () => {
    let adminId;
    let sessionId;
    let serviceId;
    let serviceCode;
    let serviceName;

    before('should create a new admin and session', () => Manager
      .createAdmin()
      .then(admin => {
        adminId = admin.id;
        return Manager.createAdminSession(adminId);
      })
      .then(session => sessionId = session));

    it('should fail on validation for invalid code and name', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/service', {
          code: Helpers.random(Helpers.RANDOM_TYPE.UPPERCASE_LETTERS),
          name: 1
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([20, 21]);
        }));

    it('should respond with \'INVALID_SESSION_ID\' error for missing Authorization header', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/service', {
          code: Helpers.random(Helpers.RANDOM_TYPE.CODE),
          name: Helpers.random(Helpers.RANDOM_TYPE.LETTERS)
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(403);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([12]);
        }));

    it('should respond with `NOT_AUTHORIZED` error for missing admin permission', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/service', {
          code: Helpers.random(Helpers.RANDOM_TYPE.CODE),
          name: Helpers.random(Helpers.RANDOM_TYPE.LETTERS)
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(401);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([13]);
        }));

    it('should silently grant master admin the \'CREATE_SERVICES\' permission to pass the test', () =>
      Manager.grantAdminPermission(adminId, 'CREATE_SERVICES'));

    it('should succeed for valid data', () => {
      serviceCode = Helpers.random(Helpers.RANDOM_TYPE.CODE);
      serviceName = Helpers.random(Helpers.RANDOM_TYPE.LETTERS);
      return Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/service', {
          code: serviceCode,
          name: serviceName
        }, {Authorization: sessionId})
        .then(res => {
          serviceId = res.body.serviceId;
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
          chai.expect(res.body.serviceId).to.be.a('number');
        })
    });

    it('should respond with `CODE_IN_USE` error for the same code', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/service', {
          code: serviceCode,
          name: Helpers.random(Helpers.RANDOM_TYPE.LETTERS)
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([18]);
        }));

    it('should respond with `NAME_IN_USE` error for the same name', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/service', {
          code: Helpers.random(Helpers.RANDOM_TYPE.CODE),
          name: serviceName
        }, {Authorization: sessionId})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([19]);
        }));

    after('should delete created admin, admin permissions, session, service and service admin xref', () =>
      Promise
        .all([
          Manager.revokeAllAdminPermissions(adminId),
          Manager.removeAllServiceAdmins(serviceId)
        ])
        .then(() => Promise.all([
          Manager.removeAdmin(adminId),
          Manager.removeAdminSession(adminId, sessionId),
          Manager.removeService(serviceId)
        ])));
  });
});
