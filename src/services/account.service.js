// services/account.service.js
const pool = require('../config/db');

async function createAccount({ username, shaPassHash, email, verifier, salt }) {
  const sql = `
    INSERT INTO account (username, sha_pass_hash, email, v, s)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [username, shaPassHash, email, verifier, salt]);
  return result;
}

async function getAccountByCredentials(username, shaPassHash) {
  const sql = `
    SELECT id, username, email FROM account
    WHERE username = ? AND sha_pass_hash = ?
  `;
  const [rows] = await pool.execute(sql, [username, shaPassHash]);
  return rows[0];
}

module.exports = {
  createAccount,
  getAccountByCredentials
};
