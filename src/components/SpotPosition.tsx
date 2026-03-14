import React from 'react';
import { Lang, t } from '../i18n';
import { Wallet } from 'lucide-react';

interface SpotPositionProps {
  amount: number;
  setAmount: (a: number) => void;
  entryPrice: number;
  setEntryPrice: (p: number) => void;
  lang: Lang;
}

export const SpotPosition: React.FC<SpotPositionProps> = ({ amount, setAmount, entryPrice, setEntryPrice, lang }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-orange-400" />
        {t[lang].spotPosition}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t[lang].spotAmount}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t[lang].entryPrice}</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            step="100"
          />
        </div>
      </div>
    </div>
  );
};
