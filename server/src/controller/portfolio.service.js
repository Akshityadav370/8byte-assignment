import { readHoldingsFromExcel } from '../utils/excel.utils.js';
import { getHomogenousSymbol } from '../utils/mapping.utils.js';
import { getFundamentals } from './google.service.js';
import { getCMP } from './yahoo.service.js';

let holdingsCache = null;

export async function buildPortfolio() {
  if (!holdingsCache) {
    holdingsCache = readHoldingsFromExcel();
  }

  // add homogenous exchange
  const dataWithSymbols = holdingsCache.map((holding) => {
    const symbol = getHomogenousSymbol(holding.exchange);
    return { ...holding, symbol };
  });

  const cmpMap = await getCMP(dataWithSymbols.map((data) => data.symbol));

  //   console.log(await getCMP(['SAVFI.NS']));

  const resData = [];

  let totalInvestment = 0;
  let totalPresentValue = 0;
  //   console.log(cmpMap);

  for (const h of dataWithSymbols) {
    const cmp = cmpMap[h.symbol];
    // replace BAJAJHFL.NS with BAJAJHFL:NSE
    // const data = await getFundamentals('BAJAJHFL:NSE');
    // const fundamentals = await getFundamentals(h.symbol);
    // console.log('cmp', cmp, h.symbol);
    if (!cmp) continue;

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
      //   ...fundamentals,
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
