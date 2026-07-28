import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, FileText, FlaskConical, LockKeyhole, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PREMIUM_APP_ROUTE, PREMIUM_APP_STATUS } from "@/config";

const cards = [
  { title: "Live Dashboard", benefit: "See allocation and health signals update as your portfolio changes.", icon: BarChart3 },
  { title: "Scenario Lab", benefit: "Compare contribution-only, gradual, and full-rebalance paths.", icon: FlaskConical },
  { title: "Exact Action Plan", benefit: "Turn the diagnosis into precise Buy, Reduce, and Hold steps.", icon: ListChecks },
  { title: "Report Center", benefit: "Keep progress history and generate unlimited updated reports.", icon: FileText },
];

export default function PremiumAppPreview({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  const ctaLabel =
    PREMIUM_APP_STATUS === "live"
      ? "Open Premium Workspace"
      : PREMIUM_APP_STATUS === "waitlist"
        ? "Join the Waitlist"
        : "Explore the Premium Preview";

  return (
    <section id="premium-preview" className="scroll-mt-24 py-16 md:py-24" aria-labelledby="premium-heading">
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F16953]">Premium workspace</span>
          <h2 id="premium-heading" className="mt-3 text-3xl font-bold text-[#eff6ff] md:text-5xl">
            Your portfolio, designed to stay useful.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Premium is becoming a private living web app—not a static workbook.
            The upgraded app is currently {PREMIUM_APP_STATUS === "live" ? "live" : "in preview"}.
          </p>
        </div>

        <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4"}`}>
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-full bg-[#FECFA5]/15 px-2.5 py-1 text-xs font-semibold text-[#FECFA5]">Premium</span>
                  <LockKeyhole className="h-4 w-4 text-slate-400" aria-label="Locked preview" />
                </div>
                <div className="mb-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <Icon className="h-7 w-7 text-[#73a7a5]" />
                  <div className="mt-4 flex gap-1" aria-hidden="true">
                    {[48, 72, 58, 88].map((height) => (
                      <span key={height} className="w-1/4 rounded-sm bg-[#F16953]/70" style={{ height: `${height / 3}px` }} />
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{card.benefit}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-slate-950/65 p-6 text-left md:grid-cols-[1fr_1fr_auto] md:items-center">
          <div>
            <p className="font-semibold text-[#FECFA5]">Free</p>
            <p className="mt-1 text-sm text-slate-300">Diagnosis and one category-level first action.</p>
          </div>
          <div>
            <p className="font-semibold text-[#F16953]">Premium</p>
            <p className="mt-1 text-sm text-slate-300">Exact execution plan, scenarios, saved progress, and unlimited reports.</p>
          </div>
          <Link href={PREMIUM_APP_ROUTE}>
            <Button className="w-full bg-[#F16953] hover:bg-[#d95840] md:w-auto">{ctaLabel}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
