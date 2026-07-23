import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  name: z.string().min(1, 'Full name is required').max(100).trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const TransactionSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  portfolioId: z.string().optional(),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'SIP_BUY']).default('BUY'),
  units: z.coerce.number().positive('Units must be greater than zero'),
  pricePerUnit: z.coerce.number().positive('Price per unit must be greater than zero'),
  amount: z.coerce.number().optional(),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const SIPSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  portfolioId: z.string().optional(),
  amount: z.coerce.number().positive('Monthly amount must be greater than zero'),
  frequency: z.enum(['MONTHLY', 'QUARTERLY']).default('MONTHLY'),
  dayOfMonth: z.coerce.number().int().min(1).max(31).default(5),
  startDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const AssetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20).toUpperCase().trim(),
  isin: z.string().max(20).optional(),
  name: z.string().min(1, 'Asset name is required').max(200).trim(),
  category: z.enum(['MUTUAL_FUND', 'ETF', 'EQUITY', 'GOLD', 'DEBT', 'FIXED_INCOME']).default('MUTUAL_FUND'),
  assetClass: z.enum(['LARGE_CAP', 'MID_CAP', 'SMALL_CAP', 'FLEXI_CAP', 'INDEX', 'COMMODITY', 'DEBT']).default('INDEX'),
  currentNAV: z.coerce.number().positive('Current NAV must be a positive number'),
});
