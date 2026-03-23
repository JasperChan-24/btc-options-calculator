export type Lang = 'en' | 'zh';

export const t = {
  en: {
    title: 'BTC Options Payoff Calculator',
    subtitle: 'Visualize option strategies, calculate PnL, and analyze Greeks.',
    payoffProfile: 'Payoff Profile',
    portfolioGreeks: 'Portfolio Greeks',
    globalParams: 'Global Parameters',
    prebuiltStrategies: 'Pre-built Strategies',
    optionLegs: 'Option Legs',
    addLeg: 'Add Leg',
    position: 'Position',
    type: 'Type',
    strike: 'Strike (k$)',
    dte: 'DTE (Days)',
    iv: 'IV (%)',
    premium: 'Premium ($)',
    premiumBtc: 'Premium (₿)',
    usdtMode: 'USDT Settled',
    btcMode: 'BTC Settled',
    qty: 'Qty',
    long: 'Long',
    short: 'Short',
    call: 'Call',
    put: 'Put',
    noLegs: 'No option legs added. Click "Add Leg" to start building a strategy.',
    currentBtcPrice: 'Current BTC Price',
    daysPassed: 'Days Passed',
    days: 'days',
    simulateTheta: 'Simulate time decay (Theta)',
    ivAdjustment: 'IV Adjustment',
    simulateVega: 'Simulate volatility changes (Vega)',
    riskFreeRate: 'Risk-Free Rate',
    expirationPnl: 'Expiration PnL',
    currentPnl: 'Current PnL (T+n)',
    currentBtc: 'Current BTC',
    btcChart: 'BTC Chart',
    btcPrice: 'BTC Price',
    resetZoom: 'Reset View',
    thetaDaily: 'Theta (Daily)',
    optionChain: 'Option Chain (Binance)',
    expiryDate: 'Expiry Date',
    bid: 'Bid',
    ask: 'Ask',
    mark: 'Mark',
    vol: 'IV',
    loadingChain: 'Loading option chain...',
    errorLoadingChain: 'Failed to load option chain.',
    clickToLong: 'Click to Long',
    clickToShort: 'Click to Short',
    spotPosition: 'Spot BTC Position',
    spotAmount: 'BTC Amount',
    entryPrice: 'Entry Price ($)',
    entryPriceBtc: 'Entry Price (₿)',

    strategies: {
      longCall: { name: 'Long Call', desc: 'Bullish. Profit from rising prices.' },
      shortCall: { name: 'Short Call', desc: 'Bearish/Neutral. Profit from falling or stagnant prices. Unlimited risk.' },
      longPut: { name: 'Long Put', desc: 'Bearish. Profit from falling prices.' },
      shortPut: { name: 'Short Put', desc: 'Bullish/Neutral. Profit from rising or stagnant prices. High risk.' },
      straddle: { name: 'Straddle', desc: 'Volatile. Profit from big moves in either direction.' },
      strangle: { name: 'Strangle', desc: 'Volatile. Cheaper than Straddle, needs bigger move.' },
      bullCall: { name: 'Bull Call Spread', desc: 'Mildly Bullish. Capped profit and loss.' },
      bearPut: { name: 'Bear Put Spread', desc: 'Mildly Bearish. Capped profit and loss.' },
      ironCondor: { name: 'Iron Condor', desc: 'Neutral. Profit from low volatility.' },
      callButterfly: { name: 'Call Butterfly', desc: 'Neutral. Profit from low volatility, capped risk.' },
      calendarSpread: { name: 'Calendar Spread', desc: 'Neutral/Directional. Profit from time decay differences.' },
      riskReversal: { name: 'Risk Reversal', desc: 'Bullish. Finance a long call with a short put.' },
    },
    tutorial: {
      title: 'User Guide',
      payoffChart: {
        title: 'Payoff Profile',
        desc: 'Visualizes your strategy\'s profit and loss. The solid line shows PnL at expiration, while the dashed line shows current theoretical PnL based on the "Days Passed" and "IV Adjustment" settings.'
      },
      optionChain: {
        title: 'Option Chain',
        desc: 'Displays real-time BTC options from Binance. **Click on any Bid or Ask price to instantly add that option leg to your strategy.** Calls are on the left, Puts are on the right.'
      },
      greeks: {
        title: 'Greeks Analysis',
        desc: 'Delta measures price sensitivity, Gamma measures Delta sensitivity, Theta shows daily time decay, and Vega measures volatility sensitivity. These help you understand the risk profile of your portfolio.'
      },
      controls: {
        title: 'Simulation Controls',
        desc: 'Adjust the BTC price, simulate the passage of time (Theta), or change the Implied Volatility (Vega) to see how your strategy performs under different market conditions.'
      },
      spot: {
        title: 'Spot Position',
        desc: 'Add your BTC spot holdings to see how they interact with your options. Useful for calculating the payoff of Covered Calls or Protective Puts.'
      },
      legs: {
        title: 'Leg Editor',
        desc: 'Fine-tune your strategy by adjusting individual option parameters like Strike, Expiration, and Quantity, or remove legs you no longer need.'
      }
    }
  },
  zh: {
    title: 'BTC 期权收益计算器',
    subtitle: '可视化期权策略，计算盈亏，分析希腊字母。',
    payoffProfile: '收益图表',
    portfolioGreeks: '组合希腊字母',
    globalParams: '全局参数',
    prebuiltStrategies: '预设策略',
    optionLegs: '期权腿 (Legs)',
    addLeg: '添加期权',
    position: '方向',
    type: '类型',
    strike: '行权价 (k$)',
    dte: '到期天数',
    iv: '隐含波动率 (%)',
    premium: '权利金成本 ($)',
    premiumBtc: '权利金成本 (₿)',
    usdtMode: 'USDT 本位',
    btcMode: 'BTC 本位',
    qty: '数量',
    long: '做多 (Long)',
    short: '做空 (Short)',
    call: '看涨 (Call)',
    put: '看跌 (Put)',
    noLegs: '暂无期权腿。点击“添加期权”开始构建策略。',
    currentBtcPrice: '当前 BTC 价格',
    daysPassed: '经过天数',
    days: '天',
    simulateTheta: '模拟时间衰减 (Theta)',
    ivAdjustment: 'IV 调整',
    simulateVega: '模拟波动率变化 (Vega)',
    riskFreeRate: '无风险利率',
    expirationPnl: '到期盈亏',
    currentPnl: '当前盈亏 (T+n)',
    currentBtc: '当前 BTC',
    btcChart: 'BTC K线',
    btcPrice: 'BTC 价格',
    resetZoom: '复位视图',
    thetaDaily: 'Theta (每日)',
    optionChain: '期权链 (Binance)',
    expiryDate: '到期日',
    bid: '买价 (Bid)',
    ask: '卖价 (Ask)',
    mark: '标记价 (Mark)',
    vol: '波动率 (IV)',
    loadingChain: '正在加载期权链...',
    errorLoadingChain: '加载期权链失败。',
    clickToLong: '点击做多 (Long)',
    clickToShort: '点击做空 (Short)',
    spotPosition: '现货 BTC 持仓',
    spotAmount: 'BTC 数量',
    entryPrice: '入场价格 ($)',
    entryPriceBtc: '入场价格 (₿)',

    strategies: {
      longCall: { name: '买入看涨 (Long Call)', desc: '看涨。从价格上涨中获利。' },
      shortCall: { name: '卖出看涨 (Short Call)', desc: '偏空/中性。从价格下跌或盘整中获利。风险无限。' },
      longPut: { name: '买入看跌 (Long Put)', desc: '看跌。从价格下跌中获利。' },
      shortPut: { name: '卖出看跌 (Short Put)', desc: '偏多/中性。从价格上涨或盘整中获利。风险较高。' },
      straddle: { name: '跨式 (Straddle)', desc: '做多波动率。从任一方向的大幅波动中获利。' },
      strangle: { name: '宽跨式 (Strangle)', desc: '做多波动率。成本低于跨式，需要更大的波动。' },
      bullCall: { name: '牛市看涨价差', desc: '温和看涨。收益和亏损均有上限。' },
      bearPut: { name: '熊市看跌价差', desc: '温和看跌。收益和亏损均有上限。' },
      ironCondor: { name: '铁鹰式 (Iron Condor)', desc: '中性。从低波动率中获利。' },
      callButterfly: { name: '看涨蝴蝶式 (Call Butterfly)', desc: '中性。从低波动率中获利，风险有限。' },
      calendarSpread: { name: '日历价差 (Calendar Spread)', desc: '中性/方向性。从不同到期日的时间衰减差中获利。' },
      riskReversal: { name: '风险逆转 (Risk Reversal)', desc: '强烈看涨。卖出看跌期权来为买入看涨期权融资。' },
    },
    tutorial: {
      title: '使用教程',
      payoffChart: {
        title: '收益图表',
        desc: '可视化策略的盈亏情况。实线表示到期时的盈亏，虚线表示基于“经过天数”和“IV 调整”设置的当前理论盈亏。'
      },
      optionChain: {
        title: '期权链',
        desc: '显示来自币安的实时 BTC 期权数据。**点击任何买入 (Bid) 或卖出 (Ask) 价格，即可立即将该期权腿添加到您的策略中。** 左侧为看涨期权 (Calls)，右侧为看跌期权 (Puts)。'
      },
      greeks: {
        title: '希腊字母分析',
        desc: 'Delta 衡量价格敏感度，Gamma 衡量 Delta 的敏感度，Theta 显示每日时间衰减，Vega 衡量波动率敏感度。这些指标帮助您了解投资组合的风险状况。'
      },
      controls: {
        title: '模拟控制',
        desc: '调整 BTC 价格、模拟时间流逝 (Theta) 或更改隐含波动率 (Vega)，以查看您的策略在不同市场条件下的表现。'
      },
      spot: {
        title: '现货持仓',
        desc: '添加您的 BTC 现货持仓，查看其与期权的相互作用。适用于计算备兑看涨 (Covered Call) 或保护性看跌 (Protective Put) 的收益。'
      },
      legs: {
        title: '期权腿编辑器',
        desc: '通过调整行权价、到期时间和数量等单个期权参数来微调您的策略，或删除不再需要的期权腿。'
      }
    }
  }
};
