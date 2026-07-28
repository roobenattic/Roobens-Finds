import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Search } from "lucide-react";
import type { Holding } from "@/types/portfolio";
import { plannerStrings } from "@/data/plannerStrings";

const explanations: Record<string, string> = {
  Growth: "Classified as growth-oriented equity exposure based on the confirmed symbol or fund description.",
  Income: "Classified as income-oriented exposure because the confirmed security emphasizes dividends or distributions.",
  "Real Estate": "Classified as real-estate exposure based on the confirmed REIT or property-focused security.",
  Bonds: "Classified as fixed-income exposure based on the confirmed bond or Treasury-focused security.",
  Cash: "Classified as cash or a money-market position based on the confirmed account description.",
  Other: "Kept in Other because the confirmed role does not match a primary model category.",
  "Needs review": "The import did not provide enough evidence to assign a category. Your correction is the source of truth.",
};

type Props = {
  holdings: Holding[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

export default function HoldingsExplorer({ holdings, selectedCategory, onCategoryChange }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return holdings.filter((holding) => {
      const categoryMatches = !selectedCategory || holding.assetClass === selectedCategory;
      const queryMatches = !normalizedQuery || `${holding.symbol} ${holding.name} ${holding.assetClass}`.toLowerCase().includes(normalizedQuery);
      return categoryMatches && queryMatches;
    });
  }, [holdings, query, selectedCategory]);

  return (
    <section id="holdings-explorer" className="scroll-mt-24 rounded-[2rem] border border-[#495E79]/10 bg-white p-5 shadow-sm md:p-8" aria-labelledby="holdings-explorer-title">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#F16953]">Confirmed positions</span>
          <h2 id="holdings-explorer-title" className="mt-2 text-2xl font-bold text-[#24364c]">Holdings explorer</h2>
          <p className="mt-2 text-sm text-[#5F7C84]">
            {selectedCategory ? `Showing ${selectedCategory} holdings selected from the allocation view.` : "Search or expand a holding to understand its classification."}
          </p>
        </div>
        {selectedCategory ? (
          <button type="button" onClick={() => onCategoryChange(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#495E79] focus-visible:ring-2 focus-visible:ring-[#F16953]">
            Show all holdings
          </button>
        ) : null}
      </div>

      <label className="relative mt-6 block">
        <span className="sr-only">Search holdings</span>
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ticker, name, or category"
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 focus-visible:ring-2 focus-visible:ring-[#F16953]"
        />
      </label>

      <div className="mt-5 grid gap-3">
        {filtered.map((holding) => {
          const isExpanded = expanded === holding.id;
          const needsReview = holding.assetClass === "Needs review" || holding.confidence === "low";
          return (
            <article key={holding.id} className={`rounded-2xl border ${needsReview ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-white"}`}>
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`holding-details-${holding.id}`}
                onClick={() => setExpanded(isExpanded ? null : holding.id)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F16953] md:grid-cols-[1.2fr_.8fr_.8fr_auto]"
              >
                <span>
                  <span className="block font-bold text-[#24364c]">{holding.symbol || holding.name}</span>
                  {holding.name && holding.name !== holding.symbol ? <span className="mt-0.5 block text-xs text-[#5F7C84]">{holding.name}</span> : null}
                </span>
                <span className="hidden text-sm text-[#495E79] md:block">${holding.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} • {holding.weight.toFixed(1)}%</span>
                <span className={`hidden w-fit rounded-full px-2.5 py-1 text-xs font-semibold md:inline-flex ${needsReview ? "bg-amber-100 text-amber-900" : "bg-[#73a7a5]/10 text-[#496f70]"}`}>
                  {needsReview ? plannerStrings.needsReview : holding.assetClass}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#5F7C84] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              <div id={`holding-details-${holding.id}`} hidden={!isExpanded} className="border-t border-slate-200 px-4 py-4">
                <div className="grid gap-4 text-sm sm:grid-cols-3">
                  <div><span className="block text-xs font-semibold uppercase text-slate-500">Value and weight</span><span className="mt-1 block text-[#24364c]">${holding.marketValue.toLocaleString()} • {holding.weight.toFixed(1)}%</span></div>
                  <div><span className="block text-xs font-semibold uppercase text-slate-500">Classification</span><span className="mt-1 block text-[#24364c]">{holding.assetClass}</span></div>
                  <div><span className="block text-xs font-semibold uppercase text-slate-500">Data confidence</span><span className="mt-1 block capitalize text-[#24364c]">{holding.confidence}</span></div>
                </div>
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-[#5F7C84]">{explanations[holding.assetClass] || explanations.Other}</p>
                {holding.warnings.map((item, warningIndex) => (
                  <p key={`${holding.id}-${item.code}-${warningIndex}`} className="mt-3 flex gap-2 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" /> {item.message} {item.action}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
        {!filtered.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <p className="font-semibold text-[#24364c]">No holdings match this view.</p>
            <button type="button" onClick={() => { setQuery(""); onCategoryChange(null); }} className="mt-2 text-sm font-semibold text-[#F16953] focus-visible:ring-2 focus-visible:ring-[#F16953]">Reset filters</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
