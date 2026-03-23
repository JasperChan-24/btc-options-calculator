import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';

export const BtcKlineChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [interval, setInterval] = useState<string>('1h');
  const [loading, setLoading] = useState<boolean>(true);

  const intervals = [
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
    { label: '7d', value: '1w' },
  ];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af', // gray-400
      },
      grid: {
        vertLines: { color: '#334155', style: 3 }, // dashed gray-700
        horzLines: { color: '#334155', style: 3 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#475569',
      },
      rightPriceScale: {
        borderColor: '#475569',
        autoScale: true,
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: {
          color: '#64748b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#64748b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial size setup after a tiny delay to ensure container is fully rendered
    setTimeout(handleResize, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch and update data
  useEffect(() => {
    const fetchKlines = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=1000`);
        const json = await response.json();
        
        const formattedData = json.map((d: any) => ({
          time: d[0] / 1000, // Unix timestamp in seconds
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        
        if (seriesRef.current) {
          seriesRef.current.setData(formattedData);
          chartRef.current?.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Error fetching klines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKlines();
  }, [interval]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-2 left-4 z-10 flex gap-1 bg-gray-900/80 p-1 rounded-lg backdrop-blur-sm border border-gray-700/50">
        {intervals.map((int) => (
          <button
            key={int.value}
            onClick={() => setInterval(int.value)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              interval === int.value
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {int.label}
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/20 backdrop-blur-[1px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="flex-1 w-full h-full" 
        style={{ cursor: 'crosshair', pointerEvents: loading ? 'none' : 'auto' }}
      />
    </div>
  );
};
