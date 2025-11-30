const { Service } = require('../utils/decorators');
const logger = require('../config/logger');
const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const crypto = require('crypto');

@Service()
class FileService {
  constructor({ fileModel }) {
    this.fileModel = fileModel;
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
    logger.info('File record created', { fileId: savedFile._id, s3Key: savedFile.s3Key });
    
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

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if file is uploaded
    if (file.status !== 'uploaded') {
      throw new ValidationException('File is not available for download');
    }

    // Check if requesting user is in target list
    if (!file.targetUserEmails.includes(requestingUserEmail)) {
      throw new ValidationException('You are not authorized to access this file');
    }

    // Validate access code
    if (file.accessCode !== accessCode) {
      throw new ValidationException('Invalid access code');
    }

    // If first access, set expiry timestamp
    if (!file.firstAccessedAt) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + file.expiryDurationMinutes * 60 * 1000);
      
      file.firstAccessedAt = now;
      file.expiresAt = expiresAt;
      await file.save();
      
      logger.info('File first accessed, expiry set', { 
        fileId: file._id, 
        expiresAt,
        expiryDurationMinutes: file.expiryDurationMinutes 
      });
    } else {
      // Check if file has expired
      if (file.expiresAt && new Date() > file.expiresAt) {
        await this.fileModel.findByIdAndUpdate(file._id, { status: 'expired' });
        throw new ValidationException('File has expired');
      }
    }

    return file;
  }

  async getUserFiles(userId) {
    return await this.fileModel.find({ 
      userId, 
      status: { $in: ['uploaded', 'pending'] } 
    }).sort({ createdAt: -1 });
  }

  async getFileByKey(s3Key) {
    const file = await this.fileModel.findOne({ s3Key });
    if (!file) {
      throw new NotFoundException('File not found');
    }
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