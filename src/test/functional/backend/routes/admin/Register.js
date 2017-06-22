const chai = require('chai');
const Helpers = require('../../../../Helpers');

describe('backend/routes/adminRegister', () => {
  describe('POST', () => {
    let adminId;
    it('should fail on validation for missing email', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        })
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
        })
        .then(res => {
          chai.expect(res.statusCode).to.equal(400);
          chai.expect(res.body.success).to.be.false;
          chai.expect(res.body.err).to.deep.equal([3]);
        }));
    it('should succeed for valid data', () =>
      Helpers
        .request(Helpers.REQUEST_METHOD.POST, '/api/v1/admin/register', {
          email: Helpers.random(Helpers.RANDOM_TYPE.EMAIL),
          username: Helpers.random(Helpers.RANDOM_TYPE.USERNAME),
          password: Helpers.random(Helpers.RANDOM_TYPE.PASSWORD)
        })
        .then(res => {
          adminId = res.body.adminId;
          chai.expect(res.statusCode).to.equal(200);
          chai.expect(res.body.success).to.be.true;
          chai.expect(res.body.adminId).to.be.a('number');
        }));
    after('should delete created admin', () => Helpers
      .databaseExecute(`DELETE FROM ${Helpers.DATABASE_SCHEMA}.admin WHERE id = $1;`, [adminId]));
  });
});
