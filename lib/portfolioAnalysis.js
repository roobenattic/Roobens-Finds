const ANALYSIS_VERSION = "2.1.0";

const TARGETS = {
  balanced: { Growth: 50, Income: 15, "Real Estate": 10, Bonds: 20, Cash: 5, Other: 0 },
  growth: { Growth: 75, Income: 8, "Real Estate": 7, Bonds: 5, Cash: 5, Other: 0 },
  income: { Growth: 30, Income: 30, "Real Estate": 15, Bonds: 20, Cash: 5, Other: 0 },
};

const VALID_STRATEGIES = new Set(Object.keys(TARGETS));
const VALID_ACCOUNTS = new Set(["brokerage", "roth-ira", "traditional-ira", "401k", "other"]);
const VALID_MODES = new Set(["contribution-only", "gradual", "full-rebalance"]);
const DISCLAIMER = "For informational and educational purposes only. This diagnosis is not financial, investment, tax, or legal advice and does not recommend or execute trades.";

const round = (value, digits = 1) => Number(Number(value || 0).toFixed(digits));
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function normalizeCategory(value = "") {
  const category = String(value).trim();
  if (!category || category === "Uncategorized") return "Needs review";
  return category;
}

function normalizeHoldings(inputHoldings = [], suppliedTotal = 0) {
  const cleaned = inputHoldings
    .map((item, index) => {
      const symbol = String(item.symbol || item.ticker || "").trim().toUpperCase();
      const name = String(item.name || "").trim();
      const marketValue = Number(item.marketValue) > 0 ? Number(item.marketValue) : null;
      const suppliedWeight = Number(item.weight ?? item.percent) > 0 ? Number(item.weight ?? item.percent) : null;
      const assetClass = normalizeCategory(item.assetClass || item.category);
      const warnings = Array.isArray(item.warnings) ? [...item.warnings] : [];
      if (assetClass === "Needs review") {
        warnings.push({
          code: "unknown-classification",
          message: `${symbol || name || `Holding ${index + 1}`} could not be confidently classified.`,
          action: "Choose a category in Review holdings.",
          severity: "warning",
        });
      }
      return {
        id: item.id || makeId("holding"),
        symbol,
        name,
        shares: Number(item.shares) >= 0 ? Number(item.shares) : null,
        marketValue,
        costBasis: Number(item.costBasis) >= 0 ? Number(item.costBasis) : null,
        suppliedWeight,
        assetClass,
        confidence: item.confidence || "medium",
        sourceRef: String(item.sourceRef || "User-confirmed input"),
        warnings,
      };
    })
    .filter((item) => (item.symbol || item.name) && (item.marketValue || item.suppliedWeight));

  const valuesTotal = cleaned.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalValue = Number(suppliedTotal) > 0 ? Number(suppliedTotal) : valuesTotal;
  if (!cleaned.length || totalValue <= 0) {
    throw new Error("At least one valid holding and a positive portfolio value are required.");
  }

  const rawWeightTotal = cleaned.reduce((sum, item) => {
    return sum + (item.marketValue ? (item.marketValue / totalValue) * 100 : item.suppliedWeight || 0);
  }, 0);
  if (rawWeightTotal <= 0) throw new Error("Holding weights could not be calculated.");

  return {
    totalValue: round(totalValue, 2),
    holdings: cleaned.map(({ suppliedWeight, ...item }) => {
      const rawWeight = item.marketValue ? (item.marketValue / totalValue) * 100 : suppliedWeight || 0;
      const weight = (rawWeight / rawWeightTotal) * 100;
      return {
        ...item,
        marketValue: round(item.marketValue || (weight / 100) * totalValue, 2),
        weight: round(weight, 2),
      };
    }),
  };
}

function allocationsFromHoldings(holdings) {
  return holdings.reduce((result, holding) => {
    result[holding.assetClass] = round((result[holding.assetClass] || 0) + holding.weight, 2);
    return result;
  }, {});
}

