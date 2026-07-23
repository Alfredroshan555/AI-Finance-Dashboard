import Papa from 'papaparse';

export interface CSVTransactionRow {
  date: string;
  assetName: string;
  symbol?: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SIP_BUY';
  category?: string;
  assetClass?: string;
  units: number;
  pricePerUnit: number;
  amount: number;
  notes?: string;
}

function parseCleanNumber(val?: string): number {
  if (!val) return 0;
  return Math.abs(parseFloat(val.replace(/,/g, ''))) || 0;
}

function extractField(row: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return undefined;
}

function classifyTransactionType(typeStr: string): CSVTransactionRow['type'] {
  const upper = typeStr.toUpperCase();
  if (upper.includes('SELL') || upper.includes('REDEMPTION')) return 'SELL';
  if (upper.includes('DIVIDEND') || upper.includes('PAYOUT')) return 'DIVIDEND';
  if (upper.includes('SIP')) return 'SIP_BUY';
  return 'BUY';
}

export function parseTransactionCSV(csvContent: string): {
  success: boolean;
  rows: CSVTransactionRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows: CSVTransactionRow[] = [];

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (parsed.errors?.length) {
    parsed.errors.forEach((err) => errors.push(`CSV Error line ${err.row}: ${err.message}`));
  }

  const dataList = parsed.data as Record<string, string>[];

  dataList.forEach((row, idx) => {
    const dateStr = extractField(row, ['date', 'transaction date', 'trade date', 'date_time']);
    const assetName = extractField(row, ['asset', 'asset name', 'scheme name', 'symbol', 'description']);

    if (!dateStr || !assetName) {
      errors.push(`Row ${idx + 1}: Missing required fields (Date or Asset Name).`);
      return;
    }

    const dateVal = new Date(dateStr);
    if (isNaN(dateVal.getTime())) {
      errors.push(`Row ${idx + 1}: Invalid date format "${dateStr}".`);
      return;
    }

    const units = parseCleanNumber(extractField(row, ['units', 'quantity', 'qty']));
    const pricePerUnit = parseCleanNumber(extractField(row, ['price', 'nav', 'price per unit', 'rate']));
    let amount = parseCleanNumber(extractField(row, ['amount', 'total amount', 'value']));

    if (amount === 0 && units > 0 && pricePerUnit > 0) {
      amount = units * pricePerUnit;
    }

    const rawType = extractField(row, ['type', 'transaction type', 'trade type']) || 'BUY';

    rows.push({
      date: dateVal.toISOString(),
      assetName: assetName.trim(),
      symbol: (row['symbol'] || assetName.trim().substring(0, 10)).toUpperCase(),
      type: classifyTransactionType(rawType),
      category: (row['category'] || 'MUTUAL_FUND').toUpperCase(),
      assetClass: (extractField(row, ['asset class', 'assetclass']) || 'INDEX').toUpperCase(),
      units,
      pricePerUnit,
      amount,
      notes: extractField(row, ['notes', 'remarks']) || 'CSV Import',
    });
  });

  return {
    success: errors.length === 0 || rows.length > 0,
    rows,
    errors,
  };
}
