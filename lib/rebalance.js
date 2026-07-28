import { TARGETS } from "./portfolioAnalysis.js";

function rebalancePortfolio(data, strategy = "balanced") {
  const targetAllocation = TARGETS[strategy] || TARGETS.balanced;
  const currentAllocation = data?.allocation || {};
  const categoryGuidance = Object.entries(targetAllocation).map(([category, targetPercent]) => {
    const currentPercent = Number(currentAllocation[category] || 0);
    const differencePercent = Number((targetPercent - currentPercent).toFixed(1));
    return {
      actionType: Math.abs(differencePercent) < 2 ? "Hold range" : differencePercent > 0 ? "Build exposure" : "Review concentration",
      category,
      reason: `${category} is ${Math.abs(differencePercent)} percentage points ${differencePercent > 0 ? "below" : "above"} the reference mix.`,
      priority: Math.abs(differencePercent) >= 10 ? "High" : "Normal",
      method: differencePercent > 0 ? "Use future contributions as an educational starting point." : "Review alignment before making any change.",
      expectedImpact: "Directionally narrows the category allocation gap.",
      currentPercent,
      targetPercent,
      differencePercent,
    };
  });
  return { strategy, targetAllocation, currentAllocation, categoryGuidance };
}

export { rebalancePortfolio };
