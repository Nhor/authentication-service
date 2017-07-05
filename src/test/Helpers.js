const crypto = require('crypto');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const pg = require('pg');
const redis = require('redis');
const request = require('request');
const randomatic = require('randomatic');
const Config = require('../Config');

class Helpers {

  static get REQUEST_METHOD() {
    return {
      GET: 'GET',
      POST: 'POST',
      PUT: 'PUT',
      DELETE: 'DELETE'
    };
  }

  /**
   * Send HTTP request with given parameters.
   * @param {String} method - HTTP request method ('GET', 'POST', 'PUT' or 'DELETE').
   * @param {String} url - Target URL, if specified without protocol localhost will be used.
   * @param {Object} [payload] - Optional request payload, defaults to an empty object.
   * @param {Object} [headers] - Optional request headers, defaults to an empty object.
   * @param {String} [type] - Optional request content type, defaults to 'json'.
   * @return {Promise} Resolved promise with response object on success,
   *                   rejected promise with error on failure.
   */
  static request(method, url, payload = {}, headers = {}, type = 'json') {
    let options = {};

    switch(type) {
      case 'json':
        options.json = true;
        options.method = method;
        options.url = /:\/\//.test(url) ? url : `http://localhost:${Config.port}${url}`;
        options[/POST|PUT/.test(method) ? 'body' : 'qs'] = payload;
        options.headers = headers;
        break;
    }

    return new Promise((resolve, reject) =>
      request(options, (err, res, body) => err ? reject(err) : resolve(res)));
  }

  static get DATABASE_SCHEMA() {
    return Config.databaseSchema;
  }

  /**
   * Execute given database SQL query with provided arguments.
   * @param {String} sql - Database SQL query to be executed.
   * @param {Array} [args] - Optional query arguments, defaults to `[]`.
   * @returns {Promise} Resolved promise with array of records on success,
   *                    rejected promise with error on failure.
   */
  static databaseExecute(sql, args) {
    let client = new pg.Client({
      host: Config.databaseHost,
      port: Config.databasePort,
      database: Config.databaseName,
      user: Config.databaseUser,
      password: Config.databasePassword
    });

    return new Promise((resolve, reject) => client.connect(err => {
      if (err)
        return reject(err);

      client.query(sql, args, (err, res) => {
        if (err)
          return reject(err);

        let result = _.map(res.rows, row => _.mapKeys(row, (value, key) => _.camelCase(key)));

        client.end(err => err ? reject(err) : resolve(result));
      })
    }));
  }

  /**
   * Query a transaction with specified action to Redis.
   * @param {Array} actions - Nested array containing arrays with commands and
   *                          arguments for redis actions to perform.
   * @return {Promise} Resolved promise with Redis replies array on success,
   *                   rejected promise with error on failure.
   */
  static redisTransaction(actions) {
    let client = redis.createClient({
      host: Config.redisHost,
      port: Config.redisPort
    });

    return new Promise((resolve, reject) => client
      .multi(actions)
      .exec((err, replies) => {
        client.quit();
        err ? reject(err) : resolve(replies);
      }));
  }

  static get RANDOM_TYPE() {
    return {
      CODE: 'CODE',
      EMAIL: 'EMAIL',
      LETTERS: 'LETTERS',
      PASSWORD: 'PASSWORD',
      UPPERCASE_LETTERS: 'UPPERCASE_LETTERS',
      USERNAME: 'USERNAME'
    };
  }

  /**
   * Randomize a string with given pattern.
   * @param {String} type - Random type parameter.
   * @return {String} Randomized string.
   */
  static random(type) {
    switch(type) {
      case 'CODE':
        return randomatic('?', 8, {chars: 'abcdefghijklmnopqrstuvwxyz0123456789_'});
      case 'EMAIL':
        return `${randomatic('a', 5)}@${randomatic('a', 6)}.${randomatic('a', 3)}`;
      case 'LETTERS':
        return randomatic('aA', 10);
      case 'PASSWORD':
        return `${randomatic('a')}${randomatic('aA0', 10)}${randomatic('0')}`;
      case 'UPPERCASE_LETTERS':
        return randomatic('A', 10);
      case 'USERNAME':
        return randomatic('aA', 8);
    }
  }

  /**
   * Hash plain text.
   * @param {String} plainText - Plain text to hash.
   * @return {Promise} Resolved promise with hashed text.
   */
  static hashPlainText(plainText) {
    return bcrypt.hash(plainText, 10);
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

module.exports = Helpers;
