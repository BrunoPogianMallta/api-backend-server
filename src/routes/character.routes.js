const express = require('express');
const router = express.Router();
const characterController = require('../controllers/character.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, characterController.getAllCharacters);
router.get('/main', authMiddleware, characterController.getMainCharacter);


module.exports = router;
