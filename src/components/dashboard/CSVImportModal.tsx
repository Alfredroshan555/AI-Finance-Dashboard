'use client';

import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `Date,Asset Name,Symbol,Type,Units,Price,Amount,Category,Asset Class
2024-01-15,Mirae Asset Large Cap Fund,MIRAE_LARGE,BUY,100,85.50,8550,MUTUAL_FUND,LARGE_CAP
2024-02-15,Mirae Asset Large Cap Fund,MIRAE_LARGE,SIP_BUY,100,88.20,8820,MUTUAL_FUND,LARGE_CAP
2024-03-15,Nippon India Gold ETF,GOLDBEES,BUY,200,55.00,11000,ETF,COMMODITY
2024-04-10,SBI Small Cap Fund,SBI_SMALL,BUY,150,140.00,21000,MUTUAL_FUND,SMALL_CAP`;

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; insertedCount?: number; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCsvContent(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_portfolio_statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!csvContent.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || 'Import failed.' });
      } else {
        setResult({ success: true, insertedCount: data.insertedCount });
        onSuccess();
      }
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : 'Error uploading CSV statement' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            Import Portfolio CSV Statement
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Upload transaction CSV statements exported from CAMS, KFintech, Zerodha, or custom templates.
        </p>

        {/* Action Buttons & Dropzone */}
        <div className="border-2 border-dashed border-gray-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-gray-950/60 transition-all space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto stroke-1" />
          <div className="text-xs">
            <label className="cursor-pointer text-emerald-400 hover:underline font-bold">
              Click to select a .csv file
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-gray-400"> or paste raw text below</span>
          </div>
          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download Sample CSV Template
          </button>
        </div>

        {/* Textarea fallback */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">CSV Raw Data:</label>
          <textarea
            rows={5}
            placeholder="Paste CSV headers and transaction rows..."
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs font-mono text-gray-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {result && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {result.success
              ? `Successfully imported ${result.insertedCount} transactions!`
              : result.error}
          </div>
        )}

        <div className="pt-3 border-t border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !csvContent.trim()}
            className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
          >
            {loading ? 'Processing...' : 'Parse & Import CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};
