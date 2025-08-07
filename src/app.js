const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');

const corsMiddleware = require('./middlewares/cors.middleware');
const rateLimitMiddleware = require('./middlewares/rateLimiter.middleware');

const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const characterRoutes = require('./routes/character.routes');
const accountRoutes = require('./routes/account.routes');
const voteRoutes = require('./routes/vote.routes');
const shopRoutes = require('./routes/shopRoutes');
const mailRoutes = require('./routes/mailRoutes');

// ✅ Carrega o .env normalmente (funciona local) — na Render, as variáveis já estão no ambiente
dotenv.config();

// Log para debug
console.log('🔑 MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? 'OK' : 'FALTANDO');

const app = express();

app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use(helmet());
// app.use(rateLimitMiddleware);
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/dashboard', voteRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/payments', paymentRoutes);

// Teste
app.post('/api/test', (req, res) => {
  console.log("Rota teste alcançada");
  res.json({ success: true });
});

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

module.exports = app;
