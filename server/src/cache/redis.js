import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis error', err);
});

export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Redis cache connected');
    }
  } catch (err) {
    console.error('Failed to connect Redis', err);
    process.exit(1);
  }
}
