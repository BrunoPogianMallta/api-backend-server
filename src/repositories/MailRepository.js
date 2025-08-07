const charactersPool = require('../config/charDb');

async function sendItemMail({ characterGuid, itemEntry, itemName, mailBody, quantity }) {
    const connection = await charactersPool.getConnection();
    try {
        await connection.beginTransaction();

        const [[{ nextMailId }]] = await connection.query(
            'SELECT IFNULL(MAX(id), 0) + 1 as nextMailId FROM mail'
        );
        if (!nextMailId) throw new Error('Falha ao obter mailId');

        const [mailInsert] = await connection.execute(
            `INSERT INTO mail 
             (id, messageType, stationery, sender, receiver, subject, body, has_items, expire_time, deliver_time)
             VALUES (?, 0, 41, 1810, ?, ?, ?, 1, UNIX_TIMESTAMP() + 2592000, UNIX_TIMESTAMP())`,
            [nextMailId, characterGuid, itemName, mailBody]
        );
        if (mailInsert.affectedRows !== 1) throw new Error('Erro ao inserir mail');

        const [[{ newGuid }]] = await connection.query(
            'SELECT IFNULL(MAX(guid), 0) + 1 as newGuid FROM item_instance'
        );

        await connection.execute(
            `INSERT INTO item_instance 
             (guid, itemEntry, owner_guid, creatorGuid, giftCreatorGuid, count, duration, charges, flags, enchantments, randomPropertyId, durability, playedTime, text)
             VALUES (?, ?, ?, 0, 0, ?, 0, '0 0 0 0 0', 1, '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0', 0, 100, 0, '')`,
            [newGuid, itemEntry, characterGuid, quantity]
        );

        await connection.execute(
            `INSERT INTO mail_items (mail_id, item_guid, receiver) VALUES (?, ?, ?)`,
            [nextMailId, newGuid, characterGuid]
        );

        await connection.commit();
        return {
            success: true,
            mailId: nextMailId,
            itemName,
            quantity,
            deliveredAt: new Date()
        };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}


module.exports = { sendItemMail};