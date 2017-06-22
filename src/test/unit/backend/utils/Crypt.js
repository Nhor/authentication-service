const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const utils = require('../../../../backend/utils');

describe('backend/utils/Crypt', () => {
  describe('hashPlainText', () => {
    it('should hash plain text', () => utils.Crypt
      .hashPlainText('some string')
      .then(hashedText => chai.expect(hashedText)
        .to.be.a('string').and.not.equal('some string')));
  });

  describe('comparePlainTextWithHash', () => {
    it('should compare plain text with hashed text and fail', () => utils.Crypt
      .hashPlainText('some string')
      .then(hashedText => utils.Crypt.comparePlainTextWithHash('other string', hashedText))
      .then(result => chai.expect(result).to.be.false));
    it('should compare plain text with hashed text and succeed', () => utils.Crypt
      .hashPlainText('some string')
      .then(hashedText => utils.Crypt.comparePlainTextWithHash('some string', hashedText))
      .then(result => chai.expect(result).to.be.true));
  });
});
