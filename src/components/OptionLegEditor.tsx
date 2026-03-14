import React from 'react';
import { OptionLeg, OptionType, PositionType } from '../utils/blackScholes';
import { Trash2, Plus, Settings2 } from 'lucide-react';
import { Lang, t } from '../i18n';

interface OptionLegEditorProps {
  legs: OptionLeg[];
  onChange: (legs: OptionLeg[]) => void;
  lang: Lang;
}

export const OptionLegEditor: React.FC<OptionLegEditorProps> = ({ legs, onChange, lang }) => {
  const addLeg = () => {
    const newLeg: OptionLeg = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Call',
      position: 'Long',
      strike: 60000,
      expirationDays: 30,
      impliedVol: 0.5,
      quantity: 1,
      premium: 1000,
    };
    onChange([...legs, newLeg]);
  };

  const updateLeg = (id: string, updates: Partial<OptionLeg>) => {
    onChange(legs.map((leg) => (leg.id === id ? { ...leg, ...updates } : leg)));
  };

  const removeLeg = (id: string) => {
    onChange(legs.filter((leg) => leg.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-400" />
          {t[lang].optionLegs}
        </h3>
        <button
          onClick={addLeg}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> {t[lang].addLeg}
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto h-[148px] pr-1" style={{ scrollbarWidth: 'thin' }}>
        {legs.map((leg) => (
          <div key={leg.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 xl:grid-cols-4 2xl:grid-cols-4 gap-3 items-end">
            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].position}</label>
              <select
                value={leg.position}
                onChange={(e) => updateLeg(leg.id, { position: e.target.value as PositionType })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Long">{t[lang].long}</option>
                <option value="Short">{t[lang].short}</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].type}</label>
              <select
                value={leg.type}
                onChange={(e) => updateLeg(leg.id, { type: e.target.value as OptionType })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Call">{t[lang].call}</option>
                <option value="Put">{t[lang].put}</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].strike}</label>
              <input
                type="number"
                value={leg.strike / 1000}
                onChange={(e) => updateLeg(leg.id, { strike: Number(e.target.value) * 1000 })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].dte}</label>
              <input
                type="number"
                value={leg.expirationDays}
                onChange={(e) => updateLeg(leg.id, { expirationDays: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].iv}</label>
              <input
                type="number"
                value={leg.impliedVol * 100}
                onChange={(e) => updateLeg(leg.id, { impliedVol: Number(e.target.value) / 100 })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].premium}</label>
              <input
                type="number"
                value={leg.premium}
                onChange={(e) => updateLeg(leg.id, { premium: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">{t[lang].qty}</label>
              <input
                type="number"
                step="0.01"
                value={leg.quantity}
                onChange={(e) => updateLeg(leg.id, { quantity: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => removeLeg(leg.id)}
              className="w-full h-[34px] flex items-center justify-center text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 rounded transition-colors"
              title="Remove Leg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {legs.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {t[lang].noLegs}
          </div>
        )}
      </div>
    </div>
  );
};
