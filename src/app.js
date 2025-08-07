/// PRIMEIRAS LINHAS - ANTES DE TUDO
const path = require('path');
const dotenv = require('dotenv');

// Carregamento FORÇADO do .env
const envPath = path.resolve(__dirname, '../.env');  // Volta um nível
console.log('🔄 Carregando .env de:', envPath);



const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('❌ Falha ao carregar .env:', envResult.error);
  process.exit(1);
} else {
  console.log('✅ .env carregado com sucesso!');
  console.log('🔑 MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? 'OK' : 'FALTANDO');
}
const express = require('express');
const paymentRoutes = require('./routes/paymentRoutes');
const corsMiddleware = require('./middlewares/cors.middleware');
const helmet = require('helmet');
const rateLimitMiddleware = require('./middlewares/rateLimiter.middleware');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const characterRoutes = require('./routes/character.routes');
const accountRoutes = require('./routes/account.routes');
const voteRoutes = require('./routes/vote.routes');
const shopRoutes = require('./routes/shopRoutes');
const mailRoutes = require('./routes/mailRoutes');


const app = express();


app.use(corsMiddleware);         
app.options('*', corsMiddleware); 

app.use(helmet());               
// app.use(rateLimitMiddleware);
app.use(express.json());


// Suas rotas
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/dashboard', voteRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/payments',paymentRoutes);

// No app.js, adicione:
app.post('/api/test', (req, res) => {
  console.log("Rota teste alcançada");
  res.json({ success: true });
});

// Depois de todas as rotas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});


module.exports = app;
