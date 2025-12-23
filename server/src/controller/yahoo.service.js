import { redisClient } from '../cache/redis.js';
import { yahooFinance } from '../configs/common.js';

export async function getCMP(symbols) {
  const results = {};

  const uncached = [];

  for (const symbol of symbols) {
    const cached = await redisClient.get(`cmp:${symbol}`);
    if (cached) {
      results[symbol] = Number(cached);
    } else {
      uncached.push(symbol);
    }
  }

  if (uncached.length > 0) {
    // console.log('uncached', uncached);
    const quotes = await yahooFinance.quote(uncached);
    // console.log('quotes', quotes);

    for (const quote of Array.isArray(quotes) ? quotes : [quotes]) {
      const price = quote.regularMarketPrice;
      results[quote.symbol] = price;

      await redisClient.setEx(`cmp:${quote.symbol}`, 15, price.toString());
    }
  }

  return results;
}
