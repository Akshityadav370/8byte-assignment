import axios from 'axios';
import * as cheerio from 'cheerio';
import { redisClient } from '../cache/redis.js';

export async function getFundamentals(symbol) {
  const cacheKey = `fundamentals:${symbol}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const url = `https://www.google.com/finance/quote/${symbol}`;

  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const $ = cheerio.load(response.data);

  const data = {};

  // Strategy 1, search by tooltip content + accessibility attributes
  $('div[role="tooltip"]').each((_, tooltip) => {
    const tooltipText = $(tooltip).text();
    const tooltipId = $(tooltip).attr('id');

    if (!tooltipId) return;

    // P/E Ratio
    if (tooltipText.includes('ratio of current share price')) {
      const labelDiv = $(`[aria-describedby="${tooltipId}"]`);
      const container = labelDiv.parent();
      const value = container.find('div').last().text().trim();
      data.peRatio = parseFloat(value);
    }

    // Earnings per Share
    if (tooltipText.includes('profit divided by the outstanding shares')) {
      const labelDiv = $(`[aria-describedby="${tooltipId}"]`);
      const row = labelDiv.closest('tr');
      const value = row.find('td').eq(1).text().trim();
      data.latestEarnings = parseFloat(value);
    }
  });

  // Strategy 2, text based search
  if (!data.peRatio) {
    $('div').each((_, el) => {
      const text = $(el).text().trim();
      if (text === 'P/E ratio') {
        const value = $(el).parent().find('div').last().text().trim();
        if (value && !isNaN(parseFloat(value))) {
          data.peRatio = parseFloat(value);
        }
      }
    });
  }

  if (!data.latestEarnings) {
    $('tr').each((_, row) => {
      const firstCell = $(row).find('td').first().text();
      if (firstCell.includes('Earnings per share')) {
        const value = $(row).find('td').eq(1).text().trim();
        if (value && !isNaN(parseFloat(value))) {
          data.latestEarnings = parseFloat(value);
        }
      }
    });
  }

  // Strategy 3, regex patterns in raw HTML
  if (!data.peRatio) {
    const peMatch = response.data.match(/P\/E ratio[^<]*<[^>]*>([\d.]+)</i);
    if (peMatch) {
      data.peRatio = parseFloat(peMatch[1]);
    }
  }

  if (!data.latestEarnings) {
    const epsMatch = response.data.match(
      /Earnings per share[^<]*<\/div>[^<]*<\/span>[^<]*<\/td>\s*<td[^>]*>([\d.]+)</i
    );
    if (epsMatch) {
      data.latestEarnings = parseFloat(epsMatch[1]);
    }
  }

  await redisClient.setEx(cacheKey, 60 * 60 * 24, JSON.stringify(data));

  return data;
}
