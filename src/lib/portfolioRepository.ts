import type { PortfolioSnapshot, Scenario } from "@/types/portfolio";
// @ts-ignore Shared schema migration helpers.
import { PORTFOLIO_MEMORY_SCHEMA_VERSION, clearPortfolioMemory, migratePortfolioMemory } from "../../lib/portfolioMemory.js";

const STORAGE_KEY = "roobens-finds:planner-memory";

type StoredPortfolioData = {
  schemaVersion: number;
  snapshots: PortfolioSnapshot[];
  scenarios: Scenario[];
};

export interface PortfolioRepository {
  createSnapshot(snapshot: PortfolioSnapshot): Promise<PortfolioSnapshot>;
  getSnapshot(id: string): Promise<PortfolioSnapshot | null>;
  listSnapshots(): Promise<PortfolioSnapshot[]>;
  saveScenario(scenario: Scenario): Promise<Scenario>;
  listScenarios(snapshotId?: string): Promise<Scenario[]>;
  deleteLocalData(): Promise<void>;
}

function emptyData(): StoredPortfolioData {
  return { schemaVersion: PORTFOLIO_MEMORY_SCHEMA_VERSION, snapshots: [], scenarios: [] };
}

function migrateData(input: unknown): StoredPortfolioData {
  return migratePortfolioMemory(input) as StoredPortfolioData;
}

export class LocalDemoPortfolioRepository implements PortfolioRepository {
  private read(): StoredPortfolioData {
    if (typeof window === "undefined") return emptyData();
    try {
      return migrateData(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null"));
    } catch {
      return emptyData();
    }
  }

  private write(data: StoredPortfolioData) {
    if (typeof window === "undefined") return;
    // Only normalized, user-confirmed values are stored. Raw uploads never enter this adapter.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async createSnapshot(snapshot: PortfolioSnapshot) {
    const data = this.read();
    const snapshots = [snapshot, ...data.snapshots.filter((item) => item.id !== snapshot.id)].slice(0, 10);
    this.write({ ...data, snapshots });
    return snapshot;
  }

  async getSnapshot(id: string) {
    return this.read().snapshots.find((snapshot) => snapshot.id === id) || null;
  }

  async listSnapshots() {
    return this.read().snapshots;
  }

  async saveScenario(scenario: Scenario) {
    const data = this.read();
    const scenarios = [scenario, ...data.scenarios.filter((item) => item.id !== scenario.id)].slice(0, 20);
    this.write({ ...data, scenarios });
    return scenario;
  }

  async listScenarios(snapshotId?: string) {
    const scenarios = this.read().scenarios;
    return snapshotId ? scenarios.filter((scenario) => scenario.startingSnapshotId === snapshotId) : scenarios;
  }

  async deleteLocalData() {
    if (typeof window !== "undefined") clearPortfolioMemory(window.localStorage, STORAGE_KEY);
  }
}

export class NoPersistencePortfolioRepository implements PortfolioRepository {
  async createSnapshot(snapshot: PortfolioSnapshot) { return snapshot; }
  async getSnapshot() { return null; }
  async listSnapshots() { return []; }
  async saveScenario(scenario: Scenario) { return scenario; }
  async listScenarios() { return []; }
  async deleteLocalData() {}
}

export function createPortfolioRepository(enabled: boolean): PortfolioRepository {
  return enabled ? new LocalDemoPortfolioRepository() : new NoPersistencePortfolioRepository();
}

// Sprint 37 boundary: replace this adapter with authenticated server persistence,
// Row Level Security, consent and retention controls, account management, and
// documented encrypted transport/storage practices.
export { STORAGE_KEY, migrateData };
export { PORTFOLIO_MEMORY_SCHEMA_VERSION };
