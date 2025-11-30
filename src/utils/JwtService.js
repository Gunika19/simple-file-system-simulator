const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'DEVS-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  generateToken(payload) {
    try {
      return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    } catch (error) {
      logger.error('Error generating JWT token', { error: error.message });
      throw error;
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      logger.error('Error verifying JWT token', { error: error.message });
      throw error;
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtService;