const Joi = require('joi');

const DownloadRequestDto = Joi.object({
  s3Key: Joi.string().required(),
  accessCode: Joi.string().length(6).pattern(/^\d+$/).required()
});

module.exports = DownloadRequestDto;