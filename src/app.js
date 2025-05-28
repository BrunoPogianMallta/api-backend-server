require('dotenv').config();  

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express(); 

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requests sem origin (como curl/postman) ou origem na lista liberada
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

// Rotas
app.use('/api/auth', authRoutes);

module.exports = app;
