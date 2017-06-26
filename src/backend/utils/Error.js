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

class RecordAlreadyExists extends ExtendableError {
  constructor(code) {
    super('Record already exists');
    this.code = code;
    this.isCustom = true;
  }
}

let Code = {
  UNKNOWN: 0,
  INVALID_EMAIL_FORMAT: 1,
  INVALID_USERNAME_FORMAT: 2,
  INVALID_PASSWORD_FORMAT: 3,
  INVALID_USERNAME_OR_PASSWORD: 4,
  EMAIL_IN_USE: 5,
  USERNAME_IN_USE: 6,
  ADMIN_NOT_FOUND: 7,
  ADMIN_PERMISSION_NOT_FOUND: 8,
  ADMIN_PERMISSION_ALREADY_GRANTED: 9,
  INVALID_ID_FORMAT: 10,
  INVALID_ADMIN_ID_FORMAT: 11
};

module.exports.InvalidFormat = InvalidFormat;
module.exports.RecordNotFound = RecordNotFound;
module.exports.RecordAlreadyExists = RecordAlreadyExists;
module.exports.Code = Code;
