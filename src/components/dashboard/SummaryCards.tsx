'use client';

import React from 'react';
import { formatINR, formatLakhsCrores } from '@/lib/financial/calculations';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Repeat, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
  netWorth: number;
  totalInvested: number;
  totalGains: number;
  absReturnPct: number;
  cagrPct: number;
  xirrPct: number;
  monthlyCashFlow: {
    income: number;
    expenses: number;
    savings: number;
    net: number;
  };
  activeSIPCount: number;
  monthlySIPTotal: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  netWorth,
  totalInvested,
  totalGains,
  absReturnPct,
  cagrPct,
  xirrPct,
  monthlyCashFlow,
  activeSIPCount,
  monthlySIPTotal,
}) => {
  const isPositiveGain = totalGains >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Net Worth */}
      <div className="relative overflow-hidden bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Net Worth</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">{formatINR(netWorth)}</h2>
          <p className="text-xs text-cyan-400 font-medium mt-0.5">{formatLakhsCrores(netWorth)}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>Invested: <strong className="text-gray-200">{formatINR(totalInvested)}</strong></span>
          <span className="text-gray-400">{formatLakhsCrores(totalInvested)}</span>
        </div>
      </div>

      {/* 2. Total Gains & Absolute Return */}
      <div className="relative overflow-hidden bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-md hover:border-emerald-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Returns</span>
          <div className={`p-2 rounded-xl ${isPositiveGain ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {isPositiveGain ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h2 className={`text-2xl font-bold tracking-tight ${isPositiveGain ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositiveGain ? '+' : ''}{formatINR(totalGains)}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatLakhsCrores(totalGains)}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">Absolute Return:</span>
          <span className={`font-semibold flex items-center gap-0.5 ${absReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {absReturnPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {absReturnPct}%
          </span>
        </div>
      </div>

      {/* 3. Annualized Returns (XIRR & CAGR) */}
      <div className="relative overflow-hidden bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-md hover:border-indigo-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Annualized Returns</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-gray-400 block">XIRR Return</span>
            <h2 className="text-2xl font-bold text-indigo-400">{xirrPct}%</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block">CAGR Return</span>
            <h3 className="text-lg font-semibold text-gray-200">{cagrPct}%</h3>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>Formula:</span>
          <span className="font-mono text-cyan-400 text-[11px]">Newton-Raphson XIRR</span>
        </div>
      </div>

      {/* 4. Active SIPs & Monthly Cash Flow */}
      <div className="relative overflow-hidden bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-md hover:border-amber-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active SIP Commitments</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Repeat className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-2xl font-bold text-amber-400">{formatINR(monthlySIPTotal)}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{activeSIPCount} Active Monthly SIPs</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>Monthly Net Cashflow:</span>
          <span className={`font-semibold ${monthlyCashFlow.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(monthlyCashFlow.net)}
          </span>
        </div>
      </div>
    </div>
  );
};
