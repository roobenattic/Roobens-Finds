import { buildSnapshot, buildSignals } from "../lib/insights.js";
import { formatTickerPlanForUI } from "../lib/formatters.js";
import { mapPlanToTickers } from "../lib/tickerMapping.js";
import { parsePortfolioText } from "../lib/portfolioParser.js";
import { rebalancePortfolio } from "../lib/rebalance.js";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
const { text, totalValue = 10000, strategy = "balanced" } = body;
    if (!text) {
      return res.status(400).json({ error: "No OCR text provided" });
    }

    const parsed = parsePortfolioText(text, totalValue);
const plan = rebalancePortfolio(parsed, strategy);
const tickerPlan = mapPlanToTickers(parsed, plan, strategy);
  const uiPlan = formatTickerPlanForUI(tickerPlan);
const parsed = parsePortfolioText(text, totalValue);
const plan = rebalancePortfolio(parsed, strategy);
const tickerPlan = mapPlanToTickers(parsed, plan, strategy);
const uiPlan = formatTickerPlanForUI(tickerPlan);
return res.status(200).json({
  ...parsed,
  plan,
  tickerPlan,
  uiPlan,
  snapshot,
  signals
});
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
