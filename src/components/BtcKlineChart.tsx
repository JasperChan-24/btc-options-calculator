import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface KlineData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const Candlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.close >= payload.open;
  const color = isUp ? '#10b981' : '#f43f5e'; // emerald-500 : rose-500

  // Fallback to ratio calculation if yAxis scale is not accessible
  const ratio = height / Math.max(Math.abs(payload.close - payload.open), 0.001);
  const highY = y - (payload.high - Math.max(payload.open, payload.close)) * ratio;
  const lowY = y + height + (Math.min(payload.open, payload.close) - payload.low) * ratio;

  return (
    <g stroke={color} fill={color}>
      <line x1={x + width / 2} y1={highY} x2={x + width / 2} y2={lowY} strokeWidth={1} />
      <rect x={x} y={y} width={width} height={Math.max(height, 1)} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    const colorClass = isUp ? 'text-emerald-400' : 'text-rose-400';
    
    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-gray-400 mb-2">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-500">O:</span>
          <span className="text-white font-mono">{data.open.toFixed(1)}</span>
          <span className="text-gray-500">H:</span>
          <span className="text-white font-mono">{data.high.toFixed(1)}</span>
          <span className="text-gray-500">L:</span>
          <span className="text-white font-mono">{data.low.toFixed(1)}</span>
          <span className="text-gray-500">C:</span>
          <span className={`font-mono ${colorClass}`}>{data.close.toFixed(1)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const BtcKlineChart: React.FC = () => {
  const [data, setData] = useState<KlineData[]>([]);
  const [interval, setInterval] = useState<string>('1h');
  const [loading, setLoading] = useState<boolean>(true);

  const intervals = [
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
    { label: '7d', value: '1w' },
  ];

  useEffect(() => {
    const fetchKlines = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=100`);
        const json = await response.json();
        
        const formattedData = json.map((d: any) => {
          const date = new Date(d[0]);
          let timeLabel = '';
          if (interval === '1d' || interval === '1w') {
            timeLabel = `${date.getMonth() + 1}/${date.getDate()}`;
          } else {
            timeLabel = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          }

          return {
            time: timeLabel,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
          };
        });
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching klines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKlines();
  }, [interval]);

  // Calculate domain for Y axis to give some padding
  const minLow = Math.min(...data.map(d => d.low));
  const maxHigh = Math.max(...data.map(d => d.high));
  const padding = (maxHigh - minLow) * 0.1;

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
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              tick={{ fill: '#888', fontSize: 11 }}
              minTickGap={30}
            />
            <YAxis 
              domain={[minLow - padding, maxHigh + padding]} 
              stroke="#666" 
              tick={{ fill: '#888', fontSize: 11 }}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#222', opacity: 0.5 }} />
            <Bar 
              dataKey={(d) => [d.open, d.close]} 
              shape={<Candlestick />} 
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
