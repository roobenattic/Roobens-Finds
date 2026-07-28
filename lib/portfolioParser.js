const CATEGORY_MAP = {
  AAPL: "Growth", MSFT: "Growth", NVDA: "Growth", AMZN: "Growth", META: "Growth",
  GOOGL: "Growth", GOOG: "Growth", TSLA: "Growth", VTI: "Growth", VOO: "Growth",
  SPY: "Growth", QQQ: "Growth", VT: "Growth", VXUS: "Growth", VEA: "Growth",
  SCHD: "Income", VYM: "Income", JEPI: "Income", JEPQ: "Income", MAIN: "Income",
  O: "Real Estate", DLR: "Real Estate", PLD: "Real Estate", VNQ: "Real Estate",
  BND: "Bonds", AGG: "Bonds", TLT: "Bonds", SGOV: "Bonds",
  CASH: "Cash", SPAXX: "Cash", FDRXX: "Cash", VMFXX: "Cash",
};

function cleanOCRText(text = "") {
  return String(text).replace(/[|]/g, " ").replace(/\s+/g, " ").trim();
}

function inferCategory(ticker = "", name = "") {
  const symbol = String(ticker).trim().toUpperCase();
  if (CATEGORY_MAP[symbol]) return CATEGORY_MAP[symbol];
  const value = `${symbol} ${name}`.toLowerCase();
  if (/cash|money market|sweep/.test(value)) return "Cash";
  if (/bond|treasury|fixed income/.test(value)) return "Bonds";
  if (/reit|real estate/.test(value)) return "Real Estate";
  if (/dividend|income/.test(value)) return "Income";
  return "Other";
}

function parsePortfolioText(ocrText, totalPortfolioValue = 0) {
  const text = cleanOCRText(ocrText);
  const holdings = [];
  const seen = new Set();
  const percentPattern = /\b([A-Z][A-Z0-9.-]{0,9})\b[^\d%$]{0,35}(\d{1,3}(?:\.\d{1,4})?)\s*%/g;
  const valuePattern = /\b([A-Z][A-Z0-9.-]{0,9})\b[^\d%$]{0,35}\$([\d,]+(?:\.\d{1,2})?)/g;

  for (const match of text.matchAll(percentPattern)) {
    const ticker = match[1].toUpperCase();
    const percent = Number(match[2]);
    if (percent <= 0 || percent > 100 || seen.has(ticker)) continue;
    seen.add(ticker);
    holdings.push({
      ticker,
      name: "",
      shares: null,
      marketValue: totalPortfolioValue > 0 ? (percent / 100) * totalPortfolioValue : null,
      percent,
      category: inferCategory(ticker),
      confidence: "medium",
    });
  }

  for (const match of text.matchAll(valuePattern)) {
    const ticker = match[1].toUpperCase();
    const marketValue = Number(match[2].replaceAll(",", ""));
    if (marketValue <= 0 || seen.has(ticker)) continue;
    seen.add(ticker);
    holdings.push({
      ticker,
      name: "",
      shares: null,
      marketValue,
      percent: totalPortfolioValue > 0 ? (marketValue / totalPortfolioValue) * 100 : null,
      category: inferCategory(ticker),
      confidence: "low",
    });
  }

  return { totalEstimated: Number(totalPortfolioValue) || 0, holdings };
}

export { CATEGORY_MAP, cleanOCRText, inferCategory, parsePortfolioText };
