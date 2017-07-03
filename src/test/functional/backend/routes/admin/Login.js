const _ = require('lodash');
const chai = require('chai');
const Helpers = require('../../../../Helpers');

describe('backend/routes/admin/Login', () => {
  describe('POST', () => {
    let adminId;
    let adminUsername;
    let adminPassword;
    let sessionId;

    before('should create a new admin', () => {
      adminUsername = Helpers.random(Helpers.RANDOM_TYPE.USERNAME);
      adminPassword = Helpers.random(Helpers.RANDOM_TYPE.PASSWORD);
      return Helpers
        .hashPlainText(adminPassword)
        .then(hashedPassword => Helpers
          .databaseExecute(`INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin ` +
            '(email, username, password) VALUES ($1, $2, $3) RETURNING id;', [
            Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
            adminUsername,
            hashedPassword
          ]))
        .then(rows => adminId = parseInt(_.get(_.first(rows), 'id')));
    });

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

    after('should delete created admin', () => Helpers
      .databaseExecute(`DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin WHERE id = $1;`, [adminId]));
  });
});
