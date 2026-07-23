'use client';

import React from 'react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR, formatLakhsCrores } from '@/lib/financial/calculations';
import { PieChart, Shield } from 'lucide-react';

interface AssetAllocationProps {
  data: { name: string; value: number; percentage: number }[];
}

const COLORS = [
  '#06b6d4', // Cyan (Index / Flexi)
  '#10b981', // Emerald (Small Cap)
  '#6366f1', // Indigo (Mid Cap)
  '#f59e0b', // Amber (Gold / Commodity)
  '#ec4899', // Pink (Large Cap)
  '#8b5cf6', // Purple (Debt)
];

export const AssetAllocationChart: React.FC<AssetAllocationProps> = ({ data }) => {
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 h-80 flex flex-col items-center justify-center text-gray-500">
        <PieChart className="w-12 h-12 stroke-1 mb-2 text-gray-600" />
        <p className="text-sm">No asset allocation data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              Asset Class Breakdown
            </h3>
            <p className="text-xs text-gray-400">Distribution across Small Cap, Index, Gold & Debt</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {data.length} Categories
          </span>
        </div>

        {/* Donut Chart */}
        <div className="h-52 w-full relative my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#111827" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as { name: string; value: number; percentage: number };
                    return (
                      <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl text-xs space-y-1 shadow-2xl">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-cyan-400">{formatINR(item.value)} ({item.percentage}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RePieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Total</span>
            <span className="text-sm font-bold text-white">{formatLakhsCrores(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* Legend List */}
      <div className="mt-4 pt-3 border-t border-gray-800 space-y-2 text-xs max-h-36 overflow-y-auto pr-1">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span className="text-gray-300 font-medium capitalize">{item.name.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-200">{formatINR(item.value)}</span>
              <span className="w-12 text-right px-1.5 py-0.5 rounded text-[11px] font-bold bg-gray-800 text-cyan-400">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
