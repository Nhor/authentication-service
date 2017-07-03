const _ = require('lodash');
const chai = require('chai');
const Helpers = require('../../../../../Helpers');

describe('backend/routes/admin/permissions/Grant', () => {
  describe('POST', () => {
    let adminId;

    before('should create a new admin', () => Helpers
      .hashPlainText(Helpers.random(Helpers.RANDOM_TYPE.PASSWORD))
      .then(hashedPassword => Helpers
        .databaseExecute(`INSERT INTO ${Helpers.DATABASE_SCHEMA}.admin ` +
          '(email, username, password) VALUES ($1, $2, $3) RETURNING id;', [
          Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          hashedPassword
        ]))
      .then(rows => adminId = parseInt(_.get(_.first(rows), 'id'))));

    it('should fail on validation for missing id', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, `/api/v1/admin/${adminId}/permissions/grant`)
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([10]);
        }));

    it('should succeed for valid data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, `/api/v1/admin/${adminId}/permissions/grant`, {id: 1})
        .then(res => {
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
        }));

    it('should respond with `ADMIN_PERMISSION_ALREADY_GRANTED` error for the same data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, `/api/v1/admin/${adminId}/permissions/grant`, {id: 1})
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([9]);
        }));

    after('should delete created admin', () => Helpers
      .databaseExecute(`DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin_permission_xref WHERE admin_id = $1;`, [adminId])
      .then(() => Helpers.databaseExecute(`DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin WHERE id = $1;`, [adminId])));
  });
});
