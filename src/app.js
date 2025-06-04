require('dotenv').config();  // PRIMEIRO, sempre!
const express = require('express');
const corsMiddleware = require('./middlewares/cors.middleware');
const helmet = require('helmet');
const rateLimitMiddleware = require('./middlewares/rateLimiter.middleware');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const characterRoutes = require('./routes/character.routes');
const accountRoutes = require('./routes/account.routes');
const voteRoutes = require('./routes/vote.routes');
const shopRoutes = require('./routes/shopRoutes');

const app = express();


app.use(corsMiddleware);         
app.options('*', corsMiddleware); 

app.use(helmet());               
app.use(rateLimitMiddleware);
app.use(express.json());

// Suas rotas
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/dashboard', voteRoutes);
app.use('/api/shop', shopRoutes);


module.exports = app;
