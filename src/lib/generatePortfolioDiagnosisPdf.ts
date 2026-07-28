import { jsPDF } from "jspdf";

type Diagnosis = {
  totalValue: number;
  holdings: Array<{ ticker?: string; name?: string; marketValue: number; percent: number; category: string }>;
  holdingsCount: number;
  strategy: string;
  accountType: string;
  allocation: Record<string, number>;
  targetAllocation: Record<string, number>;
  score: {
    total: number;
    diversification: number;
    concentration: number;
    liquidity: number;
    goalAlignment: number;
  };
  strengths: string[];
  risks: string[];
  mainPriority: string;
  freeAction: {
    actionType: string;
    category: string;
    reason: string;
    method: string;
    expectedImpact: string;
  };
  dataQualityNote: string;
  disclaimer: string;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function generatePortfolioDiagnosisPdf(diagnosis: Diagnosis) {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 52;
  const contentWidth = pageWidth - margin * 2;
  let y = 60;

  function header(title: string, subtitle?: string) {
    pdf.setFillColor(8, 20, 35);
    pdf.rect(0, 0, pageWidth, 118, "F");
    pdf.setTextColor(241, 105, 83);
    pdf.setFontSize(11);
    pdf.text("ROOBENS FINDS", margin, 45);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text(title, margin, 78);
    if (subtitle) {
      pdf.setFontSize(10);
      pdf.setTextColor(200, 211, 224);
      pdf.text(subtitle, margin, 98);
    }
    y = 150;
  }

  function section(title: string) {
    if (y > 680) {
      pdf.addPage();
      y = 58;
    }
    pdf.setTextColor(36, 54, 76);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, margin, y);
    pdf.setFont("helvetica", "normal");
    y += 22;
  }

  function lines(text: string, color: [number, number, number] = [79, 96, 113]) {
    pdf.setTextColor(...color);
    pdf.setFontSize(10);
    const wrapped = pdf.splitTextToSize(text, contentWidth);
    pdf.text(wrapped, margin, y);
    y += wrapped.length * 14 + 8;
  }

  function pageFooter() {
    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      pdf.setFontSize(8);
      pdf.setTextColor(115, 125, 137);
      pdf.text(`Roobens Finds • Portfolio Diagnosis • ${page}/${pages}`, margin, 760);
    }
  }

  header("Free Portfolio Diagnosis", `Generated ${new Date().toLocaleDateString()} • ${diagnosis.strategy} strategy`);
  pdf.setFillColor(247, 244, 239);
  pdf.roundedRect(margin, y, contentWidth, 96, 10, 10, "F");
  pdf.setTextColor(36, 54, 76);
  pdf.setFontSize(11);
  pdf.text("CONFIRMED PORTFOLIO", margin + 18, y + 24);
  pdf.setFontSize(22);
  pdf.text(money.format(diagnosis.totalValue), margin + 18, y + 54);
  pdf.setFontSize(10);
  pdf.text(`${diagnosis.holdingsCount} holdings • Health score ${diagnosis.score.total}/100`, margin + 18, y + 77);
  y += 122;
  section("Executive snapshot");
  lines(diagnosis.mainPriority);
  lines(`Strategy: ${diagnosis.strategy} • Account: ${diagnosis.accountType} • ${diagnosis.dataQualityNote}`);

  pdf.addPage();
  header("What you own today");
  diagnosis.holdings.slice(0, 18).forEach((holding) => {
    const label = holding.ticker || holding.name || "Holding";
    lines(`${label} — ${holding.category} — ${holding.percent.toFixed(1)}% — ${money.format(holding.marketValue)}`);
  });
  if (diagnosis.holdings.length > 18) lines(`${diagnosis.holdings.length - 18} additional holdings are included in the totals.`);

  pdf.addPage();
  header("Strengths, risks & score");
  section("Score breakdown");
  lines(`Diversification ${diagnosis.score.diversification}/25 • Concentration ${diagnosis.score.concentration}/25 • Liquidity ${diagnosis.score.liquidity}/25 • Goal alignment ${diagnosis.score.goalAlignment}/25`);
  section("Strengths");
  diagnosis.strengths.forEach((item) => lines(`• ${item}`));
  section("Risks");
  diagnosis.risks.forEach((item) => lines(`• ${item}`));

  pdf.addPage();
  header("Current vs target allocation");
  const categories = [...new Set([...Object.keys(diagnosis.targetAllocation), ...Object.keys(diagnosis.allocation)])];
  categories.forEach((category) => {
    lines(`${category}: current ${(diagnosis.allocation[category] || 0).toFixed(1)}% • target ${(diagnosis.targetAllocation[category] || 0).toFixed(1)}%`);
  });
  section("One practical next action");
  lines(`${diagnosis.freeAction.actionType}: ${diagnosis.freeAction.category}`, [241, 105, 83]);
  lines(diagnosis.freeAction.reason);
  lines(diagnosis.freeAction.method);
  lines(diagnosis.freeAction.expectedImpact);

  pdf.addPage();
  header("Continue in the Premium Workspace");
  lines("Premium is being upgraded into a private living web app with saved portfolios, live scenarios, exact action plans, progress history, and unlimited updated reports.");
  lines("Preview: https://www.roobensfinds.com/premium-preview");
  section("Educational disclaimer");
  lines(diagnosis.disclaimer);
  lines("This report does not include confidential source screenshots or raw uploaded documents.");

  pageFooter();
  pdf.save(`roobens-finds-portfolio-diagnosis-${new Date().toISOString().slice(0, 10)}.pdf`);
}
