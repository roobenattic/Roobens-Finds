function hasIdentity(holding = {}) {
  return Boolean(String(holding.ticker || holding.name || "").trim());
}

function hasPositionValue(holding = {}) {
  return Number(holding.marketValue) > 0 || Number(holding.percent) > 0;
}

function holdingReviewState(holding = {}) {
  if (!hasIdentity(holding) || !hasPositionValue(holding) || holding.category === "Needs review") {
    return {
      status: "Needs editing",
      tone: "error",
      needsEditing: true,
      needsConfirmation: false,
    };
  }
  if (holding.confidence === "low" || (holding.warnings || []).some((item) => item.severity === "warning")) {
    return {
      status: "Confirm",
      tone: "warning",
      needsEditing: false,
      needsConfirmation: true,
    };
  }
  return {
    status: "Ready",
    tone: "success",
    needsEditing: false,
    needsConfirmation: false,
  };
}

function allocationForHolding(holding = {}, portfolioTotal = 0) {
  const marketValue = Number(holding.marketValue) || 0;
  const total = Number(portfolioTotal) || 0;
  if (marketValue > 0 && total > 0) return (marketValue / total) * 100;
  return Number(holding.percent) || 0;
}

function buildPortfolioReadiness({ holdings = [], portfolioTotal = 0, reviewed = false } = {}) {
  const states = holdings.map(holdingReviewState);
  const validRows = states.filter((state) => !state.needsEditing).length;
  const editingRows = states.filter((state) => state.needsEditing).length;
  const confirmationRows = states.filter((state) => state.needsConfirmation).length;
  const hasHoldings = holdings.length > 0;
  const hasTotal = Number(portfolioTotal) > 0;
  const needsReviewConfirmation = confirmationRows > 0;
  const confirmed = editingRows === 0 && (!needsReviewConfirmation || reviewed);
  const completed = [
    { label: "Portfolio data added", done: hasHoldings, weight: 20 },
    { label: "Holding details complete", done: hasHoldings && editingRows === 0, weight: 35 },
    { label: "Portfolio total available", done: hasTotal, weight: 25 },
    { label: "Uncertain details confirmed", done: hasHoldings && confirmed, weight: 20 },
  ];
  const score = completed.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  const actions = [];
  if (!hasHoldings) actions.push("Upload a portfolio file or add one holding.");
  if (editingRows > 0) actions.push(`Complete ${editingRows} holding ${editingRows === 1 ? "row" : "rows"}.`);
  if (!hasTotal) actions.push("Add a portfolio total or market values.");
  if (needsReviewConfirmation && !reviewed) {
    actions.push(`Confirm ${confirmationRows} uncertain ${confirmationRows === 1 ? "holding" : "holdings"}.`);
  }
  return {
    score,
    completed,
    actions,
    editingRows,
    confirmationRows,
    validRows,
    ready: hasHoldings && editingRows === 0 && hasTotal && confirmed,
    needsReviewConfirmation,
  };
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
  getImportErrorGuidance,
  getPlanGuidance,
  hasIdentity,
  hasPositionValue,
  holdingReviewState,
  uploadKey,
};
