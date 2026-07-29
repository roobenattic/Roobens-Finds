import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  FileDown,
  FileSpreadsheet,
  FileText,
  FolderUp,
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
  dedupeWarnings,
  getImportErrorGuidance,
  getPlanGuidance,
  holdingReviewState,
  uploadKey,
} from "../../lib/portfolioReview.js";

const CATEGORY_OPTIONS = [
  { value: "Growth", description: "stocks or funds focused on long-term growth" },
  { value: "Income", description: "dividend or income-paying investments" },
  { value: "Real Estate", description: "REITs and property-focused funds" },
  { value: "Bonds", description: "bond, Treasury, or fixed-income funds" },
  { value: "Cash", description: "cash and money-market holdings" },
  { value: "Other", description: "an investment that does not fit the groups above" },
  { value: "Needs review", description: "we still need enough information to suggest a type" },
];
const COLORS = ["#F16953", "#73a7a5", "#FECFA5", "#58708f", "#9bd1cd", "#a78b7b"];
const WORKFLOW_STAGES = [
  { label: "Portfolio files", detail: "Your screenshots or statements", icon: FolderUp },
  { label: "AI organizes", detail: "Likely holdings are grouped", icon: BrainCircuit },
  { label: "You confirm", detail: "Only uncertain details need you", icon: BadgeCheck },
  { label: "Diagnosis PDF", detail: "A clear, educational summary", icon: FileDown },
];

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

function removeUploadSource(holdings, key) {
  return holdings.flatMap((holding) => {
    const sources = [...new Set([...(holding.uploadKeys || []), holding.uploadKey].filter(Boolean))];
    if (!sources.includes(key)) return [holding];
    const remainingSources = sources.filter((source) => source !== key);
    if (!remainingSources.length) return [];
    return [{ ...holding, uploadKey: remainingSources[0], uploadKeys: remainingSources }];
  });
}

