const { generateSalt, generateVerifier } = require('../utils/srp');
const accountService = require('./account.service');
const jwt = require('jsonwebtoken');

async function register(username, password, email) {
  const normalizedUsername = username.toUpperCase();

  const salt = generateSalt();
  const verifier = generateVerifier(normalizedUsername, password, salt);

  await accountService.createAccount({
    username: normalizedUsername,
    salt,
    verifier,
    email,
    reg_mail: email
  });
}

async function login(username, password, remember = false) {
  const normalizedUsername = username.toUpperCase();

  if (!password) {
    console.error('[LOGIN] Senha não fornecida');
    throw new Error('Senha obrigatória');
  }

  const user = await accountService.getAccountByUsername(normalizedUsername);
if (!user) throw new Error('Conta não encontrada');

if (!user.salt || !user.verifier) {
  console.log(`[LOGIN] Salt ou verifier ausente para o usuário: ${normalizedUsername}`);
  throw new Error('Dados da conta incompletos.');
}

const inputVerifier = generateVerifier(normalizedUsername, password, user.salt);

console.log('[LOGIN] Verifier válido:', inputVerifier);
console.log('[LOGIN] Verifier do banco:', user.verifier);

// Comparar buffers corretamente:
if (!inputVerifier.equals(user.verifier)) {
  console.log('[LOGIN] Verifier inválido');
  throw new Error('Senha incorreta');
}

  const expiresIn = remember ? '7d' : '1h';
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn
  });

  return { user, token };
}

async function changePassword(username, newPassword) {
  const normalizedUsername = username.toUpperCase();
  const salt = generateSalt();
  const verifier = generateVerifier(normalizedUsername, newPassword, salt);

  await accountService.updatePassword(normalizedUsername, {
    verifier,
    salt
  });
}

module.exports = { register, login, changePassword };
