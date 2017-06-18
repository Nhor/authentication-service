const _ = require('lodash');
const Error = require('./Error');

class Validator {

  /**
   * Check if value is valid not empty string.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static NotEmptyStringField(val) {
    return _.isString(val) && !_.isEmpty(val);
  }

  /**
   * Check if value is valid string.
   * @param {any} val - Value to validate.
   * @return {Boolean} `true` if validation was successful, `false` otherwise.
   */
  static StringField(val) {
    return _.isString(val);
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
