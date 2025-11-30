const NotFoundException = require("../exceptions/NotFoundException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const logger = require("../config/logger");
const { Service } = require("../utils/decorators");

@Service()
class UserService {
  constructor({ userModel, passwordEncoder }) {
    this.userModel = userModel;
    this.passwordEncoder = passwordEncoder;
  }

  async createUser(userData) {
    logger.info('Creating user', { email: userData.email });
    const hasedPassword = await this.passwordEncoder.encode(userData.password);
    
    const user = new this.userModel({
      ...userData,
      password: hasedPassword
    });

    const savedUser = await user.save();

    // Remove password from response
    const userObject = savedUser.toObject();
    delete userObject.password;

    return userObject;
  }

  async getUserById(id) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id: ${id}, not found.`);
    }
    return user;
  }

  async getAllUsers() {
    return await this.userModel.find();
  }

  async deleteUser(id) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with id: ${id}, not found.`);
    }
    return result;
  }

  async validateCredentials(email, password) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isValid = await this.passwordEncoder.matches(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }
}

module.exports = UserService;