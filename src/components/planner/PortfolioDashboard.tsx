import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleHelp, FileText, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import HoldingsExplorer from "@/components/planner/HoldingsExplorer";
import { plannerStrings } from "@/data/plannerStrings";
import type { PortfolioAnalysis } from "@/types/portfolio";

const COLORS = ["#F16953", "#5f9595", "#e9b787", "#58708f", "#9bd1cd", "#8a7a9b", "#d69b55"];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Props = {
  analysis: PortfolioAnalysis;
  onDownload: () => void;
};

export default function PortfolioDashboard({ analysis, onDownload }: Props) {
  const reduceMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allocationData = useMemo(
    () => Object.entries(analysis.allocation).filter(([, value]) => value > 0).map(([name, value]) => ({ name, value })),
    [analysis.allocation],
  );
  const comparisonData = useMemo(
    () => [...new Set([...Object.keys(analysis.targetAllocation), ...Object.keys(analysis.allocation)])].map((category) => ({
      category,
      Current: analysis.allocation[category] || 0,
      Scenario: analysis.calculatedAllocation[category] || 0,
      Target: analysis.targetAllocation[category] || 0,
      difference: (analysis.targetAllocation[category] || 0) - (analysis.allocation[category] || 0),
    })),
    [analysis.allocation, analysis.calculatedAllocation, analysis.targetAllocation],
  );
  const largest = analysis.topExposures[0];

  function selectCategory(category: string) {
    setSelectedCategory(category);
    requestAnimationFrame(() => document.getElementById("holdings-explorer")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }));
  }

  if (!analysis.holdings.length || !(analysis.totalValue > 0)) {
    return (
      <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 text-amber-950">
        <AlertTriangle className="h-6 w-6" />
        <h2 className="mt-4 text-2xl font-bold">More confirmed data is needed.</h2>
        <p className="mt-2 text-sm leading-6">The dashboard will not show zero-value cards or charts. Confirm at least one holding and a positive portfolio total.</p>
        <Button type="button" variant="outline" className="mt-5" onClick={() => document.getElementById("review-heading")?.scrollIntoView()}>{plannerStrings.reviewHoldings}</Button>
      </section>
    );
  }

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      className="space-y-6"
      aria-labelledby="intelligence-dashboard-title"
    >
      <div className="flex flex-col justify-between gap-5 rounded-[2rem] bg-[#081423] p-6 text-white md:flex-row md:items-center md:p-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#FECFA5]">Confirmed snapshot • Analysis {analysis.analysisVersion}</span>
          <h2 id="intelligence-dashboard-title" className="mt-2 text-3xl font-bold">{plannerStrings.dashboardTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{analysis.disclaimer}</p>
        </div>
        <Button onClick={onDownload} className="bg-[#F16953] hover:bg-[#d95840]"><FileText className="mr-2 h-4 w-4" /> Download diagnosis PDF</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["Portfolio value", money.format(analysis.totalValue)],
          ["Holdings", analysis.holdingsCount],
          ["Available cash", money.format(analysis.cashValue)],
          ["Largest position", largest ? `${largest.label} ${largest.weight.toFixed(1)}%` : "Not available"],
          ["Strategy", analysis.scenario.strategy],
          ["Health score", `${analysis.score.total}/100`],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[#495E79]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5F7C84]">{label}</p>
            <p className="mt-2 break-words text-xl font-bold capitalize text-[#24364c]">{value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <article className="min-w-0 overflow-hidden rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-xl font-bold text-[#24364c]">Current allocation</h3>
          <p className="mt-1 text-sm text-[#5F7C84]">Select a category in the chart or list to filter matching holdings.</p>
          <div className="h-64" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={88}
                  isAnimationActive={!reduceMotion}
                  animationDuration={450}
                  onClick={(entry) => selectCategory(entry.name)}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke={selectedCategory === entry.name ? "#081423" : "#ffffff"} strokeWidth={selectedCategory === entry.name ? 4 : 2} opacity={selectedCategory && selectedCategory !== entry.name ? 0.4 : 1} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 sm:grid-cols-2" aria-label="Accessible current allocation list">
            {allocationData.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={selectedCategory === item.name}
                onClick={() => selectCategory(item.name)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-[#F16953] ${selectedCategory === item.name ? "border-[#24364c] bg-slate-50" : "border-slate-200"}`}
              >
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-slate-500" style={{ background: COLORS[index % COLORS.length] }} />{item.name}</span>
                <strong>{item.value.toFixed(1)}%</strong>
              </button>
            ))}
          </div>
        </article>

        <article className="min-w-0 overflow-hidden rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-xl font-bold text-[#24364c]">Current, scenario, and target</h3>
          <p className="mt-1 text-sm text-[#5F7C84]">Scenario values update immediately when the free explorer changes.</p>
          <div className="h-72" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="category" width={78} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="Current" fill="#F16953" radius={[0, 3, 3, 0]} isAnimationActive={!reduceMotion} animationDuration={450} />
                <Bar dataKey="Scenario" fill="#FECFA5" stroke="#8a6848" radius={[0, 3, 3, 0]} isAnimationActive={!reduceMotion} animationDuration={450} />
                <Bar dataKey="Target" fill="#5f9595" radius={[0, 3, 3, 0]} isAnimationActive={!reduceMotion} animationDuration={450} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[540px] w-full text-left text-xs">
              <caption className="sr-only">Current, scenario, target, and percentage-point difference by category</caption>
              <thead className="bg-slate-50 text-[#495E79]"><tr><th className="p-2">Category</th><th className="p-2">Current</th><th className="p-2">Scenario</th><th className="p-2">Target</th><th className="p-2">Difference</th></tr></thead>
              <tbody>{comparisonData.map((item) => <tr key={item.category} className="border-t border-slate-100"><th className="p-2 font-semibold">{item.category}</th><td className="p-2">{item.Current.toFixed(1)}%</td><td className="p-2">{item.Scenario.toFixed(1)}%</td><td className="p-2">{item.Target.toFixed(1)}%</td><td className="p-2">{item.difference > 0 ? "+" : ""}{item.difference.toFixed(1)} pp</td></tr>)}</tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-emerald-950"><CheckCircle2 className="h-5 w-5" /> Strengths</h3>
          <div className="mt-4 space-y-3">{analysis.strengths.map((item, index) => <details key={item} className="rounded-xl bg-white/70 p-3"><summary className="cursor-pointer text-sm font-semibold text-emerald-950">{item}</summary><p className="mt-2 text-xs leading-5 text-emerald-900">{analysis.score.reasons[index] || "This finding is based on the confirmed portfolio weights."}</p></details>)}</div>
        </article>
        <article className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-amber-950"><AlertTriangle className="h-5 w-5" /> Risks</h3>
          <div className="mt-4 space-y-3">{analysis.risks.map((item) => <details key={item} className="rounded-xl bg-white/70 p-3"><summary className="cursor-pointer text-sm font-semibold text-amber-950">{item}</summary><p className="mt-2 text-xs leading-5 text-amber-900">Why this matters: concentration or allocation drift can make results depend more heavily on a smaller part of the portfolio.</p></details>)}</div>
        </article>
        <article className="rounded-[2rem] border border-blue-200 bg-blue-50 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-blue-950"><CircleHelp className="h-5 w-5" /> Data warnings</h3>
          {analysis.warnings.length ? (
            <div className="mt-4 space-y-3">{analysis.warnings.map((item, index) => <details key={`${item.code}-${item.message}-${index}`} className="rounded-xl bg-white/70 p-3"><summary className="cursor-pointer text-sm font-semibold text-blue-950">{item.message}</summary><p className="mt-2 text-xs leading-5 text-blue-900">{item.action}</p></details>)}</div>
          ) : <p className="mt-4 text-sm leading-6 text-blue-900">No unresolved import warnings remain after your review.</p>}
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <article className="rounded-[2rem] border border-[#F16953]/25 bg-[#fff4ee] p-6">
          <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#F16953]">Highest-priority opportunity</span>
          <h3 className="mt-2 text-2xl font-bold text-[#24364c]">{analysis.freeAction.actionType}: {analysis.freeAction.category}</h3>
          <p className="mt-3 leading-7 text-[#5F7C84]">{analysis.freeAction.reason}</p>
          <p className="mt-3 rounded-xl bg-white p-4 text-sm leading-6 text-[#24364c]"><strong>Educational first step:</strong> {analysis.freeAction.method}</p>
          <p className="mt-2 text-xs text-[#5F7C84]">{plannerStrings.educationalModel}</p>
        </article>
        <article className="rounded-[2rem] border border-[#495E79]/10 bg-white p-6">
          <h3 className="text-xl font-bold text-[#24364c]">Top exposures</h3>
          <p className="mt-1 text-sm text-[#5F7C84]">Largest confirmed positions and concentration context.</p>
          <ol className="mt-4 space-y-3">{analysis.topExposures.map((item, index) => <li key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-[#495E79]">{index + 1}</span><span><span className="block text-sm font-semibold text-[#24364c]">{item.label}</span><span className="block text-xs text-[#5F7C84]">{item.category}</span></span><strong className="text-sm text-[#24364c]">{item.weight.toFixed(1)}%</strong></li>)}</ol>
        </article>
      </div>

      <HoldingsExplorer holdings={analysis.holdings} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
    </motion.section>
  );
}
