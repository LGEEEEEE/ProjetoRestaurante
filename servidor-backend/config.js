require('dotenv').config();

const ensureEnv = (key, fallback = null) => {
  const value = process.env[key] ?? fallback;
  if (value === null || value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parseList = (value, defaultList = []) => {
  if (!value) return defaultList;
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const config = {
  port: process.env.PORT || 4000,
  cors: {
    origins: parseList(
      process.env.CORS_ALLOWED_ORIGINS,
      [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:19006',
      ]
    ),
    methods: parseList(process.env.CORS_ALLOWED_METHODS, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
    allowedHeaders: parseList(
      process.env.CORS_ALLOWED_HEADERS,
      ['Content-Type', 'Authorization', 'Origin', 'Accept', 'ngrok-skip-browser-warning']
    ),
    allowAll: process.env.CORS_ALLOW_ALL === 'true',
  },
  jwt: {
    userSecret: ensureEnv('JWT_USER_SECRET', process.env.JWT_SECRET),
    deviceSecret: ensureEnv('JWT_DEVICE_SECRET', process.env.JWT_SECRET),
    userExpiresIn: process.env.JWT_USER_EXPIRES_IN || '8h',
    deviceExpiresIn: process.env.JWT_DEVICE_EXPIRES_IN || '365d',
  },
  uploads: {
    maxBytes: parseInt(process.env.UPLOAD_MAX_BYTES || `${2 * 1024 * 1024}`, 10),
    allowedMimeTypes: parseList(
      process.env.UPLOAD_ALLOWED_MIME,
      ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    ),
  },
};

module.exports = config;

