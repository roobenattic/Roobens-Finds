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
    strategy,
    targetAllocation: target,
    currentAllocation: current,
    summary: [],
    reduce: [],
    add: []
  };

  for (const category in target) {
    const currentPercent = Number(current[category] || 0);
    const targetPercent = Number(target[category] || 0);

    const diff = targetPercent - currentPercent;
    const amount = Math.round((Math.abs(diff) / 100) * total);

    if (diff < 0 && amount > 0) {
      actions.reduce.push({
        category,
        amount,
        currentPercent,
        targetPercent,
        differencePercent: Math.abs(diff)
      });

      actions.summary.push(
        `${category} appears about ${Math.abs(diff)}% above the selected ${strategy} target. An example reduction could be around $${amount}.`
      );
    } else if (diff > 0 && amount > 0) {
      actions.add.push({
        category,
        amount,
        currentPercent,
        targetPercent,
        differencePercent: diff
      });

      actions.summary.push(
        `${category} appears about ${diff}% below the selected ${strategy} target. An example addition could be around $${amount}.`
      );
    } else {
      actions.summary.push(
        `${category} appears aligned with the selected ${strategy} target.`
      );
    }
  }

  return actions;
}

export { rebalancePortfolio };