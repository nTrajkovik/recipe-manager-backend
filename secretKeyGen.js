const crypto = require('crypto');

const generateBcryptSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const bcryptSecretKey = generateBcryptSecretKey();
console.log('Generated bcrypt secret key:', bcryptSecretKey);
