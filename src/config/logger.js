const winston = require('winston');
const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (Object.keys(metadata).length > 0) {
        msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

// Para logs de queries SQL (opcional)
const queryLogger = winston.createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'logs/queries.log' 
        })
    ]
});

module.exports = {
    logger,
    queryLogger
};