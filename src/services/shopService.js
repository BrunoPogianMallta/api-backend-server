const worldPool = require('../config/worldDb');
const authPool = require('../config/db');
const charactersPool = require('../config/charDb');
const shopDb = require('../config/shopDb');
const { logger } = require('../services/loggingService');


async function sendItemToCharacter(playerName, itemEntry, quantity = 1) {
    const connection = await charactersPool.getConnection();
    try {
        await connection.beginTransaction();

        logger.info(`[Mail Service] Iniciando envio para ${playerName} - Item: ${itemEntry} (${quantity}x)`);

        // 1.1 Verificar personagem
        const [character] = await connection.execute(
            `SELECT guid, race, class FROM characters WHERE name = ?`, 
            [playerName]
        );
        
        if (!character.length) {
            throw new Error(`Personagem não encontrado: ${playerName}`);
        }

        const { guid: characterGuid, race, class: charClass } = character[0];
        const raceName = getRaceName(race);
        const className = getClassName(charClass);

        // 1.2 Obter detalhes do item
        const [item] = await worldPool.execute(
            `SELECT entry, name, Quality, InventoryType FROM item_template WHERE entry = ?`,
            [itemEntry]
        );

        if (!item.length) {
            throw new Error(`Item não encontrado: ${itemEntry}`);
        }

        const { name: itemName, Quality: quality, InventoryType: invType } = item[0];

        // 2. CONSTRUÇÃO DA MENSAGEM
        const now = new Date();
        const mailSubject = `${itemName}`;
        const greeting = getRaceClassGreeting(race, charClass);
        const qualityColor = getQualityColor(quality);
        const itemType = getInventoryTypeName(invType);

        const mailBody = [
            `${greeting}, ${playerName}`,
            "",
            "Você recebeu um item solicitado através do Serviço de Entrega Mágica de Azeroth:",
            "",
            `|TInterface\\Icons\\INV_Misc_Note_01:20:20|t |cFF${qualityColor}${itemName}|r |cFF000000(${itemType})|r`,
            `|cFF000000Quantidade:|r ${quantity}x`,
            "",
            "O item foi inspecionado e está pronto para uso em suas aventuras.",
            "",
            "|cFF000000Informações da Entrega:|r",
            "• Método: Correio de Azeroth",
            "• Validade: 30 dias",
            "• Dúvidas? Consulte um Mestre de Jogo",
            "",
            "Que sua jornada seja repleta de conquistas,",
            "",
            "|cFF000000--|r",
            "|cFF000000Serviço de Entrega Mágica|r",
            `|cFF000000${now.toLocaleDateString('pt-BR')}|r`
        ].join("\n");

        // 3. PROCESSAMENTO DA TRANSAÇÃO
        // 3.1 Obter o próximo ID disponível para mail
        const [[{ nextMailId }]] = await connection.query('SELECT IFNULL(MAX(id), 0) + 1 as nextMailId FROM mail');
        
        // 3.2 Inserir e-mail com ID explícito
        await connection.execute(
            `INSERT INTO mail 
             (id, messageType, stationery, sender, receiver, subject, body, has_items, expire_time, deliver_time)
             VALUES (?, 0, 41, 1810, ?, ?, ?, 1, UNIX_TIMESTAMP() + 2592000, UNIX_TIMESTAMP())`,
            [nextMailId, characterGuid, mailSubject, mailBody]
        );
        
        // 3.3 Obter novo GUID para o item
        const [[{ newGuid }]] = await connection.query('SELECT IFNULL(MAX(guid), 0) + 1 as newGuid FROM item_instance');

        await connection.execute(
            `INSERT INTO item_instance 
             (guid, itemEntry, owner_guid, creatorGuid, giftCreatorGuid, count, duration, charges, flags, enchantments, randomPropertyId, durability, playedTime, text)
             VALUES (?, ?, ?, 0, 0, ?, 0, '0 0 0 0 0', 1, '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0', 0, 100, 0, '')`,
            [newGuid, itemEntry, characterGuid, quantity]
        );

        // 3.4 Vincular item ao e-mail
        await connection.execute(
            `INSERT INTO mail_items (mail_id, item_guid, receiver) VALUES (?, ?, ?)`,
            [nextMailId, newGuid, characterGuid]
        );

        await connection.commit();
        
        logger.info(`[Mail Service] E-mail enviado - ID: ${nextMailId}`, {
            player: playerName,
            item: itemName,
            quantity,
            quality
        });

        return {
            success: true,
            mailId: nextMailId,
            itemName,
            quantity,
            deliveredAt: now
        };

    } catch (error) {
        await connection.rollback();
        logger.error(`[Mail Service] Falha no envio - ${error.message}`, {
            playerName,
            itemEntry,
            error: error.stack
        });
        
        throw new Error(`Falha ao enviar e-mail: ${error.message}`);
    } finally {
        connection.release();
    }
}


