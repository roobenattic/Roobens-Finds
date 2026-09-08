const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

function categoryFromInstrument(instrument = {}) {
  const description = [
    instrument.securityType,
    instrument.securityType2,
    instrument.marketSector,
    instrument.name,
  ].filter(Boolean).join(" ").toLowerCase();
  if (/money market|m-mkt|cash/.test(description)) return "Cash";
  if (/bond|treasury|government|fixed income|note|corp|muni/.test(description)) return "Bonds";
  if (/reit|real estate/.test(description)) return "Real Estate";
  if (/etf|fund/.test(description)) return /dividend|income/.test(description) ? "Income" : "Growth";
  if (/common stock|equity|preferred/.test(description)) return "Growth";
  return "Other";
}

function instrumentFromFigi(value = {}) {
  return {
    figi: value.figi || null,
    compositeFigi: value.compositeFIGI || null,
    symbol: value.ticker || "",
    name: value.name || "",
    exchange: value.exchCode || "",
    securityType: value.securityType || value.securityType2 || "",
    securityType2: value.securityType2 || "",
    marketSector: value.marketSector || "",
    category: categoryFromInstrument(value),
    source: "OpenFIGI",
  };
}

function distinctInstruments(values = []) {
  const seen = new Map();
  for (const value of values) {
    const instrument = instrumentFromFigi(value);
    const key = instrument.compositeFigi || instrument.figi || `${instrument.symbol}:${instrument.exchange}:${instrument.securityType}`;
    if (key && !seen.has(key)) seen.set(key, instrument);
  }
  return [...seen.values()];
}

function resolutionFromMapping(job, response = {}) {
  const instruments = distinctInstruments(response.data || []);
  const evidence = [`OpenFIGI mapping used ${job.idType} evidence.`];
  if (!instruments.length) {
    return {
      status: "unresolved",
      evidence: [...evidence, response.warning || response.error || "No verified instrument matched."],
    };
  }
  if (instruments.length === 1) {
    return {
      status: "verified",
      instrument: instruments[0],
      confidence: job.idType === "TICKER" ? 0.86 : 0.97,
      evidence: [...evidence, `Matched ${instruments[0].name || instruments[0].symbol} on ${instruments[0].exchange || "the reported market"}.`],
    };
  }
  return {
    status: "ambiguous",
    candidates: instruments.slice(0, 8),
    evidence: [...evidence, `${instruments.length} possible instruments matched; no guess was selected.`],
  };
}

function mappingJob(candidate = {}) {
  const identifiers = candidate.identifiers || [];
  const durable = identifiers.find((field) => ["CUSIP", "ISIN", "FIGI"].includes(field?.value?.type) && field?.value?.value);
  if (durable) {
    const types = { CUSIP: "ID_CUSIP", ISIN: "ID_ISIN", FIGI: "ID_BB_GLOBAL" };
    return { idType: types[durable.value.type], idValue: durable.value.value };
  }
  const symbol = String(candidate.symbol?.value || candidate.ticker || candidate.symbol || "").trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol)) return null;
  return {
    idType: "TICKER",
    idValue: symbol,
    ...(candidate.exchange ? { exchCode: candidate.exchange } : {}),
    ...(candidate.currency ? { currency: candidate.currency } : {}),
  };
}

function cacheKey(job) {
  return JSON.stringify(job);
}

function getCached(job) {
  const entry = cache.get(cacheKey(job));
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) cache.delete(cacheKey(job));
    return null;
  }
  return entry.value;
}

function setCached(job, value) {
  cache.set(cacheKey(job), { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function resolveSecurityCandidates(candidates = [], options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("Security lookup is unavailable.");
  const results = Array(candidates.length);
  const pending = [];

  candidates.forEach((candidate, index) => {
    const job = mappingJob(candidate);
    if (!job) {
      results[index] = { status: "unresolved", evidence: ["No readable ticker or durable identifier was available."] };
      return;
    }
    const cached = getCached(job);
    if (cached) {
      results[index] = cached;
      return;
    }
    pending.push({ index, job });
  });

  const batchSize = options.apiKey ? 100 : 5;
  for (let offset = 0; offset < pending.length; offset += batchSize) {
    const batch = pending.slice(offset, offset + batchSize);
    let response;
    try {
      response = await fetchImpl("https://api.openfigi.com/v3/mapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.apiKey ? { "X-OPENFIGI-APIKEY": options.apiKey } : {}),
        },
        body: JSON.stringify(batch.map(({ job }) => job)),
        signal: options.signal,
      });
    } catch {
      batch.forEach(({ index }) => {
        results[index] = { status: "unresolved", evidence: ["Security verification is temporarily unavailable."] };
      });
      continue;
    }
    if (!response.ok) {
      const reason = response.status === 429 ? "Security verification is rate-limited; try again shortly." : "Security verification is temporarily unavailable.";
      batch.forEach(({ index }) => {
        results[index] = { status: "unresolved", evidence: [reason] };
      });
      continue;
    }
    const payload = await response.json();
    batch.forEach(({ index, job }, batchIndex) => {
      const resolution = resolutionFromMapping(job, payload[batchIndex] || {});
      results[index] = resolution;
      setCached(job, resolution);
    });
  }
  return results;
}

export {
  categoryFromInstrument,
  instrumentFromFigi,
  mappingJob,
  resolutionFromMapping,
  resolveSecurityCandidates,
};
