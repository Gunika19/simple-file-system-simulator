const { Service } = require('../utils/decorators');
const logger = require("../config/logger");

@Service()
class AuthService {
  constructor({ userService, jwtService }) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  async login(email, password) {
    logger.info('Login attempt', { email });
    const user = await this.userService.validateCredentials(email, password);

    const token = this.jwtService.generateToken({
      id: user._id,
      email: user.email,
      name: user.name
    });

    logger.info('Login successful', { userId: user._id });

    return { user, token };
  }

  async register(userData) {
    logger.info('Registration attempt', { email: userData.email });
    const user = await this.userService.createUser(userData);

    const token = this.jwtService.generateToken({
      id: user._id,
      email: user.email,
      name: user.name
    });

    logger.info('Registration successful', { userId: user._id });

    return { user, token };
  }
}

module.exports = AuthService;