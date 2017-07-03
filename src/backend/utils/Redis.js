const _ = require('lodash');
const redis = require('redis');

class Redis {

  /**
   * Handle class instance initialization.
   * @param {String} host - Redis server host address.
   * @param {Number} port - Redis server port.
   */
  constructor(host, port) {
    this._client = redis.createClient({
      host: host,
      port: port
    });
  }

  /**
   * Query a transaction with specified action to Redis.
   * @param {Array} actions - Nested array containing arrays with commands and
   *                          arguments for redis actions to perform.
   * @return {Promise} Resolved promise with Redis replies array on success,
   *                   rejected promise with error on failure.
   */
  transaction(actions) {
    return new Promise((resolve, reject) =>
      this._client
        .multi(actions)
        .exec((err, replies) => err ? reject(err) : resolve(replies)));
  }

  /**
   * Get value for a given key from Redis.
   * @param {String} key - Key.
   * @return {Promise} Resolved promise with value associated with key on success,
   *                   rejected promise with error on failure.
   */
  get(key) {
    return new Promise((resolve, reject) =>
      this._client.get(key, (err, reply) => err ? reject(err) : resolve(reply)));
  }
}

module.exports = Redis;
