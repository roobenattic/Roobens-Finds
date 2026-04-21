function rebalancePortfolio(data, strategy = "balanced") {
  const targets = {
    balanced: { Growth: 60, Dividend: 25, REIT: 10, Cash: 5 },
    income: { Growth: 30, Dividend: 40, REIT: 20, Cash: 10 },
    growth: { Growth: 75, Dividend: 15, REIT: 5, Cash: 5 }
  };

  const total = Number(data?.totalEstimated || 0);
  const current = data?.allocation || {};
  const target = targets[strategy] || targets.balanced;

  const actions = {
    sell: [],
    buy: []
  };

  for (const category in target) {
    const currentPercent = Number(current[category] || 0);
    const targetPercent = Number(target[category] || 0);

    const diff = targetPercent - currentPercent;
    const amount = Math.round((diff / 100) * total);

    if (amount < 0) {
      actions.sell.push({
        category,
        amount: Math.abs(amount)
      });
    } else if (amount > 0) {
      actions.buy.push({
        category,
        amount
      });
    }
  }

  return actions;
}

export { rebalancePortfolio };
