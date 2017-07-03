const _ = require('lodash');
const bcrypt = require('bcrypt');
const pg = require('pg');
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
   * @param {String} [type] - Optional request content type, defaults to 'json'.
   * @return {Promise} Resolved promise with response object on success,
   *                   rejected promise with error on failure.
   */
  static request(method, url, payload = {}, type = 'json') {
    let options = {};

    switch(type) {
      case 'json':
        options.json = true;
        options.method = method;
        options.url = /:\/\//.test(url) ? url : `http://localhost:${Config.port}${url}`;
        options[/POST|PUT/.test(method) ? 'body' : 'qs'] = payload;
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

  static get RANDOM_TYPE() {
    return {
      EMAIL: 'EMAIL',
      LETTERS: 'LETTERS',
      PASSWORD: 'PASSWORD',
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
      case 'EMAIL':
        return `${randomatic('a', 5)}@${randomatic('a', 6)}.${randomatic('a', 3)}`;
      case 'LETTERS':
        return randomatic('aA', 10);
      case 'PASSWORD':
        return `${randomatic('a')}${randomatic('aA0', 10)}${randomatic('0')}`;
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
}

module.exports = Helpers;
