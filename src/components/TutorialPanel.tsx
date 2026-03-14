import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Lang, t } from '../i18n';

interface TutorialPanelProps {
  lang: Lang;
}

export const TutorialPanel: React.FC<TutorialPanelProps> = ({ lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sections = [
    {
      title: t[lang].tutorial.payoffChart.title,
      desc: t[lang].tutorial.payoffChart.desc,
    },
    {
      title: t[lang].tutorial.optionChain.title,
      desc: t[lang].tutorial.optionChain.desc,
    },
    {
      title: t[lang].tutorial.greeks.title,
      desc: t[lang].tutorial.greeks.desc,
    },
    {
      title: t[lang].tutorial.controls.title,
      desc: t[lang].tutorial.controls.desc,
    },
    {
      title: t[lang].tutorial.spot.title,
      desc: t[lang].tutorial.spot.desc,
    },
    {
      title: t[lang].tutorial.legs.title,
      desc: t[lang].tutorial.legs.desc,
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold text-white mb-2 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          {t[lang].tutorial.title}
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      
      {isExpanded && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-medium text-gray-200">{section.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {section.desc.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-emerald-400">{part}</strong> : part
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
