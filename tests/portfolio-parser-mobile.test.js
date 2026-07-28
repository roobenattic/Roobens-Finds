import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildSnapshot } from "../lib/portfolioAnalysis.js";
import { BLOCKED_TICKERS, parsePortfolioText } from "../lib/portfolioParser.js";

const fixture = (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

test("PNG OCR layout keeps name, ticker, quantity, value, and adjacent percentage", async () => {
  const result = parsePortfolioText(await fixture("mobile-screenshot-png.txt"));
  assert.deepEqual(result.holdings.map((holding) => holding.ticker), ["AAPL", "VTI"]);
  assert.equal(result.holdings[0].name, "Apple Inc");
  assert.equal(result.holdings[0].shares, 10);
  assert.equal(result.holdings[0].marketValue, 1234.56);
  assert.equal(result.holdings[1].marketValue, 4250.5);
  assert.equal(result.holdings[1].percent, 62.4);
});

test("JPG OCR layout calculates value from quantity and current price without using gain/loss", async () => {
  const result = parsePortfolioText(await fixture("mobile-screenshot-jpg.txt"));
  const microsoft = result.holdings.find((holding) => holding.ticker === "MSFT");
  assert.ok(microsoft);
  assert.equal(microsoft.marketValue, 4152);
  assert.equal(microsoft.shares, 10);
  assert.ok(microsoft.warnings.some((item) => item.code === "calculated-market-value"));
  const cash = result.holdings.find((holding) => holding.ticker === "SPAXX");
  assert.equal(cash.marketValue, 615.25);
});

test("supports same-line percentage and value without a dollar symbol", () => {
  const percent = parsePortfolioText("AAPL 12.4%");
  assert.equal(percent.holdings[0].percent, 12.4);
  const adjacent = parsePortfolioText("Apple Inc AAPL\n1,234.56");
  assert.equal(adjacent.holdings[0].marketValue, 1234.56);
});

test("headings never become ticker symbols", () => {
  const result = parsePortfolioText("TOTAL ACCOUNT MARKET VALUE PRICE TODAY COST GAIN LOSS\n$9,999.00");
  assert.equal(result.holdings.length, 0);
  for (const heading of ["TOTAL", "ACCOUNT", "MARKET", "VALUE", "PRICE", "TODAY", "COST", "GAIN", "LOSS"]) {
    assert.ok(BLOCKED_TICKERS.has(heading));
  }
});

test("partially corrupted but defensible ticker becomes a low-confidence review row", () => {
  const result = parsePortfolioText("MSF7\n$2,100.00");
  assert.equal(result.holdings.length, 1);
  assert.equal(result.holdings[0].ticker, "MSF7");
  assert.equal(result.holdings[0].confidence, "low");
  assert.equal(result.recovered, true);
});

test("zero-complete-position recovery preserves a known ticker with null values", () => {
  const result = parsePortfolioText("AAPL\nPosition unavailable");
  assert.equal(result.holdings.length, 1);
  assert.equal(result.holdings[0].marketValue, null);
  assert.equal(result.holdings[0].percent, null);
  assert.ok(result.holdings[0].warnings.some((item) => item.code === "incomplete-ocr-row"));
});

test("manual corrections remain the source of truth for analysis", () => {
  const imported = parsePortfolioText("AAPL\nPosition unavailable").holdings[0];
  const corrected = {
    ...imported,
    marketValue: 2500,
    percent: 100,
    category: "Growth",
    assetClass: "Growth",
    confidence: "high",
    warnings: [],
  };
  const snapshot = buildSnapshot({ holdings: [corrected], totalValue: 2500, accountType: "brokerage" });
  assert.equal(snapshot.totalValue, 2500);
  assert.equal(snapshot.holdings[0].marketValue, 2500);
  assert.equal(snapshot.holdings[0].weight, 100);
});
