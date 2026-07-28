import type { RebalanceMode, Strategy } from "@/types/portfolio";

type Props = {
  strategy: Strategy;
  contributionAmount: number;
  rebalanceMode: RebalanceMode;
  onStrategyChange: (value: Strategy) => void;
  onContributionChange: (value: number) => void;
  onModeChange: (value: RebalanceMode) => void;
};

const contributionPresets = [0, 250, 500, 1000];
const modes: Array<{ value: RebalanceMode; label: string; description: string }> = [
  { value: "contribution-only", label: "Contribution-only", description: "Direct new money toward underweight categories without assuming sales." },
  { value: "gradual", label: "Gradual", description: "Model a measured move toward the target mix over time." },
  { value: "full-rebalance", label: "Full rebalance", description: "Compare the portfolio directly with the complete model mix." },
];

export default function ScenarioExplorer({
  strategy,
  contributionAmount,
  rebalanceMode,
  onStrategyChange,
  onContributionChange,
  onModeChange,
}: Props) {
  return (
    <section className="rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="scenario-explorer-title">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#F16953]">Free scenario explorer</span>
          <h2 id="scenario-explorer-title" className="mt-2 text-2xl font-bold text-[#24364c]">Explore a model without placing a trade</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F7C84]">
            Changes recalculate locally. Targets are educational model allocations, not forecasts or transaction instructions.
          </p>
        </div>
        <span className="rounded-full bg-[#73a7a5]/10 px-3 py-1.5 text-xs font-semibold text-[#496f70]">Contribution-only is the default</span>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-3">
        <fieldset>
          <legend className="text-sm font-bold text-[#24364c]">Strategy</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["growth", "balanced", "income"] as Strategy[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={strategy === value}
                onClick={() => onStrategyChange(value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F16953] ${
                  strategy === value ? "border-[#24364c] bg-[#24364c] text-white" : "border-slate-200 bg-white text-[#495E79] hover:border-[#73a7a5]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-[#24364c]">Monthly contribution</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {contributionPresets.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={contributionAmount === value}
                onClick={() => onContributionChange(value)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#F16953] ${
                  contributionAmount === value ? "border-[#F16953] bg-[#fff4ee] text-[#c84e39]" : "border-slate-200 text-[#495E79]"
                }`}
              >
                ${value.toLocaleString()}
              </button>
            ))}
          </div>
          <label htmlFor="scenario-contribution" className="mt-3 block text-xs font-semibold text-[#5F7C84]">Custom monthly amount</label>
          <input
            id="scenario-contribution"
            type="number"
            min="0"
            step="25"
            value={contributionAmount}
            onChange={(event) => onContributionChange(Math.max(0, Number(event.target.value) || 0))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 focus-visible:ring-2 focus-visible:ring-[#F16953]"
          />
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-[#24364c]">Rebalance approach</legend>
          <div className="mt-3 space-y-2">
            {modes.map((mode) => (
              <label key={mode.value} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${rebalanceMode === mode.value ? "border-[#73a7a5] bg-[#73a7a5]/5" : "border-slate-200"}`}>
                <input
                  type="radio"
                  name="rebalance-mode"
                  value={mode.value}
                  checked={rebalanceMode === mode.value}
                  onChange={() => onModeChange(mode.value)}
                  className="mt-1 accent-[#F16953]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[#24364c]">{mode.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[#5F7C84]">{mode.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
