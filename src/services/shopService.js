const worldPool = require('../config/worldDb');
const authPool = require('../config/db');
const charactersPool = require('../config/charDb');
const shopDb = require('../config/shopDb');


async function getAllPets() {
  try {
    const [rows] = await worldPool.execute(`
      SELECT 
        entry AS item_entry,
        displayid,
        name,
        class,
        subclass,
        ItemLevel AS item_level,
        Quality AS quality,
        InventoryType AS inventory_type
      FROM item_template
      WHERE class = 15 AND subclass = 2
        AND name IS NOT NULL AND name != ''
    `);

    return rows;
  } catch (error) {
    console.error('Erro em getAllPets:', error);
    throw error;
  }
}



async function getItemById(entry) {
  try {
    const [[item]] = await worldPool.execute(`
      SELECT entry, name FROM item_template WHERE entry = ?
    `, [entry]);

    return item || null;
  } catch (error) {
    console.error('Erro em getItemById:', error);
    throw error;
  }
}

async function getItemByName(name) {
  try {
    const [items] = await worldPool.execute(`
      SELECT entry AS item_entry, displayid, name, class AS category
      FROM item_template
      WHERE name LIKE ?
    `, [`%${name}%`]);

    return items;
  } catch (error) {
    console.error('Erro em getItemByName:', error);
    throw error;
  }
}

async function getAllWorldItems() {
  try {
    const [rows] = await worldPool.execute(`
      SELECT 
        entry,
        name,
        displayid,
        ItemLevel,
        Quality,
        InventoryType,
        class,
        subclass
      FROM item_template
      WHERE 
        name IS NOT NULL 
        AND name != ''
        AND Quality >= 3  -- Filtra itens com qualidade 3 (Rare) ou superior
    `);

    return rows;
  } catch (error) {
    console.error('Erro em getAllWorldItems:', error);
    throw error;
  }
}

async function addItemToShop(data) {
  try {
    const defaultValues = {
      flags: 0,
      flags_extra: 0,
      price_points: 0,
      price_tokens: 0,
      buy_count: 1,
      buy_price: 0,
      sell_price: 0,
    };

    const completeData = { ...defaultValues, ...data };

    const cleanData = Object.fromEntries(
      Object.entries(completeData)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, v === undefined ? null : v])
    );

    if (!cleanData.item_entry || !cleanData.name || !cleanData.displayid) {
      throw new Error('Campos obrigatórios faltando: item_entry, name, displayid');
    }

    const query = `
      INSERT INTO shop_items (
        ${Object.keys(cleanData).join(', ')}
      ) VALUES (
        ${Object.keys(cleanData).map(() => '?').join(', ')}
      )`;

    await authPool.execute(query, Object.values(cleanData));
  } catch (error) {
    console.error('Error in addItemToShop service:', error);
    throw error;
  }
}

async function getItemsFromStore() {
  try {
    console.log('Listando todos os itens da loja (shop_items)...');

    const result = await shopDb.query(`
      SELECT 
        item_entry,
        displayid,
        name,
        category,
        quality,
        token_price,
        vote_price,
        item_level,
        inventory_type,
        class,
        subclass
      FROM shop_items
    `);

    return result.rows; // <-- Aqui está a lista de itens propriamente dita
  } catch (error) {
    console.error('Erro em getItemsFromStore:', error.message);
    throw error;
  }
}



async function buyItem(playerName, item_entry) {
  try {
    console.log(`Processando compra: player=${playerName}, item_entry=${item_entry}`);

    const [chars] = await charactersPool.execute(`SELECT guid FROM characters WHERE name = ?`, [playerName]);
    if (!chars.length) return { success: false, message: 'Personagem não encontrado' };
    const guid = chars[0].guid;

    const [items] = await authPool.execute(`SELECT * FROM shop_items WHERE item_entry = ?`, [item_entry]);
    if (!items.length) return { success: false, message: 'Item não existe na loja' };
    const item = items[0];

    const subject = 'Item da Loja';
    const body = `Obrigado por comprar ${item.name}`;

    const [[{ maxId }]] = await charactersPool.query('SELECT IFNULL(MAX(id), 0) + 1 as maxId FROM mail');
    const mailId = maxId;

    await charactersPool.execute(`
      INSERT INTO mail (id, messageType, stationery, sender, receiver, subject, body, has_items, expire_time, deliver_time)
      VALUES (?, 0, 41, 1, ?, ?, ?, 1, UNIX_TIMESTAMP() + 2592000, UNIX_TIMESTAMP())
    `, [mailId, guid, subject, body]);

    await charactersPool.execute(`
      INSERT INTO mail_items (mail_id, item_template, receiver) VALUES (?, ?, ?)
    `, [mailId, item_entry, guid]);

    console.log(`Item enviado com sucesso para ${playerName}`);
    return { success: true, message: 'Item enviado com sucesso' };
  } catch (error) {
    console.error('Erro em buyItem:', error);
    return { success: false, message: 'Erro interno ao tentar comprar item' };
  }
}

async function getShopItems() {
  try {
    console.log('Buscando itens da loja diretamente da tabela shop_items (shopDb)...');

    const result = await shopDb.query(`
      SELECT 
        item_entry, 
        name, 
        displayid, 
        category
      FROM shop_items
      
    `);

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar itens da loja:', error);
    throw error;
  }
}

module.exports = {
  getItemById,
  getItemByName,
  getAllWorldItems,
  addItemToShop,
  getItemsFromStore,
  buyItem,
  getShopItems,
  getAllPets 
};
