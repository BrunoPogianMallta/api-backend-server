const authDb = require('../config/db');

// ==============================================
// ✅ Funções para usuários logados (JWT)
// ==============================================
async function getVoteStatus(accountId) {
  const [rows] = await authDb.execute(`
    SELECT site_id, next_vote_time
    FROM vote_status
    WHERE account_id = ?
  `, [accountId]);
  return rows;
}

async function updateVoteStatus(accountId, site_id, nextVoteTime) {
  await authDb.execute(`
    INSERT INTO vote_status (account_id, site_id, next_vote_time)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE next_vote_time = VALUES(next_vote_time)
  `, [accountId, site_id, nextVoteTime]);
}

async function getVotePoints(accountId) {
  const [rows] = await authDb.execute(`
    SELECT vote_points
    FROM account
    WHERE id = ?
  `, [accountId]);
  return rows[0]?.vote_points || 0;
}

async function addVotePoints(accountId, pointsToAdd) {
  await authDb.execute(`
    UPDATE account
    SET vote_points = vote_points + ?
    WHERE id = ?
  `, [pointsToAdd, accountId]);
}

// ==============================================
// ✅ Funções para Postback (Top100Arena)
// ==============================================
async function getVoteStatusByPostback(postbackId, siteId) {
  const [rows] = await authDb.execute(`
    SELECT next_vote_time
    FROM vote_status
    WHERE postback_id = ? AND site_id = ?
  `, [postbackId, siteId]);
  return rows;
}

async function updateVoteStatusByPostback(postbackId, siteId, nextVoteTime) {
  await authDb.execute(`
    INSERT INTO vote_status (postback_id, site_id, next_vote_time)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE next_vote_time = VALUES(next_vote_time)
  `, [postbackId, siteId, nextVoteTime]);
}

async function logPostback(postbackId, ip, siteId) {
  await authDb.execute(`
    INSERT INTO postback_logs (postback_id, ip, site_id, received_at)
    VALUES (?, ?, ?, NOW())
  `, [postbackId, ip, siteId]);
}

module.exports = {
  // Usuários logados
  getVoteStatus,
  updateVoteStatus,
  getVotePoints,
  addVotePoints,

  // Postback
  getVoteStatusByPostback,
  updateVoteStatusByPostback,
  logPostback
};