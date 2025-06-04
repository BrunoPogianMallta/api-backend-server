const shopService = require('../services/shopService');

const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await shopService.getItemById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar item por ID', error: error.message });
  }
};

const getItemByName = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: 'Parâmetro "name" é obrigatório' });

  try {
    const items = await shopService.getItemByName(name);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar item por nome', error: error.message });
  }
};

const getAllWorldItems = async (req, res) => {
  try {
    const items = await shopService.getAllWorldItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar todos os itens do mundo', error: error.message });
  }
};

const getAllPets = async (req, res) => {
  try {
    const pets = await shopService.getAllPets();
    res.json(pets);
  } catch (error) {
    console.error('Erro na rota /shop/pets:', error);
    res.status(500).json({ message: 'Erro ao buscar mascotes', error: error.message });
  }
};

const addItemToShop = async (req, res) => {
  try {
    await shopService.addItemToShop(req.body);
    res.status(201).json({ message: 'Item adicionado à loja com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar item à loja', error: error.message });
  }
};

const getItemsFromStore = async (req, res) => {
  try {
    const items = await shopService.getItemsFromStore();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar itens da loja', error: error.message });
  }
};

const buyItem = async (req, res) => {
  const { playerName, item_entry } = req.body;

  if (!playerName || !item_entry) {
    return res.status(400).json({ message: 'playerName e item_entry são obrigatórios' });
  }

  try {
    const result = await shopService.buyItem(playerName, item_entry);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar compra', error: error.message });
  }
};

const getShopItems = async (req, res) => {
  try {
    const items = await shopService.getShopItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar itens da loja (formatado)', error: error.message });
  }
};

module.exports = {
  getItemById,
  getItemByName,
  getAllWorldItems,
  addItemToShop,
  getItemsFromStore,
  buyItem,
  getShopItems,
  getAllPets // 👈 Exportando a nova função corretamente
};
