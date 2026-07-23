'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface AssetOption {
  id: string;
  symbol: string;
  name: string;
  category: string;
  currentNAV: number;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL' | 'SIP_BUY'>('BUY');
  const [units, setUnits] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/assets')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAssets(data);
            if (data.length > 0) {
              setSelectedAssetId(data[0].id);
              setPricePerUnit(data[0].currentNAV.toString());
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    const found = assets.find((a) => a.id === assetId);
    if (found) {
      setPricePerUnit(found.currentNAV.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !units || !pricePerUnit) {
      setError('Please fill in all required transaction fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAssetId,
          type,
          units: parseFloat(units),
          pricePerUnit: parseFloat(pricePerUnit),
          amount: parseFloat(units) * parseFloat(pricePerUnit),
          date,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add transaction');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            Add New Investment Transaction
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Asset Selector */}
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Select Holding / Asset:</label>
            <select
              value={selectedAssetId}
              onChange={(e) => handleAssetChange(e.target.value)}
              className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.symbol}) - ₹{a.currentNAV}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Transaction Type:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BUY', 'SIP_BUY', 'SELL'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    type === t
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-gray-950 text-gray-400 border border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Units & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">Units (Quantity):</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 150.25"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-300 mb-1">NAV / Unit Price (INR):</label>
              <input
                type="number"
                step="any"
                placeholder="NAV price"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Transaction Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Notes / Remarks:</label>
            <input
              type="text"
              placeholder="e.g. Monthly SIP debit or manual buy"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
