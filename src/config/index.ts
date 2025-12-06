import dotenv from 'dotenv';
import path from 'path';

// Load .env file only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

// Get environment variables with defaults
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || '';
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  database: {
    url: getEnv('DATABASE_URL'),
  },

  jwt: {
    accessSecret: getEnv('JWT_ACCESS_SECRET'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },
} as const;

export type Config = typeof config;
