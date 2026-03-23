import React, { useState, useEffect, useMemo } from 'react';
import { OptionLeg, Denomination } from '../utils/blackScholes';
import { Lang, t } from '../i18n';
import { Table, AlertCircle, Loader2 } from 'lucide-react';

interface OptionData {
  symbol: string;
  strike: number;
  type: 'Call' | 'Put';
  bid: number;
  ask: number;
  mark: number;
  iv: number;
  expiryDate: Date;
  daysToExpiry: number;
  expiryStr: string;
}

interface StrikeRow {
  strike: number;
  call?: OptionData;
  put?: OptionData;
}

interface OptionChainProps {
  onAddLeg: (leg: OptionLeg) => void;
  lang: Lang;
  currentBtcPrice: number;
  denomination: Denomination;
}

export const OptionChain: React.FC<OptionChainProps> = ({ onAddLeg, lang, currentBtcPrice, denomination }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OptionData[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');

  useEffect(() => {
    const fetchChain = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tickerRes, markRes] = await Promise.all([
          fetch('/api/binance/options/ticker'),
          fetch('/api/binance/options/mark')
        ]);
        
        if (!tickerRes.ok || !markRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const tickers = await tickerRes.json();
        const marks = await markRes.json();

        const markMap = new Map<string, any>(marks.map((m: any) => [m.symbol, m]));

        const parsedData: OptionData[] = tickers
          .filter((t: any) => t.symbol.startsWith('BTC-'))
          .map((t: any) => {
            const markData = markMap.get(t.symbol);
            const parts = t.symbol.split('-');
            const dateStr = parts[1];
            const year = 2000 + parseInt(dateStr.substring(0, 2));
            const month = parseInt(dateStr.substring(2, 4)) - 1;
            const day = parseInt(dateStr.substring(4, 6));
            const expiryDate = new Date(Date.UTC(year, month, day, 8, 0, 0));
            const now = new Date();
            const daysToExpiry = Math.max(0, (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
              symbol: t.symbol,
              strike: parseInt(parts[2]),
              type: parts[3] === 'C' ? 'Call' : 'Put',
              bid: parseFloat(t.bidPrice) || 0,
              ask: parseFloat(t.askPrice) || 0,
              mark: markData ? parseFloat(markData.markPrice) : 0,
              iv: markData ? parseFloat(markData.markIV) : 0,
              expiryDate,
              daysToExpiry,
              expiryStr: dateStr
            };
          })
          .filter((d: OptionData) => d.daysToExpiry > 0);

        setData(parsedData);
        
        const expiries = Array.from(new Set(parsedData.map(d => d.expiryStr))).sort();
        if (expiries.length > 0) {
          setSelectedExpiry(expiries[0]);
        }
      } catch (err) {
        console.error(err);
        setError(t[lang].errorLoadingChain);
      } finally {
        setLoading(false);
      }
    };

    fetchChain();
  }, [lang]);

  const expiries = useMemo(() => {
    return Array.from(new Set(data.map(d => d.expiryStr))).sort();
  }, [data]);

  const strikeRows = useMemo(() => {
    if (!selectedExpiry) return [];
    
    const filtered = data.filter(d => d.expiryStr === selectedExpiry);
    const rowMap = new Map<number, StrikeRow>();
    
    filtered.forEach(opt => {
      if (!rowMap.has(opt.strike)) {
        rowMap.set(opt.strike, { strike: opt.strike });
      }
      const row = rowMap.get(opt.strike)!;
      if (opt.type === 'Call') row.call = opt;
      else row.put = opt;
    });

    return Array.from(rowMap.values()).sort((a, b) => a.strike - b.strike);
  }, [data, selectedExpiry]);

  const handleAddLeg = (opt: OptionData, position: 'Long' | 'Short') => {
    const premium = position === 'Long' ? (opt.ask || opt.mark) : (opt.bid || opt.mark);
    const convertedPremium = denomination === 'BTC' ? premium / currentBtcPrice : premium;
    onAddLeg({
      id: Math.random().toString(36).substr(2, 9),
      type: opt.type,
      position,
      strike: opt.strike,
      expirationDays: Math.round(opt.daysToExpiry),
      impliedVol: opt.iv,
      quantity: 1,
      premium: convertedPremium
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">{t[lang].loadingChain}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 flex flex-col items-center justify-center h-[500px]">
        <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700 overflow-hidden flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-400" />
          {t[lang].optionChain}
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">{t[lang].expiryDate}:</label>
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {expiries.map(exp => (
              <option key={exp} value={exp}>
                20{exp.substring(0,2)}-{exp.substring(2,4)}-{exp.substring(4,6)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
        <table className="w-full text-[10px] 2xl:text-xs text-center whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-900 text-gray-400 z-10 shadow-md">
            <tr>
              <th colSpan={4} className="py-1 border-b border-gray-700 text-emerald-400 hidden sm:table-cell">Call</th>
              <th colSpan={3} className="py-1 border-b border-gray-700 text-emerald-400 sm:hidden">Call</th>
              <th className="py-1 border-b border-gray-700 px-2"></th>
              <th colSpan={4} className="py-1 border-b border-gray-700 text-rose-400 hidden sm:table-cell">Put</th>
              <th colSpan={3} className="py-1 border-b border-gray-700 text-rose-400 sm:hidden">Put</th>
            </tr>
            <tr>
              <th className="py-1 px-2 font-medium border-b border-gray-700 hidden sm:table-cell">{t[lang].vol}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700">{t[lang].bid}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700">{t[lang].mark}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700">{t[lang].ask}</th>
              <th className="py-1 px-3 font-medium border-b border-gray-700 bg-gray-800">{t[lang].strike}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700">{t[lang].ask}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700">{t[lang].mark}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700">{t[lang].bid}</th>
              <th className="py-1 px-2 font-medium border-b border-gray-700 hidden sm:table-cell">{t[lang].vol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {strikeRows.map((row) => {
              const isBtc = denomination === 'BTC';
              const fmtPrice = (v: number | undefined) => {
                if (!v) return '-';
                return isBtc ? (v / currentBtcPrice).toFixed(6) : v.toFixed(1);
              };
              const isAtm = Math.abs(row.strike - currentBtcPrice) < 500;
              return (
                <tr key={row.strike} className={`hover:bg-gray-700/50 transition-colors ${isAtm ? 'bg-blue-900/20' : ''}`}>
                  {/* Call Side */}
                  <td className="py-1 px-2 text-gray-400 hidden sm:table-cell">
                    {row.call?.iv ? `${(row.call.iv * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td 
                    className="py-1 px-2 text-emerald-400/80 hover:text-emerald-300 hover:bg-gray-700 cursor-pointer"
                    onClick={() => row.call && handleAddLeg(row.call, 'Short')}
                    title={t[lang].clickToShort}
                  >
                    {fmtPrice(row.call?.bid)}
                  </td>
                  <td className="py-1 px-2 text-gray-300">{fmtPrice(row.call?.mark)}</td>
                  <td 
                    className="py-1 px-2 text-emerald-400/80 hover:text-emerald-300 hover:bg-gray-700 cursor-pointer"
                    onClick={() => row.call && handleAddLeg(row.call, 'Long')}
                    title={t[lang].clickToLong}
                  >
                    {fmtPrice(row.call?.ask)}
                  </td>

                  {/* Strike */}
                  <td className="py-1 px-3 font-mono font-bold text-white bg-gray-800/50">
                    {row.strike / 1000}k
                  </td>

                  {/* Put Side */}
                  <td 
                    className="py-1 px-2 text-rose-400/80 hover:text-rose-300 hover:bg-gray-700 cursor-pointer"
                    onClick={() => row.put && handleAddLeg(row.put, 'Long')}
                    title={t[lang].clickToLong}
                  >
                    {fmtPrice(row.put?.ask)}
                  </td>
                  <td className="py-1 px-2 text-gray-300">{fmtPrice(row.put?.mark)}</td>
                  <td 
                    className="py-1 px-2 text-rose-400/80 hover:text-rose-300 hover:bg-gray-700 cursor-pointer"
                    onClick={() => row.put && handleAddLeg(row.put, 'Short')}
                    title={t[lang].clickToShort}
                  >
                    {fmtPrice(row.put?.bid)}
                  </td>
                  <td className="py-1 px-2 text-gray-400 hidden sm:table-cell">
                    {row.put?.iv ? `${(row.put.iv * 100).toFixed(1)}%` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
