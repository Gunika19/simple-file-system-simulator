const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number },
  s3Key: { type: String, required: true, unique: true },
  fileUrl: { type: String, required: true },
  folder: { type: String, default: 'uploads' },
  status: {
    type: String,
    enum: ['pending', 'uploaded', 'expired', 'deleted'],
    default: 'pending'
  },
  targetUserEmails: [{ type: String, required: true }],
  accessCode: { type: String, required: true },
  expiryDurationMinutes: { type: Number, required: true, default: 5 },
  firstAccessedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
},{
  timestamps: true
});

fileSchema.index({ s3Key: 1 });
fileSchema.index({ userId: 1, status: 1 });
fileSchema.index({ accessCode: 1 });

fileSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

module.exports = mongoose.model('File', fileSchema);