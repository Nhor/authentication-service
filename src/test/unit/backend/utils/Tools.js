const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const utils = require('../../../../backend/utils');

describe('backend/utils/Tools', () => {
  describe('pathnameAppendToProjectRoot', () => {
    it('should return project root absolute path when no arguments provided', () => {
      chai.expect(utils.Tools.pathnameAppendToProjectRoot())
        .to.equal(path.join(__dirname, '..', '..', '..', '..', '..'));
    });
    it('should return ./dist directory absolute path for \'dist\' argument', () => {
      chai.expect(utils.Tools.pathnameAppendToProjectRoot('dist'))
        .to.equal(path.join(__dirname, '..', '..', '..', '..', '..', 'dist'));
    });
  });

  describe('prepareResponse', () => {
    it('should save provided data in `res.locals` object and call `next` function', () => {
      let res = {locals: {}};
      let next = sinon.spy();
      utils.Tools.prepareResponse(res, next, 200, {success: true}, 'json');
      chai.expect(res)
        .to.deep.equal({locals: {status: 200, body: {success: true}, type: 'json'}});
      chai.expect(next.calledOnce)
        .to.be.true;
    });
  });

  describe('validationFailed', () => {
    it('should use `prepareResponse` to send a response with status 400 and errors array', () => {
      let res = {locals: {}};
      let next = sinon.spy();
      utils.Tools.validationFailed(res, next, {success: false, err: [
        new utils.Error.InvalidFormat(utils.Error.Code.INVALID_USERNAME_FORMAT),
        new utils.Error.InvalidFormat(utils.Error.Code.INVALID_PASSWORD_FORMAT)
      ]});
      chai.expect(res)
        .to.deep.equal({locals: {status: 400, body: {success: false, err: [2, 3]}, type: 'json'}});
      chai.expect(next.calledOnce)
        .to.be.true;
    });
  });

  describe('actionFailed', () => {
    it('should use `prepareResponse` to send a response with status 400 and custom error codes array', () => {
      let res = {locals: {}};
      let next = sinon.spy();
      utils.Tools.actionFailed(res, next, new utils.Error.InvalidFormat(utils.Error.Code.INVALID_USERNAME_OR_PASSWORD));
      chai.expect(res)
        .to.deep.equal({locals: {status: 400, body: {success: false, err: [4]}, type: 'json'}});
      chai.expect(next.calledOnce)
        .to.be.true;
    });
    it('should use `prepareResponse` to send a response with status 500 and unknown error code', () => {
      let res = {locals: {}};
      let next = sinon.spy();
      utils.Tools.actionFailed(res, next, new Error());
      chai.expect(res)
        .to.deep.equal({locals: {status: 500, body: {success: false, err: [0]}, type: 'json'}});
      chai.expect(next.calledOnce)
        .to.be.true;
    });
  });
});
