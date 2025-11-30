const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const logger = require('../config/logger');
const { Service } = require('./decorators');

@Service()
class S3Service {
  constructor({ s3Client }) {
    this.s3Client = s3Client;
    this.bucket = process.env.AWS_S3_BUCKET;
    this.region = process.env.AWS_REGION;
    this.expirationSeconds = parseInt(process.env.AWS_S3_UPLOAD_EXPIRATION || '300');
  }

  async generatePresignedUploadUrl(fileName, fileType, folder = 'uploads') {
    try {
      const key = `${folder}/${uuidv4()}-${fileName}`;
      const command = new PutObjectCommand({
        Bucket: this.bucket, Key: key, ContentType: fileType
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.expirationSeconds
      });

      logger.info('Generated presigned upload URL', { key, fileType });

      return {
        uploadUrl: presignedUrl, key: key, fileUrl: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
      };
    } catch (error) {
      logger.error('Error generating presigned URL', { error: error.message });
      throw error;
    }
  }

  async generatePresignedDownloadUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket, Key: key
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn, });

      logger.info('Generated presigned download URL', { key });
      return presignedUrl;
    } catch (error) {
      logger.error('Error generating presigned download URL', { error: error.message });
      throw error;
    }
  }

  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket, Key: key
      });

      await this.s3Client.send(command);
      logger.info('File deleted from S3', { key });

      return true;
    } catch (error) {
      logger.error('Error deleting file from S3', { error: error.message });
      throw error;
    }
  }
}

module.exports = S3Service;