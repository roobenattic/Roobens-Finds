function rebalancePortfolio(data, strategy = "balanced") {
  const targets = {
    balanced: {
      Growth: 60,
      Dividend: 25,
      REIT: 10,
      Cash: 5
    },
    income: {
      Growth: 30,
      Dividend: 40,
      REIT: 20,
      Cash: 10
    },
    growth: {
      Growth: 75,
      Dividend: 15,
      REIT: 5,
      Cash: 5
    }
  };

  const total = data.totalEstimated;
  const current = data.allocation;
  const target = targets[strategy];

  const actions = {
    sell: [],
    buy: []
  };

  // Calculate difference per category
  for (let category in target) {
    const currentPercent = current[category] || 0;
    const targetPercent = target[category];

    const diff = targetPercent - currentPercent;
    const amount = (diff / 100) * total;

    if (amount < 0) {
      actions.sell.push({
        category,
        amount: Math.abs(Math.round(amount))
      });
    } else if (amount > 0) {
      actions.buy.push({
        category,
        amount: Math.round(amount)
      });
    }
  }

  return actions;
}

export { rebalancePortfolio };
