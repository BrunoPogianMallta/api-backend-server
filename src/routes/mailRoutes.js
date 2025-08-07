const express = require('express');
const router = express.Router();
const MailController = require('../controllers/MailController');
const mailController = new MailController();
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/send', authMiddleware, mailController.sendItem);

module.exports = router;