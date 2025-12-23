import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import stockMap from './stockMap.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateStockMap() {
  const csvPath = path.resolve(
    __dirname,
    '../../BhavCopy_BSE_CM_0_0_0_20251223_F_0000.csv'
  );
  const outputPath = path.resolve(__dirname, './stockMap.json');

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found at: ${csvPath}`);
    return;
  }

  const data = fs.readFileSync(csvPath, 'utf8');
  const lines = data.trim().split('\n');

  const headers = lines[0].split(',');
  const bseIndex = headers.indexOf('FinInstrmId');
  const symbolIndex = headers.indexOf('TckrSymb');

  const stockMap = {};

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length <= symbolIndex) continue;

    const bseCode = row[bseIndex].trim();
    const nseSymbol = row[symbolIndex].trim();

    if (bseCode && nseSymbol) {
      stockMap[bseCode] = nseSymbol;
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(stockMap, null, 2));
}

export function getHomogenousSymbol(input) {
  if (!stockMap) {
    generateStockMap();
  }

  if (stockMap[input]) {
    return stockMap[input] + '.NS';
  }

  return input + '.NS';
}

// generateStockMap();
