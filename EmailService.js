// src/services/EmailService.js
const { Service } = require('../utils/decorators');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

@Service()
class EmailService {
  constructor() {
    // Create transporter using Gmail App Password (recommended)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendAccessCodeEmail({ to, fileName, accessCode, expiryDurationMinutes, uploaderEmail }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: `Secure File Access – ${fileName}`,
        text: `
A file has been securely shared with you.

Uploader: ${uploaderEmail}
File: ${fileName}

Your access code: ${accessCode}

This file will expire ${expiryDurationMinutes} minutes after your first access.

Do NOT share this code with anyone.
        `
      };

      await this.transporter.sendMail(mailOptions);

      logger.info('Access code email sent successfully', { to, fileName });
    } catch (err) {
      logger.error('Failed to send email', { error: err.message });
    }
  }
}

module.exports = EmailService;
