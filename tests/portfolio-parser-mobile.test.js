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

test("digit-corrupted OCR symbols do not become holdings", () => {
  const result = parsePortfolioText("MSF7\n$2,100.00");
  assert.equal(result.holdings.length, 0);
});

test("a known ticker without numeric position evidence remains ignored text", () => {
  const result = parsePortfolioText("AAPL\nPosition unavailable");
  assert.equal(result.holdings.length, 0);
  assert.equal(result.unrecognized[0].candidate, "AAPL");
});

test("manual holdings remain the source of truth for analysis", () => {
  const corrected = {
    ticker: "AAPL",
    name: "Apple Inc",
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

test("statement labels and OCR fragments never become fake holdings", () => {
  const result = parsePortfolioText(`
    ROOBENS DUME
    FIDELITY INVESTMENTS
    ONLINE BROKERAGE ACCOUNT
    MARKET VALUE FUND DIGITAL PROVIDED
    FAST LTE S68 S84
    $79,000.00
  `);
  assert.deepEqual(result.holdings, []);
});

test("unknown symbols require both a plausible name and numeric position evidence", () => {
  const defensible = parsePortfolioText("Acme Robotics ACME 10 shares $2,100.00");
  assert.equal(defensible.holdings.length, 1);
  assert.equal(defensible.holdings[0].confidence, "low");
  assert.equal(holdingIssue(defensible.holdings[0]), "symbol-uncertain");

  const isolated = parsePortfolioText("ACME\n$2,100.00");
  assert.equal(isolated.holdings.length, 0);
});

test("Fidelity statement rows use ticker parentheses and ending market value columns", async () => {
  const result = parsePortfolioText(
    await fixture("fidelity-statement-ocr.txt"),
    0,
    { recognizedBroker: true, brokerId: "fidelity" },
  );
  assert.deepEqual(result.holdings.map((holding) => holding.ticker), [
    "SPAXX", "FTHI", "QQQ", "DGRO", "JEPQ", "SPYD", "SCHD", "VXUS",
    "VEA", "VYM", "VTI", "DHS", "AGI", "MAIN", "DLR",
  ]);
  assert.equal(result.holdings.find((holding) => holding.ticker === "QQQ").marketValue, 668.65);
  assert.equal(result.holdings.find((holding) => holding.ticker === "JEPQ").marketValue, 10.81);
  assert.equal(result.holdings.find((holding) => holding.ticker === "VXUS").marketValue, 212.1);
  assert.equal(result.holdings.find((holding) => holding.ticker === "AGI").marketValue, 155.49);
  assert.equal(result.holdings.find((holding) => holding.ticker === "MAIN").marketValue, 74.34);
  assert.equal(result.holdings.find((holding) => holding.ticker === "DLR").marketValue, 274.03);
  assert.ok(result.holdings.every((holding) => holding.name));
  assert.ok(result.holdings.every((holding) => holding.percent === null));
  assert.ok(result.holdings.every((holding) => holding.confidence === "high"));
  assert.deepEqual(result.unrecognized, []);
  for (const falseTicker of ["FIRST", "TRUST", "GOLD", "COM", "NPV", "CL"]) {
    assert.ok(!result.holdings.some((holding) => holding.ticker === falseTicker));
  }
});

function holdingIssue(holding) {
  return holding.warnings[0]?.code;
}
