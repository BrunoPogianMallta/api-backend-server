require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');

const corsMiddleware = require('./middlewares/cors.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(rateLimiter);

app.use(express.json());
app.use(xss());

app.use('/api/auth', authRoutes);

module.exports = app;
