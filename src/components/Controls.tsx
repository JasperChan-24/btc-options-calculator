import React from 'react';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Lang, t } from '../i18n';

interface ControlsProps {
  currentBtcPrice: number;
  setCurrentBtcPrice: (val: number) => void;
  daysPassed: number;
  setDaysPassed: (val: number) => void;
  volAdjustment: number;
  setVolAdjustment: (val: number) => void;
  riskFreeRate: number;
  setRiskFreeRate: (val: number) => void;
  maxDays: number;
  walletBalance: number;
  setWalletBalance: (val: number) => void;
  lang: Lang;
  lastSyncTime?: Date | null;
  onRefreshPrice?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  currentBtcPrice,
  setCurrentBtcPrice,
  daysPassed,
  setDaysPassed,
  volAdjustment,
  setVolAdjustment,
  riskFreeRate,
  setRiskFreeRate,
  maxDays,
  walletBalance,
  setWalletBalance,
  lang,
  lastSyncTime,
  onRefreshPrice,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700">
      <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
        {t[lang].globalParams}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-300">
              {t[lang].currentBtcPrice}: ${currentBtcPrice.toLocaleString()}
            </label>
            <button 
              onClick={onRefreshPrice}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              title={lastSyncTime ? `Last synced: ${lastSyncTime.toLocaleTimeString()}` : 'Sync price'}
            >
              <RefreshCw className="w-3 h-3" /> Live
            </button>
          </div>
          <input
            type="range"
            min={20000}
            max={150000}
            step={100}
            value={currentBtcPrice}
            onChange={(e) => setCurrentBtcPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <input
            type="number"
            value={currentBtcPrice}
            onChange={(e) => setCurrentBtcPrice(Number(e.target.value))}
            className="mt-1.5 w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t[lang].walletBalance}: ${walletBalance.toLocaleString()}
          </label>
          <input
            type="number"
            value={walletBalance}
            onChange={(e) => setWalletBalance(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <div className="mt-1.5 text-[10px] text-gray-400">
            {t[lang].initialMargin} simulation
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t[lang].daysPassed}: {daysPassed} {t[lang].days}
          </label>
          <input
            type="range"
            min={0}
            max={Math.max(1, maxDays)}
            step={1}
            value={daysPassed}
            onChange={(e) => setDaysPassed(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="mt-1.5 text-[10px] text-gray-400">
            {t[lang].simulateTheta}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t[lang].ivAdjustment}: {(volAdjustment * 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min={-0.5}
            max={0.5}
            step={0.01}
            value={volAdjustment}
            onChange={(e) => setVolAdjustment(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="mt-1.5 text-[10px] text-gray-400">
            {t[lang].simulateVega}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t[lang].riskFreeRate}: {(riskFreeRate * 100).toFixed(2)}%
          </label>
          <input
            type="number"
            min={0}
            max={0.2}
            step={0.01}
            value={riskFreeRate * 100}
            onChange={(e) => setRiskFreeRate(Number(e.target.value) / 100)}
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>
    </div>
  );
};
