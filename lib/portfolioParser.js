const CATEGORY_MAP = {
  AAPL: "Growth", MSFT: "Growth", NVDA: "Growth", AMZN: "Growth", META: "Growth",
  GOOGL: "Growth", GOOG: "Growth", TSLA: "Growth", VTI: "Growth", VOO: "Growth",
  SPY: "Growth", QQQ: "Growth", VT: "Growth", VXUS: "Growth", VEA: "Growth",
  AGI: "Growth", DGRO: "Income", DHS: "Income", FTHI: "Income", SCHD: "Income",
  SPYD: "Income", VYM: "Income", JEPI: "Income", JEPQ: "Income", MAIN: "Income",
  O: "Real Estate", DLR: "Real Estate", PLD: "Real Estate", VNQ: "Real Estate",
  BND: "Bonds", AGG: "Bonds", TLT: "Bonds", SGOV: "Bonds",
  CASH: "Cash", SPAXX: "Cash", FDRXX: "Cash", VMFXX: "Cash",
};

const SECURITY_NAMES = {
  AGI: "Alamos Gold",
  DGRO: "iShares Core Dividend Growth ETF",
  DHS: "WisdomTree U.S. High Dividend Fund",
  DLR: "Digital Realty Trust",
  FTHI: "First Trust BuyWrite Income ETF",
  JEPQ: "JPMorgan Nasdaq Equity Premium Income ETF",
  MAIN: "Main Street Capital",
  QQQ: "Invesco QQQ Trust",
  SCHD: "Schwab U.S. Dividend Equity ETF",
  SPAXX: "Fidelity Government Money Market Fund",
  SPYD: "SPDR Portfolio S&P 500 High Dividend ETF",
  VEA: "Vanguard FTSE Developed Markets ETF",
  VTI: "Vanguard Total Stock Market ETF",
  VXUS: "Vanguard Total International Stock ETF",
  VYM: "Vanguard High Dividend Yield ETF",
};

const BLOCKED_TICKERS = new Set([
  "ACCOUNT", "ACCOUNTS", "ALLOCATION", "BALANCE", "BROKERAGE", "BUY", "CASH",
  "CHANGE", "COST", "CURRENT", "DAY", "DESCRIPTION", "DIGITAL", "FIDELITY", "FUND",
  "FUNDS", "GAIN", "HOLDINGS", "INVESTMENTS", "JUNE", "LAST", "LOSS", "MARKET",
  "NAME", "ONLINE", "PERCENT", "PORTFOLIO", "POSITION", "POSITIONS", "PRICE",
  "PROVIDED", "QUANTITY", "SHARES", "STATEMENT", "SYMBOL", "TODAY", "TOTAL",
  "VALUE", "VALUES", "WEIGHT", "EAI", "ETN", "ETNS", "EY", "INC", "LLC", "LTD",
  "ETF", "ETFS", "THE",
]);

const NEGATIVE_VALUE_CONTEXT = /\b(?:cost|gain|loss|today|day change|last price|current price|price)\b/i;
const VALUE_LABEL = /\b(?:market value|current value|position value|balance)\b/i;
const HEADING_LINE = /^(?:account|accounts|allocation|balance|brokerage|description|holdings?|market|market value|positions?|price|today|cost|gain|loss|total|value|symbol|quantity|shares?|statement)\b/i;
const DATE_LINE = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i;

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
  if (HEADING_LINE.test(line) || DATE_LINE.test(line)) return [];
  const matches = String(line).match(/\b[A-Z][A-Z0-9.-]{0,9}\b/g) || [];
  return matches.filter((candidate) => {
    if (BLOCKED_TICKERS.has(candidate) || /^\d/.test(candidate)) return false;
    if (CATEGORY_MAP[candidate]) return true;
    return /^[A-Z]{2,5}(?:[.-][A-Z]{1,2})?$/.test(candidate);
  });
}

function percentageFromLine(line) {
  const match = String(line).match(/(\d{1,3}(?:\.\d{1,4})?)\s*%/);
  const value = match ? numeric(match[1]) : null;
  return value !== null && value > 0 && value <= 100 ? value : null;
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
  if (
    previous
    && /[a-z]/.test(previous)
    && /[A-Za-z]{3}/.test(previous)
    && !HEADING_LINE.test(previous)
    && !DATE_LINE.test(previous)
    && !tickerCandidates(previous).length
  ) {
    return previous;
  }
  return "";
}

function warning(code, message, action) {
  return { code, message, action, severity: "warning" };
}

