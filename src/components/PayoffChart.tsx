import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { 
  OptionLeg, 
  calculateExpirationPayoff, 
  calculateCurrentPnL,
  calculatePortfolioRisk 
} from '../utils/blackScholes';
import { Lang, t } from '../i18n';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface PayoffChartProps {
  legs: OptionLeg[];
  currentBtcPrice: number;
  daysPassed: number;
  volAdjustment: number;
  riskFreeRate: number;
  priceRange: [number, number];
  spotBtcAmount: number;
  spotBtcEntryPrice: number;
  walletBalance: number;
  lang: Lang;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  legs,
  currentBtcPrice,
  daysPassed,
  volAdjustment,
  riskFreeRate,
  priceRange,
  spotBtcAmount,
  spotBtcEntryPrice,
  walletBalance,
  lang,
}) => {
  const [hoveredLiq, setHoveredLiq] = React.useState<number | null>(null);

  const riskMetrics = useMemo(() => {
    return calculatePortfolioRisk(currentBtcPrice, legs, daysPassed, volAdjustment, riskFreeRate, walletBalance);
  }, [currentBtcPrice, legs, daysPassed, volAdjustment, riskFreeRate, walletBalance]);

  const liqPrices = useMemo(() => {
    const shortLegs = legs.filter(l => l.position === 'Short');
    if (shortLegs.length === 0) return [];
    
    const points = [];
    // Scan a wide range to find liquidation boundaries
    const scanMin = Math.max(1000, currentBtcPrice * 0.1);
    const scanMax = currentBtcPrice * 3;
    const step = (scanMax - scanMin) / 200;

    let wasLiquidated = false;
    for (let S = scanMin; S <= scanMax; S += step) {
      const risk = calculatePortfolioRisk(S, legs, daysPassed, volAdjustment, riskFreeRate, walletBalance);
      const isLiquidated = risk.equity < risk.totalMM;
      
      if (isLiquidated !== wasLiquidated) {
        points.push(Math.round(S));
      }
      wasLiquidated = isLiquidated;
    }
    return points;
  }, [legs, currentBtcPrice, daysPassed, volAdjustment, riskFreeRate, walletBalance]);

  const getLiqColor = (price: number) => {
    const distancePercent = Math.abs(price - currentBtcPrice) / currentBtcPrice;
    if (distancePercent < 0.08) return '#ef4444'; // Red (High Risk)
    if (distancePercent < 0.20) return '#f59e0b'; // Yellow (Medium Risk)
    return '#10b981'; // Green (Low Risk)
  };

  const data = useMemo(() => {
    const points = [];
    const [minPrice, maxPrice] = priceRange;
    const step = (maxPrice - minPrice) / 100;

    for (let S = minPrice; S <= maxPrice; S += step) {
      const spotPnL = spotBtcAmount * (S - spotBtcEntryPrice);
      let expirationPnL = spotPnL;
      let currentPnL = spotPnL;

      legs.forEach((leg) => {
        expirationPnL += calculateExpirationPayoff(S, leg);
        currentPnL += calculateCurrentPnL(S, leg, daysPassed, volAdjustment, riskFreeRate);
      });

      points.push({
        price: Math.round(S),
        expirationPnL: Math.round(expirationPnL),
        currentPnL: Math.round(currentPnL),
      });
    }
    return points;
  }, [legs, daysPassed, volAdjustment, riskFreeRate, priceRange, spotBtcAmount, spotBtcEntryPrice]);

  const yDomain = useMemo(() => {
    let min = 0;
    let max = 0;
    data.forEach(d => {
      min = Math.min(min, d.expirationPnL, d.currentPnL);
      max = Math.max(max, d.expirationPnL, d.currentPnL);
    });
    const padding = Math.max(1000, (max - min) * 0.1);
    return [min - padding, max + padding];
  }, [data]);

  const riskStatus = useMemo(() => {
    if (riskMetrics.marginRatio > 2) return { label: t[lang].safe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck };
    if (riskMetrics.marginRatio > 1.2) return { label: t[lang].warning, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Info };
    return { label: t[lang].danger, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle };
  }, [riskMetrics.marginRatio, lang]);

  return (
    <div className="w-full h-full relative">
      {/* Risk Metrics Overlay - Hidden by default, shown on LIQ hover */}
      {legs.some(l => l.position === 'Short') && (
        <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-none transition-all duration-500 ${hoveredLiq ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className={`p-3 rounded-lg border border-gray-700 shadow-2xl backdrop-blur-md ${riskStatus.bg} pointer-events-auto`}>
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <riskStatus.icon className={`w-4 h-4 ${riskStatus.color}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${riskStatus.color}`}>
                  {t[lang].riskLevel}: {riskStatus.label}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Binance Rules</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div>
                <div className="text-[10px] text-gray-500 uppercase">{t[lang].initialMargin}</div>
                <div className="text-sm font-mono text-white">${Math.round(riskMetrics.totalIM).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">{t[lang].maintMargin}</div>
                <div className="text-sm font-mono text-white">${Math.round(riskMetrics.totalMM).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">{t[lang].equity}</div>
                <div className="text-sm font-mono text-white">${Math.round(riskMetrics.equity).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Margin Ratio</div>
                <div className={`text-sm font-mono ${riskStatus.color}`}>
                  {riskMetrics.marginRatio === Infinity ? '∞' : `${(riskMetrics.marginRatio * 100).toFixed(1)}%`}
                </div>
              </div>
            </div>

            {liqPrices.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <div className="text-[10px] text-red-400 uppercase font-bold mb-1">{t[lang].liquidationPrice}</div>
                <div className="flex flex-wrap gap-2">
                  {liqPrices.map(price => (
                    <span key={price} className={`px-2 py-0.5 rounded text-xs font-mono border ${price === hoveredLiq ? 'bg-red-500/40 border-red-400 text-white scale-110' : 'bg-red-500/20 border-red-500/30 text-red-400'} transition-all`}>
                      ${price.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="price" 
            type="number" 
            domain={priceRange} 
            stroke="#888"
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <YAxis 
            domain={yDomain} 
            stroke="#888"
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`, 
              name === 'expirationPnL' ? t[lang].expirationPnl : t[lang].currentPnl
            ]}
            labelFormatter={(label: number) => `${t[lang].btcPrice}: $${label.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend formatter={(value) => value === 'expirationPnL' ? t[lang].expirationPnl : t[lang].currentPnl} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <ReferenceLine x={currentBtcPrice} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: t[lang].currentBtc, fill: '#3b82f6' }} />
          
          {/* Liquidation Reference Lines */}
          {liqPrices.map(price => {
            const color = getLiqColor(price);
            return (
              <React.Fragment key={price}>
                {/* Invisible wide trigger for better hover sensitivity */}
                <ReferenceLine 
                  x={price} 
                  stroke="transparent" 
                  strokeWidth={20} 
                  onMouseEnter={() => setHoveredLiq(price)}
                  onMouseLeave={() => setHoveredLiq(null)}
                  className="cursor-crosshair"
                  isFront={true}
                />
                {/* Visible dashed line */}
                <ReferenceLine 
                  x={price} 
                  stroke={color} 
                  strokeDasharray="5 5" 
                  strokeWidth={price === hoveredLiq ? 3 : 1.5}
                  className="pointer-events-none transition-all"
                  label={{ 
                    position: 'bottom', 
                    value: 'LIQ', 
                    fill: color, 
                    fontSize: 10,
                    fontWeight: 'bold'
                  }} 
                />
              </React.Fragment>
            );
          })}

          <Line
            type="monotone"
            dataKey="expirationPnL"
            name="expirationPnL"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="currentPnL"
            name="currentPnL"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
