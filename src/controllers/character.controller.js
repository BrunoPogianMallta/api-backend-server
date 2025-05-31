const characterService = require('../services/character.service');

async function getAllCharacters(req, res) {
  try {
    const accountId = req.user.id; 
    const characters = await characterService.getAllCharactersByAccountId(accountId);
    res.json(characters);
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    res.status(500).json({ error: 'Erro ao buscar personagens' });
  }
}

async function getMainCharacter(req, res) {
  try {
    const accountId = req.user.id;
    const mainCharacter = await characterService.getMainCharacterByAccountId(accountId);
    if (!mainCharacter) {
      return res.status(404).json({ error: 'Nenhum personagem principal encontrado' });
    }
    res.json(mainCharacter);
  } catch (error) {
    console.error('Erro ao buscar personagem principal:', error);
    res.status(500).json({ error: 'Erro ao buscar personagem principal' });
  }
}

module.exports = {
  getAllCharacters,
  getMainCharacter
};
