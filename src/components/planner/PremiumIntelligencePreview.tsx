import { Link } from "wouter";
import { BarChart3, Clock3, FileClock, History, ListChecks, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { plannerStrings } from "@/data/plannerStrings";
import type { PortfolioAnalysis } from "@/types/portfolio";

export default function PremiumIntelligencePreview({ analysis }: { analysis: PortfolioAnalysis }) {
  const gapCount = analysis.scenario.actions.filter((action) => action.direction !== "hold").length;
  const widgets = [
    {
      title: "Full Action Plan",
      icon: ListChecks,
      value: `${gapCount} category ${gapCount === 1 ? "gap" : "gaps"} identified`,
      detail: "Premium turns confirmed gaps into prioritized Buy, Reduce, and Hold steps with exact amounts.",
      visual: <div className="space-y-2">{["Build", "Review", "Hold"].map((label, index) => <div key={label} className="flex items-center gap-2"><span className="w-16 text-xs text-slate-400">{label}</span><span className="h-2 rounded-full bg-[#F16953]/60" style={{ width: `${78 - index * 17}%` }} /></div>)}</div>,
    },
    {
      title: "Contribution Planner",
      icon: BarChart3,
      value: `$${analysis.scenario.contributionAmount.toLocaleString()} monthly model`,
      detail: "See how each contribution can be allocated across underweight categories.",
      visual: <div className="flex h-12 items-end gap-2 blur-[2px]" aria-label="Exact category allocations locked">{[52, 78, 38, 62].map((height) => <span key={height} className="w-1/4 rounded-t bg-[#73a7a5]" style={{ height: `${height}%` }} />)}</div>,
    },
    {
      title: "Scenario Timeline",
      icon: Clock3,
      value: "Planning milestones, not a return forecast",
      detail: "Preview contribution and review checkpoints from today through one year.",
      visual: <div className="flex items-center justify-between text-[10px] text-slate-400">{["Today", "Next", "30d", "90d", "1y"].map((label) => <span key={label} className="relative before:mx-auto before:mb-1 before:block before:h-2 before:w-2 before:rounded-full before:bg-[#F16953]">{label}</span>)}</div>,
    },
    {
      title: "Portfolio History",
      icon: History,
      value: "Available with Portfolio App",
      detail: "Compare normalized portfolio versions and understand what changed.",
      visual: <svg viewBox="0 0 220 60" className="h-14 w-full" aria-hidden="true"><path d="M4 48 C45 44 55 28 88 33 S142 18 170 24 S201 13 216 10" fill="none" stroke="#73a7a5" strokeWidth="3" /><path d="M4 54H216" stroke="#334155" /></svg>,
    },
    {
      title: "Report Center",
      icon: FileClock,
      value: "Unlimited refreshed reports",
      detail: "Keep a dated report history and generate a new PDF after portfolio updates.",
      visual: <div className="grid grid-cols-3 gap-2">{["Today", "May", "Mar"].map((label) => <span key={label} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center text-[10px] text-slate-400">{label}<span className="mt-1 block h-6 rounded bg-white/10" /></span>)}</div>,
    },
  ];

  return (
    <section className="rounded-[2rem] bg-[#081423] px-5 py-12 text-white md:px-8" aria-labelledby="premium-intelligence-title">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#FECFA5]">Living Portfolio App preview</span>
        <h2 id="premium-intelligence-title" className="mt-3 text-3xl font-bold">See what the complete planning loop unlocks.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">These are honest product previews. Exact recommendations, saved history, and locked amounts are not available in the free diagnosis.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <article key={widget.title} className="group rounded-3xl border border-white/10 bg-white/[.06] p-5 transition hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#FECFA5]">
            <div className="flex items-center justify-between">
              <widget.icon className="h-5 w-5 text-[#73a7a5]" />
              <LockKeyhole className="h-4 w-4 text-[#FECFA5]" aria-label="Premium preview locked" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{widget.title}</h3>
            <p className="mt-1 text-xs font-semibold text-[#FECFA5]">{widget.value}</p>
            <div className="my-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">{widget.visual}</div>
            <p className="text-sm leading-6 text-slate-300">{widget.detail}</p>
            <Link href="/premium-preview" className="mt-4 inline-flex rounded-lg text-sm font-semibold text-[#F16953] focus-visible:ring-2 focus-visible:ring-[#FECFA5]">{plannerStrings.premiumCta}</Link>
          </article>
        ))}
      </div>
      <div className="mt-7 text-center">
        <Link href="/premium-preview"><Button className="bg-[#F16953] hover:bg-[#d95840]">{plannerStrings.premiumCta}</Button></Link>
      </div>
    </section>
  );
}
