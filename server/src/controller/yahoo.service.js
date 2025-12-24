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

export async function getPEnEarningFromYahoo(symbols) {
  const resultsMap = {};
  const uncached = [];

  for (const symbol of symbols) {
    const cached = await redisClient.get(`fundamentals:yahoo:${symbol}`);
    if (cached) {
      resultsMap[symbol] = JSON.parse(cached);
    } else {
      uncached.push(symbol);
    }
  }

  if (uncached.length === 0) return resultsMap;

  const results = await Promise.all(
    uncached.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quoteSummary(symbol, {
          modules: ['defaultKeyStatistics'],
        });

        return {
          symbol,
          peRatio: quote.defaultKeyStatistics?.forwardPE ?? null,
          latestEarnings: quote.defaultKeyStatistics?.trailingEps ?? null,
          source: 'yahoo',
        };
      } catch {
        return { symbol, peRatio: null, latestEarnings: null, source: 'yahoo' };
      }
    })
  );

  for (const result of results) {
    await redisClient.setEx(
      `fundamentals:yahoo:${result.symbol}`,
      60 * 60 * 24,
      JSON.stringify(result)
    );
    resultsMap[result.symbol] = result;
  }

  return resultsMap;
}
