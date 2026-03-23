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
export type Denomination = 'USDT' | 'BTC';

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

// ======================================================
// BTC-denominated (inverse) option calculations
// ======================================================

// Expiration payoff in BTC: payoff(USD) / S
export function calculateExpirationPayoffBTC(
  S: number,
  leg: OptionLeg
): number {
  let payoffBtc = 0;
  if (leg.type === 'Call') {
    payoffBtc = Math.max(0, S - leg.strike) / S;
  } else {
    payoffBtc = Math.max(0, leg.strike - S) / S;
  }

  const profit = payoffBtc - leg.premium; // premium is already in BTC
  return leg.position === 'Long' ? profit * leg.quantity : -profit * leg.quantity;
}

// Current theoretical PnL in BTC
export function calculateCurrentPnLBTC(
  S: number,
  leg: OptionLeg,
  daysPassed: number,
  volAdjustment: number,
  r: number = 0.05
): number {
  const tRemaining = Math.max(0, leg.expirationDays - daysPassed) / 365;
  const currentVol = Math.max(0.01, leg.impliedVol + volAdjustment);

  const currentPriceUsd = blackScholesPrice(S, leg.strike, tRemaining, r, currentVol, leg.type);
  const currentPriceBtc = currentPriceUsd / S;
  const profit = currentPriceBtc - leg.premium; // premium is already in BTC

  return leg.position === 'Long' ? profit * leg.quantity : -profit * leg.quantity;
}

// Greeks for BTC-denominated (inverse) options
// OKX standard: To improve readability, major exchanges display standard USD-equivalent Greeks
// instead of pure strict inverse derivatives (which result in unreadable 0.0000x values).
export function calculateGreeksBTC(
  S: number,
  K: number,
  t: number,
  r: number,
  v: number,
  type: OptionType
) {
  return calculateGreeks(S, K, t, r, v, type);
}
