import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineSeries,
  CrosshairMode,
  LineStyle,
} from 'lightweight-charts';
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
  pnlUnit: 'BTC' | 'USDT';
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
  pnlUnit,
  lang,
}) => {
  const isBtc = denomination === 'BTC';
  const displayBtc = isBtc && pnlUnit === 'BTC';
  const unit = displayBtc ? '₿' : '$';

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  const expSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const curSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const zeroLineRef = useRef<ISeriesApi<"Line"> | null>(null);

  const chartData = useMemo(() => {
    const expData = [];
    const curData = [];
    const zeroData = [];
    
    const [focusMin, focusMax] = priceRange;
    // Generate data over a massive range to allow infinite-feeling panning
    const minPrice = Math.max(10, focusMin * 0.2);
    const maxPrice = focusMax * 3;
    const step = (maxPrice - minPrice) / 1000; 

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

      // If in BTC mode but displaying as USDT, multiply the BTC PnL by the X-axis price (S)
      if (isBtc && pnlUnit === 'USDT') {
        expirationPnL *= S;
        currentPnL *= S;
      }

      const timeVal = Math.round(S) as any;
      
      expData.push({ time: timeVal, value: displayBtc ? parseFloat(expirationPnL.toFixed(6)) : Math.round(expirationPnL) });
      curData.push({ time: timeVal, value: displayBtc ? parseFloat(currentPnL.toFixed(6)) : Math.round(currentPnL) });
      zeroData.push({ time: timeVal, value: 0 });
    }
    return { expData, curData, zeroData };
  }, [legs, daysPassed, volAdjustment, riskFreeRate, priceRange, spotBtcAmount, spotBtcEntryPrice, isBtc, pnlUnit]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#334155', style: 3 },
        horzLines: { color: '#334155', style: 3 },
      },
      timeScale: {
        timeVisible: true,
        borderColor: '#475569',
        tickMarkFormatter: (time: number) => '$' + time.toLocaleString(),
      },
      localization: {
        timeFormatter: (time: number) => t[lang].btcPrice + ': $' + time.toLocaleString(),
        priceFormatter: (price: number) => displayBtc ? price.toFixed(4) + ' ₿' : '$' + price.toLocaleString(),
      },
      rightPriceScale: {
        borderColor: '#475569',
        autoScale: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    const zeroLine = chart.addSeries(LineSeries, {
      color: '#666',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const expSeries = chart.addSeries(LineSeries, {
      color: '#10b981',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const curSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    zeroLineRef.current = zeroLine;
    expSeriesRef.current = expSeries;
    curSeriesRef.current = curSeries;

    chart.subscribeCrosshairMove((param) => {
      if (!legendRef.current) return;
      
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        legendRef.current.style.opacity = '0.7';
        legendRef.current.innerHTML = '<div style="color: #10b981">● ' + t[lang].expirationPnl + '</div><div style="color: #f59e0b">● ' + t[lang].currentPnl + '</div><div style="color: #9ca3af; font-size: 0.75rem" class="ml-2">(Hover to view)</div>';
        return;
      }

      legendRef.current.style.opacity = '1';
      const expValue = param.seriesData.get(expSeries) as { value: number };
      const curValue = param.seriesData.get(curSeries) as { value: number };
      
      if (expValue && curValue) {
        const formatPnl = (v: number) => displayBtc ? v.toFixed(4) + ' ₿' : '$' + v.toLocaleString();
        legendRef.current.innerHTML = '<div style="color: #10b981">● ' + t[lang].expirationPnl + ': ' + formatPnl(expValue.value) + '</div><div style="color: #f59e0b">● ' + t[lang].currentPnl + ': ' + formatPnl(curValue.value) + '</div>';
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [lang, isBtc, displayBtc]);

  useEffect(() => {
    if (zeroLineRef.current && expSeriesRef.current && curSeriesRef.current && chartRef.current) {
      zeroLineRef.current.setData(chartData.zeroData);
      expSeriesRef.current.setData(chartData.expData);
      curSeriesRef.current.setData(chartData.curData);

      // Focus on the optimal priceRange initially, but allow panning into the extended data range
      chartRef.current.timeScale().setVisibleRange({ 
        from: priceRange[0] as any, 
        to: priceRange[1] as any 
      });
    }
  }, [chartData, priceRange, lang, isBtc, displayBtc]);

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().setVisibleRange({ 
        from: priceRange[0] as any, 
        to: priceRange[1] as any 
      });
      chartRef.current.priceScale('right').applyOptions({ autoScale: true });
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative group">
      <div 
        ref={legendRef} 
        className="absolute top-2 left-4 z-10 flex flex-col sm:flex-row gap-2 sm:gap-4 bg-gray-900/80 p-2 rounded text-xs backdrop-blur-sm border border-gray-700/50 pointer-events-none transition-opacity duration-200"
      >
        <div style={{ color: '#10b981' }}>● {t[lang].expirationPnl}</div>
        <div style={{ color: '#f59e0b' }}>● {t[lang].currentPnl}</div>
      </div>

      <button
        onClick={handleResetZoom}
        className="absolute top-2 right-12 z-10 flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs transition-opacity opacity-0 group-hover:opacity-100 border border-gray-600 cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        {t[lang].resetZoom}
      </button>
      <div 
        ref={chartContainerRef} 
        className="flex-1 w-full h-full" 
        style={{ cursor: 'crosshair' }}
      />
    </div>
  );
};
