const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Registro de novo usuário
router.post('/register', (req, res, next) => {
  console.log('[ROUTE] POST /auth/register chamado');
  next();
}, authController.register);

// Login do usuário
router.post('/login', (req, res, next) => {
  console.log('[ROUTE] POST /auth/login chamado');
  next();
}, authController.login);

// Verificação do token
router.get('/verify', (req, res, next) => {
  console.log('[ROUTE] GET /auth/verify chamado');
  next();
}, authenticateToken, authController.verify);

module.exports = router;
