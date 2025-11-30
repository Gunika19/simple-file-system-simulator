const logger = require('../config/logger');
const { Controller, Post, Get, Delete } = require('../utils/decorators');
const validateDto = require('../middlewares/validateDto');
const CreateUserDto = require('../dtos/CreateUserDto');

// Example protected controller
@Controller('/users')
class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }

  @Post('/', [validateDto(CreateUserDto), 'authenticate'])
  async create(req, res) {
    const user = await this.userService.createUser(req.body);
    logger.info('User created successfully', { userId: user._id });
    res.status(201).json({ success: true, data: user });
  }

  @Get('/profile', ['authenticate'])
  async getProfile(req, res) {
    // Authenticated user accessible via req.user
    const userId = req.user.id;
    res.json({ success: true, user: req.user });
  }

  @Delete('/:id', ['authenticate'])
  async delete(req, res) {
    await this.userService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  }
}

module.exports = UserController;