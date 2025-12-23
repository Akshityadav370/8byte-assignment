import app from './app.js';
import { connectRedis } from './cache/redis.js';

async function start() {
  await connectRedis();
  app.listen(5000, () => console.log('Backend running on port 5000'));
}

start();
