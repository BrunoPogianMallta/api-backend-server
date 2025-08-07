const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const rateLimit = require('express-rate-limit');

// Limitar a 10 requisições por minuto por IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: {
    success: false,
    error: "Muitas requisições. Tente novamente mais tarde."
  }
});


// Rotas principais
router.post('/', apiLimiter, paymentController.iniciarPagamento); // Checkout tradicional
router.post('/pix', apiLimiter, paymentController.iniciarPagamentoPix); // Pagamento via Pix

// Webhook (sem rate limit)
router.post('/webhook', paymentController.webhookHandler);

module.exports = router;