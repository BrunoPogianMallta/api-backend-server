const accountService = require('../services/account.service');
const characterService = require('../services/character.service');
// const voteService = require('../services/vote.service'); // se ainda for usar no futuro

async function getProfile(req, res) {
  try {
    const userId = req.user.id; // Vem do JWT token

    // Buscar conta no banco auth_core
    const account = await accountService.getAccountFullById(userId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Buscar personagem principal (maior nível)
    const mainCharacter = await characterService.getMainCharacterByAccountId(userId);
    if (!mainCharacter) {
      return res.status(404).json({ success: false, message: 'Nenhum personagem encontrado' });
    }

    // Montar caminho do avatar (ajuste conforme imagens que você tiver)
    const avatarUrl = `/images/avatars/${mainCharacter.race}_${mainCharacter.class}.jpg`;

    // Construir a resposta para o front-end
    const profileData = {
      username: account.username,
      avatarUrl,
      class: getClassName(mainCharacter.class),
      level: mainCharacter.level,
      votePoints: account.vote_points || 0,
      joinDate: formatDate(account.joindate),
      ranking: 0, // futuramente você implementa essa lógica
      hoursPlayed: Math.floor((account.totaltime || 0) / 3600)
    };

    return res.json({ success: true, data: profileData });

  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
  }
}

// Traduz ID da classe para nome
function getClassName(classId) {
  const classes = {
    1: 'Guerreiro', 2: 'Paladino', 3: 'Caçador', 4: 'Ladino',
    5: 'Sacerdote', 6: 'Cavaleiro da Morte', 7: 'Xamã',
    8: 'Mago', 9: 'Bruxo', 10: 'Monge', 11: 'Druida'
  };
  return classes[classId] || 'Desconhecido';
}

// Formata datas para YYYY-MM-DD
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

module.exports = { getProfile };
