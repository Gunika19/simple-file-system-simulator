const { Controller, Post } = require('../utils/decorators');
const validateDto = require('../middlewares/validateDto');
const CreateUserDto = require('../dtos/CreateUserDto');
const LoginDto = require('../dtos/LoginDto');
const logger = require('../config/logger');

@Controller('/auth')
class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  @Post('/register', [validateDto(CreateUserDto)])
  async register(req, res) {
    const result = await this.authService.register(req.body);
    logger.info('User registered successfully');
    res.status(201).json({ 
      success: true, 
      data: result
    });
  }

  @Post('/login', [validateDto(LoginDto)])
  async login(req, res) {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.json({ 
      success: true, 
      data: result
    });
  }
}

module.exports = AuthController;