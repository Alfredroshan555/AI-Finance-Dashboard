/**
 * Financial Calculation Engine: XIRR (Extended Internal Rate of Return)
 * Calculates precise annual returns for irregular cashflow series (e.g. SIPs, buy/sell transactions).
 */

export interface CashFlowEntry {
  amount: number; // Negative for outflows/buys, positive for inflows/sells/current market value
  date: Date;
}

const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-7;
const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

function getYearsDiff(date: Date, d0: number): number {
  return (date.getTime() - d0) / MS_PER_YEAR;
}

/**
 * Calculates f(r) = sum( C_i / (1 + r)^((d_i - d_0) / 365) )
 */
function calculateNPV(rate: number, cashFlows: CashFlowEntry[], d0: number): number {
  if (rate <= -0.9999999) return NaN;
  return cashFlows.reduce((sum, cf) => {
    const years = getYearsDiff(cf.date, d0);
    return sum + cf.amount / Math.pow(1 + rate, years);
  }, 0);
}

/**
 * Calculates derivative f'(r) for Newton-Raphson iteration
 */
function calculateNPVDerivative(rate: number, cashFlows: CashFlowEntry[], d0: number): number {
  if (rate <= -0.9999999) return NaN;
  return cashFlows.reduce((sum, cf) => {
    const years = getYearsDiff(cf.date, d0);
    return sum - (years * cf.amount) / Math.pow(1 + rate, years + 1);
  }, 0);
}

/**
 * Bisection method fallback when Newton-Raphson fails to converge
 */
function bisectionXIRR(cashFlows: CashFlowEntry[], d0: number): number {
  let low = -0.99;
  let high = 10.0; // 1000% annual return cap
  let mid = 0.1;

  let fLow = calculateNPV(low, cashFlows, d0);
  let fHigh = calculateNPV(high, cashFlows, d0);

  if (isNaN(fLow) || isNaN(fHigh) || fLow * fHigh > 0) {
    return 0;
  }

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    mid = (low + high) / 2;
    const fMid = calculateNPV(mid, cashFlows, d0);

    if (Math.abs(fMid) < TOLERANCE || (high - low) / 2 < TOLERANCE) {
      return mid;
    }

    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return mid;
}

/**
 * Main XIRR calculation function
 * @returns Annualized return rate as percentage (e.g. 14.5 for 14.5%)
 */
export function calculateXIRR(cashFlows: CashFlowEntry[]): number {
  if (!cashFlows || cashFlows.length < 2) return 0;

  // Verify there is at least one positive and one negative cash flow
  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  const hasNegative = cashFlows.some((cf) => cf.amount < 0);
  if (!hasPositive || !hasNegative) return 0;

  // Sort cashflows chronologically
  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const d0 = sorted[0].date.getTime();

  let rate = 0.1; // Initial guess of 10%

  // Try Newton-Raphson Method
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const fValue = calculateNPV(rate, sorted, d0);
    const fPrime = calculateNPVDerivative(rate, sorted, d0);

    if (isNaN(fValue) || isNaN(fPrime) || Math.abs(fPrime) < 1e-12) {
      break; // Fallback to bisection
    }

    const nextRate = rate - fValue / fPrime;

    if (Math.abs(nextRate - rate) < TOLERANCE) {
      return Math.round(nextRate * 10000) / 100; // Returns rate as percentage (e.g. 15.42)
    }

    rate = nextRate;
  }

  // Fallback to Bisection solver
  const bisectionResult = bisectionXIRR(sorted, d0);
  return Math.round(bisectionResult * 10000) / 100;
}
