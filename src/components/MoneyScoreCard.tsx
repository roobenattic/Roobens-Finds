type MoneyScoreCardProps = {
  score?: number;
};

export default function MoneyScoreCard({ score = 72 }: MoneyScoreCardProps) {
  return (
    <section className="mb-8 rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
        Money Score
      </p>

      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-5xl font-semibold tracking-tight">{score}/100</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Your current money health snapshot based on debt, cash flow, and
            portfolio readiness.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-slate-300">Next best move</p>
          <p className="mt-1 text-lg font-semibold">
            Start with your Debt Freedom Plan.
          </p>
        </div>
      </div>
    </section>
  );
}