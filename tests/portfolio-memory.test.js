import assert from "node:assert/strict";
import test from "node:test";
import {
  PORTFOLIO_MEMORY_SCHEMA_VERSION,
  clearPortfolioMemory,
  migratePortfolioMemory,
} from "../lib/portfolioMemory.js";

test("memory migration rejects unsupported schemas", () => {
  assert.deepEqual(migratePortfolioMemory({ schemaVersion: 99, snapshots: [{ id: "unsafe" }] }), {
    schemaVersion: PORTFOLIO_MEMORY_SCHEMA_VERSION,
    snapshots: [],
    scenarios: [],
  });
});

test("local deletion removes only the configured planner key", () => {
  const removed = [];
  clearPortfolioMemory({ removeItem: (key) => removed.push(key) }, "planner-key");
  assert.deepEqual(removed, ["planner-key"]);
});
