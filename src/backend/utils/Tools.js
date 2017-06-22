const path = require('path');
const _ = require('lodash');
const Error = require('./Error');

class Tools {

  /**
   * Append given pathname to project root.
   * @param {String} [pathname] - Optional pathname to append.
   * @return {String} Given pathname appended to project root.
   */
  static pathnameAppendToProjectRoot(pathname = '') {
    return path.join(__dirname, '..', '..', '..', pathname);
  }

  /**
   * Prepare and save response values to be sent.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @param {Number} status - Response status.
   * @param {Object} body - Response body.
   * @param {String} [type] - Optional response type, defaults to 'json'.
   */
  static prepareResponse(res, next, status, body, type = 'json') {
    res.locals.status = status;
    res.locals.type = type;
    res.locals.body = body;
    next();
  }

  /**
   * Send response with failed validation result.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @param {Object} validation - Validation result.
   */
  static validationFailed(res, next, validation) {
    let status = 400;
    let body = {success: validation.success, err: _.map(validation.err, 'code')};
    Tools.prepareResponse(res, next, status, body);
  }

  /**
   * Send response with failed action result.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @param {Error} err - Error object.
   */
  static actionFailed(res, next, err) {
    let isErrorCustom = _.get(err, 'isCustom');
    let status = isErrorCustom ? 400 : 500;
    let body = {success: false, err: [isErrorCustom ? err.code : Error.Code.UNKNOWN]};
    Tools.prepareResponse(res, next, status, body);
  }
}

module.exports = Tools;
