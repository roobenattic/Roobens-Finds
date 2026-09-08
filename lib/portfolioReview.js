function hasIdentity(holding = {}) {
  return Boolean(String(holding.ticker || holding.name || "").trim());
}

function hasPositionValue(holding = {}) {
  return Number(holding.marketValue) > 0 || Number(holding.percent) > 0;
}

function holdingReviewState(holding = {}) {
  const issues = [];
  if (!hasIdentity(holding)) issues.push("symbol uncertain");
  if (!hasPositionValue(holding)) issues.push("market value missing");
  if (holding.category === "Needs review" || holding.category === "Other") issues.push("category unknown");
  for (const item of holding.warnings || []) {
    if (item.code === "symbol-uncertain" && !issues.includes("symbol uncertain")) issues.push("symbol uncertain");
    if (item.code === "category-unknown" && !issues.includes("category unknown")) issues.push("category unknown");
    if (item.code === "calculated-market-value" && !issues.includes("confirm calculated market value")) {
      issues.push("confirm calculated market value");
    }
    if (item.code === "user-corrected" && !issues.includes("confirm corrected details")) {
      issues.push("confirm corrected details");
    }
  }
  if (issues.some((issue) => ["symbol uncertain", "market value missing", "category unknown"].includes(issue))) {
    return {
      status: "Needs review",
      tone: "error",
      needsEditing: true,
      needsConfirmation: false,
      issues,
      exactIssue: `Needs review: ${issues[0]}`,
    };
  }
  if (holding.confidence === "low" || issues.length) {
    return {
      status: "Confirm",
      tone: "warning",
      needsEditing: false,
      needsConfirmation: true,
      issues,
      exactIssue: `Needs review: ${issues[0] || "extracted data uncertain"}`,
    };
  }
  return {
    status: "Ready",
    tone: "success",
    needsEditing: false,
    needsConfirmation: false,
    issues: [],
    exactIssue: "Ready",
  };
}

function allocationForHolding(holding = {}, portfolioTotal = 0) {
  const marketValue = Number(holding.marketValue) || 0;
  const total = Number(portfolioTotal) || 0;
  if (marketValue > 0 && total > 0) return (marketValue / total) * 100;
  return Number(holding.percent) || 0;
}

function buildPortfolioReadiness({
  holdings = [],
  portfolioTotal = 0,
  filesProcessed = 0,
  unrecognizedCount = 0,
  consent = false,
} = {}) {
  const states = holdings.map(holdingReviewState);
  const editingRows = states.filter((state) => state.needsEditing).length;
  const confirmationRows = states.filter((state) => state.needsConfirmation).length;
  const hasHoldings = holdings.length > 0;
  const hasTotal = Number(portfolioTotal) > 0;
  const blockers = [];
  holdings.forEach((holding, index) => {
    const state = states[index];
    if (state.status === "Ready") return;
    const label = holding.ticker || holding.name || `holding ${index + 1}`;
    blockers.push(state.needsConfirmation
      ? `Confirm ${state.issues[0] || "the extracted data"} for ${label}.`
      : `Correct ${state.issues[0] || "the missing data"} for ${label}.`);
  });
  if (!hasHoldings) blockers.push("Add at least one defensible holding.");
  if (!hasTotal) blockers.push("Add market values so the portfolio total can be calculated.");
  const dataReady = blockers.length === 0;
  const completed = [
    {
      label: filesProcessed > 0
        ? `${filesProcessed} file${filesProcessed === 1 ? "" : "s"} processed`
        : "Portfolio data added manually",
      done: filesProcessed > 0 || hasHoldings,
      weight: 15,
    },
    { label: `${holdings.length} likely holding${holdings.length === 1 ? "" : "s"} found`, done: hasHoldings, weight: 25 },
    { label: "Holding details confirmed", done: hasHoldings && editingRows === 0 && confirmationRows === 0, weight: 35 },
    { label: "Portfolio total available", done: hasTotal, weight: 15 },
    { label: "Allocation calculated", done: hasTotal && hasHoldings, weight: 10 },
  ];
  const score = completed.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  return {
    score,
    completed,
    actions: blockers,
    blockers,
    editingRows,
    confirmationRows,
    unrecognizedCount,
    dataReady,
    consentEnabled: dataReady,
    ready: dataReady && consent,
  };
}

function dedupeWarnings(warnings = []) {
  const seen = new Set();
  return warnings.filter((item) => {
    const key = `${item.code}|${item.message}|${item.action || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const PLAN_GUIDANCE = {
  "long-term-growth:income": {
    message: "An income strategy may trade some long-term growth for current income.",
    suggestion: "growth",
  },
  "income:growth": {
    message: "A growth strategy may produce less current income and more price fluctuation.",
    suggestion: "income",
  },
  "preservation:growth": {
    message: "A growth strategy can conflict with capital preservation, especially over shorter timelines.",
    suggestion: "balanced",
  },
};

function getPlanGuidance({ goal, strategy, timelineYears } = {}) {
  const direct = PLAN_GUIDANCE[`${goal}:${strategy}`];
  if (direct) return direct;
  if (strategy === "growth" && Number(timelineYears) <= 3) {
    return {
      message: "A growth strategy can be volatile over a timeline of three years or less.",
      suggestion: "balanced",
    };
  }
  return null;
}

const ERROR_GUIDANCE = {
  "NO-POSITIONS-01": {
    title: "We could read the file, but could not find clear holdings.",
    why: "The layout may not show a ticker with a value, or the image may be too unclear.",
    next: "Try a clearer screenshot or CSV, or add the missing holding manually.",
  },
  "FILE-EMPTY-01": {
    title: "This file does not contain any portfolio data.",
    why: "The export may have been interrupted or saved as an empty file.",
    next: "Export it again, then choose the new file.",
  },
  "FILE-TYPE-01": {
    title: "This file format is not supported.",
    why: "The planner reads PNG, JPG, WEBP, PDF, CSV, and TXT files.",
    next: "Choose one of those formats or add a holding manually.",
  },
  "PDF-PASSWORD-01": {
    title: "This PDF is locked.",
    why: "The planner cannot open password-protected portfolio documents.",
    next: "Export an unlocked copy, or use screenshots or CSV.",
  },
};

function getImportErrorGuidance(error = {}) {
  return ERROR_GUIDANCE[error.code] || {
    title: "We could not finish reading this file.",
    why: "The browser could not reliably process part of the document.",
    next: "Try the file once more, use a clearer screenshot or CSV, or add a holding manually.",
  };
}

function uploadKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export {
  allocationForHolding,
  buildPortfolioReadiness,
  dedupeWarnings,
  getImportErrorGuidance,
  getPlanGuidance,
  hasIdentity,
  hasPositionValue,
  holdingReviewState,
  uploadKey,
};