function scorePortfolio(holdings, allocation, target) {
  const activeCategories = Object.entries(allocation).filter(([category, value]) => category !== "Needs review" && value >= 3).length;
  const diversification = Math.min(25, activeCategories * 6.25);
  const largestHolding = Math.max(...holdings.map((holding) => holding.weight), 0);
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
  const strengths = [];
  if (largestHolding <= 25) strengths.push("No single holding exceeds 25% of the reviewed portfolio.");
  if (activeCategories >= 3) strengths.push("The portfolio spans several meaningful allocation categories.");
  if (cash >= 2 && cash <= 15) strengths.push("Cash exposure is within the score's educational reference range.");
  if (!strengths.length) strengths.push("The confirmed holdings provide a reliable baseline for comparison.");
  const risks = [];
  const largest = holdings.reduce((current, holding) => holding.weight > current.weight ? holding : current);
  if (largest.weight > 25) risks.push(`${largest.symbol || largest.name} represents ${round(largest.weight)}%, creating single-position concentration.`);
  if ((allocation["Needs review"] || 0) > 0) risks.push("One or more holdings still need a confirmed category.");
  if (cash > 20) risks.push("A large cash allocation may be misaligned with the selected strategy.");
  if (!risks.length) risks.push("Allocation can drift over time; review it after material portfolio changes.");
  return {
    total: Object.values(subscores).reduce((sum, value) => sum + value, 0),
    ...subscores,
    reasons: [
      `${activeCategories} allocation ${activeCategories === 1 ? "category is" : "categories are"} meaningfully represented.`,
      `The largest single holding is ${round(largestHolding)}% of the portfolio.`,
      `Cash represents ${round(cash)}% of the reviewed portfolio.`,
      `The allocation is ${round(distance / 2)} percentage points from the selected model mix.`,
    ],
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
  };
}

function buildSnapshot(input = {}) {
  const normalized = normalizeHoldings(input.holdings, input.totalValue);
  const accountType = VALID_ACCOUNTS.has(input.accountType) ? input.accountType : "other";
  const allocations = allocationsFromHoldings(normalized.holdings);
  const warnings = normalized.holdings.flatMap((holding) => holding.warnings);
  if (Math.abs(normalized.holdings.reduce((sum, holding) => sum + holding.weight, 0) - 100) > 0.5) {
    warnings.push({
      code: "weight-normalized",
      message: "Holding weights were normalized to approximately 100%.",
      action: "Review position values if the result looks unexpected.",
      severity: "info",
    });
  }
  const source = {
    kind: input.source?.kind || "manual",
    broker: input.source?.broker || "Generic import",
    brokerConfidence: input.source?.brokerConfidence || "low",
    fileCount: Number(input.source?.fileCount) || 0,
    label: input.source?.label || "User-confirmed holdings",
  };
  const health = scorePortfolio(normalized.holdings, allocations, TARGETS.balanced);
  return {
    id: input.id || makeId("snapshot"),
    createdAt: input.createdAt || new Date().toISOString(),
    source,
    currency: "USD",
    accountType,
    totalValue: normalized.totalValue,
    cashValue: round(normalized.holdings.filter((holding) => holding.assetClass === "Cash").reduce((sum, holding) => sum + holding.marketValue, 0), 2),
    holdings: normalized.holdings,
    allocations,
    health,
    warnings,
    analysisVersion: ANALYSIS_VERSION,
  };
}

function calculateScenarioAllocation(snapshot, target, contributionAmount, mode) {
  if (mode === "full-rebalance") return { ...target };
  const contribution = Math.max(0, Number(contributionAmount) || 0);
  const postContributionTotal = snapshot.totalValue + contribution;
  const currentValues = Object.fromEntries(
    Object.entries(snapshot.allocations).map(([category, weight]) => [category, (weight / 100) * snapshot.totalValue]),
  );
  const resultValues = { ...currentValues };
  if (mode === "gradual") {
    const blend = Math.min(0.5, contribution / Math.max(snapshot.totalValue, 1) + 0.2);
    for (const category of new Set([...Object.keys(target), ...Object.keys(snapshot.allocations)])) {
      const blendedWeight = (snapshot.allocations[category] || 0) * (1 - blend) + (target[category] || 0) * blend;
      resultValues[category] = (blendedWeight / 100) * postContributionTotal;
    }
  } else {
    const gaps = Object.entries(target).map(([category, targetWeight]) => ({
      category,
      gap: Math.max(0, (targetWeight / 100) * postContributionTotal - (currentValues[category] || 0)),
    }));
    const totalGap = gaps.reduce((sum, item) => sum + item.gap, 0);
    for (const item of gaps) {
      if (item.gap > 0 && totalGap > 0) {
        resultValues[item.category] = (resultValues[item.category] || 0) + contribution * (item.gap / totalGap);
      }
    }
  }
  const valueTotal = Object.values(resultValues).reduce((sum, value) => sum + value, 0) || postContributionTotal;
  return Object.fromEntries(Object.entries(resultValues).map(([category, value]) => [category, round((value / valueTotal) * 100, 2)]));
}

