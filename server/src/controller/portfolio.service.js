import { readHoldingsFromExcel } from '../utils/excel.utils.js';
import { getHomogenousSymbol } from '../utils/mapping.utils.js';
import { getCMP } from './yahoo.service.js';

export async function buildPortfolio() {
  const holdingsCache = readHoldingsFromExcel();

  //   add homogenous exchange
  const dataWithSymbols = holdingsCache.map((holding) => {
    const symbol = getHomogenousSymbol(holding.exchange);
    // console.log('symbol', symbol);
    return { ...holding, symbol };
  });

  const cmpMap = await getCMP(dataWithSymbols.map((data) => data.symbol));

  return cmpMap;
}
