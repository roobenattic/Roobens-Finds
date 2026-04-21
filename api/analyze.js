import { parsePortfolioText } from "../src/lib/portfolioParser.js";

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

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
