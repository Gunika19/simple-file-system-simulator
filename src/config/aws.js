const { S3Client } = require("@aws-sdk/client-s3");
const logger = require("./logger");

function createS3Client() {
  const requiredVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    logger.warn('Missing AWS environment variables:', missing);
    logger.warn('S3 upload functionality will not work until these are configured');
  }

  const useLocalstack = process.env.USE_LOCALSTACK_ENDPOINT === "yes";

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    ...(useLocalstack && {
      endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
      forcePathStyle: true,
    }),
  });

  logger.info('S3 Client initialized', { region: process.env.AWS_REGION });
  
  return s3Client;
}

module.exports = createS3Client;