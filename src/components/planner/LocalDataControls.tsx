import { useMemo, useState } from "react";
import { Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ENABLE_LOCAL_PORTFOLIO_MEMORY } from "@/config";
import { plannerStrings } from "@/data/plannerStrings";
import { createPortfolioRepository } from "@/lib/portfolioRepository";
import type { PortfolioSnapshot } from "@/types/portfolio";

export default function LocalDataControls({ snapshot }: { snapshot: PortfolioSnapshot }) {
  const repository = useMemo(() => createPortfolioRepository(ENABLE_LOCAL_PORTFOLIO_MEMORY), []);
  const [status, setStatus] = useState("");

  async function saveTemporary() {
    await repository.createSnapshot(snapshot);
    setStatus("This normalized snapshot is temporarily stored on this device.");
  }

  async function clearTemporary() {
    const confirmed = window.confirm("Clear normalized Planner demo data from this device? Raw uploads were never stored.");
    if (!confirmed) return;
    await repository.deleteLocalData();
    setStatus(plannerStrings.clearSuccess);
  }

  return (
    <section className="rounded-2xl border border-[#73a7a5]/30 bg-[#73a7a5]/5 p-5" aria-labelledby="local-memory-title">
      <div className="flex items-start gap-3">
        <Database className="mt-1 h-5 w-5 flex-none text-[#496f70]" />
        <div>
          <h2 id="local-memory-title" className="font-bold text-[#24364c]">{plannerStrings.localDemoTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-[#5F7C84]">{plannerStrings.localDemoDescription}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={saveTemporary}>Save temporary demo snapshot</Button>
            <Button type="button" variant="outline" onClick={clearTemporary} className="text-red-700 hover:bg-red-50 hover:text-red-800">
              <Trash2 className="mr-2 h-4 w-4" /> {plannerStrings.clearLocalData}
            </Button>
          </div>
          <p className="mt-3 text-sm font-medium text-[#496f70]" aria-live="polite">{status}</p>
        </div>
      </div>
    </section>
  );
}
