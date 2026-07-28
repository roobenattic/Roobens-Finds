import { parsePortfolioText } from "../lib/portfolioParser.js";
import { analyzePortfolio } from "../lib/portfolioAnalysis.js";

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    let holdings = Array.isArray(body.holdings) ? body.holdings : [];

    // Text remains a compatibility fallback. The reviewed holdings table is the
    // trustworthy primary input for Planner 2.0.
    if (!holdings.length && String(body.text || "").trim()) {
      holdings = parsePortfolioText(body.text, body.totalValue).holdings;
    }

    if (!holdings.length) {
      return res.status(400).json({ error: "No valid reviewed holdings were provided." });
    }
    if (!(Number(body.totalValue) > 0) && !holdings.some((holding) => Number(holding.marketValue) > 0)) {
      return res.status(400).json({ error: "Confirm a positive portfolio value before analysis." });
    }

    return res.status(200).json(analyzePortfolio({ ...body, holdings }));
  } catch (error) {
    return res.status(400).json({
      error: "The portfolio data is not trustworthy enough to analyze.",
      details: error instanceof Error ? error.message : "Validation failed.",
    });
  }
}