function findNearbyFields(lines, index) {
  const end = Math.min(lines.length - 1, index + 3);
  const current = lines[index] || "";
  let shares = sharesFromLine(current);
  let marketValue = null;
  let percent = percentageFromLine(current);
  let currentPrice = priceFromLine(current);
  let valueConfidence = "low";
  let explicitValue = VALUE_LABEL.test(current);
  let sameLineValue = false;

  for (let cursor = index; cursor <= end; cursor += 1) {
    const line = lines[cursor];
    if (cursor !== index && tickerCandidates(line).length) break;
    shares = shares ?? sharesFromLine(line);
    percent = percent ?? percentageFromLine(line);
    currentPrice = currentPrice ?? priceFromLine(line);
    const lineExplicitValue = VALUE_LABEL.test(line);
    if (NEGATIVE_VALUE_CONTEXT.test(line) && !lineExplicitValue) continue;
    if (/^\s*total\b/i.test(line) || DATE_LINE.test(line)) continue;
    const positionNumericLine = cursor > index && /^[$\d,.\s%]+$/.test(line);
    const values = moneyValues(line, lineExplicitValue || positionNumericLine || sharesFromLine(line) !== null);
    if (values.length && marketValue === null) {
      marketValue = values[values.length - 1];
      explicitValue = explicitValue || lineExplicitValue;
      sameLineValue = cursor === index || sharesFromLine(line) !== null;
      valueConfidence = sameLineValue || lineExplicitValue ? "high" : "medium";
    }
  }

  const calculatedFromPrice = marketValue === null && shares !== null && currentPrice !== null;
  if (calculatedFromPrice) {
    marketValue = Number((shares * currentPrice).toFixed(2));
    valueConfidence = "medium";
  }

  return {
    shares,
    marketValue,
    percent,
    currentPrice,
    valueConfidence,
    explicitValue,
    sameLineValue,
    calculatedFromPrice,
  };
}

function unrecognizedItem(line, candidate, reason) {
  return {
    text: line,
    candidate: candidate || "",
    reason,
  };
}

function fidelityTickerFromLine(line = "") {
  const parenthesized = String(line).match(/\(([A-Z]{1,5})\)/);
  if (parenthesized) return parenthesized[1];
  const damagedOpeningParenthesis = String(line).match(/^\W*([A-Z]{2,5})\)/);
  return damagedOpeningParenthesis ? damagedOpeningParenthesis[1] : "";
}

function fidelityPositionNumbers(line = "") {
  const matches = String(line).match(/-?\$?\d[\d,]*(?:\.\d+)?/g) || [];
  return matches
    .map((value) => numeric(value.replace(/^-/, "")))
    .filter((value) => value !== null);
}

function alignedFidelityValues(values) {
  let best = null;
  for (let start = 0; start <= values.length - 4; start += 1) {
    const expectedMarketValue = values[start + 1] * values[start + 2];
    const endingMarketValue = values[start + 3];
    if (expectedMarketValue <= 0 || endingMarketValue <= 0) continue;
    const relativeDifference = Math.abs(expectedMarketValue - endingMarketValue) / endingMarketValue;
    if (!best || relativeDifference < best.relativeDifference) {
      best = { start, relativeDifference };
    }
  }
  if (best && best.relativeDifference <= 0.08) return values.slice(best.start);
  return values;
}

function fidelityNumericRow(lines, tickerIndex) {
  for (let cursor = tickerIndex; cursor >= Math.max(0, tickerIndex - 4); cursor -= 1) {
    const line = lines[cursor] || "";
    if (/^\s*total\b/i.test(line) || DATE_LINE.test(line) || /\b(?:ISIN|SEDOL|CUSIP)\b/i.test(line)) continue;
    const values = fidelityPositionNumbers(line);
    if (values.length >= 4) {
      return {
        line,
        values: alignedFidelityValues(values),
      };
    }
  }
  return null;
}

function parseFidelityStatement(lines) {
  const holdings = [];
  const unrecognized = [];
  const seen = new Set();

  lines.forEach((line, index) => {
    const ticker = fidelityTickerFromLine(line);
    if (
      !ticker
      || BLOCKED_TICKERS.has(ticker)
      || (ticker.length === 1 && !CATEGORY_MAP[ticker])
      || seen.has(ticker)
    ) return;
    const row = fidelityNumericRow(lines, index);
    if (!row) {
      unrecognized.push(unrecognizedItem(
        line,
        ticker,
        "We found a possible ticker but could not match it to the Fidelity value columns.",
      ));
      return;
    }

    const marketValue = row.values[3];
    const shares = row.values[1];
    const category = inferCategory(ticker, SECURITY_NAMES[ticker] || row.line);
    const knownSymbol = Boolean(CATEGORY_MAP[ticker]);
    const warnings = [];
    if (!knownSymbol) {
      warnings.push(warning("symbol-uncertain", "Needs review: symbol uncertain.", "Confirm the symbol or remove this row."));
    }
    if (category === "Other") {
      warnings.push(warning("category-unknown", "Needs review: investment type uncertain.", "Choose the closest plain-language investment type."));
    }

    seen.add(ticker);
    holdings.push({
      ticker,
      name: SECURITY_NAMES[ticker] || "",
      shares,
      marketValue,
      percent: null,
      category,
      confidence: knownSymbol && category !== "Other" ? "high" : "low",
      confidenceReason: knownSymbol && category !== "Other"
        ? "The ticker and Fidelity ending market value were matched from the same statement row."
        : "The Fidelity row was found, but the investment identity still needs confirmation.",
      fieldConfidence: {
        ticker: knownSymbol ? "high" : "low",
        name: SECURITY_NAMES[ticker] ? "high" : "low",
        shares: "high",
        marketValue: "high",
        percent: "low",
      },
      warnings,
    });
  });

  return { holdings, unrecognized };
}

