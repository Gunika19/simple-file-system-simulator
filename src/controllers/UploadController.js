const { Controller, Post, Get } = require('../utils/decorators');
const validateDto = require('../middlewares/validateDto');
const PresignedUrlDto = require('../dtos/PresignedUrlDto');
const DownloadRequestDto = require('../dtos/DownloadRequestDto');
const logger = require('../config/logger');
const ForbiddenException = require('../exceptions/ForbiddenException');

@Controller('/upload')
class UploadController {
  constructor({ s3Service, fileService }) {
    this.s3Service = s3Service;
    this.fileService = fileService;
  }

  @Post('/presigned-url', ['authenticate', validateDto(PresignedUrlDto)])
  async getPresignedUrl(req, res) {
    const { fileName, fileType, folder, targetUserEmails, expiryDurationMinutes } = req.body;
    const userId = req.user.id;

    const result = await this.s3Service.generatePresignedUploadUrl(
      fileName, fileType, folder
    );

    const fileRecord = await this.fileService.createFileRecord({
      userId,
      fileName,
      fileType,
      s3Key: result.key,
      fileUrl: result.fileUrl,
      folder,
      targetUserEmails,
      expiryDurationMinutes: expiryDurationMinutes || 5,
      status: 'pending'
    });

    logger.info('Presigned URL generated with access control', { 
      userId, 
      fileName,
      key: result.key,
      targetUserEmails,
      accessCode: fileRecord.accessCode
    });
    
    res.json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        key: result.key,
        fileUrl: result.fileUrl,
        accessCode: fileRecord.accessCode,
        expiryDurationMinutes: fileRecord.expiryDurationMinutes,
        targetUserEmails: fileRecord.targetUserEmails
      },
      message: 'Share the access code with target users to allow them to download'
    });
  }

  @Post('/confirm', ['authenticate'])
  async confirmUpload(req, res) {
    const { key } = req.body;
    const userId = req.user.id;

    const file = await this.fileService.confirmUpload(key);

    if (file.userId.toString() !== userId) throw new ForbiddenException();

    logger.info('File upload confirmed', { userId, key });
    
    res.json({
      success: true,
      message: 'Upload confirmed',
      data: {
        key: file.s3Key,
        fileUrl: file.fileUrl,
        accessCode: file.accessCode,
        status: file.status
      }
    });
  }

  @Post('/download', ['authenticate', validateDto(DownloadRequestDto)])
  async getDownloadUrl(req, res) {
    const { s3Key,accessCode } = req.body;
    const requestingUserEmail = req.user.email;

    const file = await this.fileService.validateAccessAndSetExpiry(
      s3Key, accessCode, requestingUserEmail
    );

    const downloadUrl = await this.s3Service.generatePresignedDownloadUrl(s3Key);

    logger.info('Download URL generated', { 
      fileId: file._id, 
      requestingUserEmail,
      expiresAt: file.expiresAt 
    });

    res.json({
      success: true,
      data: { 
        downloadUrl,
        fileName: file.fileName,
        fileType: file.fileType,
        expiresAt: file.expiresAt,
        timeRemainingMinutes: file.expiresAt 
          ? Math.ceil((file.expiresAt - new Date()) / 1000 / 60) 
          : file.expiryDurationMinutes
      }
    });
  }

  @Get('/my-files', ['authenticate'])
  async getMyFiles(req, res) {
    const userId = req.user.id;
    const files = await this.fileService.getUserFiles(userId);

    res.json({
      success: true,
      data: files.map(file => ({
        id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        s3Key: file.s3Key,
        fileUrl: file.fileUrl,
        status: file.status,
        accessCode: file.accessCode,
        targetUserEmails: file.targetUserEmails,
        expiryDurationMinutes: file.expiryDurationMinutes,
        firstAccessedAt: file.firstAccessedAt,
        expiresAt: file.expiresAt,
        createdAt: file.createdAt
      }))
    });
  }

  @Get('/file/:key', ['authenticate'])
  async getFileDetails(req, res) {
    const s3Key = req.params.key;
    const file = await this.fileService.getFileByKey(s3Key);

    const userId = req.user.id;
    const userEmail = req.user.email;
    
    if (file.userId.toString() !== userId && !file.targetUserEmails.includes(userEmail)) {
      throw new ForbiddenException('Permission denied to view this file');
    }

    res.json({
      success: true,
      data: {
        fileName: file.fileName,
        fileType: file.fileType,
        status: file.status,
        targetUserEmails: file.targetUserEmails,
        expiryDurationMinutes: file.expiryDurationMinutes,
        firstAccessedAt: file.firstAccessedAt,
        expiresAt: file.expiresAt,
        isExpired: file.isExpired,
        createdAt: file.createdAt
      }
    });
  }
}

module.exports = UploadController;