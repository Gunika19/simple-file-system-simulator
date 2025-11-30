const BaseException = require('./BaseException');

class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized action. Invalid Credentials.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = UnauthorizedException;