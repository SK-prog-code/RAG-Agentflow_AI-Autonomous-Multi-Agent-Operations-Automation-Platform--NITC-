const crypto = require('crypto');
const env = require('../config/env');

class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
    this.algorithm = 'aes-256-gcm';
    // Ensure 32-byte key for AES-256
    const rawKey = env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
    this.encryptionKey = crypto.createHash('sha256').update(String(rawKey)).digest();
  }

  /**
   * Encrypt sensitive string (e.g. access_token, refresh_token)
   */
  encrypt(text) {
    if (!text) return '';
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err) {
      console.error(`[Encryption Error] ${this.providerName}:`, err.message);
      throw new Error('Failed to encrypt integration credentials');
    }
  }

  /**
   * Decrypt encrypted credential string
   */
  decrypt(encryptedData) {
    if (!encryptedData) return '';
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted payload format');
      }
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error(`[Decryption Error] ${this.providerName}:`, err.message);
      throw new Error('Failed to decrypt integration credentials. Invalid or altered key.');
    }
  }

  /**
   * Return OAuth authorization URL
   */
  getAuthUrl(state) {
    throw new Error('getAuthUrl must be implemented by subclass');
  }

  /**
   * Handle OAuth exchange
   */
  async handleCallback(code) {
    throw new Error('handleCallback must be implemented by subclass');
  }

  /**
   * Test if the credentials are valid
   */
  async testConnection(credentials) {
    throw new Error('testConnection must be implemented by subclass');
  }

  /**
   * Execute integration action
   */
  async executeAction(action, payload, credentials) {
    throw new Error('executeAction must be implemented by subclass');
  }
}

module.exports = BaseIntegration;
