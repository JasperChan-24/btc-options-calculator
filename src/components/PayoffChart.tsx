import React, { useMemo, useState, useRef, useEffect } from 'react';
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
import { RotateCcw } from 'lucide-react';
import { 
  OptionLeg, 
  Denomination,
  calculateExpirationPayoff, 
  calculateCurrentPnL,
  calculateExpirationPayoffBTC,
  calculateCurrentPnLBTC,
} from '../utils/blackScholes';
import { Lang, t } from '../i18n';

interface PayoffChartProps {
  legs: OptionLeg[];
  currentBtcPrice: number;
  daysPassed: number;
  volAdjustment: number;
  riskFreeRate: number;
  priceRange: [number, number];
  spotBtcAmount: number;
  spotBtcEntryPrice: number;
  denomination: Denomination;
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
  denomination,
  lang,
}) => {
  const isBtc = denomination === 'BTC';
  const unit = isBtc ? '₿' : '$';

  // --- Zoom / Pan State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Auto-reset zoom if the legs change fundamentally or if user resets
  const currentDomain = zoomDomain || priceRange;

  // --- Wheel Zoom Handler ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // strict prevent page scroll when hovering chart
      const width = el.clientWidth;
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - 40; // Approx 40px left margin from Recharts
      const activeWidth = width - 70; // Map approx chart area

      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      
      setZoomDomain(prev => {
        const domain = prev || priceRange;
        const range = domain[1] - domain[0];
        
        // Ratio of mouse X inside the chart area
        const ratio = Math.max(0, Math.min(1, mouseX / activeWidth));
        const priceAtMouse = domain[0] + ratio * range;
        
        const newRange = range * zoomFactor;
        
        // Limit zoom
        if (newRange < 10) return domain; // Max zoom in
        if (newRange > 200000) return domain; // Max zoom out

        const newMin = priceAtMouse - ratio * newRange;
        const newMax = newMin + newRange;
        
        return [newMin, newMax];
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [priceRange]);

  // --- Drag Pan Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - startX;
    setStartX(e.clientX);
    
    const activeWidth = containerRef.current.clientWidth - 70;
    const domainRange = currentDomain[1] - currentDomain[0];
    const priceDelta = -(dx / Math.max(1, activeWidth)) * domainRange;
    
    setZoomDomain([currentDomain[0] + priceDelta, currentDomain[1] + priceDelta]);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // --- Calculate Data ---
  const data = useMemo(() => {
    const points = [];
    const [minPrice, maxPrice] = currentDomain;
    const step = (maxPrice - minPrice) / 120; // 120 points for smooth rendering inside view

    for (let S = minPrice; S <= maxPrice; S += step) {
      const spotPnLUsd = spotBtcAmount * (S - spotBtcEntryPrice);
      const spotPnL = isBtc ? spotPnLUsd / S : spotPnLUsd;

      let expirationPnL = spotPnL;
      let currentPnL = spotPnL;

      legs.forEach((leg) => {
        if (isBtc) {
          expirationPnL += calculateExpirationPayoffBTC(S, leg);
          currentPnL += calculateCurrentPnLBTC(S, leg, daysPassed, volAdjustment, riskFreeRate);
        } else {
          expirationPnL += calculateExpirationPayoff(S, leg);
          currentPnL += calculateCurrentPnL(S, leg, daysPassed, volAdjustment, riskFreeRate);
        }
      });

      points.push({
        price: Math.round(S),
        expirationPnL: isBtc ? parseFloat(expirationPnL.toFixed(6)) : Math.round(expirationPnL),
        currentPnL: isBtc ? parseFloat(currentPnL.toFixed(6)) : Math.round(currentPnL),
      });
    }
    return points;
  }, [legs, daysPassed, volAdjustment, riskFreeRate, currentDomain, spotBtcAmount, spotBtcEntryPrice, isBtc]);

  const yDomain = useMemo(() => {
    let min = 0;
    let max = 0;
    data.forEach(d => {
      min = Math.min(min, d.expirationPnL, d.currentPnL);
      max = Math.max(max, d.expirationPnL, d.currentPnL);
    });
    const padding = isBtc ? Math.max(0.01, (max - min) * 0.1) : Math.max(1000, (max - min) * 0.1);
    return [min - padding, max + padding];
  }, [data, isBtc]);

  const formatValue = (val: number) => {
    if (isBtc) return `${val.toFixed(4)} ₿`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="w-full h-full relative group">
      {/* Reset Zoom Button */}
      {zoomDomain && (
        <button
          onClick={() => setZoomDomain(null)}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs transition-opacity opacity-0 group-hover:opacity-100 border border-gray-600"
        >
          <RotateCcw className="w-3 h-3" />
          {t[lang].resetZoom}
        </button>
      )}

      {/* Interactive Chart Container */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="price" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              stroke="#888"
              tickFormatter={(val) => `$${Math.round(val).toLocaleString()}`}
            />
            <YAxis 
              domain={yDomain} 
              stroke="#888"
              tickFormatter={(val) => isBtc ? `${val.toFixed(3)}₿` : `$${val.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatValue(value), 
                name === 'expirationPnL' ? t[lang].expirationPnl : t[lang].currentPnl
              ]}
              labelFormatter={(label: number) => `${t[lang].btcPrice}: $${label.toLocaleString()}`}
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              isAnimationActive={false} // Disable tooltip lag during fast panning
            />
            <Legend formatter={(value) => value === 'expirationPnL' ? `${t[lang].expirationPnl} (${unit})` : `${t[lang].currentPnl} (${unit})`} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            {(currentBtcPrice >= currentDomain[0] && currentBtcPrice <= currentDomain[1]) && (
              <ReferenceLine x={currentBtcPrice} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: t[lang].currentBtc, fill: '#3b82f6' }} />
            )}

            <Line
              type="monotone"
              dataKey="expirationPnL"
              name="expirationPnL"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} /* Very important for fluid panning */
            />
            <Line
              type="monotone"
              dataKey="currentPnL"
              name="currentPnL"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
