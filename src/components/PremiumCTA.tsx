import { Link } from "wouter";

export default function PremiumCTA() {
  return (
    <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-[28px] bg-slate-950 p-6 text-white md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FECFA5]">
          Premium workspace preview
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Keep your portfolio plan alive.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Preview saved portfolios, live scenarios, exact action plans, progress
          history, and unlimited updated reports.
        </p>
        <Link
          href="/premium-preview"
          className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
        >
          Preview the Premium App
        </Link>
      </div>
    </section>
  );
}
