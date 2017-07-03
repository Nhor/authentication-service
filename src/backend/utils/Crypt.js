const crypto = require('crypto');
const _ = require('lodash');
const bcrypt = require('bcrypt');

class Crypt {

  /**
   * Hash plain text.
   * @param {String} plainText - Plain text to hash.
   * @return {Promise} Resolved promise with hashed text.
   */
  static hashPlainText(plainText) {
    let saltRounds = 10;
    return bcrypt.hash(plainText, saltRounds);
  }


  /**
   * Compare plain text with hashed text.
   * @param {String} plainText - Plain text to compare with hashed text.
   * @param {String} hash - Hashed text to compare with plain text.
   * @return {Promise} Resolved promise with `true` if hashed text matches with plain text,
   *                   resolved promise with `false` if they don't match.
   */
  static comparePlainTextWithHash(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }

  /**
   * Generate pseudo random hex string.
   * @param {Number} stringLength - Length of the string to be generated.
   * @return {Promise} Resolved promise with generated string on success,
   *                   rejected promise with error on failure.
   */
  static generatePseudoRandomString(stringLength) {
    return new Promise((resolve, reject) =>
      crypto.randomBytes(_.max([0, _.ceil(stringLength / 2)]), (err, buffer) =>
        err ? reject(err) : resolve(buffer.toString('hex').substr(0, stringLength))));
  }
}

module.exports = Crypt;