// ==============================================
// OUTRAS FUNÇÕES (MANTIDAS COMO NO ORIGINAL)
// ==============================================

async function getAllPets() {
  try {
    const [rows] = await worldPool.execute(`
      SELECT entry AS item_entry, displayid, name, class, subclass,
             ItemLevel AS item_level, Quality AS quality, InventoryType AS inventory_type
      FROM item_template
      WHERE class = 15 AND subclass = 2 AND name IS NOT NULL AND name != ''
    `);
    return rows;
  } catch (error) {
    logger.error('Erro em getAllPets:', error);
    throw error;
  }
}

async function getItemById(entry) {
  try {
    const [[item]] = await worldPool.execute(
      'SELECT entry, name FROM item_template WHERE entry = ?',
      [entry || null]
    );
    return item || null;
  } catch (error) {
    logger.error('Erro em getItemById:', error);
    throw error;
  }
}

async function getItemByName(name) {
  try {
    const searchName = name || '';
    const [items] = await worldPool.execute(
      'SELECT entry AS item_entry, displayid, name, class AS category FROM item_template WHERE name LIKE ?',
      [`%${searchName}%`]
    );
    return items;
  } catch (error) {
    logger.error('Erro em getItemByName:', error);
    throw error;
  }
}

async function getAllWorldItems() {
  try {
    const [rows] = await worldPool.execute(`
      SELECT entry, name, displayid, ItemLevel, Quality, InventoryType, class, subclass
      FROM item_template
      WHERE name IS NOT NULL AND name != '' AND Quality >= 3
    `);
    return rows;
  } catch (error) {
    logger.error('Erro em getAllWorldItems:', error);
    throw error;
  }
}

