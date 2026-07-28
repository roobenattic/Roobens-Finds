const TARGETS = {
  balanced: { Growth: 50, Income: 15, "Real Estate": 10, Bonds: 20, Cash: 5, Other: 0 },
  growth: { Growth: 75, Income: 8, "Real Estate": 7, Bonds: 5, Cash: 5, Other: 0 },
  income: { Growth: 30, Income: 30, "Real Estate": 15, Bonds: 20, Cash: 5, Other: 0 },
};

const VALID_STRATEGIES = new Set(Object.keys(TARGETS));
const VALID_ACCOUNTS = new Set(["brokerage", "roth-ira", "traditional-ira", "401k", "other"]);

const round = (value, digits = 1) => Number(Number(value || 0).toFixed(digits));

function normalizeHoldings(inputHoldings = [], suppliedTotal = 0) {
  const cleaned = inputHoldings
    .map((item, index) => ({
      id: item.id || `holding-${index + 1}`,
      ticker: String(item.ticker || "").trim().toUpperCase(),
      name: String(item.name || "").trim(),
      shares: Number(item.shares) > 0 ? Number(item.shares) : null,
      marketValue: Number(item.marketValue) > 0 ? Number(item.marketValue) : null,
      percent: Number(item.percent) > 0 ? Number(item.percent) : null,
      category: String(item.category || "Other").trim() || "Other",
      confidence: item.confidence || "medium",
    }))
    .filter((item) => (item.ticker || item.name) && (item.marketValue || item.percent));

  const valuesTotal = cleaned.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalValue = Number(suppliedTotal) > 0 ? Number(suppliedTotal) : valuesTotal;
  if (!cleaned.length || totalValue <= 0) {
    throw new Error("At least one valid holding and a positive portfolio value are required.");
  }

  const rawPercentTotal = cleaned.reduce((sum, item) => {
    const calculated = item.marketValue ? (item.marketValue / totalValue) * 100 : item.percent || 0;
    return sum + calculated;
  }, 0);
  if (rawPercentTotal <= 0) throw new Error("Holding percentages could not be calculated.");

  return {
    totalValue,
    holdings: cleaned.map((item) => {
      const rawPercent = item.marketValue ? (item.marketValue / totalValue) * 100 : item.percent || 0;
      const percent = (rawPercent / rawPercentTotal) * 100;
      return {
        ...item,
        percent: round(percent, 2),
        marketValue: item.marketValue || round((percent / 100) * totalValue, 2),
      };
    }),
  };
}

function scorePortfolio(holdings, allocation, target) {
  // Four transparent 25-point subscores: category breadth, largest-position
  // concentration, cash range, and distance from the selected strategy target.
  const activeCategories = Object.values(allocation).filter((value) => value >= 3).length;
  const diversification = Math.min(25, activeCategories * 6.25);
  const largestHolding = Math.max(...holdings.map((holding) => holding.percent), 0);
  const concentration = Math.max(0, 25 - Math.max(0, largestHolding - 15) * 0.8);
  const cash = allocation.Cash || 0;
  const liquidity = cash >= 2 && cash <= 15 ? 25 : Math.max(5, 25 - Math.abs(cash - 7) * 1.6);
  const categories = new Set([...Object.keys(target), ...Object.keys(allocation)]);
  const distance = [...categories].reduce(
    (sum, category) => sum + Math.abs((allocation[category] || 0) - (target[category] || 0)),
    0,
  );
  const goalAlignment = Math.max(0, 25 - distance * 0.25);
  const subscores = {
    diversification: round(diversification, 0),
    concentration: round(concentration, 0),
    liquidity: round(liquidity, 0),
    goalAlignment: round(goalAlignment, 0),
  };
  const reasons = [
    `${activeCategories} allocation ${activeCategories === 1 ? "category is" : "categories are"} meaningfully represented.`,
    `The largest single holding is ${round(largestHolding)}% of the portfolio.`,
    `Cash represents ${round(cash)}% of the reviewed portfolio.`,
    `The allocation is ${round(distance / 2)} percentage points from the selected target mix.`,
  ];
  return { total: Object.values(subscores).reduce((sum, value) => sum + value, 0), ...subscores, reasons };
}

