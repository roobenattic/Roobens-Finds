import assert from "node:assert/strict";
import test from "node:test";
import {
  allocationForHolding,
  buildPortfolioReadiness,
  getImportErrorGuidance,
  getPlanGuidance,
  holdingReviewState,
} from "../lib/portfolioReview.js";

const readyHolding = {
  ticker: "VTI",
  name: "Vanguard Total Stock Market ETF",
  marketValue: 8000,
  percent: null,
  category: "Growth",
  confidence: "high",
  warnings: [],
};

test("review state expands incomplete rows and keeps confirmed rows compact", () => {
  assert.equal(holdingReviewState(readyHolding).status, "Ready");
  assert.equal(holdingReviewState({ ...readyHolding, marketValue: null, percent: null }).needsEditing, true);
  assert.equal(holdingReviewState({ ...readyHolding, confidence: "low" }).needsConfirmation, true);
});

test("allocation is calculated from market values when a total is available", () => {
  assert.equal(allocationForHolding(readyHolding, 10000), 80);
  assert.equal(allocationForHolding({ percent: 12.5 }, 0), 12.5);
});

test("readiness explains remaining work and becomes ready after uncertain data is confirmed", () => {
  const empty = buildPortfolioReadiness({ holdings: [], portfolioTotal: 0, consent: false });
  assert.equal(empty.score, 0);
  assert.equal(empty.ready, false);
  const incomplete = buildPortfolioReadiness({
    holdings: [{ ...readyHolding, marketValue: null, percent: null }],
    portfolioTotal: 0,
    consent: false,
  });
  assert.equal(incomplete.score, 40);
  assert.equal(incomplete.ready, false);

  const uncertain = { ...readyHolding, confidence: "low" };
  const pending = buildPortfolioReadiness({ holdings: [uncertain], portfolioTotal: 8000, consent: false });
  assert.equal(pending.score, 65);
  assert.equal(pending.ready, false);
  assert.deepEqual(pending.actions, ["Confirm the extracted data for VTI."]);
  assert.equal(pending.consentEnabled, false);

  const confirmed = buildPortfolioReadiness({ holdings: [readyHolding], portfolioTotal: 8000, consent: true });
  assert.equal(confirmed.score, 100);
  assert.equal(confirmed.ready, true);
});

test("plan conflicts provide guidance without invalidating the choice", () => {
  const guidance = getPlanGuidance({ goal: "preservation", strategy: "growth", timelineYears: 10 });
  assert.equal(guidance.suggestion, "balanced");
  assert.match(guidance.message, /capital preservation/i);
  assert.equal(getPlanGuidance({ goal: "long-term-growth", strategy: "growth", timelineYears: 10 }), null);
});

test("technical import codes become plain-language recovery guidance", () => {
  const guidance = getImportErrorGuidance({ code: "NO-POSITIONS-01" });
  assert.match(guidance.title, /could not find clear holdings/i);
  assert.match(guidance.next, /CSV/i);
  assert.doesNotMatch(guidance.title, /NO-POSITIONS/);
});
