import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Plus,
  RefreshCw,
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
  mergeHoldings,
  normalizePortfolioImportError,
  parsePortfolioFile,
  terminatePortfolioOcr,
} from "@/lib/portfolioFiles";
import { generatePortfolioDiagnosisPdf } from "@/lib/generatePortfolioDiagnosisPdf";
// @ts-ignore Shared browser/server calculation module.
import { analyzeSnapshot, buildScenario, buildSnapshot } from "../../lib/portfolioAnalysis.js";
// @ts-ignore Shared deterministic review experience helpers.
import {
  allocationForHolding,
  buildPortfolioReadiness,
  getImportErrorGuidance,
  getPlanGuidance,
  holdingReviewState,
  uploadKey,
} from "../../lib/portfolioReview.js";

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
      className={`group flex min-h-36 cursor-pointer flex-col justify-between rounded-3xl border-2 border-dashed border-[#73a7a5]/45 bg-white p-5 transition focus-within:ring-2 focus-within:ring-[#F16953] hover:-translate-y-1 hover:border-[#F16953] hover:shadow-lg ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <div>
        <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-[#73a7a5]/10 text-[#496f70]">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-[#24364c]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5F7C84]">{description}</p>
      </div>
      <span className="mt-3 inline-flex items-center text-sm font-semibold text-[#F16953]">
        Choose {multiple ? "images" : "a file"} <ArrowRight className="ml-1 h-4 w-4" />
      </span>
      <input id={id} type="file" className="sr-only" accept={accept} multiple={multiple} onChange={onChange} disabled={disabled} />
    </label>
  );
}

function ConfidenceBadge({ confidence }) {
  const tone = confidence === "high"
    ? "bg-emerald-100 text-emerald-800"
    : confidence === "medium"
      ? "bg-blue-100 text-blue-800"
      : "bg-amber-100 text-amber-900";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${tone}`}>
      {confidence === "low" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
      {confidence}
    </span>
  );
}

