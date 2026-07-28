const CATEGORY_MAP = {
  AAPL: "Growth", MSFT: "Growth", NVDA: "Growth", AMZN: "Growth", META: "Growth",
  GOOGL: "Growth", GOOG: "Growth", TSLA: "Growth", VTI: "Growth", VOO: "Growth",
  SPY: "Growth", QQQ: "Growth", VT: "Growth", VXUS: "Growth", VEA: "Growth",
  SCHD: "Income", VYM: "Income", JEPI: "Income", JEPQ: "Income", MAIN: "Income",
  O: "Real Estate", DLR: "Real Estate", PLD: "Real Estate", VNQ: "Real Estate",
  BND: "Bonds", AGG: "Bonds", TLT: "Bonds", SGOV: "Bonds",
  CASH: "Cash", SPAXX: "Cash", FDRXX: "Cash", VMFXX: "Cash",
};

const BLOCKED_TICKERS = new Set([
  "ACCOUNT", "ACCOUNTS", "ALLOCATION", "BALANCE", "BUY", "CASH", "CHANGE",
  "COST", "CURRENT", "DAY", "DESCRIPTION", "GAIN", "HOLDINGS", "LAST", "LOSS",
  "MARKET", "NAME", "PERCENT", "PORTFOLIO", "POSITION", "POSITIONS", "PRICE",
  "QUANTITY", "SHARES", "SYMBOL", "TODAY", "TOTAL", "VALUE", "VALUES", "WEIGHT",
  "INC", "LLC", "LTD", "ETF", "ETFS", "THE",
]);

const NEGATIVE_VALUE_CONTEXT = /\b(?:cost|gain|loss|today|day change|last price|current price|price)\b/i;
const VALUE_LABEL = /\b(?:market value|current value|position value|balance)\b/i;
const HEADING_LINE = /^(?:account|accounts|holdings?|market|market value|positions?|price|today|cost|gain|loss|total|value|symbol|quantity|shares?)\b/i;

