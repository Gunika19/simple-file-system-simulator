const BaseException = require('./BaseException');

class ForbiddenException extends BaseException {
  constructor(message = 'Permission denied to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

module.exports = ForbiddenException;