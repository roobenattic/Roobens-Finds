export const ANALYSIS_VERSION = "2.1.0";

export type Confidence = "high" | "medium" | "low";
export type Strategy = "growth" | "balanced" | "income";
export type RebalanceMode = "contribution-only" | "gradual" | "full-rebalance";
export type AccountType = "brokerage" | "roth-ira" | "traditional-ira" | "401k" | "other";

export type AnalysisWarning = {
  code: string;
  message: string;
  action: string;
  severity?: "info" | "warning" | "error";
};

export type PortfolioSource = {
  kind: "image" | "pdf" | "csv" | "txt" | "manual" | "mixed";
  broker: string;
  brokerConfidence: Confidence;
  fileCount: number;
  label: string;
};

export type Holding = {
  id: string;
  symbol: string;
  name: string;
  shares: number | null;
  marketValue: number;
  costBasis: number | null;
  weight: number;
  assetClass: string;
  confidence: Confidence;
  sourceRef: string;
  warnings: AnalysisWarning[];
};

export type HealthSummary = {
  total: number;
  diversification: number;
  concentration: number;
  liquidity: number;
  goalAlignment: number;
  reasons: string[];
  strengths: string[];
  risks: string[];
};

export type PortfolioSnapshot = {
  id: string;
  createdAt: string;
  source: PortfolioSource;
  currency: "USD";
  accountType: AccountType;
  totalValue: number;
  cashValue: number;
  holdings: Holding[];
  allocations: Record<string, number>;
  health: HealthSummary;
  warnings: AnalysisWarning[];
  analysisVersion: string;
};

export type ScenarioAction = {
  category: string;
  direction: "build" | "review" | "hold";
  priority: "high" | "normal";
  reason: string;
};

export type Scenario = {
  id: string;
  name: string;
  strategy: Strategy;
  contributionCadence: "monthly";
  contributionAmount: number;
  rebalanceMode: RebalanceMode;
  startingSnapshotId: string;
  targetAllocation: Record<string, number>;
  calculatedAllocation: Record<string, number>;
  actions: ScenarioAction[];
  assumptions: string[];
  createdAt: string;
};

export type PortfolioAnalysis = {
  snapshot: PortfolioSnapshot;
  scenario: Scenario;
  holdings: Holding[];
  holdingsCount: number;
  totalValue: number;
  cashValue: number;
  allocation: Record<string, number>;
  targetAllocation: Record<string, number>;
  calculatedAllocation: Record<string, number>;
  score: HealthSummary;
  strengths: string[];
  risks: string[];
  warnings: AnalysisWarning[];
  topExposures: Array<{ id: string; label: string; category: string; value: number; weight: number }>;
  mainPriority: string;
  freeAction: {
    actionType: string;
    category: string;
    reason: string;
    priority: string;
    method: string;
    expectedImpact: string;
  };
  dataQualityNote: string;
  disclaimer: string;
  analysisVersion: string;
};
