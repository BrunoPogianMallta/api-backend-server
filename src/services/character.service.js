const charactersPool = require('../config/charDb');

async function getMainCharacterByAccountId(accountId) {
  const sql = `
    SELECT name, race, class, level, totaltime
    FROM characters
    WHERE account = ?
    ORDER BY level DESC
    LIMIT 1
  `;
  const [rows] = await charactersPool.execute(sql, [accountId]);
  return rows[0];
}

async function getAllCharactersByAccountId( accountId) {
    const sql = `SELECT guid, name, race, class, level, totaltime,gender
    FROM characters
    WHERE account = ?
    ORDER BY level DESC`
    ;
    const [rows] = await charactersPool.execute(sql,[accountId]);
    return rows;
}

module.exports = { 
    getMainCharacterByAccountId
    ,getAllCharactersByAccountId 
};
