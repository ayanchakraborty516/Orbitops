import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orbitops',
  jwtSecret: process.env.JWT_SECRET || 'orbitops_default_development_secret_key_32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  cookieSecure:
    process.env.COOKIE_SECURE === 'true' ||
    (process.env.NODE_ENV === 'production' &&
      process.env.COOKIE_SECURE !== 'false' &&
      !process.env.CLIENT_ORIGIN?.includes('localhost') &&
      !process.env.CLIENT_ORIGIN?.includes('127.0.0.1')),
};
