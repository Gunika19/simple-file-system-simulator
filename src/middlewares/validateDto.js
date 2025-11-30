const ValidationException = require("../exceptions/ValidationException");

function validateDto(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ValidationException('Validation failed', details);
    }

    // Replace with validated / sanitized value
    req.body = value;
    next();
  }
}

module.exports = validateDto;