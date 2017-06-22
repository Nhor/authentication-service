const _ = require('lodash');
const chai = require('chai');
const utils = require('../../../../backend/utils');

describe('backend/utils/Error', () => {
  describe('InvalidFormat', () => {
    it('should create a correct `InvalidFormat` error', () => {
      let error = new utils.Error.InvalidFormat(utils.Error.Code.INVALID_EMAIL_FORMAT);
      chai.expect(error.message).to.be.equal('Invalid format');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_EMAIL_FORMAT);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('RecordNotFound', () => {
    it('should create a correct `RecordNotFound` error', () => {
      let error = new utils.Error.RecordNotFound(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
      chai.expect(error.message).to.be.equal('Record not found');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('RecordAlreadyExists', () => {
    it('should create a correct `RecordAlreadyExists` error', () => {
      let error = new utils.Error.RecordAlreadyExists(utils.Error.Code.EMAIL_IN_USE);
      chai.expect(error.message).to.be.equal('Record already exists');
      chai.expect(error.code).to.be.equal(utils.Error.Code.EMAIL_IN_USE);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('Code', () => {
    it('should contain unique code numbers', () => {
      let codeNumbers = _.values(utils.Error.Code);
      chai.expect(codeNumbers).to.be.deep.equal(_.uniq(codeNumbers));
    });
  });
});