async function addItemToShop(data) {
  try {
    const defaultValues = {
      flags: 0, flags_extra: 0, price_points: 0, price_tokens: 0,
      buy_count: 1, buy_price: 0, sell_price: 0
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

    const query = `INSERT INTO shop_items (${Object.keys(cleanData).join(', ')}) 
                   VALUES (${Object.keys(cleanData).map(() => '?').join(', ')})`;

    await shopDb.query(query, Object.values(cleanData));
  } catch (error) {
    logger.error('Error in addItemToShop:', error);
    throw error;
  }
}


async function createPendingTransaction({ userId, items, total, paymentId, paymentMethod, status }) {
    const client = await shopDb.connect();
    try {
        await client.query('BEGIN');

        // Inserir transação principal
        const txResult = await client.query(
            `INSERT INTO shop_transactions 
             (user_id, total, payment_id, payment_method, status)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [userId, total, paymentId, paymentMethod, status]
        );
        const transactionId = txResult.rows[0].id;

        // Inserir itens da transação
        for (const item of items) {
            await client.query(
                `INSERT INTO shop_transaction_items
                 (transaction_id, item_entry, quantity, price_each, item_name)
                 VALUES ($1, $2, $3, $4, $5)`,
                [transactionId, item.item_entry, item.quantity, item.price, item.name]
            );
        }

        await client.query('COMMIT');
        return transactionId;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Erro ao criar transação pendente', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateTransactionStatus({ paymentId, status, userId }) {
    try {
        await shopDb.query(
            `UPDATE shop_transactions 
             SET status = $1, updated_at = NOW()
             WHERE payment_id = $2 AND user_id = $3`,
            [status, paymentId, userId]
        );
    } catch (error) {
        logger.error('Erro ao atualizar status da transação', error);
        throw error;
    }
}

async function getTransactionByPaymentId(paymentId) {
    try {
        const txResult = await shopDb.query(
            `SELECT t.*, 
             json_agg(json_build_object(
                 'item_entry', i.item_entry,
                 'name', i.item_name,
                 'quantity', i.quantity,
                 'price', i.price_each
             )) as items
             FROM shop_transactions t
             JOIN shop_transaction_items i ON t.id = i.transaction_id
             WHERE t.payment_id = $1
             GROUP BY t.id`,
            [paymentId]
        );
        
        return txResult.rows[0];
    } catch (error) {
        logger.error('Erro ao buscar transação por paymentId', error);
        throw error;
    }
}

async function getItemsFromStore() {
  try {
    const result = await shopDb.query(`
      SELECT item_entry, displayid, name, category, quality, token_price, 
             vote_price, item_level, inventory_type, class, subclass
      FROM shop_items
    `);
    return result.rows;
  } catch (error) {
    logger.error('Erro em getItemsFromStore:', error);
    throw error;
  }
}

async function buyItem(playerName, item_entry) {
  try {
    const [chars] = await charactersPool.execute(
      'SELECT guid FROM characters WHERE name = ?', 
      [playerName || '']
    );
    
    if (!chars.length) return { success: false, message: 'Personagem não encontrado' };
    const guid = chars[0].guid;

    const [items] = await shopDb.query(
      'SELECT * FROM shop_items WHERE item_entry = $1', 
      [item_entry || null]
    );
    
    if (!items.length) return { success: false, message: 'Item não existe na loja' };
    const item = items[0];

    const [[{ maxId }]] = await charactersPool.query('SELECT IFNULL(MAX(id), 0) + 1 as maxId FROM mail');
    const mailId = maxId;

    await charactersPool.execute(
      `INSERT INTO mail (id, messageType, stationery, sender, receiver, subject, body, has_items, expire_time, deliver_time)
       VALUES (?, 0, 41, 1, ?, ?, ?, 1, UNIX_TIMESTAMP() + 2592000, UNIX_TIMESTAMP())`,
      [mailId, guid, 'Item da Loja', `Obrigado por comprar ${item.name}`]
    );

    await charactersPool.execute(
      `INSERT INTO mail_items (mail_id, item_guid, receiver) VALUES (?, ?, ?)`,
      [mailId, item_entry, guid]
    );

    return { success: true, message: 'Item enviado com sucesso' };
  } catch (error) {
    logger.error('Erro em buyItem:', error);
    return { success: false, message: 'Erro interno ao tentar comprar item' };
  }
}

async function getShopItems() {
  try {
    const result = await shopDb.query(`
      SELECT item_entry, name, displayid, category FROM shop_items
    `);
    return result.rows;
  } catch (error) {
    logger.error('Erro ao buscar itens da loja:', error);
    throw error;
  }
}

async function getUserVotePoints(userId) {
  try {
    const [[result]] = await authPool.execute(
      'SELECT vote_points FROM account WHERE id = ?',
      [userId || null]
    );
    return result?.vote_points || 0;
  } catch (error) {
    logger.error('Erro em getUserVotePoints:', error);
    throw error;
  }
}

async function processPurchase({ userId, playerName, items, total }) {
  const authConnection = await authPool.getConnection();
  const shopClient = await shopDb.connect();
  
  try {
    await authConnection.beginTransaction();
    await shopClient.query('BEGIN');

    // Verificar saldo
    const [[user]] = await authConnection.execute(
      'SELECT vote_points FROM account WHERE id = ? FOR UPDATE',
      [userId]
    );
    
    if (!user) throw new Error('Usuário não encontrado');
    if (user.vote_points < total) throw new Error(`Saldo insuficiente`);

    // Deduzir pontos
    await authConnection.execute(
      'UPDATE account SET vote_points = vote_points - ? WHERE id = ?',
      [total, userId]
    );

    // Registrar transação
    const txResult = await shopClient.query(
      `INSERT INTO shop_transactions (user_id, player_name, total, status) 
       VALUES ($1, $2, $3, 'completed') RETURNING id`,
      [userId, playerName, total]
    );
    const transactionId = txResult.rows[0].id;

    // Processar itens
    const itemResults = [];
    for (const item of items) {
      const mailResult = await sendItemToCharacter(playerName, item.item_entry, item.quantity);
      
      await shopClient.query(
        `INSERT INTO shop_transaction_items
         (transaction_id, item_entry, quantity, price_each, item_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [transactionId, item.item_entry, item.quantity, item.price, item.name]
      );

      itemResults.push({
        item_entry: item.item_entry,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        mailId: mailResult.mailId,
        status: 'sent'
      });
    }

    await authConnection.commit();
    await shopClient.query('COMMIT');
    
    return { 
      success: true,
      transactionId,
      items: itemResults,
      total
    };

  } catch (error) {
    await authConnection.rollback();
    await shopClient.query('ROLLBACK');
    
    logger.error('Erro na compra:', {
      userId,
      playerName,
      error: error.message,
      stack: error.stack
    });

    throw error;
  } finally {
    authConnection.release();
    shopClient.release();
  }
}

// ==============================================
// EXPORTAÇÃO
// ==============================================

module.exports = {
  getItemById,
  getItemByName,
  getAllWorldItems,
  addItemToShop,
  getItemsFromStore,
  buyItem,
  getShopItems,
  getAllPets,
  sendItemToCharacter,
  processPurchase,
  getUserVotePoints,
  getTransactionByPaymentId,
  updateTransactionStatus,
  createPendingTransaction
};