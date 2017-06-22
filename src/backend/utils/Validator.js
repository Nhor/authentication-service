const _ = require('lodash');
const Error = require('./Error');

class Validator {

  /**
   * Check if value is a valid email.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static EmailField(val) {
    return _.isString(val)
      && /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val);
  }

  /**
   * Check if value is a valid not empty string.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static NotEmptyStringField(val) {
    return _.isString(val)
      && !_.isEmpty(val);
  }

  /**
   * Check if value is a valid password.
   * Password must contain minimum eight characters, at least one letter and one number and be no longer than 32 characters.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static PasswordField(val) {
    return _.isString(val)
      && /^(?=.*[A-Za-z]+)(?=.*[0-9]+)[A-Za-z0-9#?!@$%^&*-]{8,32}$/.test(val);
  }

  /**
   * Check if value is a valid string.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static StringField(val) {
    return _.isString(val);
  }

  /**
   * Check if value is a valid username.
   * Username must contain minimum two letters and be no longer than 16 characters.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static UsernameField(val) {
    return _.isString(val)
      && /^(?=.*[A-Za-z]+.*[A-Za-z]+)[A-Za-z0-9-_]{2,16}$/.test(val)
      || Validator.EmailField(val);
  }

  /**
   * Validate given values against expected fields.
   * @param {Object} data - Object with values to validate.
   * @param {Object} expectedFields - Object with expected data format.
   * @return {undefined|Object} Object with overall validation bool result and
   *                            array of InvalidFormat errors with proper codes.
   */
  static validate(data, expectedFields) {
    let err = _
      .chain(expectedFields)
      .map((fieldValidator, fieldName) => {
        return fieldValidator(_.get(data, fieldName))
          ? null
          : new Error.InvalidFormat(_.get(Error.Code, `INVALID_${_.snakeCase(fieldName).toUpperCase()}_FORMAT`))
      })
      .filter(fieldName => !_.isNull(fieldName))
      .value();
    return {success: _.isEmpty(err), err: err};
  }
}

module.exports = Validator;
