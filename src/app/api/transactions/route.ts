import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { TransactionSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        portfolio: {
          userId: authUser.userId,
        },
      },
      include: {
        asset: true,
        portfolio: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = TransactionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid transaction parameters.' },
        { status: 400 }
      );
    }

    const { assetId, portfolioId, type, units, pricePerUnit, amount, date, notes } = parseResult.data;

    let targetPortfolioId = portfolioId;
    if (!targetPortfolioId) {
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
      targetPortfolioId = userPortfolio.id;
    } else {
      const existing = await prisma.portfolio.findFirst({
        where: { id: targetPortfolioId, userId: authUser.userId },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Invalid portfolio' }, { status: 403 });
      }
    }

    const calculatedAmount = amount ?? units * pricePerUnit;

    const newTx = await prisma.transaction.create({
      data: {
        portfolioId: targetPortfolioId,
        assetId,
        type,
        units,
        pricePerUnit,
        amount: calculatedAmount,
        date: new Date(date || Date.now()),
        notes: notes || 'Manual transaction entry',
      },
      include: {
        asset: true,
      },
    });

    return NextResponse.json(newTx);
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
