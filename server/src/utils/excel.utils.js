import xlsx from 'xlsx';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'sample.xlsx');

export function readHoldingsFromExcel() {
  try {
    const workbook = xlsx.readFile(FILE_PATH);
    // console.log('workbook', workbook);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    //   console.log('sheet', sheet);
    const rows = xlsx.utils.sheet_to_json(sheet, {
      range: 1,
    });

    // console.log('rows', rows);
    // console.log(
    //   'row',
    //   rows[1],
    //   rows[1]['Particulars'],
    //   rows[1]['NSE/BSE'],
    //   rows[1]['Sector'],
    //   Number(rows[1]['Purchase Price'], Number(rows[1]['Qty']))
    // );

    let data = rows.map((row) => {
      //   console.log(
      //     'row',
      //     //   row[1],
      //     row['Particulars'],
      //     row['NSE/BSE'],
      //     row['Sector'],
      //     Number(row['Purchase Price'], Number(row['Qty']))
      //   );
      return {
        name: row['Particulars'],
        exchange: row['NSE/BSE'],
        sector: row['Sector'],
        purchasePrice: Number(row['Purchase Price']),
        quantity: Number(row['Qty']),
      };
    });

    data = data.filter((row) => {
      if (
        row.exchange &&
        row.name &&
        row.purchasePrice &&
        row.quantity &&
        row.sector
      )
        return row;
    });
    return data;
  } catch (error) {
    console.error('error when reading holdings', error);
  }
}
