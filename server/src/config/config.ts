
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = process.env.NODE_ENV || 'development';

interface Config {
  env: string;
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string | string[];
  logLevel: string;
}

const config: Record<string, Config> = {
  development: {
    env: 'development',
    port: Number(process.env.PORT) || 5000,
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/augmend-health',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    logLevel: 'debug'
  },
  test: {
    env: 'test',
    port: Number(process.env.PORT) || 5000,
    mongoURI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/augmend-health-test',
    jwtSecret: process.env.JWT_SECRET || 'your-test-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    logLevel: 'debug'
  },
  production: {
    env: 'production',
    port: Number(process.env.PORT) || 5000,
    mongoURI: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    logLevel: 'info'
  }
};

export default config[env];
