const BaseException = require('./BaseException');

class ValidationException extends BaseException {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

module.exports = ValidationException;