interface Config {
  PORT: number;
  MONGODB_URI: string;
  REDIS_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_REDIS_EXPIRY: number;
}

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const config: Config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  REDIS_URL: getEnvVar('REDIS_URL'),
  JWT_ACCESS_SECRET: getEnvVar('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_REDIS_EXPIRY: 7 * 24 * 60 * 60, 
};

export default config;