function parsePortfolioText(ocrText, totalPortfolioValue = 0, options = {}) {
  const lines = normalizeOcrLines(ocrText);
  if (options.brokerId === "fidelity") {
    const fidelity = parseFidelityStatement(lines);
    if (fidelity.holdings.length) {
      return {
        totalEstimated: fidelity.holdings.reduce((sum, holding) => sum + holding.marketValue, 0),
        holdings: fidelity.holdings,
        unrecognized: fidelity.unrecognized,
        recovered: fidelity.holdings.some((holding) => holding.confidence === "low"),
      };
    }
  }
  const holdings = [];
  const unrecognized = [];
  const seen = new Set();
  const recognizedBroker = Boolean(options.recognizedBroker);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    let candidates = tickerCandidates(line);
    if (!candidates.length && /\b(?:cash|money market|sweep)\b/i.test(line) && moneyValues(line, true).length) {
      candidates = ["CASH"];
    }

    for (const candidate of candidates) {
      const ticker = candidate.toUpperCase();
      const fields = findNearbyFields(lines, index);
      const name = probableName(lines, index, ticker);
      const knownSymbol = Boolean(CATEGORY_MAP[ticker]);
      const hasValueEvidence = fields.marketValue !== null || fields.percent !== null;
      const hasSharesAndPrice = fields.shares !== null && fields.currentPrice !== null;
      const structuredUnknownRow = Boolean(name) && (
        (hasValueEvidence && fields.sameLineValue)
        || (hasSharesAndPrice && fields.shares !== null)
      );
      const defensible = (knownSymbol && (hasValueEvidence || hasSharesAndPrice)) || structuredUnknownRow;

      if (!defensible) {
        if (unrecognized.length < 50) {
          unrecognized.push(unrecognizedItem(
            line,
            ticker,
            hasValueEvidence ? "Symbol could not be tied to a defensible position row." : "Required numeric position data was missing.",
          ));
        }
        continue;
      }

      const marketValue = fields.marketValue ?? (
        fields.percent !== null && Number(totalPortfolioValue) > 0
          ? (fields.percent / 100) * Number(totalPortfolioValue)
          : null
      );
      const evidenceKey = `${ticker}|${marketValue === null ? "" : marketValue.toFixed(2)}|${fields.percent ?? ""}`;
      if (seen.has(evidenceKey)) continue;
      seen.add(evidenceKey);

      const category = inferCategory(ticker, name);
      const warnings = [];
      let confidence = "medium";
      let confidenceReason = "Symbol and numeric position data were found, but part of the row was inferred.";

      if (!knownSymbol) {
        confidence = "low";
        confidenceReason = "The symbol is not in the recognized symbol map and needs confirmation.";
        warnings.push(warning("symbol-uncertain", "Needs review: symbol uncertain.", "Confirm the symbol or remove this row."));
      } else if (recognizedBroker && (fields.sameLineValue || fields.explicitValue) && !fields.calculatedFromPrice) {
        confidence = "high";
        confidenceReason = "Symbol and required numeric data were extracted from a recognized broker position row.";
      }

      if (category === "Other") {
        confidence = "low";
        warnings.push(warning("category-unknown", "Needs review: category unknown.", "Choose the correct category."));
      }
      if (fields.calculatedFromPrice) {
        warnings.push(warning("calculated-market-value", "Needs review: market value was calculated from shares and price.", "Confirm the calculated market value."));
      }

      holdings.push({
        ticker,
        name,
        shares: fields.shares,
        marketValue,
        percent: fields.percent,
        category,
        confidence,
        confidenceReason,
        fieldConfidence: {
          ticker: knownSymbol ? "high" : "low",
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
    unrecognized,
    recovered: holdings.some((holding) => holding.confidence === "low"),
  };
}

export {
  BLOCKED_TICKERS,
  CATEGORY_MAP,
  cleanOCRText,
  inferCategory,
  normalizeOcrLines,
  parsePortfolioText,
  tickerCandidates,
};
