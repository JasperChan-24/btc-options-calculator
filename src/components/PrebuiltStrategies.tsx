import React, { useState } from 'react';
import { OptionLeg } from '../utils/blackScholes';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { Lang, t } from '../i18n';

interface PrebuiltStrategiesProps {
  onSelect: (legs: OptionLeg[]) => void;
  currentPrice: number;
  lang: Lang;
}

export const PrebuiltStrategies: React.FC<PrebuiltStrategiesProps> = ({ onSelect, currentPrice, lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const createLeg = (
    type: 'Call' | 'Put',
    position: 'Long' | 'Short',
    strikeOffset: number,
    premium: number
  ): OptionLeg => ({
    id: Math.random().toString(36).substr(2, 9),
    type,
    position,
    strike: Math.round((currentPrice + strikeOffset) / 1000) * 1000,
    expirationDays: 30,
    impliedVol: 0.5,
    quantity: 1,
    premium,
  });

  const strategies = [
    {
      name: t[lang].strategies.longCall.name,
      description: t[lang].strategies.longCall.desc,
      legs: [createLeg('Call', 'Long', 0, 2000)],
    },
    {
      name: t[lang].strategies.shortCall.name,
      description: t[lang].strategies.shortCall.desc,
      legs: [createLeg('Call', 'Short', 0, 2000)],
    },
    {
      name: t[lang].strategies.longPut.name,
      description: t[lang].strategies.longPut.desc,
      legs: [createLeg('Put', 'Long', 0, 2000)],
    },
    {
      name: t[lang].strategies.shortPut.name,
      description: t[lang].strategies.shortPut.desc,
      legs: [createLeg('Put', 'Short', 0, 2000)],
    },
    {
      name: t[lang].strategies.straddle.name,
      description: t[lang].strategies.straddle.desc,
      legs: [createLeg('Call', 'Long', 0, 2000), createLeg('Put', 'Long', 0, 2000)],
    },
    {
      name: t[lang].strategies.strangle.name,
      description: t[lang].strategies.strangle.desc,
      legs: [createLeg('Call', 'Long', 5000, 1000), createLeg('Put', 'Long', -5000, 1000)],
    },
    {
      name: t[lang].strategies.bullCall.name,
      description: t[lang].strategies.bullCall.desc,
      legs: [createLeg('Call', 'Long', 0, 2000), createLeg('Call', 'Short', 5000, 1000)],
    },
    {
      name: t[lang].strategies.bearPut.name,
      description: t[lang].strategies.bearPut.desc,
      legs: [createLeg('Put', 'Long', 0, 2000), createLeg('Put', 'Short', -5000, 1000)],
    },
    {
      name: t[lang].strategies.ironCondor.name,
      description: t[lang].strategies.ironCondor.desc,
      legs: [
        createLeg('Put', 'Long', -10000, 500),
        createLeg('Put', 'Short', -5000, 1000),
        createLeg('Call', 'Short', 5000, 1000),
        createLeg('Call', 'Long', 10000, 500),
      ],
    },
    {
      name: t[lang].strategies.callButterfly.name,
      description: t[lang].strategies.callButterfly.desc,
      legs: [
        createLeg('Call', 'Long', -5000, 1500),
        createLeg('Call', 'Short', 0, 500),
        createLeg('Call', 'Short', 0, 500),
        createLeg('Call', 'Long', 5000, 100),
      ],
    },
    {
      name: t[lang].strategies.calendarSpread.name,
      description: t[lang].strategies.calendarSpread.desc,
      legs: [
        { ...createLeg('Call', 'Short', 0, 1000), expirationDays: 7 },
        { ...createLeg('Call', 'Long', 0, 2000), expirationDays: 30 },
      ],
    },
    {
      name: t[lang].strategies.riskReversal.name,
      description: t[lang].strategies.riskReversal.desc,
      legs: [
        createLeg('Call', 'Long', 5000, 1000),
        createLeg('Put', 'Short', -5000, 1000),
      ],
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold text-white mb-2 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          {t[lang].prebuiltStrategies}
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 mt-4">
          {strategies.map((strategy) => (
            <button
              key={strategy.name}
              onClick={() => {
                onSelect(strategy.legs);
                setIsExpanded(false);
              }}
              className="text-left p-3 rounded-lg bg-gray-900 border border-gray-700 hover:border-purple-500 hover:bg-gray-800 transition-all group"
            >
              <div className="font-medium text-gray-200 group-hover:text-purple-400">
                {strategy.name}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {strategy.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
