const {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
  GetBucketCorsCommand
} = require("@aws-sdk/client-s3");

const logger = require("./logger");

async function initS3Bucket() {
  if (process.env.TRIGGER_LOCALSTACK_BUCKET_CREATION !== "yes") return;
  const bucketName = process.env.AWS_S3_BUCKET || "test-bucket";

  const client = new S3Client({
    endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test"
    },
    forcePathStyle: true
  });

  try {
    await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    logger.info("Bucket created:", bucketName);
  } catch (err) {
    if (err.name === "BucketAlreadyOwnedByYou" || err.name === "BucketAlreadyExists") {
      logger.info("Bucket already exists ...");
    } else {
      throw err;
    }
  }

  const cors = {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["PUT", "POST", "GET"],
        AllowedOrigins: [`http://localhost:${process.env.PORT}`],
        ExposeHeaders: ["ETag"],
      }
    ]
  };

  await client.send(new PutBucketCorsCommand({
    Bucket: bucketName, CORSConfiguration: cors
  }));

  logger.info("CORS Config applied.");

  const resp = await client.send(
    new GetBucketCorsCommand({ Bucket: bucketName })
  );

  logger.info(`Current CORS Rules: ${JSON.stringify(resp.CORSRules, null, 2)}`);
}

module.exports = initS3Bucket;