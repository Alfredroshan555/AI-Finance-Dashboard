import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { calculateXIRR, CashFlowEntry } from '@/lib/financial/xirr';
import { calculateAbsoluteReturn, calculateCAGR } from '@/lib/financial/calculations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        portfolios: {
          include: {
            transactions: {
              include: { asset: true },
            },
            sips: {
              include: { asset: true },
            },
          },
        },
        cashFlows: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.portfolios.length === 0) {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          name: 'Primary Investment Portfolio',
          description: 'Main portfolio',
        },
        include: {
          transactions: { include: { asset: true } },
          sips: { include: { asset: true } },
        },
      });
      user.portfolios = [newPortfolio];
    }

    const portfolio = user.portfolios[0];
    const transactions = portfolio.transactions;
    const sips = portfolio.sips.filter((s) => s.status === 'ACTIVE');

    const holdingsMap: Record<string, {
      assetId: string;
      name: string;
      symbol: string;
      category: string;
      assetClass: string;
      units: number;
      invested: number;
      currentNAV: number;
      currentValue: number;
    }> = {};

    let totalInvested = 0;
    const cashFlowEntries: CashFlowEntry[] = [];

    transactions.forEach((t) => {
      if (!holdingsMap[t.assetId]) {
        holdingsMap[t.assetId] = {
          assetId: t.assetId,
          name: t.asset.name,
          symbol: t.asset.symbol,
          category: t.asset.category,
          assetClass: t.asset.assetClass,
          units: 0,
          invested: 0,
          currentNAV: t.asset.currentNAV,
          currentValue: 0,
        };
      }

      if (t.type === 'BUY' || t.type === 'SIP_BUY') {
        holdingsMap[t.assetId].units += t.units;
        holdingsMap[t.assetId].invested += t.amount;
        totalInvested += t.amount;

        cashFlowEntries.push({
          amount: -t.amount,
          date: new Date(t.date),
        });
      } else if (t.type === 'SELL') {
        holdingsMap[t.assetId].units -= t.units;
        holdingsMap[t.assetId].invested -= t.amount;
        totalInvested -= t.amount;

        cashFlowEntries.push({
          amount: t.amount,
          date: new Date(t.date),
        });
      }
    });

    let currentNetWorth = 0;
    const assetAllocationMap: Record<string, number> = {};

    Object.values(holdingsMap).forEach((h) => {
      h.currentValue = h.units * h.currentNAV;
      currentNetWorth += h.currentValue;

      const label = h.assetClass.replace('_', ' ');
      assetAllocationMap[label] = (assetAllocationMap[label] || 0) + h.currentValue;
    });

    if (currentNetWorth > 0) {
      cashFlowEntries.push({
        amount: currentNetWorth,
        date: new Date(),
      });
    }

    const totalGains = currentNetWorth - totalInvested;
    const absReturnPct = calculateAbsoluteReturn(totalInvested, currentNetWorth);
    const xirrPct = calculateXIRR(cashFlowEntries);

    let cagrPct = 0;
    if (transactions.length > 0) {
      const earliestDate = new Date(
        Math.min(...transactions.map((t) => new Date(t.date).getTime()))
      );
      const yearsDiff = Math.max(0.1, (new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      cagrPct = calculateCAGR(totalInvested, currentNetWorth, yearsDiff);
    }

    const assetAllocation = Object.entries(assetAllocationMap).map(([name, value]) => ({
      name,
      value: Math.round(value),
      percentage: currentNetWorth > 0 ? Math.round((value / currentNetWorth) * 1000) / 10 : 0,
    }));

    let income = 0;
    let expenses = 0;
    let savings = 0;

    user.cashFlows.forEach((cf) => {
      if (cf.type === 'INCOME') income += cf.amount;
      if (cf.type === 'EXPENSE') expenses += cf.amount;
      if (cf.type === 'SAVING') savings += cf.amount;
    });

    const monthlySIPTotal = sips.reduce((acc, s) => acc + s.amount, 0);

    const sortedTx = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulativeInvested = 0;
    const trajectory: { date: string; invested: number; netWorth: number }[] = [];

    sortedTx.forEach((t) => {
      cumulativeInvested += t.amount;
      const growthFactor = currentNetWorth / (totalInvested || 1);
      const estimatedValue = cumulativeInvested * growthFactor;

      trajectory.push({
        date: new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        invested: Math.round(cumulativeInvested),
        netWorth: Math.round(estimatedValue),
      });
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      netWorth: Math.round(currentNetWorth),
      totalInvested: Math.round(totalInvested),
      totalGains: Math.round(totalGains),
      absReturnPct,
      cagrPct,
      xirrPct,
      monthlyCashFlow: {
        income,
        expenses,
        savings,
        net: income - expenses,
      },
      assetAllocation,
      portfolioTrajectory: trajectory,
      activeSIPCount: sips.length,
      monthlySIPTotal,
      holdings: Object.values(holdingsMap),
    });
  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json({ error: 'Failed to generate dashboard summary' }, { status: 500 });
  }
}
