// Kept as an empty compatibility export. Security identity and category are
// resolved independently on the server; a static ticker map is not evidence.
const CATEGORY_MAP = Object.freeze({});

const BLOCKED_TICKERS = new Set([
  "ACCOUNT", "ACCOUNTS", "ALLOCATION", "BALANCE", "BUY", "CASH", "CHANGE",
  "COST", "CURRENT", "DAY", "DESCRIPTION", "GAIN", "HOLDINGS", "LAST", "LOSS",
  "MARKET", "NAME", "PERCENT", "PORTFOLIO", "POSITION", "POSITIONS", "PRICE",
  "QUANTITY", "SHARES", "SYMBOL", "TODAY", "TOTAL", "VALUE", "VALUES", "WEIGHT",
  "INC", "LLC", "LTD", "ETF", "ETFS", "THE", "FIRST", "TRUST", "GOLD",
  "COM", "NPV", "CL", "EAI", "EAIS", "EY", "ISIN", "CUSIP", "FIGI",
  "MONEY", "FUND", "FUNDS", "STOCK", "DIV", "DIVIDEND", "YLD",
]);

const NEGATIVE_VALUE_CONTEXT = /\b(?:cost|gain|loss|today|day change|last price|current price|price)\b/i;
const VALUE_LABEL = /\b(?:market value|current value|position value|balance)\b/i;
const HEADING_LINE = /^(?:account|accounts|holdings?|market|market value|positions?|price|today|cost|gain|loss|total|value|symbol|quantity|shares?)\b/i;
const TABLE_FIELD_WORD = /\b(?:symbol|ticker|code|units?|value|investment|quantity|shares?|price|description|security)\b/gi;

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

function inferCategory(_ticker = "", _name = "", verifiedInstrument = null) {
  return verifiedInstrument?.category || "Needs review";
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
    if (candidate.length === 1 && !new RegExp(`\\(${candidate}(?:\\)|\\b)`).test(String(line))) return false;
    return candidate.length <= 5;
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
  const previousHeaderFields = previous.match(TABLE_FIELD_WORD) || [];
  if (previous && /[A-Za-z]{3}/.test(previous) && previousHeaderFields.length < 2 && !HEADING_LINE.test(previous) && !tickerCandidates(previous).length) {
    return previous;
  }
  return "";
}

function warning(code, message, action) {
  return { code, message, action, severity: "warning" };
}

function hasTickerEvidence(line, ticker) {
  const escaped = ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const standalone = new RegExp(`^${escaped}$`).test(line);
  const parenthetical = new RegExp(`\\(${escaped}(?:\\)|\\b)`).test(line)
    || new RegExp(`\\b${escaped}\\)`).test(line);
  const numericMatch = line.match(new RegExp(`^(.*?)\\b${escaped}\\s+[-$\\d]`));
  const numericRow = Boolean(numericMatch && (!numericMatch[1] || /[a-z]/.test(numericMatch[1])));
  const suffix = line.match(new RegExp(`^(.*?)\\b${escaped}\\s*$`));
  const labeledSuffix = Boolean(suffix?.[1] && /[a-z]/.test(suffix[1]));
  return standalone || parenthetical || numericRow || labeledSuffix;
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

  const cursors = [
    index,
    ...Array.from({ length: end - index }, (_, offset) => index + offset + 1),
    ...(start < index ? [start] : []),
  ];
  let forwardBlocked = false;
  for (const cursor of cursors) {
    const line = lines[cursor];
    if (cursor > index && (forwardBlocked || tickerCandidates(line).length)) {
      forwardBlocked = true;
      continue;
    }
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
  const positionHeading = /^(?:holdings?|positions?)(?:\s*\(continued\))?$/i;
  const hasPositionSection = lines.some((line) => positionHeading.test(line));
  let inPositionSection = !hasPositionSection;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (positionHeading.test(line)) {
      inPositionSection = true;
      continue;
    }
    if (/^(?:activity|transactions?|securities bought|dividends?|interest|orders?|history)\b/i.test(line)) {
      inPositionSection = false;
    }
    if (!inPositionSection) continue;
    let candidates = tickerCandidates(line);
    if (!candidates.length && /^(?:cash|cash balance|cash position|sweep cash)\b/i.test(line)) candidates = ["CASH"];

    for (const candidate of candidates) {
      const ticker = candidate.toUpperCase();
      if (seen.has(ticker)) continue;
      if (ticker !== "CASH" && !hasTickerEvidence(line, ticker)) continue;
      const fields = findNearbyFields(lines, index, ticker);
      const name = probableName(lines, index, ticker);
      const unavailablePosition = lines.slice(index, index + 3).some((nearby) =>
        /\b(?:position|value|shares?)\s+(?:unavailable|not available|missing)\b/i.test(nearby),
      );
      const defensible = fields.marketValue !== null || fields.percent !== null || unavailablePosition;
      if (!defensible) continue;

      const warnings = [
        warning(
          "unverified-security",
          `The document reads ${ticker}, but its identity has not been independently verified yet.`,
          "Review the verification result before analyzing.",
        ),
      ];
      if (fields.marketValue === null && fields.percent === null) {
        warnings.push(warning("incomplete-ocr-row", `${ticker} was detected without a confirmed value.`, "Enter its market value or allocation before analyzing."));
      }
      if (fields.calculatedFromPrice) {
        warnings.push(warning("calculated-market-value", `${ticker}'s value was calculated from quantity and current price.`, "Confirm the calculated value."));
      }
      const holdingConfidence = "low";
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
        category: "Needs review",
        confidence: holdingConfidence,
        fieldConfidence: {
          ticker: "medium",
          name: name ? "medium" : "low",
          shares: fields.shares !== null ? "medium" : "low",
          marketValue: fields.valueConfidence,
          percent: fields.percent !== null ? "medium" : "low",
        },
        warnings,
        rowEvidence: lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 3)).join("\n").slice(0, 1000),
        verification: {
          status: "unresolved",
          evidence: [`The ${fields.valueConfidence}-confidence ${ticker} token came from document text.`],
        },
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
