'use client';

import React, { useState } from 'react';
import { formatINR, calculateSIPFutureValue } from '@/lib/financial/calculations';
import { Repeat, Calendar, Calculator, Sparkles, AlertCircle, Play, Pause } from 'lucide-react';

interface SIPItem {
  id: string;
  amount: number;
  frequency: string;
  dayOfMonth: number;
  status: string;
  startDate: string;
  asset: {
    name: string;
    symbol: string;
    category: string;
    assetClass: string;
  };
}

interface SIPTrackerProps {
  sips: SIPItem[];
  monthlySIPTotal: number;
}

export const SIPTracker: React.FC<SIPTrackerProps> = ({ sips, monthlySIPTotal }) => {
  const [showSIPCalc, setShowSIPCalc] = useState(false);
  const [calcMonthly, setCalcMonthly] = useState(15000);
  const [calcReturnRate, setCalcReturnRate] = useState(14);
  const [calcYears, setCalcYears] = useState(10);

  const projection = calculateSIPFutureValue(calcMonthly, calcReturnRate, calcYears);

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-amber-400" />
            Systematic Investment Plans (SIPs)
          </h3>
          <p className="text-xs text-gray-400">Automated recurring investments in mutual funds & ETFs</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 block">Monthly SIP Commitment</span>
            <span className="text-base font-bold text-amber-400">{formatINR(monthlySIPTotal)}</span>
          </div>

          <button
            onClick={() => setShowSIPCalc(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            SIP Calculator
          </button>
        </div>
      </div>

      {/* SIP List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sips.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500 text-xs">
            No active SIP schedules found. Click &quot;Add Transaction&quot; to set up a new SIP.
          </div>
        ) : (
          sips.map((sip) => (
            <div
              key={sip.id}
              className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-4 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{sip.asset.name}</h4>
                    <span className="text-[11px] text-cyan-400 font-mono">{sip.asset.symbol}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sip.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {sip.status === 'ACTIVE' ? <Play className="w-2.5 h-2.5 fill-emerald-400" /> : <Pause className="w-2.5 h-2.5" />}
                    {sip.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Monthly Debit</span>
                  <span className="text-sm font-bold text-white">{formatINR(sip.amount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> Next Debit Date
                  </span>
                  <span className="text-xs font-semibold text-gray-200">
                    {sip.dayOfMonth}th of every month
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SIP Wealth Calculator Modal */}
      {showSIPCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                SIP Wealth Growth Calculator
              </h3>
              <button
                onClick={() => setShowSIPCalc(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1.5 text-gray-300">
                  <span>Monthly Investment (INR):</span>
                  <span className="text-amber-400 font-bold">{formatINR(calcMonthly)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  step="1000"
                  value={calcMonthly}
                  onChange={(e) => setCalcMonthly(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1.5 text-gray-300">
                  <span>Expected Annual Return Rate (%):</span>
                  <span className="text-cyan-400 font-bold">{calcReturnRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={calcReturnRate}
                  onChange={(e) => setCalcReturnRate(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1.5 text-gray-300">
                  <span>Investment Duration (Years):</span>
                  <span className="text-indigo-400 font-bold">{calcYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={calcYears}
                  onChange={(e) => setCalcYears(Number(e.target.value))}
                  className="w-full accent-indigo-400 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Projection Results Box */}
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Invested Capital:</span>
                <span className="font-semibold text-gray-200">{formatINR(projection.totalInvested)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Estimated Capital Gains:</span>
                <span className="font-semibold text-emerald-400">+{formatINR(projection.estimatedReturns)}</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-300">Projected Future Wealth:</span>
                <span className="text-xl font-bold text-amber-400">{formatINR(projection.expectedFutureValue)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSIPCalc(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
