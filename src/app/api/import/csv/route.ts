import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { parseTransactionCSV } from '@/lib/financial/csvParser';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['MUTUAL_FUND', 'ETF', 'EQUITY', 'GOLD', 'DEBT', 'FIXED_INCOME'];
const VALID_ASSET_CLASSES = ['LARGE_CAP', 'MID_CAP', 'SMALL_CAP', 'FLEXI_CAP', 'INDEX', 'COMMODITY', 'DEBT'];

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { csvContent } = body;

    if (!csvContent) {
      return NextResponse.json({ error: 'CSV content is empty or missing.' }, { status: 400 });
    }

    const parseResult = parseTransactionCSV(csvContent);

    if (!parseResult.success && parseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV statement.', details: parseResult.errors },
        { status: 400 }
      );
    }

    let userPortfolio = await prisma.portfolio.findFirst({
      where: { userId: authUser.userId },
    });

    if (!userPortfolio) {
      userPortfolio = await prisma.portfolio.create({
        data: {
          userId: authUser.userId,
          name: 'Primary Investment Portfolio',
        },
      });
    }

    let insertedCount = 0;

    for (const row of parseResult.rows) {
      let asset = await prisma.asset.findFirst({
        where: {
          OR: [{ symbol: row.symbol }, { name: row.assetName }],
        },
      });

      if (!asset) {
        asset = await prisma.asset.create({
          data: {
            symbol: row.symbol || row.assetName.substring(0, 10).toUpperCase(),
            name: row.assetName,
            category: VALID_CATEGORIES.includes(row.category || '') ? (row.category as string) : 'MUTUAL_FUND',
            assetClass: VALID_ASSET_CLASSES.includes(row.assetClass || '') ? (row.assetClass as string) : 'INDEX',
            currentNAV: row.pricePerUnit || 100.0,
          },
        });
      }

      await prisma.transaction.create({
        data: {
          portfolioId: userPortfolio.id,
          assetId: asset.id,
          type: row.type,
          units: row.units,
          pricePerUnit: row.pricePerUnit,
          amount: row.amount,
          date: new Date(row.date),
          notes: row.notes || 'CSV Import',
        },
      });

      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      insertedCount,
      errors: parseResult.errors,
    });
  } catch (error) {
    console.error('CSV import API error:', error);
    return NextResponse.json({ error: 'Internal error importing statement.' }, { status: 500 });
  }
}
