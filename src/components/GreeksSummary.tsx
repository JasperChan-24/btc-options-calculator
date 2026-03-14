import React, { useMemo } from 'react';
import { OptionLeg, calculateGreeks } from '../utils/blackScholes';
import { Lang, t } from '../i18n';

interface GreeksSummaryProps {
  legs: OptionLeg[];
  currentBtcPrice: number;
  daysPassed: number;
  volAdjustment: number;
  riskFreeRate: number;
  spotBtcAmount: number;
  lang: Lang;
}

export const GreeksSummary: React.FC<GreeksSummaryProps> = ({
  legs,
  currentBtcPrice,
  daysPassed,
  volAdjustment,
  riskFreeRate,
  spotBtcAmount,
  lang,
}) => {
  const portfolioGreeks = useMemo(() => {
    let delta = spotBtcAmount;
    let gamma = 0;
    let theta = 0;
    let vega = 0;
    let rho = 0;

    legs.forEach((leg) => {
      const tRemaining = Math.max(0, leg.expirationDays - daysPassed) / 365;
      const currentVol = Math.max(0.01, leg.impliedVol + volAdjustment);
      
      const greeks = calculateGreeks(
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
  }, [legs, currentBtcPrice, daysPassed, volAdjustment, riskFreeRate, spotBtcAmount]);

  return (
    <div className="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700">
      <h3 className="text-base font-semibold text-white mb-2">{t[lang].portfolioGreeks}</h3>
      <div className="flex flex-wrap gap-2">
        <GreekCard label="Delta" value={portfolioGreeks.delta} />
        <GreekCard label="Gamma" value={portfolioGreeks.gamma} />
        <GreekCard label={t[lang].thetaDaily} value={portfolioGreeks.theta} />
        <GreekCard label="Vega" value={portfolioGreeks.vega} />
        <GreekCard label="Rho" value={portfolioGreeks.rho} />
      </div>
    </div>
  );
};

const GreekCard = ({ label, value }: { label: string; value: number }) => {
  const isPositive = value >= 0;
  return (
    <div className="bg-gray-900 p-2 rounded-lg border border-gray-700 flex-1 min-w-[80px]">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className={`text-lg font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? '+' : ''}{value.toFixed(4)}
      </div>
    </div>
  );
};
