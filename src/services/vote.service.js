const authDb = require('../config/db'); 

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

module.exports = {
  getVoteStatus,
  updateVoteStatus,
  getVotePoints,
  addVotePoints
};
