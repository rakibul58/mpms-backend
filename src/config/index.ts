import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().min(1, 'Database URL is required'),

  JWT_ACCESS_SECRET: z.string().min(1, 'JWT access secret is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT refresh secret is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_SALT_ROUNDS: z.string().default('12'),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envParse.error.format());
  process.exit(1);
}

const envVars = envParse.data;

export const config = {
  env: envVars.NODE_ENV,
  port: parseInt(envVars.PORT, 10),
  apiPrefix: envVars.API_PREFIX,

  database: {
    url: envVars.DATABASE_URL,
  },

  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpiresIn: envVars.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  bcrypt: {
    saltRounds: parseInt(envVars.BCRYPT_SALT_ROUNDS, 10),
  },

  cors: {
    frontendUrl: envVars.FRONTEND_URL,
  },

  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },

  email: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT ? parseInt(envVars.SMTP_PORT, 10) : undefined,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
    from: envVars.EMAIL_FROM,
  },
} as const;

export type Config = typeof config;
