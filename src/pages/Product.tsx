import { Link } from "wouter";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumAppPreview from "@/components/planner/PremiumAppPreview";
import { PREMIUM_APP_STATUS } from "@/config";

const freeFeatures = [
  "Upload screenshots, PDF, CSV, or TXT",
  "Review and correct detected holdings",
  "Portfolio health score and allocation chart",
  "Key strengths and risks",
  "Current vs target preview",
  "One useful category-level action",
  "Personalized diagnosis PDF",
];

const premiumFeatures = [
  "Private login and saved portfolios",
  "Live scenario simulator",
  "Animated, responsive charts",
  "Exact Buy, Reduce, and Hold action plan",
  "Contribution-only, gradual, and full-rebalance modes",
  "Progress history",
  "Unlimited updated PDF reports",
  "Portfolio-aware assistant later",
];

function FeatureList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-7 space-y-3">
      {items.map((item) => (
        <li key={item} className={`flex gap-3 text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#73a7a5]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Product() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] pt-16">
      <section className="container py-16 text-center md:py-24">
        <span className="text-sm font-semibold uppercase tracking-[.2em] text-[#F16953]">Portfolio Planner 2.0</span>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#24364c] md:text-6xl">
          Start with a free diagnosis. Grow into a living workspace.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#5F7C84]">
          Understand what you own and what deserves attention, without connecting
          a brokerage account or treating educational output as financial advice.
        </p>
      </section>

      <section className="container pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-[#495E79]/10 bg-white p-7 shadow-sm md:p-9">
            <span className="rounded-full bg-[#73a7a5]/10 px-3 py-1 text-xs font-semibold text-[#496f70]">Free now</span>
            <h2 className="mt-5 text-3xl font-bold text-[#24364c]">Free Portfolio Diagnosis</h2>
            <p className="mt-3 text-[#5F7C84]">A confirmed snapshot, an explainable score, and one practical next action.</p>
            <FeatureList items={freeFeatures} />
            <Link href="/portfolio-planner">
              <Button className="mt-8 w-full bg-[#F16953] hover:bg-[#d95840]">Generate My Free Report</Button>
            </Link>
          </article>

          <article className="rounded-[2rem] bg-[#081423] p-7 text-white shadow-xl md:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FECFA5]/10 px-3 py-1 text-xs font-semibold text-[#FECFA5]">
              <LockKeyhole className="h-3.5 w-3.5" />
              {PREMIUM_APP_STATUS === "live" ? "Live" : "Being upgraded"}
            </span>
            <h2 className="mt-5 text-3xl font-bold">Premium Portfolio Workspace</h2>
            <p className="mt-3 text-slate-300">A private, living web app for scenarios, exact actions, and progress—not a downloadable workbook.</p>
            <FeatureList items={premiumFeatures} dark />
            <Link href="/premium-preview">
              <Button className="mt-8 w-full bg-[#F16953] hover:bg-[#d95840]">Preview the Premium App</Button>
            </Link>
          </article>
        </div>
      </section>

      <div className="bg-[#081423]">
        <PremiumAppPreview compact />
      </div>
    </main>
  );
}
