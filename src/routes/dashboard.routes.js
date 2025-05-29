const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const authenticateToken = require('../middlewares/auth.middleware');


router.get('/profile', authenticateToken, dashboardController.getProfile);

module.exports = router;
