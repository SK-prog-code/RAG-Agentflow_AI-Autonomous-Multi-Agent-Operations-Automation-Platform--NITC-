const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
    encryptedAccessToken: {
      type: String,
      default: '',
    },
    encryptedRefreshToken: {
      type: String,
      default: '',
    },
    apiKey: {
      type: String,
      default: '',
    },
    metadata: {
      email: { type: String, default: '' },
      teamName: { type: String, default: '' },
      botName: { type: String, default: '' },
      channelId: { type: String, default: '' },
      accountName: { type: String, default: '' },
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
