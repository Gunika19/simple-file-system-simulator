const { buildRoutes } = require('../utils/decorators');
const logger = require('../config/logger');
const glob = require('glob');
const path = require('path');

function setupRoutes(app, container) {
  // Load all controllers to trigger decorators
  const controllerFiles = glob.sync(path.join(__dirname, '../controllers/**/*Controller.js'));
  controllerFiles.forEach(file => {
    require(file);
  });

  // Build routes from decorated controllers
  const apiRouter = buildRoutes(container);
  
  app.use('/api', apiRouter);
  
  logger.info('Routes auto-registered successfully');
}

module.exports = setupRoutes;