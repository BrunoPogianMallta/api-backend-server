const crypto = require('crypto');

function hashPassword(username, password) {
  const normalized = `${username.toUpperCase()}:${password.toUpperCase()}`;
  return crypto.createHash('sha1').update(normalized).digest('hex').toUpperCase();
}

module.exports = { hashPassword };
