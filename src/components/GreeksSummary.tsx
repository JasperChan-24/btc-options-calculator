import React, { useMemo } from 'react';
import { OptionLeg, Denomination, calculateGreeks, calculateGreeksBTC } from '../utils/blackScholes';
import { Lang, t } from '../i18n';

interface GreeksSummaryProps {
  legs: OptionLeg[];
  currentBtcPrice: number;
  daysPassed: number;
  volAdjustment: number;
  riskFreeRate: number;
  spotBtcAmount: number;
  denomination: Denomination;
  lang: Lang;
}

export const GreeksSummary: React.FC<GreeksSummaryProps> = ({
  legs,
  currentBtcPrice,
  daysPassed,
  volAdjustment,
  riskFreeRate,
  spotBtcAmount,
  denomination,
  lang,
}) => {
  const isBtc = denomination === 'BTC';
  const greeksFn = isBtc ? calculateGreeksBTC : calculateGreeks;

  const portfolioGreeks = useMemo(() => {
    // In BTC mode, spot delta contribution = spotBtcAmount (still 1 BTC = 1 BTC delta)
    let delta = spotBtcAmount;
    let gamma = 0;
    let theta = 0;
    let vega = 0;
    let rho = 0;

    legs.forEach((leg) => {
      const tRemaining = Math.max(0, leg.expirationDays - daysPassed) / 365;
      const currentVol = Math.max(0.01, leg.impliedVol + volAdjustment);
      
      const greeks = greeksFn(
        currentBtcPrice,
        leg.strike,
        tRemaining,
        riskFreeRate,
        currentVol,
        leg.type
      );

      const multiplier = leg.position === 'Long' ? leg.quantity : -leg.quantity;

      delta += greeks.delta * multiplier;
      gamma += greeks.gamma * multiplier;
      theta += greeks.theta * multiplier;
      vega += greeks.vega * multiplier;
      rho += greeks.rho * multiplier;
    });

    return { delta, gamma, theta, vega, rho };
  }, [legs, currentBtcPrice, daysPassed, volAdjustment, riskFreeRate, spotBtcAmount, greeksFn]);

  const formatGreek = (value: number, label: string) => {
    if (label === 'Gamma') return value.toFixed(6);
    return value.toFixed(4);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700">
      <h3 className="text-base font-semibold text-white mb-2">
        {t[lang].portfolioGreeks}
        <span className="ml-2 text-xs font-normal text-gray-400">
          {isBtc ? '(USD Equivalent)' : `(${denomination})`}
        </span>
      </h3>
      <div className="flex flex-wrap gap-2">
        <GreekCard label="Delta" value={portfolioGreeks.delta} formatter={(v) => formatGreek(v, "Delta")} />
        <GreekCard label="Gamma" value={portfolioGreeks.gamma} formatter={(v) => formatGreek(v, "Gamma")} />
        <GreekCard label={t[lang].thetaDaily} value={portfolioGreeks.theta} formatter={(v) => formatGreek(v, "Theta")} />
        <GreekCard label="Vega" value={portfolioGreeks.vega} formatter={(v) => formatGreek(v, "Vega")} />
        <GreekCard label="Rho" value={portfolioGreeks.rho} formatter={(v) => formatGreek(v, "Rho")} />
      </div>
    </div>
  );
};

const GreekCard = ({ label, value, formatter }: { label: string; value: number; formatter: (v: number) => string }) => {
  const isPositive = value >= 0;
  return (
    <div className="bg-gray-900 p-2 rounded-lg border border-gray-700 flex-1 min-w-[80px]">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className={`text-lg font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? '+' : ''}{formatter(value)}
      </div>
    </div>
  );
};
