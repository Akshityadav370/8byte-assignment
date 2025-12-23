import { readHoldingsFromExcel } from '../utils/excel.utils.js';

export async function buildPortfolio() {
  const holdingsCache = readHoldingsFromExcel();
  console.log('holdingCache', holdingsCache);
  return holdingsCache;
}
