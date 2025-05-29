const pool = require('../config/db');

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

async function updatePassword(username, { verifier, salt }) {
  const sql = `
    UPDATE account
    SET v = ?, salt = ?
    WHERE username = ?
  `;

  const [result] = await pool.execute(sql, [
    verifier,
    salt,
    username
  ]);

  return result;
}

async function getAccountByUsername(username) {
  const sql = `SELECT id, username FROM account WHERE username = ?`;
  const [rows] = await pool.execute(sql, [username]);
  return rows[0];
}

async function getAccountById(id) {
  const [rows] = await pool.execute('SELECT id,username FROM account WHERE id = ?', [id]);
  console.log('[DB] getAccountById resultado:', rows);
  return rows[0];
}


module.exports = {
  createAccount,
  updatePassword,
  getAccountByUsername,
  getAccountById
};

