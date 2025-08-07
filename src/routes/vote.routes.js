const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// ✅ Rota para postback (sem autenticação JWT)
router.get('/vote/postback', voteController.handlePostback);

// ✅ Rotas para usuários logados (requer JWT)
router.get('/vote-status', authenticateToken, voteController.getVoteStatus);
router.post('/vote', authenticateToken, voteController.registerVote);

module.exports = router;