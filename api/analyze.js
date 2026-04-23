import { parsePortfolioText } from "../lib/portfolioParser.js";
import { rebalancePortfolio } from "../lib/rebalance.js";
import { mapPlanToTickers } from "../lib/tickerMapping.js";
import { formatTickerPlanForUI } from "../lib/formatters.js";
import { buildSnapshot } from "../lib/insights.js";

export const config = {
  api: {
    bodyParser: true
  }
};

function buildEducationalSignals(allocation = {}, strategy = "balanced") {
  const entries = Object.entries(allocation);

  if (!entries.length) {
    return [];
  }

  const topHolding = entries.reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  }, entries[0]);

  const [largestCategory, largestPercent] = topHolding;

  const strategyLabel =
    strategy.charAt(0).toUpperCase() + strategy.slice(1);

  return [
    `This portfolio snapshot appears most concentrated in ${largestCategory} at approximately ${largestPercent}%.`,
    `This analysis is based on your selected ${strategyLabel} strategy.`,
    "The rebalance section below shows an example adjustment based on your uploaded portfolio data and selected strategy."
  ];
}

function buildSafeUiPlan(uiPlan = {}) {
  return {
    ...uiPlan,
    sellTitle: "Possible Reductions",
    buyTitle: "Possible Additions",
    sellLines: Array.isArray(uiPlan.sellLines)
      ? uiPlan.sellLines.map((line) =>
          String(line)
            .replace(/^Sell\b/i, "An example reduction could be")
            .replace(/^Reduce\b/i, "An example reduction could be")
        )
      : [],
    buyLines: Array.isArray(uiPlan.buyLines)
      ? uiPlan.buyLines.map((line) =>
          String(line)
            .replace(/^Buy\b/i, "An example addition could be")
            .replace(/^Add\b/i, "An example addition could be")
        )
      : []
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { text, totalValue = 10000, strategy = "balanced" } = body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "No OCR text provided" });
    }

    const parsed = parsePortfolioText(text, totalValue);
    const plan = rebalancePortfolio(parsed, strategy);
    const tickerPlan = mapPlanToTickers(parsed, plan, strategy);
    const formattedUiPlan = formatTickerPlanForUI(tickerPlan);
    const uiPlan = buildSafeUiPlan(formattedUiPlan);
    const snapshot = buildSnapshot(parsed.allocation);
    const signals = buildEducationalSignals(parsed.allocation, strategy);

    return res.status(200).json({
      ...parsed,
      plan,
      tickerPlan,
      uiPlan,
      snapshot,
      signals,
      strategyLabel: strategy.charAt(0).toUpperCase() + strategy.slice(1),
      disclaimer:
        "This tool is for informational and educational purposes only. It does not provide financial or investment advice. All outputs are based on your selected inputs and assumptions."
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}