function buildScenario(snapshot, input = {}) {
  const strategy = VALID_STRATEGIES.has(input.strategy) ? input.strategy : "balanced";
  const rebalanceMode = VALID_MODES.has(input.rebalanceMode) ? input.rebalanceMode : "contribution-only";
  const contributionAmount = Math.max(0, Number(input.contributionAmount ?? input.monthlyContribution) || 0);
  const targetAllocation = TARGETS[strategy];
  const calculatedAllocation = calculateScenarioAllocation(snapshot, targetAllocation, contributionAmount, rebalanceMode);
  const actions = Object.entries(targetAllocation).map(([category, targetWeight]) => {
    const current = snapshot.allocations[category] || 0;
    const difference = targetWeight - current;
    return {
      category,
      direction: Math.abs(difference) < 2 ? "hold" : difference > 0 ? "build" : "review",
      priority: Math.abs(difference) >= 10 ? "high" : "normal",
      reason: `${category} is ${round(Math.abs(difference))} percentage points ${difference >= 0 ? "below" : "above"} the ${strategy} model allocation.`,
    };
  });
  return {
    id: input.id || makeId("scenario"),
    name: input.name || `${strategy[0].toUpperCase()}${strategy.slice(1)} model`,
    strategy,
    contributionCadence: "monthly",
    contributionAmount,
    rebalanceMode,
    startingSnapshotId: snapshot.id,
    targetAllocation: { ...targetAllocation },
    calculatedAllocation,
    actions,
    assumptions: [
      "Targets are educational model allocations, not return forecasts or trade instructions.",
      "Contribution-only directs new money toward underweight categories and does not assume sales.",
      "Taxes, fees, account restrictions, and market movement are not modeled.",
    ],
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function analyzeSnapshot(snapshot, scenario) {
  if (!snapshot?.holdings?.length || !(snapshot.totalValue > 0)) {
    throw new Error("A confirmed snapshot with holdings and a positive total is required.");
  }
  const score = scorePortfolio(snapshot.holdings, snapshot.allocations, scenario.targetAllocation);
  const gaps = Object.keys(scenario.targetAllocation).map((category) => ({
    category,
    current: snapshot.allocations[category] || 0,
    target: scenario.targetAllocation[category] || 0,
    difference: (scenario.targetAllocation[category] || 0) - (snapshot.allocations[category] || 0),
  }));
  const priority = gaps.reduce((current, gap) => Math.abs(gap.difference) > Math.abs(current.difference) ? gap : current);
  const topExposures = [...snapshot.holdings]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((holding) => ({
      id: holding.id,
      label: holding.symbol || holding.name,
      category: holding.assetClass,
      value: holding.marketValue,
      weight: holding.weight,
    }));
  return {
    snapshot,
    scenario,
    holdings: snapshot.holdings,
    holdingsCount: snapshot.holdings.length,
    totalValue: snapshot.totalValue,
    cashValue: snapshot.cashValue,
    allocation: snapshot.allocations,
    targetAllocation: scenario.targetAllocation,
    calculatedAllocation: scenario.calculatedAllocation,
    score,
    strengths: score.strengths,
    risks: score.risks,
    warnings: snapshot.warnings,
    topExposures,
    mainPriority: `${priority.category} is ${round(Math.abs(priority.difference))} percentage points ${priority.difference > 0 ? "below" : "above"} the ${scenario.strategy} model mix.`,
    freeAction: {
      actionType: priority.difference > 0 ? "Build exposure" : "Review concentration",
      category: priority.category,
      reason: `${priority.category} is the largest gap between the current allocation and the selected educational model.`,
      priority: "High",
      method: priority.difference > 0
        ? "Consider directing future contributions toward this category before selling existing positions."
        : "Review whether this category still matches your goal, timeline, and comfort with concentration.",
      expectedImpact: "Moves the portfolio directionally closer to the selected model mix.",
    },
    dataQualityNote: snapshot.warnings.length
      ? `${snapshot.warnings.length} data-quality ${snapshot.warnings.length === 1 ? "note requires" : "notes require"} attention.`
      : "The report uses user-reviewed holdings.",
    disclaimer: DISCLAIMER,
    analysisVersion: snapshot.analysisVersion,
  };
}

function analyzePortfolio(input = {}) {
  const snapshot = input.snapshot || buildSnapshot(input);
  const scenario = input.scenario || buildScenario(snapshot, {
    strategy: input.strategy,
    contributionAmount: input.monthlyContribution,
    rebalanceMode: input.rebalanceMode,
  });
  return analyzeSnapshot(snapshot, scenario);
}

export {
  ANALYSIS_VERSION,
  DISCLAIMER,
  TARGETS,
  allocationsFromHoldings,
  analyzePortfolio,
  analyzeSnapshot,
  buildScenario,
  buildSnapshot,
  calculateScenarioAllocation,
  normalizeHoldings,
  scorePortfolio,
};
