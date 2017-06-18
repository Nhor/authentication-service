const redis = require('redis');

class Redis {

  /**
   * Handle class instance initialization.
   * @param {String} host - Redis server host address.
   * @param {Number} port - Redis server port.
   */
  constructor(host, port) {
    this.client = redis.createClient({
      host: host,
      port: port
    });
  }

  /**
   * Assign object to a given key.
   * @param {String} key - Cache key.
   * @param {Object} value - Object to assign to a given key.
   * @param {Number} ttl = Time to live in minutes.
   * @return {Promise} Resolved promise on success or
   *                   rejected promise with error on failure.
   */
  setObject(key, value, ttl) {
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), 'EX', ttl * 60, (err, reply) => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }

  /**
   * Get object associated with a given key.
   * @param {String} key - Cache key.
   * @return {Promise} Resolved promise with object associated with a given key or
   *                   rejected promise with error.
   */
  getObject(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err)
          return reject(err);
        if (!reply)
          return resolve();
        resolve(JSON.parse(reply.toString()));
      });
    });
  }
}

module.exports = Redis;
