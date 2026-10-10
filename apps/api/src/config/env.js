import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 5000),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance-triage',
  MONGODB_LOCAL_URI: process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/grievance-triage',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: toNumber(process.env.SMTP_PORT, 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  APP_NAME: process.env.APP_NAME || 'AI-Powered Grievance Triage and Resolution Agent'
};

export const isProduction = env.NODE_ENV === 'production';

export const isEmailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);