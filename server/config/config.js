require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/plasma-donor-finder',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS configuration
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 1000, // Increased from 100 to 1000 for development
  },
  
  // Search configuration
  search: {
    defaultRadius: 25, // km
    maxRadius: 100, // km
    minRadius: 5, // km
  },
  
  // Chat configuration
  chat: {
    messageLimit: 1000, // characters per message
    historyLimit: 50, // messages to load
  },
  
  // Validation configuration
  validation: {
    passwordMinLength: 6,
    nameMinLength: 2,
    emailMaxLength: 254,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
  }
};

module.exports = config; 