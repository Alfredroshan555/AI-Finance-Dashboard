'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Upload, PlusCircle, Calculator, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenAddTx: () => void;
  onOpenImport: () => void;
  onOpenXIRRPlayground: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTx,
  onOpenImport,
  onOpenXIRRPlayground,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U');

  return (
    <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-cyan-400">
                WealthPulse AI
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Encrypted Session
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Personal Investment & Cashflow Dashboard • <span className="text-cyan-400">{user?.email || 'Authenticated User'}</span>
            </p>
          </div>
        </div>

        {/* Action Toolbar & User Menu */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenXIRRPlayground}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium border border-gray-700 transition-all hover:border-gray-600"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            XIRR Calculator
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium border border-gray-700 transition-all hover:border-gray-600"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            Import CSV
          </button>

          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-medium shadow-md shadow-cyan-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add Transaction
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700 transition-all"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User'}
                  className="h-8 w-8 rounded-lg object-cover border border-gray-700"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {userInitial}
                </div>
              )}
              <span className="text-xs font-semibold text-gray-200 hidden sm:inline-block max-w-[120px] truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-gray-800/80">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Account'}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
