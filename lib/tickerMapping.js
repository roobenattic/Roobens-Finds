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
  const buyTargets =
    DEFAULT_BUY_TICKERS[strategy] || DEFAULT_BUY_TICKERS.balanced;

  const sell = [];
  const buy = [];

  const reduceItems = Array.isArray(plan?.reduce) ? plan.reduce : [];
  const addItems = Array.isArray(plan?.add) ? plan.add : [];

  for (const item of reduceItems) {
    const candidates = holdings
      .filter((h) => h.category === item.category)
      .sort((a, b) => Number(b.estimatedValue || 0) - Number(a.estimatedValue || 0));

    let remaining = Number(item.amount || 0);

    for (const h of candidates) {
      if (remaining <= 0) break;

      const holdingValue = Number(h.estimatedValue || 0);
      const sellAmount = Math.min(holdingValue, remaining);

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

  for (const item of addItems) {
    const targets = buyTargets[item.category] || [];
    if (!targets.length) continue;

    const totalAmount = Number(item.amount || 0);
    const splitAmount = Math.round(totalAmount / targets.length);

    targets.forEach((ticker, index) => {
      const amount =
        index === targets.length - 1
          ? totalAmount - splitAmount * (targets.length - 1)
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