const mailService = require('../services/MailService');
const { logger } = require('../services/loggingService');

class MailController {
    async sendItem(req, res) {
        const { playerName, itemEntry, quantity } = req.body;
        
        if (!playerName || !itemEntry) {
            return res.status(400).json({
                success: false,
                message: 'playerName e itemEntry são obrigatórios'
            });
        }

        try {
            logger.info(`Enviando item para ${playerName}`, { itemEntry, quantity });
            const result = await mailService.sendItemToCharacter(playerName, itemEntry, quantity || 1);
            res.json(result);
        } catch (error) {
            logger.error(`Erro ao enviar item para ${playerName}`, { 
                itemEntry, 
                error: error.message 
            });
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }z
}

module.exports = MailController;