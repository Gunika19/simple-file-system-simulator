
const { Service } = require('../utils/decorators');
const logger = require('../config/logger');
const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const crypto = require('crypto');

@Service()
class FileService {
  constructor({ fileModel, userModel, emailService }) {
    this.fileModel = fileModel;
    this.userModel = userModel;
    this.emailService = emailService;
  }

  generateAccessCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async createFileRecord(fileData) {
    const accessCode = this.generateAccessCode();

    const file = new this.fileModel({
      ...fileData,
      accessCode,
      status: 'pending'
    });

    const savedFile = await file.save();

    logger.info('File record created', {
      fileId: savedFile._id,
      accessCode,
      targetUserEmails: savedFile.targetUserEmails
    });

    // fetch uploader email
    let uploaderEmail = null;
    try {
      const uploader = await this.userModel.findById(savedFile.userId);
      uploaderEmail = uploader?.email || null;
    } catch (err) {
      logger.warn('Could not fetch uploader email', { error: err.message });
    }

    // email access code to each recipient
    if (this.emailService) {
      try {
        await Promise.all(
          savedFile.targetUserEmails.map(email =>
            this.emailService.sendAccessCodeEmail({
              to: email,
              fileName: savedFile.fileName,
              accessCode: savedFile.accessCode,
              expiryDurationMinutes: savedFile.expiryDurationMinutes,
              uploaderEmail
            })
          )
        );
      } catch (err) {
        logger.error('Failed to send access code emails', { error: err.message });
      }
    }

    return savedFile;
  }

  async confirmUpload(s3Key) {
    const file = await this.fileModel.findOneAndUpdate(
      { s3Key, status: 'pending' },
      { status: 'uploaded' },
      { new: true }
    );

    if (!file) {
      throw new NotFoundException('File not found or already confirmed');
    }

    logger.info('File upload confirmed', { fileId: file._id, s3Key });
    return file;
  }

  async validateAccessAndSetExpiry(s3Key, accessCode, requestingUserEmail) {
    const file = await this.fileModel.findOne({ s3Key });

    if (!file) throw new NotFoundException('File not found');

    if (file.status !== 'uploaded') {
      throw new ValidationException('File is not available for download');
    }

    if (!file.targetUserEmails.includes(requestingUserEmail)) {
      throw new ValidationException('You are not authorized to access this file');
    }

    if (file.accessCode !== accessCode) {
      throw new ValidationException('Invalid access code');
    }

    // first-time access sets expiry
    if (!file.firstAccessedAt) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + file.expiryDurationMinutes * 60 * 1000);

      file.firstAccessedAt = now;
      file.expiresAt = expiresAt;
      await file.save();

      logger.info('File expiry set on first access', { fileId: file._id, expiresAt });
    } else {
      if (file.expiresAt && new Date() > file.expiresAt) {
        await this.fileModel.findByIdAndUpdate(file._id, { status: 'expired' });
        throw new ValidationException('File has expired');
      }
    }

    return file;
  }

  async getUserFiles(userId) {
    return await this.fileModel
      .find({ userId, status: { $in: ['uploaded', 'pending'] } })
      .sort({ createdAt: -1 });
  }

  async getFileByKey(s3Key) {
    const file = await this.fileModel.findOne({ s3Key });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async markAsDeleted(s3Key) {
    return await this.fileModel.findOneAndUpdate(
      { s3Key },
      { status: 'deleted' },
      { new: true }
    );
  }
}

module.exports = FileService;
