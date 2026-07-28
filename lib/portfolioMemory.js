const PORTFOLIO_MEMORY_SCHEMA_VERSION = 1;

function emptyPortfolioMemory() {
  return { schemaVersion: PORTFOLIO_MEMORY_SCHEMA_VERSION, snapshots: [], scenarios: [] };
}

function migratePortfolioMemory(input) {
  if (!input || typeof input !== "object" || input.schemaVersion !== PORTFOLIO_MEMORY_SCHEMA_VERSION) {
    return emptyPortfolioMemory();
  }
  return {
    schemaVersion: PORTFOLIO_MEMORY_SCHEMA_VERSION,
    snapshots: Array.isArray(input.snapshots) ? input.snapshots : [],
    scenarios: Array.isArray(input.scenarios) ? input.scenarios : [],
  };
}

function clearPortfolioMemory(storage, key) {
  storage.removeItem(key);
}

export { PORTFOLIO_MEMORY_SCHEMA_VERSION, clearPortfolioMemory, emptyPortfolioMemory, migratePortfolioMemory };