function cleanOCRText(text = "") {
  return String(text).replace(/[|]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeOcrLines(text = "") {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[|]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
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

function numeric(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/[$,%\s,()]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function tickerCandidates(line) {
  const matches = String(line).match(/\b[A-Z][A-Z0-9.-]{0,9}\b/g) || [];
  return matches.filter((candidate) => {
    if (BLOCKED_TICKERS.has(candidate) || /^\d/.test(candidate)) return false;
    if (candidate.length === 1 && !CATEGORY_MAP[candidate]) return false;
    return CATEGORY_MAP[candidate] || candidate.length <= 5;
  });
}

function percentageFromLine(line) {
  const match = String(line).match(/(\d{1,3}(?:\.\d{1,4})?)\s*%/);
  const value = match ? numeric(match[1]) : null;
  return value !== null && value <= 100 ? value : null;
}

function sharesFromLine(line) {
  const match = String(line).match(/(\d+(?:\.\d+)?)\s*(?:shares?|qty|quantity)\b/i);
  return match ? numeric(match[1]) : null;
}

function priceFromLine(line) {
  const match = String(line).match(/\b(?:current price|last price|price)\s*:?\s*\$?\s*([\d,]+(?:\.\d{1,4})?)/i);
  return match ? numeric(match[1]) : null;
}

function moneyValues(line, allowUnmarked = false) {
  const source = String(line);
  const values = [];
  const marked = /\$\s*([\d,]+(?:\.\d{1,2})?)/g;
  let match;
  while ((match = marked.exec(source))) {
    const value = numeric(match[1]);
    if (value !== null) values.push(value);
  }
  if (values.length || !allowUnmarked) return values;
  const plain = source.match(/(?:^|\s)([\d]{1,3}(?:,\d{3})+(?:\.\d{1,2})?|[\d]+\.\d{2})(?:\s|$)/g) || [];
  return plain.map((value) => numeric(value)).filter((value) => value !== null);
}

function probableName(lines, index, ticker) {
  const current = lines[index] || "";
  const prefix = current.split(ticker)[0].trim().replace(/[-:]+$/, "").trim();
  if (prefix && /[a-z]/.test(prefix) && !HEADING_LINE.test(prefix)) return prefix;
  const previous = lines[index - 1] || "";
  if (previous && /[A-Za-z]{3}/.test(previous) && !HEADING_LINE.test(previous) && !tickerCandidates(previous).length) {
    return previous;
  }
  return "";
}

function warning(code, message, action) {
  return { code, message, action, severity: "warning" };
}

function findNearbyFields(lines, index, ticker) {
  const start = Math.max(0, index - 1);
  const end = Math.min(lines.length - 1, index + 3);
  const current = lines[index] || "";
  let shares = sharesFromLine(current);
  let marketValue = null;
  let percent = percentageFromLine(current);
  let currentPrice = priceFromLine(current);
  let valueConfidence = "low";

  for (let cursor = index; cursor <= end; cursor += 1) {
    const line = lines[cursor];
    if (cursor !== index && tickerCandidates(line).length) break;
    shares = shares ?? sharesFromLine(line);
    percent = percent ?? percentageFromLine(line);
    currentPrice = currentPrice ?? priceFromLine(line);
    const explicitlyValue = VALUE_LABEL.test(line);
    if (NEGATIVE_VALUE_CONTEXT.test(line) && !explicitlyValue) continue;
    if (/^\s*total\b/i.test(line)) continue;
    const values = moneyValues(line, explicitlyValue || (cursor > index && /^[$\d,.\s]+$/.test(line)));
    if (values.length) {
      marketValue = values[values.length - 1];
      valueConfidence = cursor === index || explicitlyValue ? "high" : "medium";
      break;
    }
  }

  if (marketValue === null && shares !== null && currentPrice !== null) {
    marketValue = Number((shares * currentPrice).toFixed(2));
    valueConfidence = "medium";
  }

  if (percent === null) {
    for (let cursor = start; cursor <= end; cursor += 1) {
      percent = percentageFromLine(lines[cursor]);
      if (percent !== null) break;
    }
  }

  return { shares, marketValue, percent, valueConfidence, calculatedFromPrice: marketValue !== null && shares !== null && currentPrice !== null && !moneyValues(current).length };
}

function parsePortfolioText(ocrText, totalPortfolioValue = 0) {
  const lines = normalizeOcrLines(ocrText);
  const holdings = [];
  const seen = new Set();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    let candidates = tickerCandidates(line);
    if (!candidates.length && /\b(?:cash|money market|sweep)\b/i.test(line)) {
      const nearbyExplicitCashTicker = lines
        .slice(index + 1, index + 3)
        .some((nearbyLine) => tickerCandidates(nearbyLine).some((ticker) => inferCategory(ticker) === "Cash"));
      if (!nearbyExplicitCashTicker) candidates = ["CASH"];
    }

    for (const candidate of candidates) {
      const ticker = candidate.toUpperCase();
      if (seen.has(ticker)) continue;
      const fields = findNearbyFields(lines, index, ticker);
      const name = probableName(lines, index, ticker);
      const defensible = CATEGORY_MAP[ticker] || fields.marketValue !== null || fields.percent !== null || name;
      if (!defensible) continue;

      const warnings = [];
      if (fields.marketValue === null && fields.percent === null) {
        warnings.push(warning("incomplete-ocr-row", `${ticker} was detected without a confirmed value.`, "Enter its market value or allocation before analyzing."));
      }
      if (fields.calculatedFromPrice) {
        warnings.push(warning("calculated-market-value", `${ticker}'s value was calculated from quantity and current price.`, "Confirm the calculated value."));
      }
      const holdingConfidence = fields.marketValue !== null && fields.valueConfidence === "high"
        ? "medium"
        : "low";
      const marketValue = fields.marketValue ?? (
        fields.percent !== null && Number(totalPortfolioValue) > 0
          ? (fields.percent / 100) * Number(totalPortfolioValue)
          : null
      );

      seen.add(ticker);
      holdings.push({
        ticker,
        name,
        shares: fields.shares,
        marketValue,
        percent: fields.percent,
        category: inferCategory(ticker, name),
        confidence: holdingConfidence,
        fieldConfidence: {
          ticker: CATEGORY_MAP[ticker] ? "high" : "medium",
          name: name ? "medium" : "low",
          shares: fields.shares !== null ? "medium" : "low",
          marketValue: fields.valueConfidence,
          percent: fields.percent !== null ? "medium" : "low",
        },
        warnings,
      });
    }
  }

  return {
    totalEstimated: Number(totalPortfolioValue) || 0,
    holdings,
    recovered: holdings.some((holding) => holding.confidence === "low" || holding.marketValue === null),
  };
}

export {
  BLOCKED_TICKERS,
  CATEGORY_MAP,
  cleanOCRText,
  inferCategory,
  normalizeOcrLines,
  parsePortfolioText,
};