function FieldLabel({ children, htmlFor }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[#24364c]">{children}</label>;
}

function WorkflowVisual({ compact = false }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`relative ${compact ? "max-w-none rounded-2xl bg-[#081423] px-4 py-4" : "mt-10 max-w-4xl"}`} aria-label="How portfolio diagnosis works">
      <div className={`absolute left-[10%] right-[10%] hidden h-px bg-gradient-to-r from-[#73a7a5]/30 via-[#F16953]/80 to-[#FECFA5]/40 sm:block ${compact ? "top-9" : "top-7"}`} aria-hidden="true">
        <motion.span
          className="absolute -top-1.5 h-3 w-3 rounded-full bg-[#FECFA5] shadow-[0_0_18px_rgba(254,207,165,.9)]"
          initial={reduceMotion ? { left: "50%" } : { left: "0%" }}
          animate={reduceMotion ? undefined : { left: ["0%", "98%"] }}
          transition={reduceMotion ? undefined : { duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 }}
        />
      </div>
      <div className="relative grid grid-cols-4 gap-2">
        {WORKFLOW_STAGES.map(({ label, detail, icon: Icon }, index) => (
          <motion.div
            key={label}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: index * 0.15, duration: 0.45 }}
            className="flex min-w-0 flex-col items-center text-center"
          >
            <span className={`relative z-10 grid place-items-center rounded-full border border-white/15 bg-[#122338] text-[#FECFA5] shadow-lg shadow-black/20 ${compact ? "h-10 w-10" : "h-14 w-14"}`}>
              <Icon className={compact ? "h-4 w-4" : "h-6 w-6"} aria-hidden="true" />
            </span>
            <span className={`${compact ? "mt-2 text-[11px]" : "mt-3 text-xs sm:text-sm"} font-bold text-white`}>{label}</span>
            {!compact ? <span className="mt-1 hidden max-w-36 text-xs leading-5 text-slate-400 sm:block">{detail}</span> : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ImportMethod({ id, title, description, action, accept, icon: Icon, multiple, onChange, disabled }) {
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border border-[#495E79]/15 bg-white p-4 text-left transition focus-within:ring-2 focus-within:ring-[#F16953] hover:border-[#F16953]/60 hover:shadow-md sm:p-5 ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#73a7a5]/10 text-[#496f70]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-[#24364c]">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-[#5F7C84]">{description}</p>
        <span className="mt-2 inline-flex items-center text-sm font-semibold text-[#F16953]">
          {action} <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </span>
      </div>
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

function HoldingsTable({
  holdings,
  portfolioTotal,
  onChange,
  onConfirm,
  onConfirmAll,
  onRemove,
  onAdd,
  onReturnToUpload,
}) {
  const [activeTab, setActiveTab] = useState("attention");
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const rows = useMemo(() => {
    const priority = (row) => row.state.needsEditing ? 0 : row.state.needsConfirmation ? 1 : 2;
    return holdings.map((holding, index) => ({
      holding,
      index,
      state: holdingReviewState(holding),
    })).sort((left, right) => priority(left) - priority(right) || left.index - right.index);
  }, [holdings]);
  const attentionRows = rows.filter(({ state }) => state.status !== "Ready");
  const readyRows = rows.filter(({ state }) => state.status === "Ready");
  const filteredRows = activeTab === "attention" ? attentionRows : activeTab === "ready" ? readyRows : rows;
  const visibleRows = filteredRows.slice(0, visibleCount);

  useEffect(() => {
    if (expandedRowId && !holdings.some((holding) => holding.id === expandedRowId)) {
      setExpandedRowId(null);
    }
  }, [expandedRowId, holdings]);

  useEffect(() => {
    if (activeTab === "attention" && rows.length > 0 && attentionRows.length === 0) {
      setActiveTab("all");
    }
  }, [activeTab, attentionRows.length, rows.length]);

  function selectTab(tab) {
    setActiveTab(tab);
    setExpandedRowId(null);
    setVisibleCount(8);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Holding review filters">
        {[
          ["attention", "Needs attention", attentionRows.length],
          ["ready", "Ready", readyRows.length],
          ["all", "All holdings", rows.length],
        ].map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={activeTab === value}
            onClick={() => selectTab(value)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#F16953] ${
              activeTab === value ? "bg-[#24364c] text-white" : "border border-slate-200 bg-white text-[#495E79]"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#495E79]/10 bg-white">
        {visibleRows.length ? visibleRows.map(({ holding, state }, index) => {
          const expanded = expandedRowId === holding.id;
          const allocation = allocationForHolding(holding, portfolioTotal);
          return (
            <article key={holding.id} className={`border-t border-[#495E79]/10 first:border-t-0 ${state.needsEditing ? "bg-red-50/30" : state.needsConfirmation ? "bg-amber-50/30" : ""}`}>
              <div className="grid grid-cols-[minmax(0,1.4fr)_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(8rem,1fr)_7rem_7rem_6rem_auto] sm:px-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#24364c]">{holding.ticker || `Holding ${index + 1}`}</p>
                  <p className="truncate text-xs text-[#5F7C84]">{holding.name || "Name not available"}</p>
                  <p className={`mt-1 text-xs font-semibold ${state.status === "Ready" ? "text-emerald-700" : "text-amber-800"}`}>
                    {state.exactIssue}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedRowId(expanded ? null : holding.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#495E79] hover:border-[#73a7a5] focus-visible:ring-2 focus-visible:ring-[#F16953] sm:order-last"
                  aria-expanded={expanded}
                  aria-controls={`holding-details-${holding.id}`}
                >
                  {expanded ? "Close" : state.needsConfirmation ? "Review" : "Edit"}
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
                <div className="max-sm:order-5">
                  <ConfidenceBadge confidence={holding.confidence} />
                  <span className="sr-only">{holding.confidenceReason || `${holding.confidence} confidence extraction`}</span>
                </div>
                <div className="max-sm:order-6"><StatusBadge state={state} /></div>
              </div>

              {expanded ? (
                <div id={`holding-details-${holding.id}`} className="border-t border-[#495E79]/10 bg-white px-4 py-4">
                  <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-[#495E79]">
                    <strong>Why this confidence:</strong> {holding.confidenceReason || "Some imported details need your confirmation."}
                  </p>
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
                    <label className="text-xs font-semibold text-[#5F7C84]">What kind of investment is this?
                      <select value={holding.category} onChange={(event) => onChange(holding.id, "category", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#F16953]">
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.value} — {option.description}</option>
                        ))}
                      </select>
                      <span className="mt-1 block font-normal leading-5">
                        {CATEGORY_OPTIONS.find((option) => option.value === holding.category)?.description}
                      </span>
                    </label>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-[#5F7C84]">
                      Allocation is calculated automatically from market value.
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <button type="button" onClick={() => onRemove(holding.id)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500">
                      <Trash2 className="h-4 w-4" /> Remove false holding
                    </button>
                    {state.needsConfirmation ? (
                      <Button type="button" size="sm" onClick={() => { onConfirm(holding.id); setExpandedRowId(null); }} className="min-h-11 bg-[#24364c] hover:bg-[#172638]">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm details
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          );
        }) : (
          <div className="px-4 py-8 text-center text-sm text-[#5F7C84]">
            {holdings.length ? `No holdings in the ${activeTab === "attention" ? "Needs attention" : "Ready"} view.` : "Uploaded holdings will appear here."}
          </div>
        )}
      </div>
      {filteredRows.length > visibleCount ? (
        <Button type="button" variant="outline" onClick={() => setVisibleCount((count) => count + 8)} className="mt-4">
          Show 8 more
        </Button>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button id="add-holding-button" type="button" variant="outline" onClick={onAdd}><Plus className="mr-2 h-4 w-4" /> Add holding</Button>
        {attentionRows.some(({ state }) => state.needsConfirmation) ? (
          <Button type="button" variant="outline" onClick={onConfirmAll}><CheckCircle2 className="mr-2 h-4 w-4" /> Confirm all ready holdings</Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={onReturnToUpload}>Return to upload</Button>
      </div>
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
  const [activeStep, setActiveStep] = useState("upload");
  const [files, setFiles] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [unrecognized, setUnrecognized] = useState([]);
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
  const [reviewConsent, setReviewConsent] = useState(false);
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
    filesProcessed: files.length,
    unrecognizedCount: unrecognized.length,
    consent: reviewConsent,
  }), [holdings, confirmedTotal, files.length, reviewConsent, unrecognized.length]);
  const groupedWarnings = useMemo(() => dedupeWarnings(warnings), [warnings]);
  const groupedBrokerMessages = useMemo(() => [...new Set(brokerMessages)], [brokerMessages]);
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
    setReviewConsent(false);
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
      ? removeUploadSource(holdings, replaceKey)
      : [...holdings];
    const nextUnrecognized = replaceKey
      ? unrecognized.filter((item) => item.uploadKey !== replaceKey)
      : [...unrecognized];
    const nextWarnings = [];
    const nextBrokerMessages = [];
    const parsedSources = [];
    let requiresReview = false;
    try {
      for (let index = 0; index < unique.length; index += 1) {
        const file = unique[index];
        setProcessingLabel(`Organizing ${file.name} (${index + 1} of ${unique.length})…`);
        const parsed = await parsePortfolioFile(file, {
          onProgress: ({ progress }) => {
            const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);
            setProcessingLabel(`Organizing screenshot ${percent}% — ${file.name}`);
          },
        });
        const currentUploadKey = uploadKey(file);
        nextHoldings.push(...parsed.holdings.map((holding) => ({
          ...holding,
          uploadKey: currentUploadKey,
          uploadKeys: [currentUploadKey],
        })));
        nextUnrecognized.push(...parsed.unrecognized.map((item) => ({ ...item, uploadKey: currentUploadKey })));
        nextWarnings.push(...parsed.warnings);
        nextBrokerMessages.push(parsed.brokerMessage);
        parsedSources.push(parsed.source);
        requiresReview = requiresReview || parsed.requiresReview;
      }
      const merged = mergeHoldings(nextHoldings);
      setFiles([...retainedFiles, ...unique]);
      setHoldings(merged);
      setUnrecognized(nextUnrecognized);
      setWarnings(dedupeWarnings(nextWarnings));
      setBrokerMessages([...new Set(nextBrokerMessages)]);
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
      setActiveStep("review");
    } catch (caught) {
      const normalized = normalizePortfolioImportError(caught);
      setError({ ...getImportErrorGuidance(normalized), supportCode: normalized.code });
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
    const nextHoldings = removeUploadSource(holdings, key);
    const nextUnrecognized = unrecognized.filter((item) => item.uploadKey !== key);
    const nextFiles = files.filter((file) => uploadKey(file) !== key);
    setFiles(nextFiles);
    setHoldings(nextHoldings);
    setUnrecognized(nextUnrecognized);
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
      const remainingWarnings = (holding.warnings || []).filter((item) => {
        if (field === "ticker") return item.code !== "symbol-uncertain";
        if (field === "marketValue") return !["market-value-missing", "calculated-market-value"].includes(item.code);
        if (field === "category") return !["category-unknown", "unknown-classification"].includes(item.code);
        return true;
      });
      const next = {
        ...holding,
        [field]: value,
        confidence: field === "confidence" ? value : "medium",
        confidenceReason: field === "confidence"
          ? holding.confidenceReason
          : "You corrected this holding. Confirm it once after reviewing the changes.",
        warnings: field === "confidence"
          ? remainingWarnings
          : [...remainingWarnings.filter((item) => item.code !== "user-corrected"), {
            code: "user-corrected",
            message: "You corrected this holding.",
            action: "Confirm the updated details.",
            severity: "info",
          }],
      };
      if (field === "category") next.assetClass = value;
      if (field === "ticker") next.symbol = value;
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

  function confirmAllReadyHoldings() {
    setHoldings((current) => current.map((holding) => {
      const state = holdingReviewState(holding);
      return state.needsConfirmation ? { ...holding, confidence: "high", warnings: [] } : holding;
    }));
    markDataChanged();
  }

  function clearAllUploads() {
    setFiles([]);
    setHoldings((current) => current.filter((holding) => !holding.uploadKey));
    setUnrecognized([]);
    setWarnings([]);
    setBrokerMessages([]);
    setImportAttempt(null);
    setTotalValue("");
    setSourceInfo({
      kind: "manual",
      broker: "Generic import",
      brokerConfidence: "low",
      fileCount: 0,
      label: "User-confirmed holdings",
    });
    markDataChanged();
  }

  function addHolding() {
    const holding = emptyHolding();
    setHoldings((current) => [...current, holding]);
    markDataChanged();
    setActiveStep("review");
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
    setActiveStep("diagnosis");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => document.getElementById("diagnosis-results")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }));
  }

  const workflowStarted = activeStep !== "upload" || files.length > 0 || holdings.length > 0 || unrecognized.length > 0;
  const steps = [
    { id: "upload", label: "Upload", available: true, complete: files.length > 0 || holdings.length > 0 },
    { id: "review", label: "Review", available: holdings.length > 0 || unrecognized.length > 0, complete: readiness.ready },
    { id: "plan", label: "Set plan", available: readiness.ready, complete: analysisStarted },
    { id: "diagnosis", label: "Diagnosis", available: Boolean(diagnosis), complete: Boolean(diagnosis) },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ef] pb-24 pt-16 text-[#24364c]">
      {!workflowStarted ? <section className="bg-[#081423] py-14 text-white md:py-20">
        <div className="container">
          <span className="text-sm font-semibold uppercase tracking-[.2em] text-[#FECFA5]">Private by design • No brokerage login</span>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">Free Portfolio Diagnosis</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Turn the portfolio files you already have into an organized, explainable
            diagnosis—without connecting your brokerage account.
          </p>
          <WorkflowVisual />
        </div>
      </section> : null}

      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="container py-3">
          {workflowStarted ? <p className="mb-2 text-sm font-bold text-[#24364c]">Free Portfolio Diagnosis</p> : null}
          <nav className="grid grid-cols-4 gap-1" aria-label="Portfolio diagnosis progress">
            {steps.map((step, index) => {
              const active = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!step.available}
                  onClick={() => setActiveStep(step.id)}
                  aria-current={active ? "step" : undefined}
                  title={!step.available ? (step.id === "review" ? "Upload a file or add a holding first." : step.id === "plan" ? "Finish and confirm the portfolio review first." : "Analyze the portfolio first.") : undefined}
                  className={`min-h-11 rounded-xl px-2 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-[#F16953] sm:text-sm ${
                    active ? "bg-[#24364c] text-white" : step.complete ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-[#5F7C84]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="mr-1">{step.complete ? "✓" : index + 1}.</span>{step.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {workflowStarted ? (
        <div className="container pt-5">
          <WorkflowVisual compact />
        </div>
      ) : null}

      <div className="container py-10">
        {activeStep === "upload" ? <section className="rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="upload-heading">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#F16953]">Start here</span>
            <h2 id="upload-heading" className="mt-2 text-3xl font-bold">Upload your portfolio</h2>
            <p className="mt-2 text-sm leading-6 text-[#5F7C84]">
              Choose whichever format is easiest. We’ll organize the holdings, then ask you to check only the details that look uncertain.
            </p>
            <div className="mt-6 rounded-3xl border border-[#73a7a5]/25 bg-[#f4f8f7] p-3 sm:p-5">
              <p className="mb-3 px-1 text-sm font-semibold text-[#365e60]">How would you like to import?</p>
              <div className="grid gap-3">
                <ImportMethod
                id="portfolio-screenshots"
                title="Screenshot import"
                description="Use one or more clear screenshots from your brokerage app."
                action="Choose screenshots"
                accept="image/png,image/jpeg,image/webp"
                icon={ImageIcon}
                multiple
                disabled={processing}
                onChange={(event) => processSelectedFiles(Array.from(event.target.files || []))}
              />
                <ImportMethod
                id="portfolio-files"
                title="PDF, CSV, or TXT import"
                description="Use a statement, spreadsheet export, or saved text file."
                action="Choose a file"
                accept="application/pdf,text/csv,.csv,.txt"
                icon={FileSpreadsheet}
                disabled={processing}
                onChange={(event) => processSelectedFiles(Array.from(event.target.files || []))}
              />
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[#5F7C84]">
              <ShieldCheck className="h-4 w-4 flex-none text-[#73a7a5]" aria-hidden="true" />
              Your files stay in this browser while we organize them.
            </p>
          </div>
          <input
            id="replace-portfolio-file"
            type="file"
            className="sr-only"
            accept={ACCEPTED_TYPES}
            onChange={(event) => processSelectedFiles(Array.from(event.target.files || []), { replaceKey: replaceTarget })}
            disabled={processing}
          />
          <details className="mx-auto mt-4 max-w-3xl text-xs text-[#5F7C84]">
            <summary className="cursor-pointer font-semibold">File guidelines</summary>
            <p className="mt-2 leading-5">
              Add up to {FILE_LIMITS.maxFiles} files, no more than 10 MB each. For longer PDFs, we’ll start with the first {FILE_LIMITS.maxPdfPages} pages.
            </p>
          </details>
          {processing ? <div className="mt-5 rounded-2xl bg-[#eef2f3] p-4 text-sm font-semibold" role="status">{processingLabel}</div> : null}
          {importAttempt ? (
            <div className="mt-4 rounded-xl border border-[#495E79]/10 bg-slate-50 px-4 py-3 text-sm text-[#495E79]" aria-live="polite">
              <p className="font-semibold">
                {importAttempt.names.join(", ")} <span className="font-normal">({importAttempt.types.join(", ")})</span>
              </p>
              <p className="mt-1 text-xs capitalize">
                {importAttempt.status === "processing"
                  ? "Organizing your portfolio…"
                  : importAttempt.status === "partial"
                    ? "Ready for you to check"
                    : importAttempt.status === "complete"
                      ? "Import complete"
                      : "Import needs another try"}
              </p>
            </div>
          ) : null}
          {files.length ? (
            <details className="mt-5 rounded-2xl border border-[#495E79]/10 bg-slate-50 p-4" aria-label="Uploaded items">
              <summary className="cursor-pointer text-sm font-bold text-[#24364c]">Uploaded items ({files.length})</summary>
              <div className="mt-3 grid gap-2">
                {files.map((file) => {
                  const key = uploadKey(file);
                  const linkedHoldings = holdings.filter((holding) =>
                    (holding.uploadKeys || [holding.uploadKey]).includes(key),
                  );
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
                        <button type="button" onClick={() => processSelectedFiles([file], { retry: true, replaceKey: key })} disabled={processing} className="grid h-11 w-11 place-items-center rounded-lg text-[#495E79] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#F16953]" aria-label={`Retry ${file.name}`}>
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => replaceUpload(key)} disabled={processing} className="grid h-11 w-11 place-items-center rounded-lg text-[#495E79] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#F16953]" aria-label={`Replace ${file.name}`}>
                          <FileSpreadsheet className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeUpload(key)} disabled={processing} className="grid h-11 w-11 place-items-center rounded-lg text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Remove ${file.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearAllUploads} disabled={processing} className="mt-3 text-red-700">
                Clear all uploaded items
              </Button>
            </details>
          ) : null}
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
              {error.supportCode ? (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer font-semibold">Support details</summary>
                  <p className="mt-1">Internal code: {error.supportCode}</p>
                </details>
              ) : null}
            </div>
          ) : null}
          {holdings.length || unrecognized.length ? (
            <Button type="button" onClick={() => setActiveStep("review")} className="mt-6 min-h-12 w-full bg-[#F16953] hover:bg-[#d95840]">
              Continue to review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </section> : null}

        {activeStep === "review" ? <section className="rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="review-heading">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 id="review-heading" className="text-2xl font-bold">Review and confirm holdings</h2>
              <p className="mt-2 text-sm text-[#5F7C84]">Complete rows stay compact. Only uncertain or incomplete details need your attention.</p>
            </div>
            <span className="text-sm font-semibold text-[#5F7C84]">{holdings.length} row{holdings.length === 1 ? "" : "s"}</span>
          </div>
          <div className="mb-5 rounded-2xl border border-[#73a7a5]/25 bg-[#73a7a5]/5 p-4 text-sm leading-6 text-[#365e60]" aria-live="polite">
            <p className="font-semibold">
              We organized {files.length} file{files.length === 1 ? "" : "s"} and found {holdings.length} likely holding{holdings.length === 1 ? "" : "s"}.
              {" "}{readiness.editingRows + readiness.confirmationRows} need review.
            </p>
            {groupedBrokerMessages.length ? (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">About this import</summary>
                <p className="mt-1">{groupedBrokerMessages.join(" ")}</p>
              </details>
            ) : null}
            {groupedWarnings.length ? (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">{groupedWarnings.length} import note{groupedWarnings.length === 1 ? "" : "s"}</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {groupedWarnings.map((warning) => (
                    <li key={`${warning.code}-${warning.message}`}>{warning.message}{warning.action ? ` ${warning.action}` : ""}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
          <HoldingsTable
            holdings={holdings}
            portfolioTotal={confirmedTotal}
            onChange={updateHolding}
            onConfirm={confirmHolding}
            onConfirmAll={confirmAllReadyHoldings}
            onReturnToUpload={() => setActiveStep("upload")}
            onRemove={(id) => {
              const nextHoldings = holdings.filter((holding) => holding.id !== id);
              setHoldings(nextHoldings);
              const nextTotal = nextHoldings.reduce((sum, holding) => sum + (Number(holding.marketValue) || 0), 0);
              setTotalValue(nextTotal > 0 ? nextTotal.toFixed(2) : "");
              markDataChanged();
            }}
            onAdd={addHolding}
          />

          {unrecognized.length ? (
            <details className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <summary className="cursor-pointer font-semibold">
                Additional statement text ignored ({unrecognized.length})
              </summary>
              <p className="mt-2 leading-6">These lines did not have enough position evidence, so they were not turned into holdings.</p>
              <ul className="mt-3 max-h-52 space-y-2 overflow-auto">
                {unrecognized.map((item) => (
                  <li key={item.id} className="rounded-lg bg-white/70 px-3 py-2">
                    <span className="font-semibold">{item.candidate || "Statement text"}:</span> {item.text}
                    <span className="block text-xs text-amber-800">{item.reason}</span>
                  </li>
                ))}
              </ul>
              <Button type="button" variant="ghost" size="sm" onClick={() => setUnrecognized([])} className="mt-3 text-amber-950">
                Remove all ignored text
              </Button>
            </details>
          ) : null}

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
              {readiness.actions.length ? (
                <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-950">
                  <p className="font-semibold">Issues remaining: {readiness.actions.length}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {readiness.actions.map((action) => <li key={action}>{action}</li>)}
                  </ul>
                </div>
              ) : (
                <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900">Holding data is complete.</p>
              )}
            </div>
          </div>
          <label className={`mt-6 flex min-h-12 items-start gap-3 rounded-2xl border p-4 text-sm ${readiness.consentEnabled ? "cursor-pointer border-[#73a7a5]/30 bg-white" : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"}`}>
            <input
              type="checkbox"
              checked={reviewConsent}
              disabled={!readiness.consentEnabled}
              onChange={(event) => setReviewConsent(event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-[#F16953]"
            />
            <span>
              <strong>I reviewed the holdings and confirm they represent my portfolio.</strong>
              {!readiness.consentEnabled ? <span className="mt-1 block">Resolve the issues above before confirming.</span> : null}
            </span>
          </label>
          <Button
            type="button"
            onClick={() => setActiveStep("plan")}
            disabled={!readiness.ready}
            className="mt-5 min-h-12 w-full bg-[#F16953] hover:bg-[#d95840] disabled:cursor-not-allowed"
          >
            {readiness.ready
              ? "Continue to set plan"
              : !readiness.dataReady
                ? `Resolve: ${readiness.actions[0] || "Finish portfolio review"}`
                : "Confirm the reviewed portfolio to continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section> : null}

        {activeStep === "plan" ? <section className="rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="text-2xl font-bold">Set your plan</h2>
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
          <Button type="button" variant="ghost" onClick={() => setActiveStep("review")} className="mt-5">
            Back to portfolio review
          </Button>
          <div className="sticky bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-20 mr-14 mt-7 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur md:static md:mr-0 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
            <Button onClick={analyze} disabled={!readiness.ready || processing} size="lg" className="min-h-12 w-full bg-[#F16953] text-base hover:bg-[#d95840] disabled:cursor-not-allowed">
              {readiness.ready ? "Analyze My Portfolio" : `Resolve: ${readiness.actions[0] || "Add portfolio data"}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section> : null}

        {activeStep === "diagnosis" ? <div id="diagnosis-results">
          {diagnosis && snapshot ? (
            <div className="space-y-8">
              <Button type="button" variant="ghost" onClick={() => setActiveStep("plan")}>Back to plan</Button>
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
            <p className="rounded-2xl bg-red-50 p-5 text-red-800" role="alert">We could not create a diagnosis from the reviewed data. Return to Review and check that each holding has a symbol or name and a market value.</p>
          ) : null}
        </div> : null}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#495E79]/10 bg-white p-5 text-sm leading-6 text-[#5F7C84]">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-[#73a7a5]" />
          Educational portfolio analysis only. No trades are executed, no brokerage credentials are requested, and no output should be treated as financial, investment, tax, or legal advice.
        </div>
      </div>
    </main>
  );
}
