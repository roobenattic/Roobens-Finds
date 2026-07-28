import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { detectBroker, normalizeBrokerRows } from "../lib/brokerProfiles.js";

const cases = [
  ["fidelity.csv", "fidelity"],
  ["schwab.csv", "schwab"],
  ["vanguard.csv", "vanguard"],
  ["robinhood.csv", "robinhood"],
  ["m1-finance.csv", "m1-finance"],
  ["public.csv", "public"],
  ["etrade.csv", "etrade"],
  ["generic.csv", "generic"],
];

function parseFixture(text) {
  const [headerLine, rowLine] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  const values = rowLine.split(",");
  return {
    headers,
    row: Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])),
  };
}

for (const [fileName, expected] of cases) {
  test(`detects ${expected} fixture without personal data`, async () => {
    const text = await readFile(path.join("tests", "fixtures", fileName), "utf8");
    const { headers, row } = parseFixture(text);
    const detection = detectBroker({ text, fileName, headers });
    assert.equal(detection.id, expected);
    const holdings = normalizeBrokerRows([row], detection, `${detection.label} synthetic fixture`);
    assert.equal(holdings.length, 1);
    assert.ok(holdings[0].marketValue > 0);
  });
}
