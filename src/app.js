const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS.split(',');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Importa as rotas do auth (caminho relativo dentro de src)
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

module.exports = app;
