const logger = require("../config/logger");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

function authenticate(container) {
  const jwtService = container.resolve('jwtService');
  
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7);
      const decoded = jwtService.verifyToken(token);
      
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Authentication failed', { error: error.message });
      next(new UnauthorizedException('Invalid or expired token'));
    }
  };
}

module.exports = authenticate;