function StatusBadge({ state }) {
  const tone = state.tone === "success"
    ? "bg-emerald-50 text-emerald-800"
    : state.tone === "warning"
      ? "bg-amber-50 text-amber-900"
      : "bg-red-50 text-red-800";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${tone}`}>{state.status}</span>;
}

function HoldingsTable({ holdings, portfolioTotal, onChange, onConfirm, onRemove, onAdd }) {
  const [expandedRows, setExpandedRows] = useState(() => new Set());

  useEffect(() => {
    setExpandedRows((current) => {
      const next = new Set(current);
      let changed = false;
      for (const holding of holdings) {
        if (holdingReviewState(holding).needsEditing && !next.has(holding.id)) {
          next.add(holding.id);
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [holdings]);

  function toggleRow(id) {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-[#495E79]/10 bg-white">
        {holdings.length ? holdings.map((holding, index) => {
          const state = holdingReviewState(holding);
          const expanded = expandedRows.has(holding.id);
          const allocation = allocationForHolding(holding, portfolioTotal);
          return (
            <article key={holding.id} className={`border-t border-[#495E79]/10 first:border-t-0 ${state.needsEditing ? "bg-red-50/30" : state.needsConfirmation ? "bg-amber-50/30" : ""}`}>
              <div className="grid grid-cols-[minmax(0,1.4fr)_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(8rem,1fr)_7rem_7rem_6rem_auto] sm:px-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#24364c]">{holding.ticker || `Holding ${index + 1}`}</p>
                  <p className="truncate text-xs text-[#5F7C84]">{holding.name || "Name not available"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleRow(holding.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#495E79] hover:border-[#73a7a5] focus-visible:ring-2 focus-visible:ring-[#F16953] sm:order-last"
                  aria-expanded={expanded}
                  aria-controls={`holding-details-${holding.id}`}
                >
                  {expanded ? "Close" : "Edit"}
                  <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
                </button>
                <p className="text-sm font-semibold text-[#24364c] max-sm:order-3">
                  <span className="block text-[10px] uppercase tracking-wide text-[#5F7C84] sm:hidden">Value</span>
                  {Number(holding.marketValue) > 0 ? money.format(holding.marketValue) : "—"}
                </p>
                <p className="text-sm font-semibold text-[#24364c] max-sm:order-4">
                  <span className="block text-[10px] uppercase tracking-wide text-[#5F7C84] sm:hidden">Allocation</span>
                  {allocation > 0 ? `${allocation.toFixed(1)}%` : "—"}
                </p>
                <div className="max-sm:order-5"><ConfidenceBadge confidence={holding.confidence} /></div>
                <div className="max-sm:order-6"><StatusBadge state={state} /></div>
              </div>

              {expanded ? (
                <div id={`holding-details-${holding.id}`} className="border-t border-[#495E79]/10 bg-white px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-xs font-semibold text-[#5F7C84]">Ticker
                      <input value={holding.ticker} onChange={(event) => onChange(holding.id, "ticker", event.target.value.toUpperCase())} placeholder="VTI" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold uppercase focus:ring-2 focus:ring-[#F16953]" />
                    </label>
                    <label className="text-xs font-semibold text-[#5F7C84]">Name
                      <input value={holding.name} onChange={(event) => onChange(holding.id, "name", event.target.value)} placeholder="Optional name" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]" />
                    </label>
                    <label className="text-xs font-semibold text-[#5F7C84]">Shares
                      <input type="number" min="0" step="0.0001" value={holding.shares ?? ""} onChange={(event) => onChange(holding.id, "shares", event.target.value === "" ? null : Number(event.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]" />
                    </label>
                    <label className="text-xs font-semibold text-[#5F7C84]">Market value
                      <input type="number" min="0" step="0.01" value={holding.marketValue ?? ""} onChange={(event) => onChange(holding.id, "marketValue", event.target.value === "" ? null : Number(event.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]" />
                    </label>
                    <label className="text-xs font-semibold text-[#5F7C84]">Category
                      <select value={holding.category} onChange={(event) => onChange(holding.id, "category", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]">
                        {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </label>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-[#5F7C84]">
                      Allocation is calculated automatically from market value.
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <button type="button" onClick={() => onRemove(holding.id)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500">
                      <Trash2 className="h-4 w-4" /> Remove holding
                    </button>
                    {state.needsConfirmation ? (
                      <Button type="button" size="sm" onClick={() => { onConfirm(holding.id); toggleRow(holding.id); }} className="min-h-11 bg-[#24364c] hover:bg-[#172638]">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm details
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          );
        }) : (
          <div className="px-4 py-8 text-center text-sm text-[#5F7C84]">Uploaded holdings will appear here in a compact review list.</div>
        )}
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
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [importAttempt, setImportAttempt] = useState(null);
  const [replaceTarget, setReplaceTarget] = useState("");
  const [totalValue, setTotalValue] = useState("");
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

  const validHoldings = useMemo(() => holdings.filter(
    (holding) => (holding.ticker || holding.name) && (Number(holding.marketValue) > 0 || Number(holding.percent) > 0),
  ), [holdings]);
  const valuesTotal = useMemo(
    () => holdings.reduce((sum, holding) => sum + (Number(holding.marketValue) || 0), 0),
    [holdings],
  );
  const confirmedTotal = Number(totalValue) || valuesTotal;
  const readiness = useMemo(() => buildPortfolioReadiness({
    holdings,
    portfolioTotal: confirmedTotal,
    reviewed: false,
  }), [holdings, confirmedTotal]);
  const planGuidance = getPlanGuidance({ goal, strategy, timelineYears });

  const snapshot = useMemo(() => {
    if (!analysisStarted || !readiness.ready) return null;
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
  }, [analysisStarted, readiness.ready, validHoldings, confirmedTotal, accountType, sourceInfo]);

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
    setAnalysisStarted(false);
    setError(null);
  }

  async function processSelectedFiles(selected, options = {}) {
    const { retry = false, replaceKey = "" } = options;
    const retainedFiles = replaceKey ? files.filter((file) => uploadKey(file) !== replaceKey) : files;
    const unique = retry ? selected : selected.filter((candidate) => !retainedFiles.some((file) =>
      file.name === candidate.name && file.size === candidate.size && file.lastModified === candidate.lastModified,
    ));
    if (retainedFiles.length + unique.length > FILE_LIMITS.maxFiles) {
      setError({
        title: `You can add up to ${FILE_LIMITS.maxFiles} files.`,
        why: "This limit keeps processing fast and private in your browser.",
        next: "Remove an uploaded item before adding another.",
      });
      return;
    }
    if (!unique.length) return;

    setProcessing(true);
    setError(null);
    setWarnings([]);
    setBrokerMessages([]);
    setImportAttempt({
      files: unique,
      names: unique.map((file) => file.name),
      types: unique.map((file) => file.name.split(".").pop()?.toUpperCase() || file.type || "Unknown"),
      status: "processing",
      code: "",
      replaceKey,
    });
    const nextHoldings = replaceKey
      ? holdings.filter((holding) => holding.uploadKey !== replaceKey)
      : [...holdings];
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
        const currentUploadKey = uploadKey(file);
        nextHoldings.push(...parsed.holdings.map((holding) => ({ ...holding, uploadKey: currentUploadKey })));
        nextWarnings.push(...parsed.warnings);
        nextBrokerMessages.push(parsed.brokerMessage);
        parsedSources.push(parsed.source);
        requiresReview = requiresReview || parsed.requiresReview;
      }
      const merged = mergeHoldings(nextHoldings);
      setFiles([...retainedFiles, ...unique]);
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
      if (!merged.length) {
        setError({
          title: "No holdings are ready to review yet.",
          why: "The uploaded data did not include a usable ticker or value.",
          next: "Try a clearer export or add one holding manually.",
        });
      }
      setImportAttempt((current) => ({
        ...current,
        status: requiresReview ? "partial" : "complete",
      }));
      markDataChanged();
    } catch (caught) {
      const normalized = normalizePortfolioImportError(caught);
      setError(getImportErrorGuidance(normalized));
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
      const replacementInput = document.getElementById("replace-portfolio-file");
      if (replacementInput) replacementInput.value = "";
      setReplaceTarget("");
    }
  }

  function removeUpload(key) {
    const nextHoldings = holdings.filter((holding) => holding.uploadKey !== key);
    const nextFiles = files.filter((file) => uploadKey(file) !== key);
    setFiles(nextFiles);
    setHoldings(nextHoldings);
    const nextTotal = nextHoldings.reduce((sum, holding) => sum + (Number(holding.marketValue) || 0), 0);
    setTotalValue(nextTotal > 0 ? nextTotal.toFixed(2) : "");
    if (!nextFiles.length) {
      setWarnings([]);
      setBrokerMessages([]);
      setSourceInfo({
        kind: "manual",
        broker: "Generic import",
        brokerConfidence: "low",
        fileCount: 0,
        label: "User-confirmed holdings",
      });
    } else {
      setSourceInfo((current) => ({ ...current, fileCount: nextFiles.length }));
    }
    setImportAttempt(null);
    markDataChanged();
  }

  function replaceUpload(key) {
    setReplaceTarget(key);
    requestAnimationFrame(() => document.getElementById("replace-portfolio-file")?.click());
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

  function confirmHolding(id) {
    setHoldings((current) => current.map((holding) => holding.id === id
      ? { ...holding, confidence: "high", warnings: [] }
      : holding));
    markDataChanged();
  }

  function addHolding() {
    const holding = emptyHolding();
    setHoldings((current) => [...current, holding]);
    markDataChanged();
    requestAnimationFrame(() => {
      document.getElementById("review-heading")?.scrollIntoView({ behavior: "smooth" });
      requestAnimationFrame(() => document.querySelector(`[id="holding-details-${holding.id}"] input`)?.focus());
    });
  }

  function analyze() {
    if (!readiness.ready) {
      setError({
        title: "Your portfolio needs one more review step.",
        why: readiness.actions[0] || "Some portfolio details are incomplete.",
        next: "Use the readiness summary to finish the remaining item, then analyze.",
      });
      return;
    }
    setError(null);
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
          <input
            id="replace-portfolio-file"
            type="file"
            className="sr-only"
            accept={ACCEPTED_TYPES}
            onChange={(event) => processSelectedFiles(Array.from(event.target.files || []), { replaceKey: replaceTarget })}
            disabled={processing}
          />
          <p className="mt-4 break-all text-xs text-[#5F7C84]">Limits: {FILE_LIMITS.maxFiles} files, 10 MB each, first {FILE_LIMITS.maxPdfPages} PDF pages. Accepted types: {ACCEPTED_TYPES}.</p>
          {processing ? <div className="mt-5 rounded-2xl bg-[#eef2f3] p-4 text-sm font-semibold" role="status">{processingLabel}</div> : null}
          {importAttempt ? (
            <div className="mt-4 rounded-xl border border-[#495E79]/10 bg-slate-50 px-4 py-3 text-sm text-[#495E79]" aria-live="polite">
              <p className="font-semibold">
                {importAttempt.names.join(", ")} <span className="font-normal">({importAttempt.types.join(", ")})</span>
              </p>
              <p className="mt-1 text-xs capitalize">
                Status: {importAttempt.status === "partial" ? "Partial import — review required" : importAttempt.status}
              </p>
            </div>
          ) : null}
          {files.length ? (
            <div className="mt-5" aria-label="Uploaded items">
              <h3 className="text-sm font-bold text-[#24364c]">Uploaded items</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {files.map((file) => {
                  const key = uploadKey(file);
                  const linkedHoldings = holdings.filter((holding) => holding.uploadKey === key);
                  const needsReview = linkedHoldings.some((holding) => holdingReviewState(holding).status !== "Ready");
                  return (
                    <article key={key} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#73a7a5]/25 bg-[#73a7a5]/5 px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#365e60]">{file.name}</p>
                        <p className="mt-0.5 text-xs text-[#5F7C84]">
                          {(file.name.split(".").pop() || file.type || "File").toUpperCase()} · {linkedHoldings.length} holding{linkedHoldings.length === 1 ? "" : "s"} · {needsReview ? "Review needed" : "Imported"}
                        </p>
                      </div>
                      <div className="flex flex-none">
                        <button type="button" onClick={() => replaceUpload(key)} disabled={processing} className="grid h-11 w-11 place-items-center rounded-lg text-[#495E79] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#F16953]" aria-label={`Replace ${file.name}`}>
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeUpload(key)} disabled={processing} className="grid h-11 w-11 place-items-center rounded-lg text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Remove ${file.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
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
              <p className="text-sm font-bold">{error.title}</p>
              <p className="mt-1 text-sm"><strong>Why this happened:</strong> {error.why}</p>
              <p className="mt-1 text-sm"><strong>Next step:</strong> {error.next}</p>
              <div className="mt-3 flex flex-wrap gap-2 pr-14 sm:pr-0">
                {importAttempt?.files?.length ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => processSelectedFiles(importAttempt.files, { retry: true, replaceKey: importAttempt.replaceKey })} disabled={processing}>
                    Retry import
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" onClick={addHolding}>
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
              <p className="mt-2 text-sm text-[#5F7C84]">Complete rows stay compact. Only uncertain or incomplete details need your attention.</p>
            </div>
            <span className="text-sm font-semibold text-[#5F7C84]">{holdings.length} row{holdings.length === 1 ? "" : "s"}</span>
          </div>
          <HoldingsTable
            holdings={holdings}
            portfolioTotal={confirmedTotal}
            onChange={updateHolding}
            onConfirm={confirmHolding}
            onRemove={(id) => {
              const nextHoldings = holdings.filter((holding) => holding.id !== id);
              setHoldings(nextHoldings);
              const nextTotal = nextHoldings.reduce((sum, holding) => sum + (Number(holding.marketValue) || 0), 0);
              setTotalValue(nextTotal > 0 ? nextTotal.toFixed(2) : "");
              markDataChanged();
            }}
            onAdd={addHolding}
          />

          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div>
              <FieldLabel htmlFor="portfolio-total">Portfolio total</FieldLabel>
              <input id="portfolio-total" type="number" min="0" step="0.01" value={totalValue} onChange={(event) => { setTotalValue(event.target.value); markDataChanged(); }} placeholder={valuesTotal > 0 ? valuesTotal.toFixed(2) : "Enter total value"} className="w-full rounded-xl border border-[#495E79]/20 px-4 py-3 focus:ring-2 focus:ring-[#F16953]" />
              <p className="mt-2 text-xs text-[#5F7C84]">
                {valuesTotal > 0 ? `Calculated from position values: ${money.format(valuesTotal)}. Adjust only if your statement total differs.` : "Add market values and the planner will calculate this automatically."}
              </p>
            </div>
            <div className="rounded-2xl border border-[#495E79]/10 bg-slate-50 p-4" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#5F7C84]">Portfolio readiness</p>
                  <p className="mt-1 text-3xl font-bold text-[#24364c]">{readiness.score}%</p>
                </div>
                <div className="h-14 w-14 rounded-full p-1" style={{ background: `conic-gradient(#73a7a5 ${readiness.score}%, #e2e8f0 0)` }} aria-hidden="true">
                  <div className="h-full w-full rounded-full bg-slate-50" />
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <div className="h-full rounded-full bg-[#73a7a5] transition-all" style={{ width: `${readiness.score}%` }} />
              </div>
              <ul className="mt-3 grid gap-1 text-xs text-[#495E79]">
                {readiness.completed.map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="h-4 w-4 rounded-full border-2 border-amber-400" />}
                    {item.label}
                  </li>
                ))}
              </ul>
              <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${readiness.ready ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
                {readiness.ready ? "Ready to analyze." : `Action needed: ${readiness.actions[0]}`}
              </p>
            </div>
          </div>
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
          {planGuidance ? (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <p><strong>Plan guidance:</strong> {planGuidance.message} You can continue with this choice.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setStrategy(planGuidance.suggestion)} className="min-h-11 flex-none border-amber-300 bg-white">
                Use {planGuidance.suggestion}
              </Button>
            </div>
          ) : (
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <CheckCircle2 className="h-4 w-4" /> Your goal, strategy, and timeline are aligned.
            </p>
          )}
          <div className="sticky bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-20 mr-14 mt-7 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur md:static md:mr-0 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
            <Button onClick={analyze} disabled={!readiness.ready || processing} size="lg" className="min-h-12 w-full bg-[#F16953] text-base hover:bg-[#d95840] disabled:cursor-not-allowed">
              {readiness.ready ? "Analyze My Portfolio" : `Next: ${readiness.actions[0] || "Add portfolio data"}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
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
