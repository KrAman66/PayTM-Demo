const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, errors, json } = format;

// Custom log format
const logFormat = printf(({ level, message, label, timestamp, stack }) => {
  return `${timestamp} [${label}] ${level}: ${stack || message}`;
});

// Create logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    label({ label: 'paytm-backend' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console(),

    // File transport for errors
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // File transport for all logs
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const directory = './logs';
if (!fs.existsSync(directory)){
  fs.mkdirSync(directory);
}

module.exports = logger;