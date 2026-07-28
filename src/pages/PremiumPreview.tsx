import { Link } from "wouter";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumAppPreview from "@/components/planner/PremiumAppPreview";
import { PREMIUM_APP_STATUS } from "@/config";

export default function PremiumPreview() {
  const isLive = PREMIUM_APP_STATUS === "live";

  return (
    <main className="min-h-screen bg-[#081423] pt-16 text-white">
      <section className="container py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#73a7a5]/30 bg-[#73a7a5]/10 px-4 py-2 text-sm text-[#b9ddda]">
          <ShieldCheck className="h-4 w-4" />
          {isLive ? "Premium workspace is live" : "Product preview — the app is being upgraded"}
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          A living workspace for every portfolio decision.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Save your portfolio, test scenarios, follow an exact action plan, and
          measure progress over time. This page previews the direction; it does
          not promise access to features that are still being built.
        </p>
        <Link href="/portfolio-planner">
          <Button size="lg" className="mt-8 bg-[#F16953] hover:bg-[#d95840]">
            Start with the Free Diagnosis <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
      <PremiumAppPreview />
    </main>
  );
}
