const path = require('path');
const dotenv = require('dotenv');

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  nodeEnv,
  port: Number(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'ewr1',
    bucket: process.env.S3_BUCKET || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || '',
  },
};

config.s3.isConfigured = Boolean(
  config.s3.endpoint &&
    config.s3.bucket &&
    config.s3.accessKeyId &&
    config.s3.secretAccessKey
);

config.mail = {
  tenantId: process.env.AZURE_TENANT_ID || '',
  clientId: process.env.AZURE_CLIENT_ID || '',
  clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  fromEmail: process.env.FROM_EMAIL || '',
  quoteNotifyEmail: process.env.QUOTE_NOTIFY_EMAIL || 'info@fabnetsystems.com',
};

config.mail.isConfigured = Boolean(
  config.mail.tenantId &&
    config.mail.clientId &&
    config.mail.clientSecret &&
    config.mail.fromEmail
);

module.exports = config;
