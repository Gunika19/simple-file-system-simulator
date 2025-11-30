const Joi = require('joi');

const PresignedUrlDto = Joi.object({
  fileName: Joi.string().required(),
  fileType: Joi.string().required(),
  folder: Joi.string().optional().default('uploads'),
  targetUserEmails: Joi.array().items(Joi.string().email()).min(1).required(),
  expiryDurationMinutes: Joi.number().integer().min(1).max(1440).optional().default(5) // Max 24 hours
});

module.exports = PresignedUrlDto;