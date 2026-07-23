'use client';

import React, { useState } from 'react';
import { formatINR } from '@/lib/financial/calculations';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Tag, Calendar, Layers } from 'lucide-react';

export interface TransactionItem {
  id: string;
  type: string;
  units: number;
  pricePerUnit: number;
  amount: number;
  date: string;
  notes?: string;
  asset: {
    name: string;
    symbol: string;
    category: string;
    assetClass: string;
  };
}

interface TransactionLedgerProps {
  transactions: TransactionItem[];
  onOpenAddTx: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ transactions, onOpenAddTx }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.asset.name.toLowerCase().includes(search.toLowerCase()) ||
      tx.asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Transaction Ledger & History
          </h3>
          <p className="text-xs text-gray-400">Detailed records of mutual funds, ETFs, equity buys/sells & SIP debits</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search asset, symbol, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
            {['ALL', 'BUY', 'SIP_BUY', 'SELL'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  typeFilter === type
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Asset / Scheme</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold text-right">Units</th>
              <th className="px-4 py-3 font-semibold text-right">NAV / Price</th>
              <th className="px-4 py-3 font-semibold text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No matching transaction records found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isBuy = tx.type === 'BUY' || tx.type === 'SIP_BUY';

                return (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white max-w-xs truncate">{tx.asset.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="text-cyan-400 font-mono font-medium">{tx.asset.symbol}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.asset.assetClass.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-gray-200">
                      {tx.units.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-gray-300">
                      {formatINR(tx.pricePerUnit, true)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-white font-mono">
                      {formatINR(tx.amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
