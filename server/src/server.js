import app from './app.js';
import { connectRedis } from './cache/redis.js';

async function start() {
  await connectRedis();
  app.listen(5001, () => console.log('Backend running on port 5001'));
}

start();
