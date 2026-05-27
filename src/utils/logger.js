const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Définition du format de log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Capture la stack trace en cas d'erreur
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'restaurant-api' },
  transports: [
    // 1. Logs d'erreurs (critiques) - Rotation quotidienne
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d', // Garde les logs des 14 derniers jours
    }),

    // 2. Logs complets (tout) - Rotation quotidienne
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

// 3. Si on n'est pas en production, on affiche aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = logger;