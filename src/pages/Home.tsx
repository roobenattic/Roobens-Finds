/**
 * Home — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5, Muted Teal #5F7C84
 * Fonts: Poppins (headings), DM Sans (body)
 * CTA Rule: Free → FREE_DOWNLOAD_URL direct | Premium → PREMIUM_CHECKOUT_URL direct
 * Sections: Hero → Flagship Tool (free/premium) → Benefits → Testimonials → Email capture
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Download, ArrowRight, CheckCircle2, Star,
  BarChart3, Target, Shield, Sparkles, BookOpen, TrendingUp,
  Package, Lightbulb, BookMarked, ExternalLink,
} from "lucide-react";
import { FREE_DOWNLOAD_URL, PREMIUM_CHECKOUT_URL, NEWSLETTER_ENDPOINT, SHOP_URL, isConfigured } from "@/config";

const LOGO_PRIMARY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/RF_primary_logo_transparent_195c0c4f.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const freeFeatures = [
  "Personal financial snapshot worksheet",
  "Income & expense tracker",
  "Emergency fund calculator",
  "Basic portfolio overview section",
  "Printable PDF format",
];

const premiumFeatures = [
  "Everything in the Free version",
  "Editable DOCX — fill it in digitally",
  "Debt review & payoff tracker",
  "Holdings map (stocks, ETFs, crypto)",
  "Portfolio cleanup matrix",
  "90-day AI-ready action board",
  "3 copy-paste AI prompts for ChatGPT/Claude",
  "Dividend income goal planner",
];

const benefits = [
  {
    icon: <Target className="w-5 h-5" />,
    title: "See your full picture",
    desc: "Map every account, asset, and goal in one place — no spreadsheet skills needed.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Know what to fix first",
    desc: "The portfolio cleanup matrix helps you spot what's dragging your returns.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI-ready prompts included",
    desc: "Three ready-to-copy prompts for ChatGPT or Claude — get personalized guidance instantly.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Built for beginners",
    desc: "No jargon, no complex formulas. Just clear sections you fill in at your own pace.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Start free, upgrade when ready",
    desc: "The free version is genuinely useful. Premium adds depth when you need it.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "One-time purchase, yours forever",
    desc: "No subscription. Pay once, download, and use it for as long as you want.",
  },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "First-time investor",
    quote: "I finally understood where my money was going. The cleanup matrix alone was worth it.",
    stars: 5,
  },
  {
    name: "Priya S.",
    role: "Side-hustle earner",
    quote: "The AI prompts saved me hours. I pasted them into ChatGPT and got a real action plan.",
    stars: 5,
  },
  {
    name: "Jordan K.",
    role: "Long-term saver",
    quote: "Clean, simple, and actually useful. I've tried three other planners — this one I actually filled out.",
    stars: 5,
  },
];

// CTA helpers — go direct when configured, fall back to product detail page
function FreeCTA({ className, size }: { className?: string; size?: "default" | "lg" | "sm" }) {
  if (isConfigured(FREE_DOWNLOAD_URL)) {
    return (
      <a href={FREE_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
        <Button size={size} className={className} style={{ fontFamily: "'Poppins', sans-serif" }}>
          <Download className="mr-2 w-4 h-4" />
          Download Free Version
        </Button>
      </a>
    );
  }
  return (
    <Link href="/product">
      <Button size={size} className={className} style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Download className="mr-2 w-4 h-4" />
        Download Free Version
      </Button>
    </Link>
  );
}

function PremiumCTA({ className, size }: { className?: string; size?: "default" | "lg" | "sm" }) {
  if (isConfigured(PREMIUM_CHECKOUT_URL)) {
    return (
      <a href={PREMIUM_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
        <Button size={size} className={className} style={{ fontFamily: "'Poppins', sans-serif" }}>
          Get Premium — $17
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </a>
    );
  }
  return (
    <Link href="/product">
      <Button size={size} className={className} style={{ fontFamily: "'Poppins', sans-serif" }}>
        Get Premium — $17
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </Link>
  );
}

export default function Home() {
 
  return (
    <div className="min-h-screen bg-[#FAF9F7]">

      {/* ── HERO — Brand intro ── */}
   <section className="pt-28 pb-20 md:pt-36 md:pb-28 bg-white border-b border-[#FECFA5]/50">
  <div className="container">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      {/* Left column */}
      <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 bg-[#FECFA5]/40 text-[#495E79] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-[#FECFA5]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F16953]" />
          Gadgets • Tools • Honest recommendations
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-4xl md:text-5xl font-bold text-[#495E79] leading-tight mb-5"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Practical tools and curated finds{" "}
          <span className="text-[#F16953]">
            for smarter everyday decisions.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-lg text-[#5F7C84] leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Roobens Finds curates gadgets, practical tools, and honest
          recommendations — so you can spend less time researching and more
          time doing.
        </motion.p>

        {/* Brand pillars */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-left"
        >
          {[
            { icon: <Package className="w-4 h-4" />, label: "Digital Tools", sub: "Planners & templates" },
            { icon: <Lightbulb className="w-4 h-4" />, label: "Curated Finds", sub: "Honest picks" },
            { icon: <BookMarked className="w-4 h-4" />, label: "Guides & Reviews", sub: "Clear, practical" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "Smart Decisions", sub: "Practical & clear" },
          ].map((p) => (
            <div
              key={p.label}
              className="bg-[#FAF9F7] border border-[#FECFA5] rounded-xl p-3 flex flex-col gap-1"
            >
              <span className="text-[#F16953]">{p.icon}</span>
              <span
                className="text-[#495E79] font-semibold text-xs"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {p.label}
              </span>
              <span
                className="text-[#5F7C84] text-xs"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {p.sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Primary CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6"
        >
          <Link href="/finds">
            <Button
              size="lg"
              className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-8 shadow-lg shadow-[#F16953]/25 text-base w-full sm:w-auto"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Browse Finds
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>

          <Link href="/tools">
            <Button
              size="lg"
              variant="outline"
              className="border-[#495E79]/30 text-[#495E79] hover:bg-[#495E79] hover:text-white font-semibold px-8 text-base w-full sm:w-auto transition-all"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              View Tools
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Right column image */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FECFA5]/30 to-[#F16953]/10 rounded-3xl blur-2xl"></div>

        <div className="relative overflow-hidden rounded-3xl border border-[#FECFA5]/50 shadow-xl bg-white">
          <img
            src="/home/hero-office-setup.jpg"
            alt="Roobens Finds creator desk setup"
            className="w-full h-[320px] md:h-[420px] object-cover object-[center_35%]"
          />
        </div>
      </motion.div>
    </div>
  </div>
</section>

      {/* ── FLAGSHIP TOOL — Portfolio Planner ── */}
      <section className="py-16 bg-[#FAF9F7]">
        <div className="container">
          <div className="text-center mb-10">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-[#F16953] mb-2"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Flagship Tool — Available Now
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold text-[#495E79]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Your financial life, organized in one place.
            </h2>
            <p
              className="text-[#5F7C84] mt-3 max-w-xl mx-auto text-base"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The Portfolio Planner is a beginner-friendly digital workbook for mapping your money, goals, and financial snapshot — available free or as a one-time $17 premium upgrade.
            </p>
          </div>

          {/* Product preview card */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-white rounded-2xl border border-[#FECFA5] shadow-xl shadow-[#495E79]/8 overflow-hidden">
              <div className="bg-[#495E79] px-6 py-4 flex items-center gap-3">
                <img src={LOGO_PRIMARY} alt="Roobens Finds" className="h-7 w-auto" />
                <div>
                  <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Portfolio Planner
                  </p>
                  <p className="text-white/60 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    by Roobens Finds
                  </p>
                </div>
                <span className="ml-auto bg-[#F16953] text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  FREE + PREMIUM
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Sections", value: "10" },
                  { label: "Format", value: "PDF + DOCX" },
                  { label: "AI Prompts", value: "3 included" },
                  { label: "Price", value: "Free or $17" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-[#FAF9F7] rounded-lg">
                    <p className="text-[#F16953] font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {item.value}
                    </p>
                    <p className="text-[#5F7C84] text-xs mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Free vs Premium — direct CTAs */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-[#FECFA5] bg-[#FAF9F7] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Free Version
                </h3>
                <span className="text-2xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>$0</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#495E79]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <CheckCircle2 className="w-4 h-4 text-[#5F7C84] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <FreeCTA className="w-full border border-[#495E79]/30 bg-transparent text-[#495E79] hover:bg-[#495E79] hover:text-white font-semibold transition-all" />
              <p className="text-center text-xs text-[#5F7C84] mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No email required. Instant download.
              </p>
            </div>

            {/* Premium */}
            <div className="rounded-xl border-2 border-[#F16953] bg-white p-6 relative shadow-lg shadow-[#F16953]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F16953] text-white text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Most Complete
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Premium Edition
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#F16953]" style={{ fontFamily: "'Poppins', sans-serif" }}>$17</span>
                  <p className="text-xs text-[#5F7C84]" style={{ fontFamily: "'DM Sans', sans-serif" }}>one-time</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#495E79]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <CheckCircle2 className="w-4 h-4 text-[#F16953] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <PremiumCTA className="w-full bg-[#F16953] hover:bg-[#d95840] text-white font-semibold shadow-md shadow-[#F16953]/20" />
              <p className="text-center text-xs text-[#5F7C84] mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                One-time payment. Instant download. PDF + DOCX included.
              </p>
            </div>
          </div>

          {/* Optional detail link — secondary path only */}
          <div className="text-center mt-6">
            <Link href="/product">
              <span
                className="text-sm text-[#5F7C84] hover:text-[#F16953] underline underline-offset-2 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                View full product details →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-16 bg-white border-y border-[#FECFA5]/50">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F16953] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              What you get
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              What the Portfolio Planner gives you.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="bg-[#FAF9F7] rounded-xl p-5 border border-[#FECFA5]/60 hover:border-[#F16953]/30 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F16953]/10 flex items-center justify-center text-[#F16953] mb-3">
                  {b.icon}
                </div>
                <h3 className="font-semibold text-[#495E79] mb-1.5 text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {b.title}
                </h3>
                <p className="text-[#5F7C84] text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 bg-[#FAF9F7] border-b border-[#FECFA5]/50">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F16953] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              What people say
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Real feedback from real users.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="bg-white rounded-xl p-5 border border-[#FECFA5]/60"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#F16953] text-[#F16953]" />
                  ))}
                </div>
                <p className="text-[#495E79] text-sm leading-relaxed mb-4 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-[#495E79] font-semibold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>{t.name}</p>
                  <p className="text-[#5F7C84] text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP CTA BAND ── */}
      <section className="py-14 bg-[#FECFA5]/30 border-b border-[#FECFA5]">
        <div className="container">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F16953] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Roobens Finds Shop
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Browse digital products and curated items.
              </h2>
              <p className="text-[#5F7C84] text-sm mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                All our digital downloads, planners, and hand-picked finds — in one place.
              </p>
            </div>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button
                size="lg"
                className="bg-[#495E79] hover:bg-[#3a4f6a] text-white font-semibold px-8 shadow-md shadow-[#495E79]/20 whitespace-nowrap"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Visit the Shop
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

     {/* ── EMAIL CAPTURE ── */}
{/* ── EMAIL CAPTURE ── */}
<section className="py-16 bg-[#495E79]">
  <div className="container max-w-xl mx-auto text-center">
    <p
      className="text-xs font-semibold uppercase tracking-widest text-[#FECFA5] mb-3"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      Stay in the loop
    </p>

    <h2
      className="text-2xl md:text-3xl font-bold text-white mb-3"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      New tools, finds, and guides — free.
    </h2>

    <p
      className="text-white/65 text-sm mb-7"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      Join the Roobens Finds list. No spam, no fluff — just practical content
      and early access to new tools and finds.
    </p>

    <form
      action="https://buttondown.com/api/emails/embed-subscribe/roobensfinds"
      method="post"
      className="flex flex-col gap-3"
    >
      <input
        type="text"
        name="metadata[name]"
        placeholder="Your name"
        className="w-full px-4 py-3 rounded-lg text-[#495E79] bg-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#F16953]/50 text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <input
        type="email"
        name="email"
        placeholder="Your email address"
        required
        className="w-full px-4 py-3 rounded-lg text-[#495E79] bg-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#F16953]/50 text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <input
        type="hidden"
        name="redirect"
        value="https://www.roobensfinds.com/thank-you"
      />
      <input type="hidden" name="embed" value="1" />
      <input type="hidden" name="tag" value="homepage" />

      <Button
        type="submit"
        className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-6 shadow-lg shadow-[#F16953]/25 whitespace-nowrap"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Subscribe Free
      </Button>
    </form>

    <p
      className="text-white/40 text-xs mt-3"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      Unsubscribe anytime. No spam, ever.
    </p>
  </div>
</section>
    );
}

      
