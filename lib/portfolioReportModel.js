function buildPortfolioReportModel(analysis) {
  if (!analysis?.snapshot || !analysis?.scenario) {
    throw new Error("A normalized portfolio analysis is required for the report.");
  }
  return {
    generatedAt: new Date().toISOString(),
    analysisVersion: analysis.analysisVersion,
    snapshotId: analysis.snapshot.id,
    scenarioId: analysis.scenario.id,
    totalValue: analysis.totalValue,
    cashValue: analysis.cashValue,
    holdingsCount: analysis.holdingsCount,
    holdings: analysis.holdings,
    allocation: analysis.allocation,
    targetAllocation: analysis.targetAllocation,
    calculatedAllocation: analysis.calculatedAllocation,
    strategy: analysis.scenario.strategy,
    rebalanceMode: analysis.scenario.rebalanceMode,
    contributionAmount: analysis.scenario.contributionAmount,
    accountType: analysis.snapshot.accountType,
    score: analysis.score,
    strengths: analysis.strengths,
    risks: analysis.risks,
    warnings: analysis.warnings,
    mainPriority: analysis.mainPriority,
    freeAction: analysis.freeAction,
    dataQualityNote: analysis.dataQualityNote,
    disclaimer: analysis.disclaimer,
  };
}

export { buildPortfolioReportModel };
