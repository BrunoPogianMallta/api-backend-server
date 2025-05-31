const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const authenticateToken = require('../middlewares/auth.middleware');



router.get('/vote-status',authenticateToken, voteController.getVoteStatus);
router.post('/vote',authenticateToken, voteController.registerVote);

module.exports = router;
