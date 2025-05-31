const cors = require('cors');

const allowedOriginsRaw = process.env.CORS_ORIGINS || '';
const allowedOrigins = allowedOriginsRaw.split(',').map(origin => origin.trim()).filter(Boolean);

console.log('Allowed Origins:', allowedOrigins); // DEBUG

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origem (ex: curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS origin denied:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
