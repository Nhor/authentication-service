const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

class Router {

  /**
   * Handle class instance creation.
   * @param {Logger} logger - `Logger` class instance.
   * @param {Object} routeContext - Object with additional context for all routes.
   */
  constructor(logger, routeContext) {
    this._router = express.Router();
    this._logger = logger;
    this._routeContext = routeContext;

    this._bindContextMiddleware = this._bindContextMiddleware.bind(this);
    this._incomingRequestLogMiddleware = this._incomingRequestLogMiddleware.bind(this);
    this._outgoingResponseLogMiddleware = this._outgoingResponseLogMiddleware.bind(this);

    this._jsonMiddleware = bodyParser.json();
  }

  /**
   * Add route.
   * @param {String} method - HTTP method ('GET', 'POST', 'PUT' or 'DELETE').
   * @param {String} path - URL path.
   * @param {Function} handler - Handler function.
   * @param {Object} [middleware] - Request middleware, defaults to JSON parser.
   */
  addRoute(method, path, handler, middleware = 'json') {
    this._router[method.toLowerCase()](
      path,
      this._bindContextMiddleware,
      this[`_${middleware}Middleware`],
      this._incomingRequestLogMiddleware,
      handler,
      this._outgoingResponseLogMiddleware,
      this._sendResponseMiddleware
    );
  }

  /**
   * Get express Router object.
   * @return {express.Router} - Express Router object.
   */
  getRouter() {
    return this._router;
  }

  /**
   * Bind initially given context to the route `res.locals.context`.
   * @private
   */
  _bindContextMiddleware(req, res, next) {
    res.locals.context = this._routeContext;
    next();
  }

  /**
   * Log incoming request middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @private
   */
  _incomingRequestLogMiddleware(req, res, next) {
    this._logger.info(
      `Incoming: "${req.method}" request from: "${req.headers['x-real-ip']}" ` +
      `to: "${req.originalUrl}" ` +
      `with body: "${JSON.stringify(_.omit(req.body, ['password']))}" ` +
      `and headers: "${JSON.stringify(req.headers)}".`
    );
    next();
  }

  /**
   * Log outgoing response middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @private
   */
  _outgoingResponseLogMiddleware(req, res, next) {
    this._logger.info(
      `Outgoing response from: "${req.originalUrl}" ` +
      `to: "${req.headers['x-real-ip']}" ` +
      `with body: "${JSON.stringify(res.locals.body)}" ` +
      `and status: "${JSON.stringify(res.locals.status)}".`
    );
    next();
  }

  /**
   * Send response middleware, should be used as the last provided middleware.
   * @param {express.Request} req - Express request object.
   * @param {express.Response} res - Express response object.
   * @param {Function} next - Express next function.
   * @private
   */
  _sendResponseMiddleware(req, res, next) {
    res.status(res.locals.status);
    res.type(res.locals.type);
    res.send(res.locals.body);
  }
}

module.exports = Router;
