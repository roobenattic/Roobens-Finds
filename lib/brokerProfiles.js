import { candidateFromHolding } from "./documentIntelligence.js";

const BASE_ALIASES = {
  symbol: ["symbol", "ticker", "security symbol"],
  name: ["description", "name", "security", "security description", "investment name"],
  shares: ["quantity", "shares", "qty", "current quantity"],
  price: ["price", "last price", "current price"],
  marketValue: ["market value", "value", "current value", "marketvalue"],
  costBasis: ["cost basis", "total cost basis", "cost basis total"],
  weight: ["allocation", "percent", "percentage", "weight", "% of account"],
};

const BROKER_PROFILES = [
  {
    id: "fidelity",
    label: "Fidelity",
    cues: [/fidelity/i, /fidelity brokerage services/i, /account name\/number/i],
    aliases: { symbol: ["symbol"], shares: ["quantity"], marketValue: ["current value"], weight: ["percent of account"] },
  },
  {
    id: "schwab",
    label: "Charles Schwab",
    cues: [/charles schwab/i, /\bschwab\b/i, /positions for account/i],
    aliases: { symbol: ["symbol"], shares: ["quantity"], marketValue: ["market value"], weight: ["% of acct"] },
  },
  {
    id: "vanguard",
    label: "Vanguard",
    cues: [/\bvanguard\b/i, /investment name/i, /total assets/i],
    aliases: { symbol: ["symbol"], name: ["investment name"], shares: ["shares"], marketValue: ["total value"] },
  },
  {
    id: "robinhood",
    label: "Robinhood",
    cues: [/\brobinhood\b/i, /robinhood financial/i, /portfolio diversity/i],
    aliases: { symbol: ["symbol"], shares: ["quantity"], marketValue: ["equity"], weight: ["portfolio diversity"] },
  },
  {
    id: "m1-finance",
    label: "M1 Finance",
    cues: [/\bm1 finance\b/i, /\bm1 holdings\b/i, /slice name/i],
    aliases: { symbol: ["symbol"], shares: ["quantity"], marketValue: ["value"], weight: ["actual weight"] },
  },
  {
    id: "public",
    label: "Public",
    cues: [/\bpublic\.com\b/i, /public investing/i, /open to the public investing/i],
    aliases: { symbol: ["symbol"], shares: ["quantity"], marketValue: ["market value"] },
  },
  {
    id: "etrade",
    label: "E*TRADE",
    cues: [/e\*trade/i, /etrade securities/i, /etrade\.com/i],
    aliases: { symbol: ["symbol"], shares: ["quantity"], marketValue: ["market value"], price: ["last price"] },
  },
];

function normalized(value) {
  return String(value || "").trim().toLowerCase();
}

function mergeAliases(profile) {
  return Object.entries(BASE_ALIASES).reduce((result, [field, aliases]) => {
    result[field] = [...new Set([...(profile?.aliases?.[field] || []), ...aliases].map(normalized))];
    return result;
  }, {});
}

function detectBroker({ text = "", headers = [] } = {}) {
  const evidence = `${text}\n${headers.join(" ")}`.slice(0, 20000);
  let best = null;
  for (const profile of BROKER_PROFILES) {
    const matches = profile.cues.filter((cue) => cue.test(evidence)).length;
    if (matches > (best?.matches || 0)) best = { profile, matches };
  }
  if (!best?.matches) {
    return {
      id: "generic",
      label: "Generic import",
      confidence: "low",
      message: "We could not confirm the statement provider, so we used a general document layout.",
      aliases: mergeAliases(null),
    };
  }
  return {
    id: best.profile.id,
    label: best.profile.label,
    confidence: best.matches >= 2 ? "high" : "medium",
    message: `Statement provider: ${best.profile.label} (${best.matches >= 2 ? "strong" : "possible"} match from document evidence).`,
    aliases: mergeAliases(best.profile),
  };
}

function numberValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/[()%$,\s]/g, "").replace(/^--$/, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function valueFor(row, aliases) {
  const key = Object.keys(row).find((candidate) => aliases.includes(normalized(candidate)));
  return key ? row[key] : undefined;
}

function normalizeBrokerRows(rows = [], detection, sourceRef = "Imported file") {
  const aliases = detection?.aliases || mergeAliases(null);
  return rows.reduce((holdings, row, index) => {
    const symbol = String(valueFor(row, aliases.symbol) || "").trim().toUpperCase();
    const name = String(valueFor(row, aliases.name) || "").trim();
    const shares = numberValue(valueFor(row, aliases.shares));
    const price = numberValue(valueFor(row, aliases.price));
    const suppliedValue = numberValue(valueFor(row, aliases.marketValue));
    const marketValue = suppliedValue ?? (shares !== null && price !== null ? shares * price : null);
    const costBasis = numberValue(valueFor(row, aliases.costBasis));
    const weight = numberValue(valueFor(row, aliases.weight));
    if ((!symbol && !name) || (marketValue === null && weight === null)) return holdings;
    const warnings = [{
      code: !symbol ? "missing-symbol" : "unverified-security",
      message: !symbol
        ? `Row ${index + 1} has no readable ticker.`
        : `The file reads ${symbol}; security verification is still required.`,
      action: "Review the verification result before analysis.",
      severity: "warning",
    }];
    const holding = {
      id: `holding-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
      ticker: symbol,
      symbol,
      name,
      shares,
      marketValue,
      costBasis,
      percent: weight,
      weight,
      category: "Needs review",
      assetClass: "Needs review",
      confidence: "low",
      sourceRef,
      warnings,
      rowEvidence: Object.entries(row).map(([key, value]) => `${key}: ${String(value ?? "")}`).join(" | ").slice(0, 1000),
      verification: {
        status: "unresolved",
        evidence: [symbol ? `Ticker ${symbol} was read from the CSV row.` : "No ticker was read from this CSV row."],
      },
    };
    holding.evidence = candidateFromHolding(holding, "csv");
    holdings.push(holding);
    return holdings;
  }, []);
}

export { BASE_ALIASES, BROKER_PROFILES, detectBroker, mergeAliases, normalizeBrokerRows };
