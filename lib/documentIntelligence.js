const SOURCE_CONFIDENCE = {
  csv: 0.98,
  "pdf-text": 0.9,
  ocr: 0.62,
  vision: 0.72,
};

const MIME_SIGNATURES = [
  { type: "pdf", mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { type: "png", mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "jpeg", mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
];

function boundedConfidence(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

function extractedField(value, source, options = {}) {
  return {
    value: value === undefined ? null : value,
    confidence: boundedConfidence(options.confidence, SOURCE_CONFIDENCE[source] || 0.5),
    source,
    ...(Number.isInteger(options.page) ? { page: options.page } : {}),
    ...(options.rawText ? { rawText: String(options.rawText).slice(0, 500) } : {}),
    ...(options.bbox ? { bbox: options.bbox } : {}),
  };
}

function detectFileType(bytes = new Uint8Array(), declaredMime = "") {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (const signature of MIME_SIGNATURES) {
    if (signature.bytes.every((byte, index) => data[index] === byte)) return signature;
  }
  const ascii = new TextDecoder().decode(data.slice(0, 512)).trimStart();
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46
    && data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
    return { type: "webp", mime: "image/webp" };
  }
  if (/ftyp(?:heic|heix|hevc|hevx|mif1|msf1)/i.test(ascii)) {
    return { type: "heic", mime: "image/heic" };
  }
  if (/^\s*[\w "%#.-]+(?:,|\t)/.test(ascii) && ascii.includes("\n")) {
    return { type: "csv", mime: "text/csv" };
  }
  if (/^image\/(?:heic|heif)$/i.test(declaredMime)) return { type: "heic", mime: declaredMime };
  if (/^text\/plain$/i.test(declaredMime)) return { type: "txt", mime: "text/plain" };
  return { type: "unknown", mime: declaredMime || "application/octet-stream" };
}

function candidateFromHolding(holding, source = "ocr", options = {}) {
  const rawText = String(options.rowEvidence || holding.rowEvidence || "").slice(0, 1000);
  const fieldConfidence = holding.fieldConfidence || {};
  const confidenceFor = (field) => {
    const value = fieldConfidence[field];
    if (typeof value === "number") return boundedConfidence(value);
    if (value === "high") return 0.92;
    if (value === "medium") return 0.72;
    if (value === "low") return 0.42;
    return SOURCE_CONFIDENCE[source] || 0.5;
  };
  return {
    symbol: extractedField(holding.ticker || holding.symbol || null, source, {
      confidence: confidenceFor("ticker"),
      rawText,
      page: options.page,
    }),
    name: extractedField(holding.name || null, source, {
      confidence: confidenceFor("name"),
      rawText,
      page: options.page,
    }),
    shares: extractedField(holding.shares ?? null, source, {
      confidence: confidenceFor("shares"),
      rawText,
      page: options.page,
    }),
    marketValue: extractedField(holding.marketValue ?? null, source, {
      confidence: confidenceFor("marketValue"),
      rawText,
      page: options.page,
    }),
    weight: extractedField(holding.percent ?? holding.weight ?? null, source, {
      confidence: confidenceFor("percent"),
      rawText,
      page: options.page,
    }),
    identifiers: Array.isArray(holding.identifiers) ? holding.identifiers : [],
    rowEvidence: rawText,
  };
}

function normalizedSymbol(value) {
  return String(value || "").trim().toUpperCase();
}

function closeEnough(left, right, tolerance = 0.01) {
  const a = Number(left);
  const b = Number(right);
  if (!(a > 0) || !(b > 0)) return false;
  return Math.abs(a - b) / Math.max(a, b) <= tolerance;
}

function duplicateAssessment(left = {}, right = {}) {
  const leftIdentifier = (left.identifiers || []).find((item) => item?.value?.value);
  const rightIdentifier = (right.identifiers || []).find((item) => item?.value?.value);
  if (leftIdentifier && rightIdentifier) {
    const sameIdentifier = leftIdentifier.value.type === rightIdentifier.value.type
      && leftIdentifier.value.value === rightIdentifier.value.value;
    return sameIdentifier
      ? { status: "duplicate", evidence: ["Durable security identifiers match."] }
      : { status: "distinct", evidence: ["Durable security identifiers differ."] };
  }
  const sameSymbol = normalizedSymbol(left.ticker || left.symbol) === normalizedSymbol(right.ticker || right.symbol);
  if (!sameSymbol || !normalizedSymbol(left.ticker || left.symbol)) {
    return { status: "distinct", evidence: ["Symbols do not match."] };
  }
  const sameValue = closeEnough(left.marketValue, right.marketValue, 0.005);
  const sameShares = closeEnough(left.shares, right.shares, 0.0001);
  if (sameValue && sameShares) {
    return { status: "duplicate", evidence: ["Symbol, shares, and market value agree."] };
  }
  return {
    status: "possible",
    evidence: ["The symbol matches, but position facts do not agree closely enough to merge automatically."],
  };
}

export {
  SOURCE_CONFIDENCE,
  boundedConfidence,
  candidateFromHolding,
  detectFileType,
  duplicateAssessment,
  extractedField,
};
