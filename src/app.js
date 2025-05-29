const express = require('express');
const corsMiddleware = require('./middlewares/corsMiddleware');
const helmet = require('helmet');
const rateLimitMiddleware = require('./middlewares/rateLimitMiddleware');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(helmet);
app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use(rateLimitMiddleware);

app.use(express.json());

app.use('/api/auth', authRoutes);

module.exports = app;
