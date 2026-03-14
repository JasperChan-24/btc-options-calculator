// utils/blackScholes.ts

// Standard Normal cumulative distribution function
export function N(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0.0) {
    const t = 1.0 / (1.0 + p * x);
    return (
      1.0 -
      c *
        Math.exp((-x * x) / 2.0) *
        t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
    );
  } else {
    const t = 1.0 / (1.0 - p * x);
    return (
      c *
      Math.exp((-x * x) / 2.0) *
      t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
    );
  }
}

// Standard Normal probability density function
export function n(x: number): number {
  return Math.exp((-x * x) / 2.0) / Math.sqrt(2.0 * Math.PI);
}

export type OptionType = 'Call' | 'Put';
export type PositionType = 'Long' | 'Short';

export interface OptionLeg {
  id: string;
  type: OptionType;
  position: PositionType;
  strike: number;
  expirationDays: number; // Days to expiration
  impliedVol: number; // Annualized volatility (e.g., 0.5 for 50%)
  quantity: number;
  premium: number; // Entry price
}

// Calculate d1 and d2
function calculateD1D2(S: number, K: number, t: number, r: number, v: number) {
  if (t <= 0) t = 1e-5; // Prevent division by zero
  const d1 = (Math.log(S / K) + (r + (v * v) / 2.0) * t) / (v * Math.sqrt(t));
  const d2 = d1 - v * Math.sqrt(t);
  return { d1, d2 };
}

// Calculate theoretical option price
export function blackScholesPrice(
  S: number, // Current underlying price
  K: number, // Strike price
  t: number, // Time to expiration in years
  r: number, // Risk-free interest rate
  v: number, // Volatility
  type: OptionType
): number {
  if (t <= 0) {
    return type === 'Call' ? Math.max(0, S - K) : Math.max(0, K - S);
  }
  const { d1, d2 } = calculateD1D2(S, K, t, r, v);
  if (type === 'Call') {
    return S * N(d1) - K * Math.exp(-r * t) * N(d2);
  } else {
    return K * Math.exp(-r * t) * N(-d2) - S * N(-d1);
  }
}

// Calculate Greeks
export function calculateGreeks(
  S: number,
  K: number,
  t: number,
  r: number,
  v: number,
  type: OptionType
) {
  if (t <= 0) t = 1e-5;
  const { d1, d2 } = calculateD1D2(S, K, t, r, v);
  
  const nd1 = n(d1);
  
  const delta = type === 'Call' ? N(d1) : N(d1) - 1;
  const gamma = nd1 / (S * v * Math.sqrt(t));
  
  let theta = 0;
  if (type === 'Call') {
    theta =
      (-S * nd1 * v) / (2 * Math.sqrt(t)) -
      r * K * Math.exp(-r * t) * N(d2);
  } else {
    theta =
      (-S * nd1 * v) / (2 * Math.sqrt(t)) +
      r * K * Math.exp(-r * t) * N(-d2);
  }
  // Convert theta to per day
  theta = theta / 365;
  
  const vega = (S * nd1 * Math.sqrt(t)) / 100; // per 1% change in vol
  
  const rho = type === 'Call' 
    ? (K * t * Math.exp(-r * t) * N(d2)) / 100 
    : (-K * t * Math.exp(-r * t) * N(-d2)) / 100;

  return { delta, gamma, theta, vega, rho };
}

// Calculate payoff at expiration for a single leg
export function calculateExpirationPayoff(
  S: number,
  leg: OptionLeg
): number {
  let payoff = 0;
  if (leg.type === 'Call') {
    payoff = Math.max(0, S - leg.strike);
  } else {
    payoff = Math.max(0, leg.strike - S);
  }
  
  const profit = payoff - leg.premium;
  return leg.position === 'Long' ? profit * leg.quantity : -profit * leg.quantity;
}

// Calculate current theoretical PnL for a single leg
export function calculateCurrentPnL(
  S: number,
  leg: OptionLeg,
  daysPassed: number,
  volAdjustment: number,
  r: number = 0.05
): number {
  const tRemaining = Math.max(0, leg.expirationDays - daysPassed) / 365;
  const currentVol = Math.max(0.01, leg.impliedVol + volAdjustment);
  
  const currentPrice = blackScholesPrice(S, leg.strike, tRemaining, r, currentVol, leg.type);
  const profit = currentPrice - leg.premium;
  
  return leg.position === 'Long' ? profit * leg.quantity : -profit * leg.quantity;
}

/**
 * Binance Options Margin Calculation (Standard Margin)
 * Based on Binance rules for USDT-margined options.
 */
export function calculateBinanceMargin(
  S: number, // Spot Price
  leg: OptionLeg,
  currentPrice: number, // Mark Price (theoretical)
  isMaintenance: boolean = false
): number {
  if (leg.position === 'Long') return 0;

  const otm = leg.type === 'Call' 
    ? Math.max(0, leg.strike - S) 
    : Math.max(0, S - leg.strike);

  if (isMaintenance) {
    // Maintenance Margin = Mark Price + 0.075 * Spot Price
    return (currentPrice + 0.075 * S) * leg.quantity;
  } else {
    // Initial Margin = Mark Price + Max(0.15 * Spot Price - OTM, 0.1 * Spot Price)
    const riskPremium = Math.max(0.15 * S - otm, 0.1 * S);
    return (currentPrice + riskPremium) * leg.quantity;
  }
}

/**
 * Calculate total portfolio margin and equity
 */
export function calculatePortfolioRisk(
  S: number,
  legs: OptionLeg[],
  daysPassed: number,
  volAdjustment: number,
  r: number,
  walletBalance: number = 0
) {
  let totalIM = 0;
  let totalMM = 0;
  let totalUnrealizedPnL = 0;

  legs.forEach(leg => {
    const tRemaining = Math.max(0, leg.expirationDays - daysPassed) / 365;
    const currentVol = Math.max(0.01, leg.impliedVol + volAdjustment);
    const markPrice = blackScholesPrice(S, leg.strike, tRemaining, r, currentVol, leg.type);
    
    if (leg.position === 'Short') {
      totalIM += calculateBinanceMargin(S, leg, markPrice, false);
      totalMM += calculateBinanceMargin(S, leg, markPrice, true);
      totalUnrealizedPnL += (leg.premium - markPrice) * leg.quantity;
    } else {
      totalUnrealizedPnL += (markPrice - leg.premium) * leg.quantity;
    }
  });

  const equity = walletBalance + totalUnrealizedPnL;
  const marginRatio = totalMM > 0 ? (equity / totalMM) : Infinity;

  return { totalIM, totalMM, equity, marginRatio };
}
