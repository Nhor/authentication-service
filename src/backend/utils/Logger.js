const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Tools = require('./Tools');

class Logger {

  /**
   * Handle class instance initialization.
   * @param {Boolean} saveToFile - Indicate if object should save logs to file.
   */
  constructor(saveToFile) {
    this._saveToFile = saveToFile;

    if (this._saveToFile) {
      try { fs.mkdirSync(Tools.pathnameAppendToProjectRoot('logs')); }
      catch (err) { if (err.code !== 'EEXIST') throw err; }
    }
  }

  /**
   * Log information message.
   * @param {String} text
   */
  info(text) {
    this._print('info', text);
  }

  /**
   * Log warning message.
   * @param {String} text
   */
  warn(text) {
    this._print('warn', text);
  }

  /**
   * Log error message.
   * @param {String} text
   */
  error(text) {
    this._print('error', text);
  }

  /**
   * Get current date time.
   * @return {String} Current date time as formatted string.
   * @private
   */
  _getDateTime() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  /**
   * Print a log message to STDOUT and save it in a log file.
   * @param {String} type - Type of log ('info', 'warn' or 'error').
   * @param {String} text - Log message.
   * @private
   */
  _print(type, text) {
    let dateTime = this._getDateTime();
    let log = `${dateTime}: ${type.toUpperCase()}: ${text}`;
    console[type.toLowerCase()](log);

    if (this._saveToFile) {
      let file = Tools.pathnameAppendToProjectRoot(`logs/${dateTime.substr(0, 10)}.log`);
      fs.appendFile(file, `${log}\n`, {encoding: 'utf8'}, () => {});
    }
  }
}

module.exports = Logger;
