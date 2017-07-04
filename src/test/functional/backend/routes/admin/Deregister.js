const _ = require('lodash');
const chai = require('chai');
const Helpers = require('../../../../Helpers');

describe('backend/routes/admin/Deregister', () => {
  describe('DELETE', () => {
    let adminId;
    let sessionId;

    before('should create a new admin and session', () => Helpers
      .hashPlainText(Helpers.random(Helpers.RANDOM_TYPE.PASSWORD))
      .then(hashedPassword => Helpers
        .databaseExecute(`INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin ` +
          '(email, username, password) VALUES ($1, $2, $3) RETURNING id;', [
          Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
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
      }));

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

    it('should silently grant admin the \'DELETE_ADMINS\' permission to pass the test', () => Helpers
      .databaseExecute(`INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin_permission_xref ` +
        `(admin_id, admin_permission_id) SELECT $1, id FROM ${Helpers.DATABASE_SCHEMA}.admin_permission ` +
        `WHERE ${Helpers.DATABASE_SCHEMA}.admin_permission.code = $2;`, [adminId, 'DELETE_ADMINS']));

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
