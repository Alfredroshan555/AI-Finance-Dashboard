'use client';

import React, { useState } from 'react';
import { calculateXIRR, CashFlowEntry } from '@/lib/financial/xirr';
import { formatINR } from '@/lib/financial/calculations';
import { Calculator, Plus, Trash2, CheckCircle2, Info } from 'lucide-react';

interface XIRRCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XIRRCalculatorModal: React.FC<XIRRCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [cashFlows, setCashFlows] = useState<Array<{ id: string; date: string; amount: number }>>([
    { id: '1', date: '2024-01-01', amount: -50000 },
    { id: '2', date: '2024-06-01', amount: -50000 },
    { id: '3', date: '2024-12-01', amount: -50000 },
    { id: '4', date: '2025-06-01', amount: 185000 },
  ]);

  if (!isOpen) return null;

  const addRow = () => {
    setCashFlows([
      ...cashFlows,
      { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], amount: -10000 },
    ]);
  };

  const removeRow = (id: string) => {
    if (cashFlows.length > 2) {
      setCashFlows(cashFlows.filter((cf) => cf.id !== id));
    }
  };

  const updateRow = (id: string, key: 'date' | 'amount', value: string | number) => {
    setCashFlows(
      cashFlows.map((cf) => (cf.id === id ? { ...cf, [key]: value } : cf))
    );
  };

  const entries: CashFlowEntry[] = cashFlows.map((cf) => ({
    amount: Number(cf.amount) || 0,
    date: new Date(cf.date),
  }));

  const calculatedXIRR = calculateXIRR(entries);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            XIRR Verification Playground
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>
            Enter negative values for investments/buys and positive values for redemptions or current market valuation.
          </span>
        </div>

        {/* Cash Flow Rows */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {cashFlows.map((cf, idx) => (
            <div key={cf.id} className="flex items-center gap-3 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-500 text-xs font-mono w-5 text-center">#{idx + 1}</span>
              <input
                type="date"
                value={cf.date}
                onChange={(e) => updateRow(cf.id, 'date', e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                placeholder="Amount (- for buy, + for sell)"
                value={cf.amount}
                onChange={(e) => updateRow(cf.id, 'amount', Number(e.target.value))}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => removeRow(cf.id)}
                disabled={cashFlows.length <= 2}
                className="text-gray-500 hover:text-rose-400 disabled:opacity-30 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 text-xs font-semibold border border-gray-700 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Cash Flow Stream
        </button>

        {/* Output Box */}
        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">Calculated XIRR Rate:</span>
            <span className="text-2xl font-bold text-indigo-400">{calculatedXIRR}%</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Algorithm:</span>
            <span className="text-xs font-mono text-emerald-400">Newton-Raphson Solver</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs transition-all"
        >
          Close Playground
        </button>
      </div>
    </div>
  );
};
