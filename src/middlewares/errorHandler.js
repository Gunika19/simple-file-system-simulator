const logger = require("../config/logger");
const BaseException = require('../exceptions/BaseException');

function errorHandler(err, req, res, next) {
  logger.error('Error occured', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof BaseException) {
    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
      details: err.details || null,
    });
  }

  // Mongoose Validation Errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: err.message || 'Validation failed',
      details: Object.values(err.errors).map(e => e.message),
    });
  }

  // Default Error
  res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_ERROR',
    message: 'An unexpected error occured'
  });
}

module.exports = errorHandler;