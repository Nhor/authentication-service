const _ = require('lodash');
const chai = require('chai');
const Helpers = require('../../../../Helpers');

describe('backend/routes/admin/Logout', () => {
  describe('POST', () => {
    let adminId;
    let adminUsername;
    let adminPassword;
    let sessionId;

    before('should create a new admin and session', () => {
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
        .then(rows => {
          adminId = parseInt(_.get(_.first(rows), 'id'));
          return Helpers.generatePseudoRandomString(32);
        })
        .then(pseudoRandomString => {
          sessionId = pseudoRandomString;
          return Helpers.redisTransaction([
            ['set', `session:admin:${adminId}`, sessionId],
            ['set', `admin:session:${sessionId}`, adminId.toString()]
          ]);
        });
    });

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

    after('should delete created admin', () => Helpers
      .databaseExecute(`DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin WHERE id = $1;`, [adminId]));
  });
});
