import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  candidateFromHolding,
  detectFileType,
  duplicateAssessment,
} from "../lib/documentIntelligence.js";
import {
  mappingJob,
  resolutionFromMapping,
} from "../lib/securityResolver.js";
import { parsePortfolioText } from "../lib/portfolioParser.js";
import { validateDocumentAssistResult } from "../api/document-assist.js";

const fixture = (name) => readFile(
  fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
  "utf8",
);

test("file type detection prefers bytes over a misleading filename or MIME", () => {
  assert.equal(detectFileType(Uint8Array.from([0x25, 0x50, 0x44, 0x46]), "image/png").type, "pdf");
  assert.equal(detectFileType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]), "").type, "png");
  assert.equal(detectFileType(Uint8Array.from([0xff, 0xd8, 0xff]), "text/plain").type, "jpeg");
});

test("a synthetic generic screenshot preserves evidence and never assigns a category from ticker text", async () => {
  const result = parsePortfolioText(await fixture("universal-generic-positions.txt"));
  assert.deepEqual(result.holdings.map((holding) => holding.ticker), ["NHIF", "LVIF"]);
  for (const holding of result.holdings) {
    assert.equal(holding.category, "Needs review");
    assert.equal(holding.verification.status, "unresolved");
    assert.ok(holding.rowEvidence.includes(holding.ticker));
  }
  assert.ok(!result.holdings.some((holding) => ["ACCOUNT", "TOTAL", "VALUE"].includes(holding.ticker)));
});

test("changed layouts route readable tokens to review without fabricated names or categories", async () => {
  const result = parsePortfolioText(await fixture("changed-layout-positions.txt"));
  const sbr = result.holdings.find((holding) => holding.ticker === "SBR");
  const gnl = result.holdings.find((holding) => holding.ticker === "GNL");
  assert.ok(sbr);
  assert.ok(gnl);
  assert.equal(sbr.category, "Needs review");
  assert.equal(gnl.category, "Needs review");
  assert.equal(sbr.confidence, "low");
  assert.equal(gnl.confidence, "low");
});

test("ticker-only mapping stays ambiguous when OpenFIGI returns more than one instrument", () => {
  const resolution = resolutionFromMapping(
    { idType: "TICKER", idValue: "SBR" },
    {
      data: [
        { figi: "BBG-SYNTH-1", ticker: "SBR", name: "Synthetic One", exchCode: "US", securityType: "Common Stock" },
        { figi: "BBG-SYNTH-2", ticker: "SBR", name: "Synthetic Two", exchCode: "LN", securityType: "Fund" },
      ],
    },
  );
  assert.equal(resolution.status, "ambiguous");
  assert.equal(resolution.candidates.length, 2);
});

test("durable identifiers take priority over ticker-only lookup", () => {
  const job = mappingJob({
    symbol: { value: "SBR" },
    identifiers: [{ value: { type: "ISIN", value: "US0000000001" } }],
  });
  assert.deepEqual(job, { idType: "ID_ISIN", idValue: "US0000000001" });
});

test("possible duplicates are preserved when symbol matches but position facts differ", () => {
  const possible = duplicateAssessment(
    { ticker: "GNL", shares: 10, marketValue: 100 },
    { ticker: "GNL", shares: 12, marketValue: 120 },
  );
  const duplicate = duplicateAssessment(
    { ticker: "GNL", shares: 10, marketValue: 100 },
    { ticker: "GNL", shares: 10, marketValue: 100 },
  );
  assert.equal(possible.status, "possible");
  assert.equal(duplicate.status, "duplicate");
});

test("field evidence retains source calibration without raw document persistence", () => {
  const candidate = candidateFromHolding({
    ticker: "GNL",
    name: "",
    shares: 2,
    marketValue: 50,
    percent: null,
    rowEvidence: "GNL 2 $50",
  }, "ocr");
  assert.equal(candidate.symbol.source, "ocr");
  assert.equal(candidate.symbol.value, "GNL");
  assert.equal(candidate.rowEvidence, "GNL 2 $50");
});

test("document assist accepts explicit nulls and rejects prose or unsupported schema output", () => {
  const valid = {
    pageType: "positions",
    brokerLabel: null,
    rows: [{
      symbol: { value: "GNL", confidence: 0.7, rawText: "GNL", bbox: null },
      name: { value: null, confidence: 0.1, rawText: null, bbox: null },
      shares: { value: 2, confidence: 0.8, rawText: "2", bbox: null },
      marketValue: { value: null, confidence: 0.1, rawText: null, bbox: null },
      weight: { value: null, confidence: 0.1, rawText: null, bbox: null },
      identifiers: [],
      rowEvidence: "GNL 2",
    }],
    notes: [],
  };
  assert.equal(validateDocumentAssistResult(valid).success, true);
  assert.equal(validateDocumentAssistResult("GNL looks like a stock").success, false);
  assert.equal(validateDocumentAssistResult({ ...valid, rows: [{ ticker: "invented" }] }).success, false);
});

test("OCR character confusion is not fuzzy-matched to a known security", () => {
  const result = parsePortfolioText("S8R\n$500.00");
  assert.equal(result.holdings[0].ticker, "S8R");
  assert.equal(result.holdings[0].verification.status, "unresolved");
  assert.equal(result.holdings[0].category, "Needs review");
});
