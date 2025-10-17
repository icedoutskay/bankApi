import { getRedisClient } from '../config/redis';
import config from '../config/config';

export const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const client = getRedisClient();
  const key = `refresh_token:${userId}`;
  await client.setEx(key, config.REFRESH_TOKEN_REDIS_EXPIRY, refreshToken);
};

export const getRefreshToken = async (userId: string): Promise<string | null> => {
  const client = getRedisClient();
  const key = `refresh_token:${userId}`;
  return await client.get(key);
};

export const deleteRefreshToken = async (userId: string): Promise<void> => {
  const client = getRedisClient();
  const key = `refresh_token:${userId}`;
  await client.del(key);
};