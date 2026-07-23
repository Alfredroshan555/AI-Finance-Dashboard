import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { SIPSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sips = await prisma.sIP.findMany({
      where: {
        portfolio: {
          userId: authUser.userId,
        },
      },
      include: {
        asset: true,
        portfolio: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sips);
  } catch (error) {
    console.error('Fetch SIPs error:', error);
    return NextResponse.json({ error: 'Failed to fetch SIP schedules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = SIPSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid SIP schedule input.' },
        { status: 400 }
      );
    }

    const { assetId, portfolioId, amount, frequency, dayOfMonth, startDate, notes } = parseResult.data;

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

    const newSIP = await prisma.sIP.create({
      data: {
        portfolioId: targetPortfolioId,
        assetId,
        amount,
        frequency,
        dayOfMonth,
        startDate: new Date(startDate || Date.now()),
        notes,
      },
      include: {
        asset: true,
      },
    });

    return NextResponse.json(newSIP);
  } catch (error) {
    console.error('Create SIP error:', error);
    return NextResponse.json({ error: 'Failed to create SIP schedule' }, { status: 500 });
  }
}
