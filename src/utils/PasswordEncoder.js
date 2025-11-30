const bcrypt = require('bcrypt');
const logger = require("../config/logger");

class PasswordEncoder {
  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  }

  async encode(plainPassword) {
    try {
      const hash = await bcrypt.hash(plainPassword, this.saltRounds);
      return hash;
    } catch (error) {
      logger.error('Error encoding password', { error: error.message });
      throw error;
    }
  }

  async matches(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Error comparing passwords', { error: error.message });
      throw error;
    }
  }
}

module.exports = PasswordEncoder;