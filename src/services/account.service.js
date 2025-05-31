const pool = require('../config/db');

// Cria uma nova conta
async function createAccount({ username, salt, verifier, email, reg_mail, locked = 0, expansion = 2 }) {
  const sql = `
    INSERT INTO account (username, salt, verifier, email, reg_mail, joindate, locked, expansion)
    VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    username,
    salt,
    verifier,
    email,
    reg_mail,
    locked,
    expansion
  ]);
  return result;
}

// Atualiza apenas o e-mail da conta
async function updateEmail(userId, newEmail) {
  const sql = `UPDATE account SET email = ? WHERE id = ?`;
  const [result] = await pool.execute(sql, [newEmail, userId]);
  return result;
}

// Atualiza apenas a senha (verifier + salt)
async function updatePasswordSRP(username, verifier, salt) {
  const sql = `
    UPDATE account
    SET v = ?, salt = ?
    WHERE username = ?
  `;
  const [result] = await pool.execute(sql, [verifier, salt, username]);
  return result;
}

// Busca uma conta por nome de usuário
async function getAccountByUsername(username) {
  const sql = `SELECT id, username FROM account WHERE username = ?`;
  const [rows] = await pool.execute(sql, [username]);
  return rows[0];
}

// Busca uma conta por ID
async function getAccountById(id) {
  const sql = `SELECT id, username FROM account WHERE id = ?`;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
}

// Retorna informações completas da conta (usado no dashboard)
async function getAccountFullById(id) {
  const sql = `
    SELECT id, username, vote_points, joindate, totaltime
    FROM account
    WHERE id = ?
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
}

module.exports = {
  createAccount,
  updateEmail,
  updatePasswordSRP,
  getAccountByUsername,
  getAccountById,
  getAccountFullById
};
