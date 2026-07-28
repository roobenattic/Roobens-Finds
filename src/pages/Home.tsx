import { useRef } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  FileDown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import PremiumAppPreview from "@/components/planner/PremiumAppPreview";
import { trustPoints, verifiedTestimonials } from "@/data/testimonials";

const allocation = [
  { name: "Broad market", value: 54, color: "#F16953" },
  { name: "Income", value: 24, color: "#73a7a5" },
  { name: "Real estate", value: 12, color: "#FECFA5" },
  { name: "Cash", value: 10, color: "#58708f" },
];

function ProductPreview() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.55 }}
      whileHover={reduceMotion ? undefined : { y: -5, rotateX: 1, rotateY: -1 }}
      className="relative rounded-[2rem] border border-white/15 bg-white/[0.08] p-4 shadow-2xl shadow-[#F16953]/10 backdrop-blur-xl md:p-6"
      aria-label="Illustrative preview of the portfolio diagnosis"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Diagnosis preview</p>
          <p className="mt-1 font-semibold text-white">Balanced strategy</p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Data reviewed</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-400">Health score</p>
          <div className="relative mx-auto mt-2 h-28 w-28">
            <svg viewBox="0 0 120 120" className="-rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#23354a" strokeWidth="9" />
              <motion.circle
                cx="60" cy="60" r="48" fill="none" stroke="#F16953" strokeWidth="9"
                strokeLinecap="round" strokeDasharray="301.6"
                initial={reduceMotion ? { strokeDashoffset: 69 } : { strokeDashoffset: 301.6 }}
                animate={{ strokeDashoffset: 69 }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-white">77</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
          <p className="px-1 text-xs text-slate-400">Current allocation</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="value" innerRadius={30} outerRadius={48} stroke="none" isAnimationActive={!reduceMotion}>
                  {allocation.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">Current vs target</p>
          <BarChart3 className="h-4 w-4 text-[#73a7a5]" />
        </div>
        {[["Growth", 54, 60], ["Income", 24, 25]].map(([label, current, target]) => (
          <div key={label} className="mb-3 grid grid-cols-[60px_1fr] items-center gap-3 last:mb-0">
            <span className="text-xs text-slate-300">{label}</span>
            <div className="space-y-1">
              <motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${current}%` }} className="h-2 rounded-full bg-[#F16953]" />
              <motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${target}%` }} className="h-2 rounded-full bg-[#73a7a5]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#FECFA5]/20 bg-[#FECFA5]/10 p-4">
        <LockKeyhole className="h-5 w-5 text-[#FECFA5]" />
        <div>
          <p className="text-sm font-semibold text-white">Exact action plan</p>
          <p className="text-xs text-slate-400">Available in the Premium Workspace</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  function updateSpotlight(event: React.MouseEvent<HTMLElement>) {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect || !heroRef.current) return;
    heroRef.current.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    heroRef.current.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <main className="min-h-screen bg-[#081423]">
      <section
        ref={heroRef}
        onMouseMove={updateSpotlight}
        className="relative overflow-hidden pt-16 [--spot-x:70%] [--spot-y:30%]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(500px_circle_at_var(--spot-x)_var(--spot-y),rgba(241,105,83,.18),transparent_60%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,48px_48px,48px_48px]" />
        <div className="container relative grid gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#73a7a5]/30 bg-[#73a7a5]/10 px-4 py-2 text-sm font-medium text-[#b9ddda]">
              <Sparkles className="h-4 w-4" /> Free personalized portfolio diagnosis
            </span>
            <h1 className="mt-7 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
              Understand your portfolio. <span className="text-[#F16953]">Get a clear next step.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 lg:mx-0">
              Upload a screenshot, PDF, CSV, or text file. Review the detected holdings,
              receive a clear portfolio diagnosis, and download a useful free report.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/portfolio-planner">
                <Button size="lg" className="w-full bg-[#F16953] px-7 text-white shadow-lg shadow-[#F16953]/20 hover:bg-[#d95840] active:scale-[.98] sm:w-auto">
                  Generate My Free Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#premium-preview">
                <Button size="lg" variant="outline" className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto">
                  Preview the Premium App
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-400 lg:justify-start">
              {[
                { label: "No login", icon: ShieldCheck },
                { label: "Review before analysis", icon: Check },
                { label: "PDF included", icon: FileDown },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-[#73a7a5]" />{item.label}
                </span>
              ))}
            </div>
          </motion.div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.04] py-6" aria-label="Product trust">
        <div className="container">
          {verifiedTestimonials.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {verifiedTestimonials.map((review) => (
                <blockquote key={review.id} className="rounded-2xl bg-white/5 p-4 text-slate-200">
                  “{review.quote}” <footer className="mt-2 text-sm text-slate-400">{review.name}</footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center justify-center gap-2 text-center text-sm font-medium text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-[#73a7a5]" /> {point}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f7f4ef] py-16 text-[#24364c] md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[.2em] text-[#F16953]">How it works</span>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">From portfolio file to practical clarity.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Upload, title: "Upload", text: "Use screenshots, PDF, CSV, or TXT. Your brokerage password is never required." },
              { icon: Check, title: "Review", text: "Correct detected holdings and confirm the portfolio total before analysis." },
              { icon: Target, title: "Diagnose", text: "See your score, allocation, risks, target comparison, and one next action." },
            ].map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-[#495E79]/10 bg-white p-7 shadow-sm"
              >
                <item.icon className="h-7 w-7 text-[#F16953]" />
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 leading-7 text-[#5F7C84]">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <PremiumAppPreview />
    </main>
  );
}
