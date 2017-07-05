const chai = require('chai');
const utils = require('../../../../backend/utils');
const Helpers = require('../../../Helpers');

describe('backend/utils/Validator', () => {
  describe('CodeField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.CodeField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.CodeField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.CodeField(true)).to.be.false);
    it('should return `false` for integer number', () =>
      chai.expect(utils.Validator.CodeField(123)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.CodeField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.CodeField({})).to.be.false);
    it('should return `false` for empty string', () =>
      chai.expect(utils.Validator.CodeField('')).to.be.false);
    it('should return `false` for string with invalid characters', () =>
      chai.expect(utils.Validator.CodeField('code-')).to.be.false);
    it('should return `false` for string with uppercase characters', () =>
      chai.expect(utils.Validator.CodeField('Code')).to.be.false);
    it('should return `false` for string with less than 2 characters', () =>
      chai.expect(utils.Validator.CodeField('a')).to.be.false);
    it('should return `true` for string with exactly 2 characters', () =>
      chai.expect(utils.Validator.CodeField('ab')).to.be.true);
    it('should return `true` for string with more than 2 letters', () =>
      chai.expect(utils.Validator.UsernameField('c_od_e_1')).to.be.true);
    it('should return `true` for random code', () =>
      chai.expect(utils.Validator.UsernameField(Helpers.random(Helpers.RANDOM_TYPE.CODE))).to.be.true);
  });

  describe('EmailField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.EmailField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.EmailField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.EmailField(true)).to.be.false);
    it('should return `false` for integer number', () =>
      chai.expect(utils.Validator.EmailField(123)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.EmailField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.EmailField({})).to.be.false);
    it('should return `false` for empty string', () =>
      chai.expect(utils.Validator.EmailField('')).to.be.false);
    it('should return `false` for email without @', () =>
      chai.expect(utils.Validator.EmailField('email')).to.be.false);
    it('should return `false` for email without TLD', () =>
      chai.expect(utils.Validator.EmailField('email@domain')).to.be.false);
    it('should return `true` for valid email', () =>
      chai.expect(utils.Validator.EmailField('email@domain.tld')).to.be.true);
    it('should return `true` for random email', () =>
      chai.expect(utils.Validator.EmailField(Helpers.random(Helpers.RANDOM_TYPE.EMAIL))).to.be.true);
  });

  describe('IntegerField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.IntegerField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.IntegerField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.IntegerField(true)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.IntegerField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.IntegerField({})).to.be.false);
    it('should return `false` for empty string', () =>
      chai.expect(utils.Validator.IntegerField('')).to.be.false);
    it('should return `false` for some string', () =>
      chai.expect(utils.Validator.IntegerField('some string')).to.be.false);
    it('should return `true` for integer number', () =>
      chai.expect(utils.Validator.IntegerField(123)).to.be.true);
  });

  describe('NotEmptyStringField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.NotEmptyStringField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.NotEmptyStringField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.NotEmptyStringField(true)).to.be.false);
    it('should return `false` for integer number', () =>
      chai.expect(utils.Validator.NotEmptyStringField(123)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.NotEmptyStringField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.NotEmptyStringField({})).to.be.false);
    it('should return `false` for empty string', () =>
      chai.expect(utils.Validator.NotEmptyStringField('')).to.be.false);
    it('should return `true` for some string', () =>
      chai.expect(utils.Validator.NotEmptyStringField('some string')).to.be.true);
    it('should return `true` for random string', () =>
      chai.expect(utils.Validator.NotEmptyStringField(Helpers.random(Helpers.RANDOM_TYPE.LETTERS))).to.be.true);
  });

  describe('PasswordField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.PasswordField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.PasswordField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.PasswordField(true)).to.be.false);
    it('should return `false` for integer number', () =>
      chai.expect(utils.Validator.PasswordField(123)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.PasswordField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.PasswordField({})).to.be.false);
    it('should return `false` for empty string', () =>
      chai.expect(utils.Validator.PasswordField('')).to.be.false);
    it('should return `false` for string with invalid characters', () =>
      chai.expect(utils.Validator.PasswordField('password1234 ')).to.be.false);
    it('should return `false` for string with less than 8 characters', () =>
      chai.expect(utils.Validator.PasswordField('pass123')).to.be.false);
    it('should return `true` for string with exactly 8 characters', () =>
      chai.expect(utils.Validator.PasswordField('pass1234')).to.be.true);
    it('should return `true` for string with more than 8 characters', () =>
      chai.expect(utils.Validator.PasswordField('password1234')).to.be.true);
    it('should return `true` for string with more than 8 characters', () =>
      chai.expect(utils.Validator.PasswordField('password1234')).to.be.true);
    it('should return `true` for string with more than 8 characters and allowed special characters', () =>
      chai.expect(utils.Validator.PasswordField('password1234!@#$')).to.be.true);
    it('should return `true` for random password', () =>
      chai.expect(utils.Validator.PasswordField(Helpers.random(Helpers.RANDOM_TYPE.PASSWORD))).to.be.true);
  });

  describe('StringField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.StringField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.StringField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.StringField(true)).to.be.false);
    it('should return `false` for integer number', () =>
      chai.expect(utils.Validator.StringField(123)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.StringField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.StringField({})).to.be.false);
    it('should return `true` for empty string', () =>
      chai.expect(utils.Validator.StringField('')).to.be.true);
    it('should return `true` for some string', () =>
      chai.expect(utils.Validator.StringField('some string')).to.be.true);
    it('should return `true` for random string', () =>
      chai.expect(utils.Validator.StringField(Helpers.random(Helpers.RANDOM_TYPE.LETTERS))).to.be.true);
  });

  describe('UsernameField', () => {
    it('should return `false` for `undefined`', () =>
      chai.expect(utils.Validator.UsernameField(undefined)).to.be.false);
    it('should return `false` for `null`', () =>
      chai.expect(utils.Validator.UsernameField(null)).to.be.false);
    it('should return `false` for boolean', () =>
      chai.expect(utils.Validator.UsernameField(true)).to.be.false);
    it('should return `false` for integer number', () =>
      chai.expect(utils.Validator.UsernameField(123)).to.be.false);
    it('should return `false` for float number', () =>
      chai.expect(utils.Validator.UsernameField(123.456)).to.be.false);
    it('should return `false` for object', () =>
      chai.expect(utils.Validator.UsernameField({})).to.be.false);
    it('should return `false` for empty string', () =>
      chai.expect(utils.Validator.UsernameField('')).to.be.false);
    it('should return `false` for string with invalid characters', () =>
      chai.expect(utils.Validator.UsernameField('username ')).to.be.false);
    it('should return `false` for string with less than 2 letters', () =>
      chai.expect(utils.Validator.UsernameField('a123')).to.be.false);
    it('should return `true` for string with exactly 2 letters', () =>
      chai.expect(utils.Validator.UsernameField('ab')).to.be.true);
    it('should return `true` for string with more than 2 letters', () =>
      chai.expect(utils.Validator.UsernameField('A_b_c_1-2-3')).to.be.true);
    it('should return `true` for email', () =>
      chai.expect(utils.Validator.UsernameField('email@domain.tld')).to.be.true);
    it('should return `true` for random username', () =>
      chai.expect(utils.Validator.UsernameField(Helpers.random(Helpers.RANDOM_TYPE.USERNAME))).to.be.true);
    it('should return `true` for random email', () =>
      chai.expect(utils.Validator.UsernameField(Helpers.random(Helpers.RANDOM_TYPE.EMAIL))).to.be.true);
  });

  describe('validate', () => {
    it('should fail on all incorrect fields validation', () => {
      let validation = utils.Validator.validate({
        username: '',
        password: ''
      }, {
        username: utils.Validator.NotEmptyStringField,
        password: utils.Validator.NotEmptyStringField
      });
      chai.expect(validation.success).to.be.false;
      chai.expect(validation.err).to.have.lengthOf(2);
    });
    it('should fail on some incorrect fields validation', () => {
      let validation = utils.Validator.validate({
        username: 'username',
        password: ''
      }, {
        username: utils.Validator.NotEmptyStringField,
        password: utils.Validator.NotEmptyStringField
      });
      chai.expect(validation.success).to.be.false;
      chai.expect(validation.err).to.have.lengthOf(1);
    });
    it('should succeed on all correct fields validation', () => {
      let validation = utils.Validator.validate({
        username: 'username',
        password: 'password'
      }, {
        username: utils.Validator.NotEmptyStringField,
        password: utils.Validator.NotEmptyStringField
      });
      chai.expect(validation.success).to.be.true;
      chai.expect(validation.err).to.be.empty;
    });
  });
});
