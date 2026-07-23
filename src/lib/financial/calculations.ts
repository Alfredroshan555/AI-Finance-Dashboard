/**
 * General Financial & Currency Calculation Utilities
 */

/**
 * Calculates Compound Annual Growth Rate (CAGR)
 */
export function calculateCAGR(investedAmount: number, currentValue: number, years: number): number {
  if (investedAmount <= 0 || currentValue <= 0 || years <= 0) return 0;
  const cagr = Math.pow(currentValue / investedAmount, 1 / years) - 1;
  return Math.round(cagr * 10000) / 100;
}

/**
 * Calculates Absolute Return Percentage
 */
export function calculateAbsoluteReturn(investedAmount: number, currentValue: number): number {
  if (investedAmount <= 0) return 0;
  const absReturn = ((currentValue - investedAmount) / investedAmount) * 100;
  return Math.round(absReturn * 100) / 100;
}

/**
 * Formats numbers into standard Indian Rupee (INR) format (e.g., ₹1,23,456.78)
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (!Number.isFinite(amount)) return '₹0';
  const digits = showDecimals ? 2 : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(amount);
}

/**
 * Formats large amounts in Indian units: Lakhs (L) and Crores (Cr)
 */
export function formatLakhsCrores(amount: number): string {
  if (!Number.isFinite(amount) || amount === 0) return '₹0';
  const absVal = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absVal >= 10_000_000) {
    return `${sign}₹${(absVal / 10_000_000).toFixed(2)} Cr`;
  }
  if (absVal >= 100_000) {
    return `${sign}₹${(absVal / 100_000).toFixed(2)} L`;
  }

  return formatINR(amount, false);
}

/**
 * SIP Future Value Calculator
 * Calculates projected wealth accumulated from regular monthly investments.
 */
export interface SIPProjectionResult {
  totalInvested: number;
  expectedFutureValue: number;
  estimatedReturns: number;
}

export function calculateSIPFutureValue(
  monthlyInvestment: number,
  annualRatePct: number,
  durationYears: number
): SIPProjectionResult {
  if (monthlyInvestment <= 0 || annualRatePct <= 0 || durationYears <= 0) {
    return { totalInvested: 0, expectedFutureValue: 0, estimatedReturns: 0 };
  }

  const months = durationYears * 12;
  const monthlyRate = annualRatePct / 12 / 100;

  // Formula: FV = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
  const futureValue =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalInvested = monthlyInvestment * months;
  const estimatedReturns = Math.max(0, futureValue - totalInvested);

  return {
    totalInvested: Math.round(totalInvested),
    expectedFutureValue: Math.round(futureValue),
    estimatedReturns: Math.round(estimatedReturns),
  };
}
