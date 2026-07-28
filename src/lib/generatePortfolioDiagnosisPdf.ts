import { jsPDF } from "jspdf";
import type { PortfolioAnalysis } from "@/types/portfolio";
// @ts-ignore Shared browser/server report projection.
import { buildPortfolioReportModel } from "../../lib/portfolioReportModel.js";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const COLORS: Array<[number, number, number]> = [
  [241, 105, 83],
  [95, 149, 149],
  [233, 183, 135],
  [88, 112, 143],
  [155, 209, 205],
  [138, 122, 155],
  [214, 155, 85],
];

export function createPortfolioDiagnosisPdf(analysis: PortfolioAnalysis) {
  const report = buildPortfolioReportModel(analysis);
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 52;
  const contentWidth = pageWidth - margin * 2;
  let y = 146;

  function header(title: string, subtitle: string) {
    pdf.setFillColor(8, 20, 35);
    pdf.rect(0, 0, pageWidth, 116, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(241, 105, 83);
    pdf.setFontSize(10);
    pdf.text("ROOBENS FINDS - SMART PORTFOLIO INTELLIGENCE", margin, 38);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(23);
    pdf.text(title, margin, 72);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 211, 224);
    pdf.setFontSize(9);
    pdf.text(subtitle, margin, 94);
    y = 146;
  }

  function newPage(title: string, subtitle: string) {
    pdf.addPage();
    header(title, subtitle);
  }

  function section(title: string) {
    if (y > pageHeight - 90) newPage(title, "Portfolio diagnosis continued");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(36, 54, 76);
    pdf.setFontSize(14);
    pdf.text(title, margin, y);
    pdf.setFont("helvetica", "normal");
    y += 20;
  }

  function paragraph(text: string, color: [number, number, number] = [79, 96, 113], indent = 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...color);
    pdf.setFontSize(9.5);
    const wrapped = pdf.splitTextToSize(text, contentWidth - indent);
    if (y + wrapped.length * 13 > pageHeight - 50) {
      newPage("Portfolio diagnosis", "Continuation of your confirmed analysis");
    }
    pdf.text(wrapped, margin + indent, y);
    y += wrapped.length * 13 + 7;
  }

  function allocationBars(
    rows: Array<{ category: string; current: number; scenario: number; target: number }>,
  ) {
    const labelWidth = 88;
    const barWidth = contentWidth - labelWidth - 52;
    const scale = barWidth / 100;
    rows.forEach((row, index) => {
      if (y > pageHeight - 78) newPage("Allocation comparison", "Current, scenario, and educational target");
      pdf.setTextColor(36, 54, 76);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text(row.category, margin, y + 9);
      const values = [
        { value: row.current, label: "C", color: [241, 105, 83] as [number, number, number] },
        { value: row.scenario, label: "S", color: [233, 183, 135] as [number, number, number] },
        { value: row.target, label: "T", color: [95, 149, 149] as [number, number, number] },
      ];
      values.forEach((item, line) => {
        const rowY = y + line * 13;
        pdf.setDrawColor(210, 216, 222);
        pdf.setFillColor(246, 247, 248);
        pdf.roundedRect(margin + labelWidth, rowY, barWidth, 8, 2, 2, "FD");
        pdf.setFillColor(...item.color);
        pdf.roundedRect(margin + labelWidth, rowY, Math.max(1, item.value * scale), 8, 2, 2, "F");
        pdf.setTextColor(79, 96, 113);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.text(`${item.label} ${item.value.toFixed(1)}%`, margin + labelWidth + barWidth + 6, rowY + 7);
      });
      y += 49;
      if (index < rows.length - 1) {
        pdf.setDrawColor(235, 238, 240);
        pdf.line(margin, y - 5, pageWidth - margin, y - 5);
      }
    });
  }

  const generatedDate = new Date(report.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const strategyLabel = `${report.strategy} strategy - ${report.rebalanceMode} model`;
  header("Portfolio Intelligence Report", `${generatedDate} - ${strategyLabel}`);

  pdf.setFillColor(247, 244, 239);
  pdf.roundedRect(margin, y, contentWidth, 102, 12, 12, "F");
  pdf.setTextColor(36, 54, 76);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("CONFIRMED PORTFOLIO SNAPSHOT", margin + 18, y + 23);
  pdf.setFontSize(23);
  pdf.text(money.format(report.totalValue), margin + 18, y + 53);
  pdf.setFontSize(9.5);
  pdf.text(
    `${report.holdingsCount} holdings - ${money.format(report.cashValue)} available cash - health score ${report.score.total}/100`,
    margin + 18,
    y + 78,
  );
  y += 128;
  section("Executive snapshot");
  paragraph(report.mainPriority);
  paragraph(`Account: ${report.accountType}. Analysis version: ${report.analysisVersion}. ${report.dataQualityNote}`);
  section("How to read this report");
  paragraph("Current values come from the holdings you reviewed and confirmed. Scenario values are deterministic educational calculations. Target values are model allocations, not forecasts, guarantees, or trade instructions.");
  section("Highest-priority opportunity");
  paragraph(`${report.freeAction.actionType}: ${report.freeAction.category}`, [241, 105, 83]);
  paragraph(report.freeAction.reason);

  newPage("Current allocation", "Values derived from your confirmed portfolio snapshot");
  const allocationRows = Object.entries(report.allocation as Record<string, number>)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
  allocationRows.forEach(([category, value], index) => {
    const color = COLORS[index % COLORS.length];
    pdf.setFillColor(...color);
    pdf.rect(margin, y - 8, 10, 10, "F");
    pdf.setTextColor(36, 54, 76);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.text(category, margin + 18, y);
    pdf.text(`${value.toFixed(1)}%`, pageWidth - margin, y, { align: "right" });
    pdf.setFillColor(241, 243, 245);
    pdf.roundedRect(margin + 18, y + 7, contentWidth - 18, 9, 2, 2, "F");
    pdf.setFillColor(...color);
    pdf.roundedRect(margin + 18, y + 7, Math.max(1, (contentWidth - 18) * (value / 100)), 9, 2, 2, "F");
    y += 36;
  });
  section("Score breakdown");
  paragraph(
    `Diversification ${report.score.diversification}/25 - Concentration ${report.score.concentration}/25 - Liquidity ${report.score.liquidity}/25 - Goal alignment ${report.score.goalAlignment}/25`,
  );

  newPage("Holdings detail", "Searchable in the web dashboard; summarized here for reference");
  report.holdings.forEach((holding: PortfolioAnalysis["holdings"][number]) => {
    if (y > pageHeight - 70) newPage("Holdings detail", "Continued from your confirmed portfolio");
    const label = holding.symbol || holding.name || "Holding";
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(36, 54, 76);
    pdf.setFontSize(9.5);
    pdf.text(label, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(holding.assetClass, margin + 112, y);
    pdf.text(`${holding.weight.toFixed(1)}%`, margin + 300, y, { align: "right" });
    pdf.text(money.format(holding.marketValue), pageWidth - margin, y, { align: "right" });
    pdf.setTextColor(105, 118, 130);
    pdf.setFontSize(7.5);
    pdf.text(`Classification confidence: ${holding.confidence}`, margin, y + 12);
    y += 29;
  });

  newPage("Scenario comparison", "C = current, S = scenario, T = educational target");
  const categories = [...new Set([
    ...Object.keys(report.allocation as Record<string, number>),
    ...Object.keys(report.calculatedAllocation as Record<string, number>),
    ...Object.keys(report.targetAllocation as Record<string, number>),
  ])];
  allocationBars(categories.map((category) => ({
    category,
    current: (report.allocation as Record<string, number>)[category] || 0,
    scenario: (report.calculatedAllocation as Record<string, number>)[category] || 0,
    target: (report.targetAllocation as Record<string, number>)[category] || 0,
  })));
  section("Scenario assumptions");
  paragraph(
    `${strategyLabel}. Monthly contribution: ${money.format(report.contributionAmount)}. Calculations use the confirmed snapshot and do not model taxes, fees, market returns, execution prices, or future performance.`,
  );

  newPage("Strengths, risks, and next step", "Explainable findings from the same dashboard analysis");
  section("Strengths");
  report.strengths.forEach((item: string) => paragraph(`- ${item}`));
  section("Risks to review");
  report.risks.forEach((item: string) => paragraph(`- ${item}`));
  if (report.warnings.length) {
    section("Data warnings");
    report.warnings.forEach((warning: PortfolioAnalysis["warnings"][number]) => {
      paragraph(`- ${warning.message} ${warning.action}`);
    });
  }
  section("One practical educational action");
  paragraph(`${report.freeAction.actionType}: ${report.freeAction.category}`, [241, 105, 83]);
  paragraph(report.freeAction.method);
  paragraph(report.freeAction.expectedImpact);

  newPage("Method and privacy notes", "A versioned, reproducible educational analysis");
  section("Calculation model");
  paragraph(`Snapshot ${report.snapshotId}. Scenario ${report.scenarioId}. Analysis version ${report.analysisVersion}. The web dashboard and this PDF are projected from the same normalized model.`);
  section("Privacy boundary");
  paragraph("Raw screenshots, PDFs, and imported text are not included in this report or stored by the local demo repository. Only normalized, user-confirmed snapshot data can be saved temporarily on this device, and it can be cleared from the dashboard.");
  section("Educational disclaimer");
  paragraph(report.disclaimer);
  paragraph("No trades were executed. No brokerage credentials were requested. Review classifications and assumptions before relying on any educational comparison.");

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(223, 227, 230);
    pdf.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(105, 118, 130);
    pdf.text(`Roobens Finds - Portfolio Intelligence - ${page}/${pages}`, margin, pageHeight - 24);
    pdf.text(`Generated ${generatedDate}`, pageWidth - margin, pageHeight - 24, { align: "right" });
  }

  return pdf;
}

export function generatePortfolioDiagnosisPdf(analysis: PortfolioAnalysis) {
  const pdf = createPortfolioDiagnosisPdf(analysis);
  pdf.save(`roobens-finds-portfolio-intelligence-${new Date().toISOString().slice(0, 10)}.pdf`);
}
