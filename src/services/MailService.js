const mailRepository = require('../repositories/MailRepository');
const { buildMailBody } = require('../utils/mailUtils');
const charactersPool = require('../config/charDb');
const worldPool = require('../config/worldDb');
const { logger } = require('../services/loggingService');

class MailService {
    async sendItemToCharacter(playerName, itemEntry, quantity = 1) {
        if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
            throw new Error('Nome do personagem inválido');
        }
        if (playerName.toLowerCase().includes('nome')) {
            throw new Error('Por favor, insira um nome de personagem válido');
        }

        logger.info(`Iniciando envio para ${playerName}`);

        const connection = await charactersPool.getConnection();
        const worldConnection = await worldPool.getConnection();
        try {
            // Buscar personagem
            const [charRes] = await connection.execute(
                `SELECT guid, race, class FROM characters WHERE name = ?`,
                [playerName]
            );
            if (!charRes.length) throw new Error(`Personagem não encontrado: ${playerName}`);
            const character = charRes[0];

            // Buscar item
            const [itemRes] = await worldConnection.execute(
                `SELECT entry, name, Quality, InventoryType FROM item_template WHERE entry = ?`,
                [itemEntry]
            );
            if (!itemRes.length) throw new Error(`Item não encontrado: ${itemEntry}`);
            const item = itemRes[0];
            

            // Construir corpo do e-mail
            const mailBody = buildMailBody({
                playerName,
                character: { race: character.race, class: character.class },
                item: {
                    name: item.name,
                    Quality: item.Quality,
                    InventoryType: item.InventoryType
                },
                quantity
            });

            // Chamar repository com dados já prontos
            return await mailRepository.sendItemMail({
                characterGuid: character.guid,
                itemEntry,
                itemName: item.name,
                mailBody,
                quantity
            });

        } catch (error) {
            logger.error(`Erro ao enviar item para ${playerName}`, { error });
            throw error;
        } finally {
            connection.release();
            worldConnection.release();
        }
    }
}

module.exports = new MailService();
