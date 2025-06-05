const authDb = require('../config/db'); // auth_core
const charDb = require('../config/db.characters');


async function getUserDashboardProfile(accountId) {
  // 1. Buscar usuário
  const [userRows] = await authDb.execute(`
    SELECT username, joindate FROM account WHERE id = ?
  `, [accountId]);

  const user = userRows[0];
  if (!user) {
    // Retornar null ou objeto vazio para o frontend tratar
    return null;
  }

  // resto do código mantém igual...
  const [charRows] = await charDb.execute(`
    SELECT name, class, level, totaltime FROM characters WHERE account = ? ORDER BY level DESC LIMIT 1
  `, [accountId]);

  const character = charRows[0];

  const [voteRows] = await authDb.execute(`
    SELECT points FROM vote_points WHERE account_id = ?
  `, [accountId]);

  const votePoints = voteRows[0]?.points || 0;

  const [rankingRows] = await charDb.execute(`
    SELECT account, MAX(level) as level FROM characters GROUP BY account ORDER BY level DESC
  `);

  let ranking = rankingRows.findIndex(row => row.account === accountId) + 1;

  return {
    username: user.username,
    avatarUrl: '/images/logomallta.png',
    class: getClassName(character?.class),
    level: character?.level || 0,
    votePoints,
    joinDate: user.joindate.toISOString().split('T')[0],
    ranking: ranking || null,
    hoursPlayed: Math.floor((character?.totaltime || 0) / 3600),
  };
}

function getClassName(classId) {
  const classes = {
    1: 'Guerreiro',
    2: 'Paladino',
    3: 'Caçador',
    4: 'Ladino',
    5: 'Sacerdote',
    6: 'Cavaleiro da Morte',
    7: 'Xamã',
    8: 'Mago',
    9: 'Bruxo',
    11: 'Druida'
  };
  return classes[classId] || 'Desconhecido';
}

module.exports = {
  getUserDashboardProfile
};
