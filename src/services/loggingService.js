const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, json } = format;
const pool = require('../config/db');

// Formato personalizado para logs no console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
});

// Configuração do logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// Adicionar transporte para console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      timestamp(),
      consoleFormat
    )
  }));
}

// Interface para morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Função para registrar logs no banco de dados
const logToDatabase = async (level, message, metadata = {}) => {
  const query = `
    INSERT INTO shop_logs 
    (level, message, metadata, user_id, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  try {
    await pool.execute(query, [
      level,
      message,
      JSON.stringify(metadata),
      metadata.userId || null,
      metadata.ip || null,
      metadata.userAgent || null
    ]);
  } catch (error) {
    logger.error('Falha ao registrar log no banco de dados', { error: error.message });
  }
};

// Middleware para log de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logToDatabase('info', 'Requisição HTTP', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

module.exports = {
  logger,
  logToDatabase,
  requestLogger
};