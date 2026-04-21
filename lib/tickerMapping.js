const DEFAULT_BUY_TICKERS = {
  balanced: {
    Growth: ["VTI", "QQQ"],
    Dividend: ["SCHD"],
    REIT: ["O"],
    Cash: ["SPAXX"]
  },
  income: {
    Growth: ["VTI"],
    Dividend: ["SCHD", "VYM"],
    REIT: ["O", "DLR"],
    Cash: ["SPAXX"]
  },
  growth: {
    Growth: ["VTI", "QQQ"],
    Dividend: ["SCHD"],
    REIT: ["O"],
    Cash: ["SPAXX"]
  }
};

function mapPlanToTickers(parsed, plan, strategy = "balanced") {
  const holdings = parsed?.holdings || [];
  const buyTargets = DEFAULT_BUY_TICKERS[strategy] || DEFAULT_BUY_TICKERS.balanced;

  const sell = [];
  const buy = [];

  for (const item of plan.sell || []) {
    const candidates = holdings
      .filter((h) => h.category === item.category)
      .sort((a, b) => b.estimatedValue - a.estimatedValue);

    let remaining = item.amount;

    for (const h of candidates) {
      if (remaining <= 0) break;

      const sellAmount = Math.min(h.estimatedValue, remaining);

      if (sellAmount > 0) {
        sell.push({
          ticker: h.ticker,
          category: h.category,
          amount: Math.round(sellAmount)
        });
        remaining -= sellAmount;
      }
    }
  }

  for (const item of plan.buy || []) {
    const targets = buyTargets[item.category] || [];
    if (!targets.length) continue;

    const splitAmount = Math.round(item.amount / targets.length);

    targets.forEach((ticker, index) => {
      const amount =
        index === targets.length - 1
          ? item.amount - splitAmount * (targets.length - 1)
          : splitAmount;

      buy.push({
        ticker,
        category: item.category,
        amount: Math.round(amount)
      });
    });
  }

  return { sell, buy };
}

export { mapPlanToTickers };
