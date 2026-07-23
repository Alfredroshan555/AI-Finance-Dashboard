import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { AssetSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Fetch assets error:', error);
    return NextResponse.json({ error: 'Failed to fetch asset master records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = AssetSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid asset data.' },
        { status: 400 }
      );
    }

    const { symbol, isin, name, category, assetClass, currentNAV } = parseResult.data;

    const asset = await prisma.asset.create({
      data: {
        symbol,
        isin,
        name,
        category,
        assetClass,
        currentNAV,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
