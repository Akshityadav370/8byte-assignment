import app from './app.js';
import { connectRedis } from './cache/redis.js';

async function start() {
  await connectRedis();
  app.listen(3002, () => console.log('Backend running on port 3002'));
}

start();
