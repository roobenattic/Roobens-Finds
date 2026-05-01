import { Link } from "wouter";
import MoneyScoreCard from "../components/MoneyScoreCard";
import DebtPayoffCard from "../components/debt/DebtPayoffCard";
import CashFlowCard from "../components/cashflow/CashFlowCard";
import PremiumCTA from "../components/PremiumCTA";

const features = [
  {
    title: "Portfolio Planner",
    description:
      "Review portfolio inputs, growth projections, and planning scenarios.",
    icon: "📈",
    href: "/portfolio-planner",
    status: "Open Planner",
    enabled: true,
  },
  {
    title: "Debt Payoff",
    description:
      "Compare payoff scenarios and estimate progress toward becoming debt-free.",
    icon: "💳",
    href: "#",
    status: "Active Below",
    enabled: false,
  },
  {
    title: "Cash Flow",
    description:
      "Estimate monthly income, expenses, savings rate, and available surplus.",
    icon: "💵",
    href: "#",
    status: "Active Below",
    enabled: false,
  },
];

export default function SmartMoneyOS() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Fix Your Money System
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            One clean dashboard for your money decisions.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Plan your portfolio, estimate payoff paths, and organize cash flow
            from a simple command center.
          </p>
        </div>

        <MoneyScoreCard />

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const card = (
              <article className="group h-full rounded-[28px] border border-white/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  {feature.icon}
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  {feature.title}
                </h2>

                <p className="mt-3 min-h-24 text-base leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-950">
                    {feature.status}
                  </span>

                  {feature.enabled && (
                    <span className="text-lg transition group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </div>
              </article>
            );

            if (!feature.enabled) {
              return (
                <div
                  key={feature.title}
                  className="cursor-default opacity-80"
                  aria-disabled="true"
                >
                  {card}
                </div>
              );
            }

            return (
              <Link key={feature.title} to={feature.href}>
                {card}
              </Link>
            );
          })}
        </div>

        <DebtPayoffCard />
        <CashFlowCard />

        {/* Premium CTA */}
        <PremiumCTA />
      </section>
    </main>
  );
}