const Joi = require('joi');

const CreateUserDto = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

module.exports = CreateUserDto;