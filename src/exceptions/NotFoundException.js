const BaseException = require('./BaseException');

class NotFoundException extends BaseException {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

module.exports = NotFoundException;