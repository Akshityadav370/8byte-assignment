import { readHoldingsFromExcel } from '../utils/excel.utils.js';
import { getHomogenousSymbol } from '../utils/mapping.utils.js';
import {
  getPEnEarningFromGoogle,
  startBackgroundScraping,
} from './google.service.js';
import { getCMP, getPEnEarningFromYahoo } from './yahoo.service.js';

let holdingsCache = null;

export async function buildPortfolio() {
  if (!holdingsCache) {
    holdingsCache = readHoldingsFromExcel();
  }

  const dataWithSymbols = holdingsCache.map((holding) => {
    const symbol = getHomogenousSymbol(holding.exchange);
    return { ...holding, symbol };
  });

  const symbols = dataWithSymbols.map((h) => h.symbol);

  const cmpMap = await getCMP(symbols);
  //   console.log('cmpMap', cmpMap);

  const fundamentalsMap = {};
  const symbolsNeedingScraping = [];

  for (const symbol of symbols) {
    let googleSymbol = symbol.replace('.NS', ':NSE');
    const googleData = await getPEnEarningFromGoogle(googleSymbol);
    // const googleData = null;

    if (googleData) {
      // found in google cache
      fundamentalsMap[symbol] = googleData;
    } else {
      // not in google cache, will fetch from yahoo
      symbolsNeedingScraping.push(googleSymbol);
    }
  }

  if (symbolsNeedingScraping.length > 0) {
    console.log(
      `using yahoo fallback for ${JSON.stringify(symbolsNeedingScraping)}`
    );
    const symbolsNeedingScrapingYahoo = symbolsNeedingScraping.map((item) =>
      item.split(':NSE').join('.NS')
    );
    const yahooFundamentals = await getPEnEarningFromYahoo(
      symbolsNeedingScrapingYahoo
    );
    // console.log('yahooFundamentals', yahooFundamentals);
    Object.assign(fundamentalsMap, yahooFundamentals);

    startBackgroundScraping(symbolsNeedingScraping);
  }

  const resData = [];
  let totalInvestment = 0;
  let totalPresentValue = 0;
  //   console.log('Fundamentals map:', fundamentalsMap);

  for (const h of dataWithSymbols) {
    const cmp = cmpMap[h.symbol];
    const fundamentals = fundamentalsMap[h.symbol] || {};
    // if (!cmp) continue;

    const investment = h.purchasePrice * h.quantity;
    const presentValue = cmp * h.quantity;
    const gainLoss = presentValue - investment;

    totalInvestment += investment;
    totalPresentValue += presentValue;

    resData.push({
      ...h,
      cmp,
      investment,
      presentValue,
      gainLoss,
      peRatio: fundamentals.peRatio,
      latestEarnings: fundamentals.latestEarnings,
      source: fundamentals.source,
    });
  }

  const sectors = {};

  for (const stock of resData) {
    if (!sectors[stock.sector]) {
      sectors[stock.sector] = {
        sectorName: stock.sector,
        totalInvestment: 0,
        totalPresentValue: 0,
        totalGainLoss: 0,
        stocks: [],
      };
    }

    const sector = sectors[stock.sector];
    sector.totalInvestment += stock.investment;
    sector.totalPresentValue += stock.presentValue;
    sector.totalGainLoss += stock.gainLoss;
    sector.stocks.push(stock);
  }

  return {
    summary: {
      totalInvestment,
      totalPresentValue,
      totalGainLoss: totalPresentValue - totalInvestment,
      lastUpdated: new Date().toISOString(),
    },
    sectors: Object.values(sectors),
  };
}
