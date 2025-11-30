require('dotenv').config();
const express = require('express');
const setupContainer = require('./config/container');
const connectDatabase = require('./config/database');
const setupRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./config/logger');
const initS3Bucket = require('./config/bucket');
const cors = require('cors');

(async function () {
  if (process.env.TRIGGER_LOCALSTACK_BUCKET_CREATION !== "yes") return;

  try {
    await initS3Bucket();
    logger.info("S3 bucket init complete");
  } catch (err) {
    logger.error(`S3 bucket init failed (continuing startup): ${err}`);
    process.exit(1);
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(cors({
  origin: 'http://localhost:3000', // or '*' for dev
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.options('/*', cors());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

app.use(express.static('public'));

// Setup DI Container
const container = setupContainer();

// Setup routes
setupRoutes(app, container);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDatabase();
  
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});

module.exports = app;