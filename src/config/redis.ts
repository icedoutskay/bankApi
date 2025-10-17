import { createClient, RedisClientType } from 'redis';
import config from './config';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
  redisClient = createClient({ url: config.REDIS_URL });
  
  redisClient.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
  });

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};