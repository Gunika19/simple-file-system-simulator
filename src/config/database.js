const mongoose = require('mongoose');
const logger = require('./logger');

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    process.exit(1);
  }
}

module.exports = connectDatabase;