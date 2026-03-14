# BTC Options Payoff Calculator | BTC 期权收益计算器

A professional-grade, real-time visualization and analysis tool for Bitcoin options trading. Built for traders to simulate complex strategies, analyze risk metrics (Greeks), and estimate margin requirements based on Binance's portfolio margin rules.

一个专业级的比特币期权实时可视化与分析工具。专为交易者设计，用于模拟复杂策略、分析风险指标（Greeks），并基于币安组合保证金规则估算保证金要求。

---

## 🚀 Key Features | 核心功能

### 1. Interactive Payoff Profile | 交互式收益图表
- **Dynamic Simulation**: Visualize PnL at expiration (solid line) and current theoretical PnL (dashed line).
- **Hover Risk Metrics**: Hover over **LIQ (Liquidation)** lines to reveal real-time margin requirements and risk alerts.
- **Dynamic Scaling**: Automatically adjusts axis based on strategy strikes and BTC price.

### 2. Real-time Option Chain | 实时期权链
- **Binance Integration**: Fetches live data from Binance Options API.
- **One-Click Execution**: Click on Bid/Ask prices to instantly add legs to your strategy.
- **Comprehensive Data**: Includes Mark Price, IV, and Bid/Ask spreads.

### 3. Portfolio Greeks | 组合希腊字母
- **Real-time Calculation**: Instant updates for Delta, Gamma, Theta, Vega, and Rho.
- **Aggregated Risk**: View the total risk profile of your entire portfolio (Options + Spot).

### 4. Advanced Risk Management | 高级风控模拟
- **Margin Estimation**: Simulates Initial Margin (IM) and Maintenance Margin (MM) based on Binance rules.
- **Liquidation Prediction**: Estimates liquidation prices and highlights them on the chart with color-coded risk levels (Safe/Warning/Danger).
- **Spot Integration**: Support for BTC spot holdings to calculate Covered Call or Protective Put payoffs.

### 5. Simulation Controls | 模拟控制面板
- **Time Decay (Theta)**: Simulate the passage of time to see how it affects your position.
- **Volatility (Vega)**: Adjust Implied Volatility (IV) to stress-test your strategy.
- **Price Sensitivity**: Slide to change BTC price and observe PnL shifts.

---

## 🛠 Tech Stack | 技术栈

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Backend/Proxy**: Express (for API proxying and static serving)
- **Data Source**: Binance Public API

---

## 📦 Getting Started | 快速开始

### Prerequisites
- Node.js 18+
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure | 项目结构

```text
src/
├── components/        # Reusable UI components (Chart, Chain, Tutorial, etc.)
├── services/          # Binance API and Black-Scholes logic
├── hooks/             # Custom React hooks for state and calculations
├── i18n.ts            # Multi-language configuration (EN/ZH)
├── types.ts           # TypeScript interfaces and types
└── App.tsx            # Main application entry
```

---

## 🛡 Risk Disclaimer | 风险免责声明

This tool is for **educational and simulation purposes only**. Calculations are based on theoretical models (Black-Scholes) and simplified margin rules. Real market conditions, slippage, and exchange-specific liquidation logic may differ. Always perform your own due diligence before trading.

本工具仅用于**教育和模拟目的**。所有计算均基于理论模型（Black-Scholes）和简化的保证金规则。实际市场状况、滑点及交易所特定的强平逻辑可能有所不同。交易前请务必进行独立研究。

---

## 📄 License | 许可证

MIT License. Feel free to use and modify for personal or commercial projects.
