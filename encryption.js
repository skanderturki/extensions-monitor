import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Store IV with the encrypted text
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


// Write the encrypted password to a file
function storePassword(password) {
  const encryptedPassword = encrypt(password);
  const filePath = path.join(__dirname, 'password.txt'); // Store in a secure directory
  fs.writeFileSync(filePath, encryptedPassword);
}

// Read and decrypt the password from the file
function readPassword() {
  const filePath = path.join(__dirname, '.env');
  const encryptedPassword = fs.readFileSync(filePath, 'utf-8');
  return decrypt(encryptedPassword);
}

module.exports = { encrypt, decrypt }