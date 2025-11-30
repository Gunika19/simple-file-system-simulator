const { createContainer, asClass, asValue, asFunction } = require('awilix');
const glob = require('glob');
const path = require('path');
const User = require('../models/User');
const File = require('../models/File');
const logger = require('./logger');
const PasswordEncoder = require('../utils/PasswordEncoder');
const JwtService = require('../utils/JwtService');
const S3Service = require('../utils/S3Service');
const authenticationFactory = require("../middlewares/authenticate");
const createS3Client = require('./aws');

function setupContainer() {
  const container = createContainer();

  // Register the container itself (for middleware access)
  container.register({
    container: asValue(container)
  });

  // Register core utilities
  container.register({
    passwordEncoder: asClass(PasswordEncoder).singleton(),
    jwtService: asClass(JwtService).singleton(),
    s3Client: asFunction(createS3Client).singleton(),
    s3Service: asClass(S3Service).singleton(),
  });

  // Register models
  container.register({
    userModel: asValue(User),
    fileModel: asValue(File)
  });

  // Register middlewares
  container.register({
    authenticate: asFunction(() => authenticationFactory(container)).singleton()
  });

  // Auto-discover and register services
  const serviceFiles = glob.sync(path.join(__dirname, '../services/**/*Service.js'));
  serviceFiles.forEach(file => {
    const Service = require(file);
    if (Service._isService) {
      const serviceName = path.basename(file, '.js');
      const instanceName = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
      container.register({
        [instanceName]: asClass(Service).singleton()
      });
      logger.info(`Registered service: ${instanceName}`);
    }
  });

  // Auto-discover and register controllers
  const controllerFiles = glob.sync(path.join(__dirname, '../controllers/**/*Controller.js'));
  controllerFiles.forEach(file => {
    const Controller = require(file);
    if (Controller._isController) {
      const controllerName = path.basename(file, '.js');
      const instanceName = controllerName.charAt(0).toLowerCase() + controllerName.slice(1);
      container.register({
        [instanceName]: asClass(Controller).singleton()
      });
      logger.info(`Registered controller: ${instanceName}`);
    }
  });

  return container;
}

module.exports = setupContainer;