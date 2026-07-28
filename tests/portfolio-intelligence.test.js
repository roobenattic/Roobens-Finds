import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeSnapshot,
  buildScenario,
  buildSnapshot,
  calculateScenarioAllocation,
} from "../lib/portfolioAnalysis.js";
import { buildPortfolioReportModel } from "../lib/portfolioReportModel.js";

const holdings = [
  { ticker: "VTI", name: "Total Market", marketValue: 6000, category: "Growth", confidence: "high" },
  { ticker: "SCHD", name: "Dividend ETF", marketValue: 1500, category: "Income", confidence: "high" },
  { ticker: "BND", name: "Bond ETF", marketValue: 2000, category: "Bonds", confidence: "high" },
  { ticker: "SPAXX", name: "Money Market", marketValue: 500, category: "Cash", confidence: "high" },
];

test("snapshot, dashboard analysis, and report model agree numerically", () => {
  const snapshot = buildSnapshot({ holdings, totalValue: 10000, accountType: "brokerage" });
  const scenario = buildScenario(snapshot, { strategy: "balanced", contributionAmount: 500, rebalanceMode: "contribution-only" });
  const analysis = analyzeSnapshot(snapshot, scenario);
  const report = buildPortfolioReportModel(analysis);
  assert.equal(snapshot.totalValue, 10000);
  assert.equal(analysis.totalValue, report.totalValue);
  assert.deepEqual(analysis.allocation, report.allocation);
  assert.deepEqual(analysis.targetAllocation, report.targetAllocation);
  assert.equal(analysis.score.total, report.score.total);
  assert.equal(snapshot.holdings.reduce((sum, item) => sum + item.weight, 0), 100);
});

test("scenario modes are deterministic and contribution-only does not jump to target", () => {
  const snapshot = buildSnapshot({ holdings, totalValue: 10000, accountType: "brokerage" });
  const target = { Growth: 50, Income: 15, "Real Estate": 10, Bonds: 20, Cash: 5, Other: 0 };
  const contributionOnly = calculateScenarioAllocation(snapshot, target, 500, "contribution-only");
  const gradual = calculateScenarioAllocation(snapshot, target, 500, "gradual");
  const full = calculateScenarioAllocation(snapshot, target, 500, "full-rebalance");
  assert.notDeepEqual(contributionOnly, target);
  assert.notDeepEqual(gradual, contributionOnly);
  assert.deepEqual(full, target);
  assert.equal(buildScenario(snapshot, {}).rebalanceMode, "contribution-only");
});

test("unknown classifications produce a review warning", () => {
  const snapshot = buildSnapshot({
    holdings: [{ ticker: "ZZZZ", marketValue: 1000, category: "Uncategorized", confidence: "low" }],
    totalValue: 1000,
  });
  assert.equal(snapshot.holdings[0].assetClass, "Needs review");
  assert.equal(snapshot.warnings[0].code, "unknown-classification");
});
