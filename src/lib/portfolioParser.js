// portfolioParser.js

const CATEGORY_MAP = {
  // REIT
  O: "REIT",
  DLR: "REIT",
  PLD: "REIT",
  GNL: "REIT",

  // Dividend
  SCHD: "Dividend",
  VYM: "Dividend",
  DHS: "Dividend",
  MAIN: "Dividend",
  JEPQ: "Dividend",
  FTHI: "Dividend",
  SBR: "Dividend",

  // Growth / Core
  VTI: "Growth",
  QQQ: "Growth",
  VXUS: "Growth",
  VEA: "Growth",

  // Other
  AGI: "Other",
  SPAXX: "Cash",
};

function cleanOCRText(text = "") {
  return text
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePortfolioText(ocrText, totalPortfolioValue = 10000) {
  const text = cleanOCRText(ocrText);

  // Match eg:
  // VYM 24.24%
  // O 18.55%
  // SCHD 9.48%
  // SPAXX 4.25%
  const regex = /\b([A-Z]{1,5})\b\s+(\d{1,3}(?:\.\d{1,2})?)%/g;

  const holdings = [];
  const seen = new Set();

  let match;
  while ((match = regex.exec(text)) !== null) {
    const ticker = match[1];
    const percent = parseFloat(match[2]);

    if (!ticker || isNaN(percent)) continue;
    if (seen.has(`${ticker}-${percent}`)) continue;

    seen.add(`${ticker}-${percent}`);

    const category = CATEGORY_MAP[ticker] || "Uncategorized";
    const estimatedValue = Number(
      ((percent / 100) * totalPortfolioValue).toFixed(2)
    );

    holdings.push({
      ticker,
      percent,
      category,
      estimatedValue,
    });
  }

  const allocation = holdings.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.percent;
    return acc;
  }, {});

  Object.keys(allocation).forEach((key) => {
    allocation[key] = Number(allocation[key].toFixed(2));
  });

  return {
    totalEstimated: totalPortfolioValue,
    holdings,
    allocation,
  };
}

// Example use:
const sampleOCRText = `
VYM 24.24%
O 18.55%
SCHD 9.48%
DLR 6.23%
QQQ 5.44%
AGI 4.90%
VTI 4.62%
DHS 4.62%
SPAXX 4.25%
VXUS 4.15%
SBR 2.03%
MAIN 1.56%
PLD 1.26%
GNL 0.59%
FTHI 0.52%
JEPQ 0.21%
`;

const result = parsePortfolioText(sampleOCRText, 10000);
console.log(JSON.stringify(result, null, 2));

module.exports = {
  parsePortfolioText,
  cleanOCRText,
  CATEGORY_MAP,
};
