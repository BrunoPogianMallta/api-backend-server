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

async function login(username, password) {
  // ⚠️ Você NÃO faz a verificação manual aqui. O login SRP será feito pelo cliente WoW via SRP-6 protocolo
  const normalizedUsername = username.toUpperCase();

  const user = await accountService.getAccountByUsername(normalizedUsername);
  if (!user) throw new Error('Conta não encontrada');

  // ⚠️ Aqui você poderia retornar os dados do salt/verifier para testes internos, mas NUNCA expose isso para o cliente final

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h'
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
