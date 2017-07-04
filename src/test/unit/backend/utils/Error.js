const _ = require('lodash');
const chai = require('chai');
const utils = require('../../../../backend/utils');

describe('backend/utils/Error', () => {
  describe('AuthenticationFailed', () => {
    it('should create a correct `AuthenticationFailed` error', () => {
      let error = new utils.Error.AuthenticationFailed(utils.Error.Code.INVALID_SESSION_ID);
      chai.expect(error.message).to.be.equal('Authentication failed');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_SESSION_ID);
      chai.expect(error.httpStatus).to.be.equal(403);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('AuthorizationFailed', () => {
    it('should create a correct `AuthorizationFailed` error', () => {
      let error = new utils.Error.AuthorizationFailed(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
      chai.expect(error.message).to.be.equal('Authorization failed');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
      chai.expect(error.httpStatus).to.be.equal(401);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('InvalidFormat', () => {
    it('should create a correct `InvalidFormat` error', () => {
      let error = new utils.Error.InvalidFormat(utils.Error.Code.INVALID_EMAIL_FORMAT);
      chai.expect(error.message).to.be.equal('Invalid format');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_EMAIL_FORMAT);
      chai.expect(error.httpStatus).to.be.equal(400);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('InvalidValue', () => {
    it('should create a correct `InvalidValue` error', () => {
      let error = new utils.Error.InvalidValue(utils.Error.Code.INVALID_PASSWORD);
      chai.expect(error.message).to.be.equal('Invalid value');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_PASSWORD);
      chai.expect(error.httpStatus).to.be.equal(400);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('RecordNotFound', () => {
    it('should create a correct `RecordNotFound` error', () => {
      let error = new utils.Error.RecordNotFound(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
      chai.expect(error.message).to.be.equal('Record not found');
      chai.expect(error.code).to.be.equal(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD);
      chai.expect(error.httpStatus).to.be.equal(400);
      chai.expect(error.isCustom).to.be.true;
    });
  });

  describe('RecordAlreadyExists', () => {
    it('should create a correct `RecordAlreadyExists` error', () => {
      let error = new utils.Error.RecordAlreadyExists(utils.Error.Code.EMAIL_IN_USE);
      chai.expect(error.message).to.be.equal('Record already exists');
      chai.expect(error.code).to.be.equal(utils.Error.Code.EMAIL_IN_USE);
      chai.expect(error.httpStatus).to.be.equal(400);
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
