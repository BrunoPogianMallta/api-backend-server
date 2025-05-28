const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/password');
const { generateSalt, generateVerifier } = require('../utils/srp');
const accountService = require('./account.service');

async function register(username, password, email) {
  const normalizedUsername = username.toUpperCase();

  const sha1Pass = hashPassword(normalizedUsername, password);
  const salt = generateSalt();
  const verifier = generateVerifier(normalizedUsername, password, salt);

  await accountService.createAccount({
    username: normalizedUsername,
    shaPassHash: sha1Pass,
    email,
    verifier,
    salt
  });
}

async function login(username, password) {
  const normalizedUsername = username.toUpperCase();
  const hashed = hashPassword(normalizedUsername, password);

  const user = await accountService.getAccountByCredentials(normalizedUsername, hashed);
  if (!user) throw new Error('Credenciais inválidas');

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return { user, token };
}


module.exports = { register, login };
