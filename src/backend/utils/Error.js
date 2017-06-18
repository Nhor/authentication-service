class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class InvalidFormat extends ExtendableError {
  constructor(code) {
    super('Invalid format');
    this.code = code;
    this.isCustom = true;
  }
}

class RecordNotFound extends ExtendableError {
  constructor(code) {
    super('Record not found');
    this.code = code;
    this.isCustom = true;
  }
}

let Code = {
  UNKNOWN: 0,
  INVALID_USERNAME_FORMAT: 1,
  INVALID_PASSWORD_FORMAT: 2,
  INVALID_TYPE_FORMAT: 3,
  INVALID_USERNAME_OR_PASSWORD: 4
};

module.exports.InvalidFormat = InvalidFormat;
module.exports.RecordNotFound = RecordNotFound;
module.exports.Code = Code;
