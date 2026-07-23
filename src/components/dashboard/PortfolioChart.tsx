'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatINR, formatLakhsCrores } from '@/lib/financial/calculations';
import { TrendingUp, Calendar } from 'lucide-react';

interface PortfolioChartProps {
  data: { date: string; invested: number; netWorth: number }[];
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'6M' | '1Y' | '3Y' | 'ALL'>('ALL');

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 h-80 flex flex-col items-center justify-center text-gray-500">
        <TrendingUp className="w-12 h-12 stroke-1 mb-2 text-gray-600" />
        <p className="text-sm">No portfolio trajectory data available yet.</p>
      </div>
    );
  }

  // Filter data based on selected timeframe
  let filteredData = [...data];
  if (timeframe === '6M') filteredData = data.slice(-6);
  if (timeframe === '1Y') filteredData = data.slice(-12);
  if (timeframe === '3Y') filteredData = data.slice(-36);

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Portfolio Growth Trajectory
          </h3>
          <p className="text-xs text-gray-400">Net worth growth vs cumulative capital invested over time</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
          {(['6M', '1Y', '3Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => formatLakhsCrores(value).replace('₹', '')}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const netWorthVal = payload[0]?.value as number;
                  const investedVal = payload[1]?.value as number;
                  const gain = netWorthVal - investedVal;

                  return (
                    <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[180px]">
                      <p className="font-semibold text-gray-300 border-b border-gray-800 pb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" /> {label}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 font-medium">Net Worth:</span>
                        <span className="font-bold text-white">{formatINR(netWorthVal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-400 font-medium">Invested:</span>
                        <span className="text-gray-300">{formatINR(investedVal)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                        <span className="text-gray-400">Total Profit:</span>
                        <span className={`font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gain >= 0 ? '+' : ''}{formatINR(gain)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              name="Net Worth"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#netWorthGradient)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              name="Capital Invested"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#investedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
          <span className="text-gray-300 font-medium">Current Net Worth</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 border border-dashed border-white"></span>
          <span className="text-gray-400">Capital Invested</span>
        </div>
      </div>
    </div>
  );
};
