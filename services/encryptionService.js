const crypto = require('crypto');
require('dotenv').config();

const IV_LENGTH = 16;

module.exports = {
    encrypt(text) {
        let iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
      },
    
      decrypt(text) {
        let [iv, encrypted] = text.split(':');
        iv = Buffer.from(iv, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
      }
};