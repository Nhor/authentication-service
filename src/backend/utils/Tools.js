const path = require('path');

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
   * Check if given string is URL encoded.
   * @param {String} str - String to check.
   * @return {Boolean} `true` if given string is URL encoded, `false` if not.
   */
  static isUrlEncoded(str) {
    let isUrlEncoded;
    try       { isUrlEncoded = decodeURIComponent(str) !== str; }
    catch (e) { isUrlEncoded = false; }
    return isUrlEncoded;
  }

  /**
   * URL encode given string.
   * @param {String} str - String to URL encode.
   * @return {String} URL encoded string.
   */
  static urlEncode(str) {
    let urlEncoded;
    try       { urlEncoded = encodeURIComponent(str); }
    catch (e) { urlEncoded = str; }
    return urlEncoded;
  }

  /**
   * URL decode given string.
   * @param {String} str - String to URL decode.
   * @return {String} URL decoded string.
   */
  static urlDecode(str) {
    let urlDecoded;
    try       { urlDecoded = decodeURIComponent(str); }
    catch (e) { urlDecoded = str; }
    return urlDecoded;
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
}

module.exports = Tools;
