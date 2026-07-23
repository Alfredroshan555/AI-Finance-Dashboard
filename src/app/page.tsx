'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AssetAllocationChart } from '@/components/dashboard/AssetAllocationChart';
import { SIPTracker } from '@/components/dashboard/SIPTracker';
import { TransactionLedger, TransactionItem } from '@/components/dashboard/TransactionLedger';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';
import { CSVImportModal } from '@/components/dashboard/CSVImportModal';
import { XIRRCalculatorModal } from '@/components/dashboard/XIRRCalculatorModal';
import { RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SummaryData {
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
  assetAllocation: { name: string; value: number; percentage: number }[];
  portfolioTrajectory: { date: string; invested: number; netWorth: number }[];
  activeSIPCount: number;
  monthlySIPTotal: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [sips, setSips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isXIRROpen, setIsXIRROpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes, sipRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/transactions'),
        fetch('/api/sips'),
      ]);

      const sumData = await sumRes.json();
      const txData = await txRes.json();
      const sipData = await sipRes.json();

      if (!sumData.error) setSummary(sumData);
      if (Array.isArray(txData)) setTransactions(txData);
      if (Array.isArray(sipData)) setSips(sipData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Header Bar */}
      <Header
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenXIRRPlayground={() => setIsXIRROpen(true)}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Refresh Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/60 border border-gray-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Indian Mutual Funds, ETFs & SIP Dashboard</h2>
              <p className="text-xs text-gray-400">
                XIRR & CAGR returns dynamically calculated across all holdings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Metrics'}
            </button>
          </div>
        </div>

        {/* 1. Metric Summary Cards */}
        {summary && (
          <SummaryCards
            netWorth={summary.netWorth}
            totalInvested={summary.totalInvested}
            totalGains={summary.totalGains}
            absReturnPct={summary.absReturnPct}
            cagrPct={summary.cagrPct}
            xirrPct={summary.xirrPct}
            monthlyCashFlow={summary.monthlyCashFlow}
            activeSIPCount={summary.activeSIPCount}
            monthlySIPTotal={summary.monthlySIPTotal}
          />
        )}

        {/* 2. Portfolio Growth & Asset Allocation Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart data={summary?.portfolioTrajectory || []} />
          </div>
          <div>
            <AssetAllocationChart data={summary?.assetAllocation || []} />
          </div>
        </div>

        {/* 3. Systematic Investment Plans (SIP) Tracker */}
        <SIPTracker sips={sips} monthlySIPTotal={summary?.monthlySIPTotal || 0} />

        {/* 4. Transaction Ledger */}
        <TransactionLedger transactions={transactions} onOpenAddTx={() => setIsAddTxOpen(true)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 WealthPulse AI • Personal Finance & Portfolio Intelligence</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encrypted</span>
            <span>•</span>
            <span>Indian Rupee (INR) Standard</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={fetchData}
      />

      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchData}
      />

      <XIRRCalculatorModal
        isOpen={isXIRROpen}
        onClose={() => setIsXIRROpen(false)}
      />
    </div>
  );
}
