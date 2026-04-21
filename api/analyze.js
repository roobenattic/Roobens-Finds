import { parsePortfolioText } from "../lib/portfolioParser.js";
import { rebalancePortfolio } from "../lib/rebalance.js";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, totalValue = 10000 } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No OCR text provided" });
    }

   const parsed = parsePortfolioText(text, totalValue);

const plan = rebalancePortfolio(parsed, "balanced");

return res.status(200).json({
  ...parsed,
  plan
});
