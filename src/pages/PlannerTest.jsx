import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
import PortfolioDashboard from "@/components/planner/PortfolioDashboard";
import ScenarioExplorer from "@/components/planner/ScenarioExplorer";
import PremiumIntelligencePreview from "@/components/planner/PremiumIntelligencePreview";
import LocalDataControls from "@/components/planner/LocalDataControls";
import {
  ACCEPTED_TYPES,
  FILE_LIMITS,
  formatPortfolioImportError,
  mergeHoldings,
  normalizePortfolioImportError,
  parsePortfolioFile,
  terminatePortfolioOcr,
} from "@/lib/portfolioFiles";
import { generatePortfolioDiagnosisPdf } from "@/lib/generatePortfolioDiagnosisPdf";
// @ts-ignore Shared browser/server calculation module.
import { analyzeSnapshot, buildScenario, buildSnapshot } from "../../lib/portfolioAnalysis.js";

const CATEGORIES = ["Growth", "Income", "Real Estate", "Bonds", "Cash", "Other", "Needs review"];
const COLORS = ["#F16953", "#73a7a5", "#FECFA5", "#58708f", "#9bd1cd", "#a78b7b"];

const emptyHolding = () => ({
  id: globalThis.crypto?.randomUUID?.() || `holding-${Date.now()}`,
  ticker: "",
  name: "",
  shares: null,
  marketValue: null,
  costBasis: null,
  percent: null,
  category: "Needs review",
  assetClass: "Needs review",
  confidence: "low",
  sourceRef: "Manual entry",
  warnings: [{
    code: "manual-entry",
    message: "This holding was added manually.",
    action: "Confirm its value and category.",
    severity: "info",
  }],
});

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function FieldLabel({ children, htmlFor }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[#24364c]">{children}</label>;
}

function UploadChoice({ id, title, description, accept, icon: Icon, multiple, onChange, disabled }) {
  return (
    <label
      htmlFor={id}
      className={`group flex min-h-48 cursor-pointer flex-col justify-between rounded-3xl border-2 border-dashed border-[#73a7a5]/45 bg-white p-6 transition focus-within:ring-2 focus-within:ring-[#F16953] hover:-translate-y-1 hover:border-[#F16953] hover:shadow-lg ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <div>
        <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-[#73a7a5]/10 text-[#496f70]">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-[#24364c]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5F7C84]">{description}</p>
      </div>
      <span className="mt-5 inline-flex items-center text-sm font-semibold text-[#F16953]">
        Choose {multiple ? "images" : "a file"} <ArrowRight className="ml-1 h-4 w-4" />
      </span>
      <input id={id} type="file" className="sr-only" accept={accept} multiple={multiple} onChange={onChange} disabled={disabled} />
    </label>
  );
}

function HoldingsTable({ holdings, onChange, onRemove, onAdd }) {
  return (
    <div>
      <div className="grid gap-4 xl:hidden">
        {holdings.map((holding, index) => {
          const incomplete = !(holding.ticker || holding.name) || !(Number(holding.marketValue) > 0 || Number(holding.percent) > 0);
          return (
            <article key={holding.id} className={`rounded-2xl border p-4 ${incomplete || holding.confidence === "low" ? "border-amber-200 bg-amber-50/60" : "border-[#495E79]/10 bg-white"}`}>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-[#24364c]">Holding {index + 1}</p>
                <button type="button" onClick={() => onRemove(holding.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Remove ${holding.ticker || holding.name || "holding"}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#5F7C84]">Ticker
                  <input value={holding.ticker} onChange={(event) => onChange(holding.id, "ticker", event.target.value.toUpperCase())} placeholder="VTI" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold uppercase focus:ring-2 focus:ring-[#F16953]" />
                </label>
                <label className="text-xs font-semibold text-[#5F7C84]">Name
                  <input value={holding.name} onChange={(event) => onChange(holding.id, "name", event.target.value)} placeholder="Optional name" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]" />
                </label>
                {[
                  ["shares", "Shares"],
                  ["marketValue", "Market value"],
                  ["percent", "Allocation %"],
                ].map(([field, label]) => (
                  <label key={field} className="text-xs font-semibold text-[#5F7C84]">{label}
                    <input type="number" min="0" step={field === "shares" ? "0.0001" : "0.01"} value={holding[field] ?? ""} onChange={(event) => onChange(holding.id, field, event.target.value === "" ? null : Number(event.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]" />
                  </label>
                ))}
                <label className="text-xs font-semibold text-[#5F7C84]">Category
                  <select value={holding.category} onChange={(event) => onChange(holding.id, "category", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]">
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
              </div>
              <p className="mt-3 text-xs text-[#5F7C84]">Detection confidence: <strong>{holding.confidence}</strong></p>
            </article>
          );
        })}
      </div>

      <div className="hidden max-w-full overflow-x-auto rounded-2xl border border-[#495E79]/10 xl:block">
        <table className="min-w-[980px] w-full border-collapse bg-white text-left text-sm">
          <caption className="sr-only">Review and correct detected portfolio holdings</caption>
          <thead className="bg-[#eef2f3] text-xs uppercase tracking-wide text-[#495E79]">
            <tr>
              <th className="px-3 py-3">Ticker / name</th>
              <th className="px-3 py-3">Shares</th>
              <th className="px-3 py-3">Market value</th>
              <th className="px-3 py-3">Allocation %</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Confidence</th>
              <th className="px-3 py-3"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const incomplete = !(holding.ticker || holding.name) || !(Number(holding.marketValue) > 0 || Number(holding.percent) > 0);
              return (
                <tr key={holding.id} className={`border-t border-[#495E79]/10 ${incomplete || holding.confidence === "low" ? "bg-amber-50/60" : ""}`}>
                  <td className="p-2">
                    <div className="grid gap-1">
                      <input aria-label="Ticker" value={holding.ticker} onChange={(event) => onChange(holding.id, "ticker", event.target.value.toUpperCase())} placeholder="VTI" className="rounded-lg border px-2 py-2 font-semibold uppercase focus:ring-2 focus:ring-[#F16953]" />
                      <input aria-label="Holding name" value={holding.name} onChange={(event) => onChange(holding.id, "name", event.target.value)} placeholder="Optional name" className="rounded-lg border px-2 py-2 text-xs focus:ring-2 focus:ring-[#F16953]" />
                    </div>
                  </td>
                  {["shares", "marketValue", "percent"].map((field) => (
                    <td key={field} className="p-2">
                      <input
                        aria-label={field === "marketValue" ? "Market value" : field}
                        type="number"
                        min="0"
                        step={field === "shares" ? "0.0001" : "0.01"}
                        value={holding[field] ?? ""}
                        onChange={(event) => onChange(holding.id, field, event.target.value === "" ? null : Number(event.target.value))}
                        className="w-28 rounded-lg border px-2 py-2 focus:ring-2 focus:ring-[#F16953]"
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <select aria-label="Holding category" value={holding.category} onChange={(event) => onChange(holding.id, "category", event.target.value)} className="w-36 rounded-lg border px-2 py-2 focus:ring-2 focus:ring-[#F16953]">
                      {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                      holding.confidence === "high" ? "bg-emerald-100 text-emerald-800" :
                      holding.confidence === "medium" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"
                    }`}>
                      {holding.confidence === "low" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {holding.confidence}
                    </span>
                  </td>
                  <td className="p-2">
                    <button type="button" onClick={() => onRemove(holding.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Remove ${holding.ticker || holding.name || "holding"}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button id="add-holding-button" type="button" variant="outline" onClick={onAdd} className="mt-4"><Plus className="mr-2 h-4 w-4" /> Add holding</Button>
    </div>
  );
}

function DiagnosisDashboard({ diagnosis, onDownload }) {
  const reduceMotion = useReducedMotion();
  const allocationData = Object.entries(diagnosis.allocation)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
  const comparisonData = [...new Set([...Object.keys(diagnosis.targetAllocation), ...Object.keys(diagnosis.allocation)])]
    .map((category) => ({
      category,
      Current: diagnosis.allocation[category] || 0,
      Target: diagnosis.targetAllocation[category] || 0,
    }));

  return (
    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} className="mt-8 space-y-6" aria-labelledby="diagnosis-title">
      <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#081423] p-6 text-white md:flex-row md:items-center md:p-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#FECFA5]">Confirmed diagnosis</span>
          <h2 id="diagnosis-title" className="mt-2 text-3xl font-bold">Your portfolio at a glance</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{diagnosis.disclaimer}</p>
        </div>
        <Button onClick={onDownload} className="bg-[#F16953] hover:bg-[#d95840]"><FileText className="mr-2 h-4 w-4" /> Generate PDF</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Portfolio value", money.format(diagnosis.totalValue)],
          ["Holdings", diagnosis.holdingsCount],
          ["Health score", `${diagnosis.score.total}/100`],
          ["Main priority", diagnosis.freeAction.category],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-[#495E79]/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#5F7C84]">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#24364c]">{value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-[#495E79]/10 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#24364c]">Current allocation</h3>
          <p className="sr-only">{allocationData.map((item) => `${item.name} ${item.value.toFixed(1)} percent`).join(", ")}</p>
          <div className="h-72" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} isAnimationActive={!reduceMotion}>
                  {allocationData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-[#495E79]/10 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#24364c]">Current vs target</h3>
          <p className="sr-only">{comparisonData.map((item) => `${item.category}: current ${item.Current.toFixed(1)} percent, target ${item.Target.toFixed(1)} percent`).join(". ")}</p>
          <div className="h-72" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="category" width={82} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="Current" fill="#F16953" radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion} />
                <Bar dataKey="Target" fill="#73a7a5" radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="text-xl font-bold text-emerald-950">Strengths</h3>
          <ul className="mt-4 space-y-3">{diagnosis.strengths.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-emerald-900"><CheckCircle2 className="mt-1 h-4 w-4 flex-none" />{item}</li>)}</ul>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="text-xl font-bold text-amber-950">Risks to review</h3>
          <ul className="mt-4 space-y-3">{diagnosis.risks.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-amber-900"><AlertTriangle className="mt-1 h-4 w-4 flex-none" />{item}</li>)}</ul>
        </article>
      </div>

      <article className="rounded-3xl border border-[#F16953]/25 bg-[#fff4ee] p-6 md:p-8">
        <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#F16953]">One free action • {diagnosis.freeAction.priority} priority</span>
        <h3 className="mt-2 text-2xl font-bold text-[#24364c]">{diagnosis.freeAction.actionType}: {diagnosis.freeAction.category}</h3>
        <p className="mt-3 leading-7 text-[#5F7C84]">{diagnosis.freeAction.reason}</p>
        <p className="mt-3 rounded-2xl bg-white p-4 text-sm leading-6 text-[#24364c]"><strong>Method:</strong> {diagnosis.freeAction.method}</p>
        <p className="mt-2 text-sm text-[#5F7C84]"><strong>Expected direction:</strong> {diagnosis.freeAction.expectedImpact}</p>
      </article>

      <details className="rounded-2xl border border-[#495E79]/10 bg-white p-5">
        <summary className="cursor-pointer font-semibold text-[#24364c]">How this score works</summary>
        <p className="mt-3 text-sm leading-6 text-[#5F7C84]">The score is deterministic: diversification, single-position concentration, liquidity, and alignment with the selected educational target each contribute 25 points.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Diversification", diagnosis.score.diversification],
            ["Concentration", diagnosis.score.concentration],
            ["Liquidity", diagnosis.score.liquidity],
            ["Goal alignment", diagnosis.score.goalAlignment],
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-[#eef2f3] p-3 text-sm text-[#24364c]">{label}: <strong>{value}/25</strong></div>)}
        </div>
      </details>
    </motion.section>
  );
}

export default function PlannerTest() {
  const [files, setFiles] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [brokerMessages, setBrokerMessages] = useState([]);
  const [sourceInfo, setSourceInfo] = useState({
    kind: "manual",
    broker: "Generic import",
    brokerConfidence: "low",
    fileCount: 0,
    label: "User-confirmed holdings",
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [importAttempt, setImportAttempt] = useState(null);
  const [totalValue, setTotalValue] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [strategy, setStrategy] = useState("balanced");
  const [goal, setGoal] = useState("long-term-growth");
  const [accountType, setAccountType] = useState("brokerage");
  const [timelineYears, setTimelineYears] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [rebalanceMode, setRebalanceMode] = useState("contribution-only");

  useEffect(() => () => {
    void terminatePortfolioOcr();
  }, []);

  const validHoldings = holdings.filter(
    (holding) => (holding.ticker || holding.name) && (Number(holding.marketValue) > 0 || Number(holding.percent) > 0),
  );
  const valuesTotal = holdings.reduce((sum, holding) => sum + (Number(holding.marketValue) || 0), 0);
  const percentageTotal = holdings.reduce((sum, holding) => sum + (Number(holding.percent) || 0), 0);
  const confirmedTotal = Number(totalValue) || valuesTotal;
  const percentagesOkay = percentageTotal === 0 || Math.abs(percentageTotal - 100) <= 2;
  const canConfirm = validHoldings.length > 0 && confirmedTotal > 0 && percentagesOkay;

  const snapshot = useMemo(() => {
    if (!analysisStarted || !reviewed) return null;
    try {
      return buildSnapshot({
        holdings: validHoldings,
        totalValue: confirmedTotal,
        accountType,
        source: sourceInfo,
      });
    } catch {
      return null;
    }
  }, [analysisStarted, reviewed, validHoldings, confirmedTotal, accountType, sourceInfo]);

  const diagnosis = useMemo(() => {
    if (!snapshot) return null;
    const scenario = buildScenario(snapshot, {
      strategy,
      contributionAmount: monthlyContribution,
      rebalanceMode,
      name: `${strategy} ${rebalanceMode} model`,
    });
    return analyzeSnapshot(snapshot, scenario);
  }, [snapshot, strategy, monthlyContribution, rebalanceMode]);

  function markDataChanged() {
    setReviewed(false);
    setAnalysisStarted(false);
    setError("");
  }

  async function processSelectedFiles(selected, retry = false) {
    const unique = retry ? selected : selected.filter((candidate) => !files.some((file) =>
      file.name === candidate.name && file.size === candidate.size && file.lastModified === candidate.lastModified,
    ));
    if (files.length + unique.length > FILE_LIMITS.maxFiles) {
      setError(`Choose no more than ${FILE_LIMITS.maxFiles} files per diagnosis.`);
      return;
    }
    if (!unique.length) return;

    setProcessing(true);
    setError("");
    setWarnings([]);
    setBrokerMessages([]);
    setImportAttempt({
      files: unique,
      names: unique.map((file) => file.name),
      types: unique.map((file) => file.name.split(".").pop()?.toUpperCase() || file.type || "Unknown"),
      status: "processing",
      code: "",
    });
    const nextHoldings = [...holdings];
    const nextWarnings = [];
    const nextBrokerMessages = [];
    const parsedSources = [];
    let requiresReview = false;
    try {
      for (let index = 0; index < unique.length; index += 1) {
        const file = unique[index];
        setProcessingLabel(`Reading ${file.name} (${index + 1} of ${unique.length})…`);
        const parsed = await parsePortfolioFile(file, {
          onProgress: ({ status, progress }) => {
            const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);
            setProcessingLabel(`${status || "Reading screenshot"} ${percent}% — ${file.name}`);
          },
        });
        nextHoldings.push(...parsed.holdings);
        nextWarnings.push(...parsed.warnings);
        nextBrokerMessages.push(parsed.brokerMessage);
        parsedSources.push(parsed.source);
        requiresReview = requiresReview || parsed.requiresReview;
      }
      const merged = mergeHoldings(nextHoldings);
      setFiles((current) => [...current, ...unique]);
      setHoldings(merged);
      setWarnings(nextWarnings);
      setBrokerMessages(nextBrokerMessages);
      if (parsedSources.length) {
        const brokers = [...new Set(parsedSources.map((source) => source.broker))];
        const brokerConfidence = parsedSources.every((source) => source.brokerConfidence === "high")
          ? "high"
          : parsedSources.some((source) => source.brokerConfidence === "medium")
            ? "medium"
            : "low";
        setSourceInfo({
          kind: parsedSources.length > 1 ? "mixed" : parsedSources[0].kind,
          broker: brokers.length === 1 ? brokers[0] : "Mixed imports",
          brokerConfidence,
          fileCount: parsedSources.length,
          label: brokers.length === 1 ? parsedSources[0].label : "Multiple user-provided files",
        });
      }
      const detectedTotal = merged.reduce((sum, holding) => sum + (Number(holding.marketValue) || 0), 0);
      if (detectedTotal > 0 && !Number(totalValue)) setTotalValue(detectedTotal.toFixed(2));
      if (!merged.length) setError("No holdings were detected. Add a row manually or try a clearer export.");
      setImportAttempt((current) => ({
        ...current,
        status: requiresReview ? "partial" : "complete",
      }));
      markDataChanged();
    } catch (caught) {
      const normalized = normalizePortfolioImportError(caught);
      setError(formatPortfolioImportError(caught));
      setImportAttempt((current) => ({
        ...current,
        status: "failed",
        code: normalized.code,
      }));
      if (normalized.code === "NO-POSITIONS-01") {
        requestAnimationFrame(() => document.getElementById("review-heading")?.scrollIntoView({ behavior: "smooth" }));
      }
    } finally {
      await terminatePortfolioOcr();
      setProcessing(false);
      setProcessingLabel("");
      const screenshotInput = document.getElementById("portfolio-screenshots");
      const portfolioInput = document.getElementById("portfolio-files");
      if (screenshotInput) screenshotInput.value = "";
      if (portfolioInput) portfolioInput.value = "";
    }
  }

  function updateHolding(id, field, value) {
    setHoldings((current) => current.map((holding) => {
      if (holding.id !== id) return holding;
      const next = { ...holding, [field]: value, confidence: field === "confidence" ? value : "high" };
      if (field === "category") next.assetClass = value;
      if (field === "ticker") next.symbol = value;
      if (field === "category" && value !== "Needs review") {
        next.warnings = (next.warnings || []).filter((item) => item.code !== "unknown-classification");
      }
      return next;
    }));
    markDataChanged();
  }

  function analyze() {
    if (!canConfirm || !reviewed) {
      setError("Review the holdings, confirm the total, and check the confirmation box first.");
      return;
    }
    setError("");
    setAnalysisStarted(true);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => document.getElementById("diagnosis-results")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }));
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] pb-24 pt-16 text-[#24364c]">
      <section className="bg-[#081423] py-14 text-white md:py-20">
        <div className="container">
          <span className="text-sm font-semibold uppercase tracking-[.2em] text-[#FECFA5]">Private by design • No brokerage login</span>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">Free Portfolio Diagnosis</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Upload, review, and confirm your holdings before receiving an explainable
            educational diagnosis and personalized PDF.
          </p>
          <ol className="mt-8 grid gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6" aria-label="Planner steps">
            {["Upload", "Review holdings", "Set plan", "Analyze", "Preview diagnosis", "Generate PDF"].map((step, index) => (
              <li key={step} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"><span className="mr-2 text-[#F16953]">{index + 1}</span>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container py-10">
        <section className="rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="text-2xl font-bold">1. Upload portfolio data</h2>
          <p className="mt-2 text-sm leading-6 text-[#5F7C84]">Files are processed in your browser. Raw financial documents are not sent to a third-party AI API.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <UploadChoice
                id="portfolio-screenshots"
                title="Upload Screenshots"
                description="PNG, JPG/JPEG, or WEBP. Select multiple screenshots when your holdings span more than one screen."
                accept="image/png,image/jpeg,image/webp"
                icon={ImageIcon}
                multiple
                disabled={processing}
                onChange={(event) => processSelectedFiles(Array.from(event.target.files || []))}
              />
            </div>
            <div>
              <UploadChoice
                id="portfolio-files"
                title="Upload Portfolio File"
                description="PDF, CSV, or TXT. Text-based PDFs are read first; scanned pages use limited in-browser OCR."
                accept="application/pdf,text/csv,.csv,.txt"
                icon={FileSpreadsheet}
                disabled={processing}
                onChange={(event) => processSelectedFiles(Array.from(event.target.files || []))}
              />
            </div>
          </div>
          <p className="mt-4 break-all text-xs text-[#5F7C84]">Limits: {FILE_LIMITS.maxFiles} files, 10 MB each, first {FILE_LIMITS.maxPdfPages} PDF pages. Accepted types: {ACCEPTED_TYPES}.</p>
          {processing ? <div className="mt-5 rounded-2xl bg-[#eef2f3] p-4 text-sm font-semibold" role="status">{processingLabel}</div> : null}
          {importAttempt ? (
            <div className="mt-4 rounded-xl border border-[#495E79]/10 bg-slate-50 px-4 py-3 text-sm text-[#495E79]" aria-live="polite">
              <p className="font-semibold">
                {importAttempt.names.join(", ")} <span className="font-normal">({importAttempt.types.join(", ")})</span>
              </p>
              <p className="mt-1 text-xs capitalize">
                Status: {importAttempt.status === "partial" ? "Partial import — review required" : importAttempt.status}
                {importAttempt.code ? ` · ${importAttempt.code}` : ""}
              </p>
            </div>
          ) : null}
          {files.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {files.map((file) => <span key={`${file.name}-${file.lastModified}`} className="rounded-full bg-[#73a7a5]/10 px-3 py-1.5 text-xs font-medium text-[#496f70]">{file.name}</span>)}
            </div>
          ) : null}
          {brokerMessages.length ? (
            <div className="mt-4 grid gap-2" aria-live="polite">
              {brokerMessages.map((message, index) => (
                <p key={`${message}-${index}`} className="rounded-xl border border-[#73a7a5]/25 bg-[#73a7a5]/5 px-4 py-3 text-sm text-[#365e60]">
                  {message}
                </p>
              ))}
            </div>
          ) : null}
          {warnings.map((warning) => (
            <p key={`${warning.code}-${warning.message}`} className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <span><strong>{warning.message}</strong>{warning.action ? ` ${warning.action}` : ""}</span>
            </p>
          ))}
          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
              <p className="text-sm font-semibold">{error}</p>
              <div className="mt-3 flex flex-wrap gap-2 pr-14 sm:pr-0">
                {importAttempt?.files?.length ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => processSelectedFiles(importAttempt.files, true)} disabled={processing}>
                    Retry import
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  document.getElementById("review-heading")?.scrollIntoView({ behavior: "smooth" });
                  requestAnimationFrame(() => document.getElementById("add-holding-button")?.focus());
                }}>
                  Add holding manually
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-8 rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="review-heading">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 id="review-heading" className="text-2xl font-bold">2. Review and correct holdings</h2>
              <p className="mt-2 text-sm text-[#5F7C84]">Yellow rows are incomplete or were detected with low confidence.</p>
            </div>
            <span className="text-sm font-semibold text-[#5F7C84]">{holdings.length} row{holdings.length === 1 ? "" : "s"}</span>
          </div>
          <HoldingsTable
            holdings={holdings}
            onChange={updateHolding}
            onRemove={(id) => { setHoldings((current) => current.filter((holding) => holding.id !== id)); markDataChanged(); }}
            onAdd={() => { setHoldings((current) => [...current, emptyHolding()]); markDataChanged(); }}
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="portfolio-total">Confirmed total portfolio value</FieldLabel>
              <input id="portfolio-total" type="number" min="0" step="0.01" value={totalValue} onChange={(event) => { setTotalValue(event.target.value); markDataChanged(); }} placeholder={valuesTotal > 0 ? valuesTotal.toFixed(2) : "Enter total value"} className="w-full rounded-xl border border-[#495E79]/20 px-4 py-3 focus:ring-2 focus:ring-[#F16953]" />
              {valuesTotal > 0 ? <p className="mt-2 text-xs text-[#5F7C84]">Position values total {money.format(valuesTotal)}.</p> : null}
            </div>
            <div className={`rounded-2xl p-4 ${percentagesOkay ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
              <p className="font-semibold">Allocation check: {percentageTotal.toFixed(1)}%</p>
              <p className="mt-1 text-xs leading-5">{percentageTotal === 0 ? "Percentages will be calculated from position values." : percentagesOkay ? "Percentages are approximately 100% and will be normalized." : "Correct the rows so percentages are within 98–102%."}</p>
            </div>
          </div>
          <label className={`mt-6 flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${canConfirm ? "cursor-pointer border-[#73a7a5]/40 bg-[#73a7a5]/5" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
            <input type="checkbox" checked={reviewed} disabled={!canConfirm} onChange={(event) => { setReviewed(event.target.checked); setAnalysisStarted(false); }} className="mt-1 h-4 w-4 accent-[#F16953]" />
            I reviewed these holdings, corrected incomplete rows, and confirm the portfolio total is accurate enough for this educational diagnosis.
          </label>
        </section>

        <section className="mt-8 rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="text-2xl font-bold">3. Set your plan</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <FieldLabel htmlFor="goal">Goal</FieldLabel>
              <select id="goal" value={goal} onChange={(event) => setGoal(event.target.value)} className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-[#F16953]">
                <option value="long-term-growth">Long-term growth</option>
                <option value="income">Generate income</option>
                <option value="preservation">Preserve capital</option>
                <option value="simplify">Simplify portfolio</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="strategy">Strategy</FieldLabel>
              <select id="strategy" value={strategy} onChange={(event) => setStrategy(event.target.value)} className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-[#F16953]">
                <option value="balanced">Balanced</option>
                <option value="growth">Growth</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="account-type">Account type</FieldLabel>
              <select id="account-type" value={accountType} onChange={(event) => setAccountType(event.target.value)} className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-[#F16953]">
                <option value="brokerage">Brokerage</option>
                <option value="roth-ira">Roth IRA</option>
                <option value="traditional-ira">Traditional IRA</option>
                <option value="401k">401(k)</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="timeline">Timeline (years)</FieldLabel>
              <input id="timeline" type="number" min="1" max="60" value={timelineYears} onChange={(event) => setTimelineYears(Number(event.target.value))} className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-[#F16953]" />
            </div>
            <div>
              <FieldLabel htmlFor="contribution">Monthly contribution</FieldLabel>
              <input id="contribution" type="number" min="0" value={monthlyContribution} onChange={(event) => setMonthlyContribution(Number(event.target.value))} className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-[#F16953]" />
            </div>
          </div>
          <Button onClick={analyze} disabled={!reviewed || !canConfirm || processing} size="lg" className="mt-7 w-full bg-[#F16953] hover:bg-[#d95840] disabled:cursor-not-allowed">
            Analyze Confirmed Portfolio <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        <div id="diagnosis-results">
          {diagnosis && snapshot ? (
            <div className="mt-8 space-y-8">
              <ScenarioExplorer
                strategy={strategy}
                contributionAmount={monthlyContribution}
                rebalanceMode={rebalanceMode}
                onStrategyChange={setStrategy}
                onContributionChange={setMonthlyContribution}
                onModeChange={setRebalanceMode}
              />
              <PortfolioDashboard analysis={diagnosis} onDownload={() => generatePortfolioDiagnosisPdf(diagnosis)} />
              <LocalDataControls snapshot={snapshot} />
              <PremiumIntelligencePreview analysis={diagnosis} />
            </div>
          ) : analysisStarted ? (
            <p className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800" role="alert">The reviewed data could not produce a trustworthy diagnosis. Recheck the holdings and total.</p>
          ) : null}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#495E79]/10 bg-white p-5 text-sm leading-6 text-[#5F7C84]">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-[#73a7a5]" />
          Educational portfolio analysis only. No trades are executed, no brokerage credentials are requested, and no output should be treated as financial, investment, tax, or legal advice.
        </div>
      </div>
    </main>
  );
}
