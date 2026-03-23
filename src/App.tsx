import React, { useState, useMemo, useEffect } from 'react';
import { OptionLeg, Denomination } from './utils/blackScholes';
import { OptionLegEditor } from './components/OptionLegEditor';
import { PayoffChart } from './components/PayoffChart';
import { GreeksSummary } from './components/GreeksSummary';
import { Controls } from './components/Controls';
import { PrebuiltStrategies } from './components/PrebuiltStrategies';
import { TutorialPanel } from './components/TutorialPanel';
import { OptionChain } from './components/OptionChain';
import { SpotPosition } from './components/SpotPosition';
import { BtcKlineChart } from './components/BtcKlineChart';
import { Activity, Languages, ArrowLeftRight } from 'lucide-react';
import { Lang, t } from './i18n';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [currentBtcPrice, setCurrentBtcPrice] = useState<number>(60000);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [daysPassed, setDaysPassed] = useState<number>(0);
  const [volAdjustment, setVolAdjustment] = useState<number>(0);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.05);
  const [spotBtcAmount, setSpotBtcAmount] = useState<number>(0);
  const [spotBtcEntryPrice, setSpotBtcEntryPrice] = useState<number>(60000);
  const [denomination, setDenomination] = useState<Denomination>('USDT');
  const [activeChart, setActiveChart] = useState<'payoff' | 'kline'>('payoff');

  const toggleDenomination = () => {
    const newDenom = denomination === 'USDT' ? 'BTC' : 'USDT';
    if (currentBtcPrice > 0) {
      // Convert leg premiums
      setLegs(legs.map(leg => ({
        ...leg,
        premium: newDenom === 'BTC' ? leg.premium / currentBtcPrice : leg.premium * currentBtcPrice,
      })));
      // Convert spot entry price
      setSpotBtcEntryPrice(prev =>
        newDenom === 'BTC' ? prev / currentBtcPrice : prev * currentBtcPrice
      );
    }
    setDenomination(newDenom);
  };

  const fetchBtcPrice = async () => {
    try {
      const response = await fetch('/api/binance/ticker');
      const data = await response.json();
      if (data && data.price) {
        const price = Math.round(Number(data.price));
        setCurrentBtcPrice(price);
        setLastSyncTime(new Date());
        
        // Initialize spot entry price if it's the first fetch and amount is 0
        if (spotBtcAmount === 0 && spotBtcEntryPrice === 60000) {
          setSpotBtcEntryPrice(price);
        }
      }
    } catch (error) {
      console.error('Error fetching BTC price:', error);
    }
  };

  useEffect(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const maxDays = useMemo(() => {
    if (legs.length === 0) return 30;
    return Math.max(...legs.map((l) => l.expirationDays));
  }, [legs]);

  const priceRange = useMemo<[number, number]>(() => {
    let minStrike = currentBtcPrice;
    let maxStrike = currentBtcPrice;
    if (legs.length > 0) {
      minStrike = Math.min(...legs.map((l) => l.strike));
      maxStrike = Math.max(...legs.map((l) => l.strike));
    }
    const range = Math.max(maxStrike - minStrike, currentBtcPrice * 0.2);
    return [
      Math.max(0, Math.floor((minStrike - range * 0.5) / 1000) * 1000),
      Math.ceil((maxStrike + range * 0.5) / 1000) * 1000,
    ];
  }, [legs, currentBtcPrice]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-2 md:p-4 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <header className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {t[lang].title}
              </h1>
              <p className="text-gray-400 text-sm">
                {t[lang].subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDenomination}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
                denomination === 'BTC'
                  ? 'bg-orange-600/20 border-orange-500/50 text-orange-300 hover:bg-orange-600/30'
                  : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              {denomination === 'USDT' ? t[lang].usdtMode : t[lang].btcMode}
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm transition-colors border border-gray-700"
            >
              <Languages className="w-4 h-4" />
              {lang === 'en' ? '中文' : 'English'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start xl:items-stretch">
          <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-4">
            <div className="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex bg-gray-900 rounded-lg p-1">
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeChart === 'payoff' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveChart('payoff')}
                  >
                    {t[lang].payoffProfile}
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeChart === 'kline' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveChart('kline')}
                  >
                    {t[lang].btcChart}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative min-h-[320px] w-full">
                <div className="absolute inset-0">
                  {activeChart === 'payoff' ? (
                    <PayoffChart
                      legs={legs}
                      currentBtcPrice={currentBtcPrice}
                      daysPassed={daysPassed}
                      volAdjustment={volAdjustment}
                      riskFreeRate={riskFreeRate}
                      priceRange={priceRange}
                      spotBtcAmount={spotBtcAmount}
                      spotBtcEntryPrice={spotBtcEntryPrice}
                      denomination={denomination}
                      lang={lang}
                    />
                  ) : (
                    <BtcKlineChart />
                  )}
                </div>
              </div>
            </div>

            <OptionChain 
              lang={lang} 
              currentBtcPrice={currentBtcPrice} 
              denomination={denomination}
              onAddLeg={(leg) => setLegs([...legs, leg])} 
            />
          </div>

          <div className="xl:col-span-5 2xl:col-span-4 flex flex-col gap-4">
            <GreeksSummary
              legs={legs}
              currentBtcPrice={currentBtcPrice}
              daysPassed={daysPassed}
              volAdjustment={volAdjustment}
              riskFreeRate={riskFreeRate}
              spotBtcAmount={spotBtcAmount}
              denomination={denomination}
              lang={lang}
            />

            <Controls
              currentBtcPrice={currentBtcPrice}
              setCurrentBtcPrice={setCurrentBtcPrice}
              daysPassed={daysPassed}
              setDaysPassed={setDaysPassed}
              volAdjustment={volAdjustment}
              setVolAdjustment={setVolAdjustment}
              riskFreeRate={riskFreeRate}
              setRiskFreeRate={setRiskFreeRate}

              maxDays={maxDays}
              lang={lang}
              lastSyncTime={lastSyncTime}
              onRefreshPrice={fetchBtcPrice}
            />

            <SpotPosition
              amount={spotBtcAmount}
              setAmount={setSpotBtcAmount}
              entryPrice={spotBtcEntryPrice}
              setEntryPrice={setSpotBtcEntryPrice}
              denomination={denomination}
              lang={lang}
            />
            
            <OptionLegEditor legs={legs} onChange={setLegs} denomination={denomination} lang={lang} />
          </div>
        </div>

        <div className="w-full space-y-4">
          <PrebuiltStrategies
            currentPrice={currentBtcPrice}
            onSelect={(newLegs) => {
              setLegs(newLegs);
              setDaysPassed(0);
              setVolAdjustment(0);
            }}
            lang={lang}
          />
          <TutorialPanel lang={lang} />
        </div>
      </div>
    </div>
  );
}
