type PremiumCTAProps = {
  gumroadUrl?: string;
};

export default function PremiumCTA({
  gumroadUrl = "https://roobensfinds.gumroad.com/l/zmsxsr",
}: PremiumCTAProps) {
  return (
    <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-[28px] bg-slate-950 p-6 text-white md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
          Premium
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Unlock your full Smart Money Plan
        </h2>

        <p className="mt-3 max-w-2xl text-slate-300">
          Get the full payoff timeline, downloadable plan, and premium money
          breakdown.
        </p>

        <a
          href={gumroadUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
        >
          Unlock Full Plan
        </a>
      </div>
    </section>
  );
}