function analyzePortfolio(input = {}) {
  const strategy = VALID_STRATEGIES.has(input.strategy) ? input.strategy : "balanced";
  const accountType = VALID_ACCOUNTS.has(input.accountType) ? input.accountType : "other";
  const timelineYears = Math.max(1, Math.min(60, Number(input.timelineYears) || 10));
  const monthlyContribution = Math.max(0, Number(input.monthlyContribution) || 0);
  const normalized = normalizeHoldings(input.holdings, input.totalValue);
  const allocation = normalized.holdings.reduce((result, holding) => {
    result[holding.category] = round((result[holding.category] || 0) + holding.percent, 2);
    return result;
  }, {});
  const targetAllocation = TARGETS[strategy];
  const score = scorePortfolio(normalized.holdings, allocation, targetAllocation);
  const largest = normalized.holdings.reduce((current, holding) => holding.percent > current.percent ? holding : current);
  const gaps = Object.keys(targetAllocation).map((category) => ({
    category,
    current: allocation[category] || 0,
    target: targetAllocation[category] || 0,
    difference: (targetAllocation[category] || 0) - (allocation[category] || 0),
  }));
  const priority = gaps.reduce((current, gap) => Math.abs(gap.difference) > Math.abs(current.difference) ? gap : current);

  const strengths = [];
  if (largest.percent <= 25) strengths.push("No single holding exceeds 25% of the reviewed portfolio.");
  if (Object.keys(allocation).filter((category) => allocation[category] >= 3).length >= 3) strengths.push("The portfolio spans several meaningful allocation categories.");
  if ((allocation.Cash || 0) >= 2 && (allocation.Cash || 0) <= 15) strengths.push("Cash exposure is within the score's educational reference range.");
  if (!strengths.length) strengths.push("The holdings are confirmed and ready for a consistent baseline comparison.");

  const risks = [];
  if (largest.percent > 25) risks.push(`${largest.ticker || largest.name} represents ${round(largest.percent)}%, creating single-position concentration.`);
  if ((allocation.Other || 0) > 10) risks.push("A meaningful share is uncategorized; refining categories would improve the diagnosis.");
  if ((allocation.Cash || 0) > 20) risks.push("A large cash allocation may be misaligned with the selected strategy.");
  if (!risks.length) risks.push("Allocation can still drift over time; review it after material portfolio changes.");

  return {
    ...normalized,
    holdingsCount: normalized.holdings.length,
    strategy,
    accountType,
    timelineYears,
    monthlyContribution,
    allocation,
    targetAllocation,
    score,
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    mainPriority: `${priority.category} is ${round(Math.abs(priority.difference))} percentage points ${priority.difference > 0 ? "below" : "above"} the ${strategy} reference mix.`,
    freeAction: {
      actionType: priority.difference > 0 ? "Build exposure" : "Review concentration",
      category: priority.category,
      reason: `${priority.category} is the largest gap between the current allocation and the selected educational target.`,
      priority: "High",
      method: priority.difference > 0
        ? "Consider directing future contributions toward this category before selling existing positions."
        : "Review whether this category still matches your goal, timeline, and comfort with concentration.",
      expectedImpact: "Moves the portfolio directionally closer to the selected reference mix.",
    },
    dataQualityNote: normalized.holdings.some((holding) => holding.confidence === "low")
      ? "Some rows were detected with low confidence and were confirmed by the user."
      : "The report uses user-reviewed holdings.",
    disclaimer: "For informational and educational purposes only. This diagnosis is not financial, investment, tax, or legal advice and does not recommend or execute trades.",
  };
}

export { TARGETS, analyzePortfolio, normalizeHoldings, scorePortfolio };
