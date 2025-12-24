import axios from 'axios';
import * as cheerio from 'cheerio';
import { redisClient } from '../cache/redis.js';
import { delay } from '../utils/common.utils.js';

const scrapingQueue = new Set();

export const processingPEnEarningFromResponse = (cherioApi, response) => {
  const data = {};

  // Strategy 1, aria-based
  cherioApi('div[role="tooltip"]').each((_, tooltip) => {
    const tooltipText = cherioApi(tooltip).text();
    const tooltipId = cherioApi(tooltip).attr('id');

    if (!tooltipId) return;

    // P/E Ratio
    if (
      tooltipText.includes(
        'ratio of current share price to trailing twelve month EPS'
      )
    ) {
      const labelDiv = cherioApi(`[aria-describedby="${tooltipId}"]`);
      const spanWrapper = labelDiv.parent();
      const container = spanWrapper.parent();
      const valueDiv = spanWrapper.next('div');
      let value = valueDiv.text().trim();

      // fallback: if not found, try last div in container
      if (!value || isNaN(parseFloat(value))) {
        value = container.find('div').last().text().trim();
      }

      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 0) {
        data.peRatio = parsed;
      }
    }

    // Earnings per Share
    if (tooltipText.includes('profit divided by the outstanding shares')) {
      const labelDiv = cherioApi(`[aria-describedby="${tooltipId}"]`);
      const row = labelDiv.closest('tr');
      const value = row.find('td').eq(1).text().trim();

      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        data.latestEarnings = parsed;
      }
    }
  });

  // Strategy 2, alternative aria
  if (!data.peRatio) {
    cherioApi('div[role="tooltip"]').each((_, tooltip) => {
      const tooltipText = cherioApi(tooltip).text();
      const tooltipId = cherioApi(tooltip).attr('id');

      if (!tooltipId) return;

      if (tooltipText.includes('ratio of current share price')) {
        const labelDiv = cherioApi(`[aria-describedby="${tooltipId}"]`);

        const paths = [
          labelDiv.parent().next(),
          labelDiv.parent().parent().children().last(),
          labelDiv.closest('div').find('div').last(),
        ];

        for (const path of paths) {
          const value = path.text().trim();
          const parsed = parseFloat(value);

          if (!isNaN(parsed) && parsed > 0 && parsed < 10000) {
            data.peRatio = parsed;
            return false;
          }
        }
      }
    });
  }

  // Strategy 3, text based
  if (!data.peRatio) {
    cherioApi('[aria-describedby]').each((_, el) => {
      const text = cherioApi(el).text().trim();

      if (text === 'P/E ratio') {
        const span = cherioApi(el).parent();
        const container = span.parent();
        const value =
          span.next('div').text().trim() ||
          container.find('div').last().text().trim();

        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed > 0) {
          data.peRatio = parsed;
          return false;
        }
      }
    });
  }

  if (!data.latestEarnings) {
    cherioApi('tr').each((_, row) => {
      const firstCell = cherioApi(row).find('td').first();
      const labelDiv = firstCell.find('[aria-describedby]').first();

      if (labelDiv.text().includes('Earnings per share')) {
        const value = cherioApi(row).find('td').eq(1).text().trim();
        const parsed = parseFloat(value);

        if (!isNaN(parsed)) {
          data.latestEarnings = parsed;
        }
      }
    });
  }

  return data;
};

export async function getPEnEarningFromGoogle(symbol) {
  const cacheKey = `fundamentals:google:${symbol}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  return null;
}

export async function scarpeDataInBackground(symbol) {
  console.log('----Scraping google finance for ', symbol);
  const cacheKey = `fundamentals:google:${symbol}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return;
  }

  await delay(1000);

  const url = `https://www.google.com/finance/quote/${symbol}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    const data = processingPEnEarningFromResponse($, response);

    if (data.peRatio || data.latestEarnings) {
      data.source = 'google';
      await redisClient.setEx(cacheKey, 60 * 60 * 24, JSON.stringify(data));
      console.log(`Scraped and cached ${symbol} from google`);
    }
  } catch (error) {
    console.error(`Error scraping ${symbol}:`, error.message);
  }
}

export function startBackgroundScraping(symbols) {
  const newSymbols = symbols.filter((s) => !scrapingQueue.has(s));

  if (newSymbols.length === 0) return;

  console.log(`Starting background scraping for ${JSON.stringify(newSymbols)}`);

  (async () => {
    for (const symbol of newSymbols) {
      scrapingQueue.add(symbol);

      try {
        await scarpeDataInBackground(symbol);
      } catch (error) {
        console.error(
          `Background scraping failed for ${symbol}:`,
          error.message
        );
      } finally {
        scrapingQueue.delete(symbol);
      }
    }
    console.log('Background scraping completed');
  })();
}
