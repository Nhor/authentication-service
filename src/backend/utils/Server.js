const express = require('express');
const Tools = require('./Tools');

class Server {

  /**
   * Handle class instance creation.
   * @param {String} name - Application name.
   * @param {String} version - Application version.
   * @param {Number} port - Application port to run on.
   */
  constructor(name, version, port) {
    this._name = name;
    this._version = version;
    this._port = port;
    this._server = express();
  }

  /**
   * Add router.
   * @param {String} baseUrl - Base url for all routes present in the router.
   * @param {Router} router - Router object.
   */
  addRouter(baseUrl, router) {
    this._server.use(baseUrl, router.getRouter());
  }

  /**
   * Add static files route.
   * @param {String} baseUrl - Base url for static files in `pathname` directory.
   * @param {String} pathname - Path with directory relative to project root.
   */
  addStatic(baseUrl, pathname) {
    let resolvedPath = Tools.pathnameAppendToProjectRoot(pathname);
    this._server.use(baseUrl, express.static(resolvedPath));
  }

  /**
   * Add ReactRouter frontend.
   * @param {String} baseUrl - Base url for the frontend site.
   * @param {String} pathname - Path with HTML file relative to project root.
   */
  addReactRouterFrontend(baseUrl, pathname) {
    this._server.get(`${baseUrl}*`, (req, res, next) =>
      res.sendFile(Tools.pathnameAppendToProjectRoot(pathname)));
  }

  /**
   * Start listening.
   * @return {Promise} Resolved promise with server `name`, `version` and `port`.
   */
  listen() {
    return new Promise((resolve, reject) =>
      this._server.listen(this._port, () => resolve({
        name: this._name,
        version: this._version,
        port: this._port
      })));
  }
}

module.exports = Server;
