/**
 * Product Page — Roobens Finds Portfolio Planner
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Fonts: Poppins (headings), DM Sans (body)
 * Domain: www.roobensfinds.com | Email: info@roobensfinds.com
 */
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Download, ArrowRight, CheckCircle2, XCircle, Star,
  ChevronDown, ChevronUp, FileText, Sparkles, Target,
  BarChart3, Shield, BookOpen, Zap
} from "lucide-react";
import { FREE_DOWNLOAD_URL, PREMIUM_CHECKOUT_URL } from "@/config";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }),
};

const premiumSections = [
  {
    number: "01",
    title: "Personal Financial Snapshot",
    desc: "Capture your current income, expenses, savings rate, and net worth in one clear overview. Understand where you actually stand before making any changes.",
    icon: <Target className="w-5 h-5" />,
  },
  {
    number: "02",
    title: "Cash Flow & Emergency Fund",
    desc: "Map your monthly cash flow and calculate exactly how many months of expenses your emergency fund covers. Know your safety net.",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    number: "03",
    title: "Debt Review",
    desc: "List every debt with interest rate and balance. Identify which to pay off first using the avalanche or snowball method.",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    number: "04",
    title: "Holdings Map",
    desc: "Document all your investments — stocks, ETFs, index funds, crypto, and other assets — in one organized table. See your full portfolio at a glance.",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    number: "05",
    title: "Portfolio Cleanup Matrix",
    desc: "Rate each holding on performance, fees, and alignment with your goals. Decide what to keep, reduce, or exit — with a clear framework.",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    number: "06",
    title: "90-Day AI-Ready Action Board",
    desc: "Set 3 specific financial goals for the next 90 days. Includes 3 ready-to-copy prompts for ChatGPT or Claude to generate a personalized action plan.",
    icon: <Sparkles className="w-5 h-5" />,
  },
];

const comparisonRows = [
  { feature: "Personal financial snapshot", free: true, premium: true },
  { feature: "Income & expense tracker", free: true, premium: true },
  { feature: "Emergency fund calculator", free: true, premium: true },
  { feature: "Basic portfolio overview", free: true, premium: true },
  { feature: "Printable PDF format", free: true, premium: true },
  { feature: "Editable DOCX (fill digitally)", free: false, premium: true },
  { feature: "Debt review & payoff tracker", free: false, premium: true },
  { feature: "Holdings map (stocks, ETFs, crypto)", free: false, premium: true },
  { feature: "Portfolio cleanup matrix", free: false, premium: true },
  { feature: "90-day action board", free: false, premium: true },
  { feature: "3 AI prompts for ChatGPT / Claude", free: false, premium: true },
  { feature: "Dividend income goal planner", free: false, premium: true },
];

const faqs = [
  {
    q: "What format does the planner come in?",
    a: "The Free version is a PDF you can print or fill in by hand. The Premium Edition includes both a PDF and an editable DOCX file so you can type directly into it on your computer.",
  },
  {
    q: "Do I need investing experience to use this?",
    a: "No. The planner is designed specifically for beginners. Every section has clear instructions, and you can fill it out at your own pace. There's no jargon and no complex formulas.",
  },
  {
    q: "What are the AI prompts?",
    a: "The Premium Edition includes 3 ready-to-copy prompts you can paste into ChatGPT or Claude. They're designed to help you get personalized investing guidance based on your specific situation — without needing to know how to write prompts yourself.",
  },
  {
    q: "Is this financial advice?",
    a: "No. The Portfolio Planner is an educational planning tool for personal organization. It helps you understand your own finances — but it is not financial advice. Always consult a licensed financial advisor before making investment decisions.",
  },
  {
    q: "Can I use this if I don't have investments yet?",
    a: "Yes. Several sections are designed for people who are just starting out. The snapshot and cash flow sections are useful even if you have zero investments — they help you understand where you are now.",
  },
  {
    q: "Is the $17 a one-time payment?",
    a: "Yes. You pay once and the files are yours to keep forever. No subscription, no renewal, no hidden fees.",
  },
  {
    q: "What if I start with the free version and want to upgrade later?",
    a: "You can purchase the Premium Edition at any time. The $17 price covers the full Premium pack — PDF + DOCX + AI prompts.",
  },
  {
    q: "How do I get the files after purchase?",
    a: "After completing your purchase, you'll receive an immediate download link. The files are delivered digitally — no shipping, no waiting.",
  },
];

export default function Product() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">

      {/* ── HERO ── */}
      <section className="bg-white border-b border-[#FECFA5]/50 py-20 md:py-24">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 bg-[#FECFA5]/40 text-[#495E79] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-[#FECFA5]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F16953]" />
            Free version available — no email required
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl md:text-5xl font-bold text-[#495E79] leading-tight mb-5"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            The Portfolio Planner
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg text-[#5F7C84] leading-relaxed mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            A beginner-friendly workbook for mapping your finances, reviewing your
            investments, and building a clear 90-day action plan — with AI prompts
            included in the Premium Edition.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          >
            <a href="#free">
              <Button
                size="lg"
                variant="outline"
                className="border-[#495E79]/30 text-[#495E79] hover:bg-[#495E79] hover:text-white font-semibold px-8 w-full sm:w-auto transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Download className="mr-2 w-4 h-4" />
                Download Free Version
              </Button>
            </a>
            <a href="#premium">
              <Button
                size="lg"
                className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-8 shadow-lg shadow-[#F16953]/25 w-full sm:w-auto"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Get Premium — $17
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#5F7C84]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {["No account needed", "Instant download", "One-time $17 for Premium", "Educational use only"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F16953]" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FREE VERSION ── */}
      <section id="free" className="py-16 bg-[#FAF9F7] scroll-mt-20">
        <div className="container max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#FECFA5]/60 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-[#5F7C84]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Start here
                </span>
                <h2
                  className="text-2xl font-bold text-[#495E79] mt-1"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Free Version
                </h2>
              </div>
              <span className="text-3xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>$0</span>
            </div>

            <p className="text-[#5F7C84] text-sm leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              The free version is a genuine starting point — not a teaser. It covers
              the core sections most beginners need: understanding your income, tracking
              expenses, and getting a basic view of your portfolio.
            </p>

            <ul className="space-y-2.5 mb-7">
              {[
                "Personal financial snapshot worksheet",
                "Income & expense tracker",
                "Emergency fund calculator",
                "Basic portfolio overview section",
                "Printable PDF format",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[#495E79]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <CheckCircle2 className="w-4 h-4 text-[#5F7C84] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full bg-[#495E79] hover:bg-[#3a4d65] text-white font-semibold shadow-md"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              onClick={() => FREE_DOWNLOAD_URL ? window.open(FREE_DOWNLOAD_URL, "_blank") : alert("Free download coming soon — check back shortly!")}
            >
              <Download className="mr-2 w-4 h-4" />
              Download Free Version — PDF
            </Button>
            <p className="text-center text-xs text-[#5F7C84] mt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              No email required. Instant download.
            </p>
          </div>
        </div>
      </section>

      {/* ── PREMIUM VALUE STACK ── */}
      <section id="premium" className="py-16 bg-white border-y border-[#FECFA5]/50 scroll-mt-20">
        <div className="container">
          <div className="text-center mb-12">
            <span
              className="text-xs font-semibold uppercase tracking-widest text-[#F16953]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Premium Edition — $17 one-time
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#495E79] mt-2 mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Everything inside the Premium workbook.
            </h2>
            <p className="text-[#5F7C84] max-w-xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              10 structured sections. Editable DOCX. 3 AI prompts for ChatGPT or Claude.
              One-time payment — yours to keep.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
            {premiumSections.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.4}
                className="bg-[#FAF9F7] rounded-xl p-5 border border-[#FECFA5]/60 hover:border-[#F16953]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-[#F16953]/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {s.number}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F16953]/10 flex items-center justify-center text-[#F16953]">
                    {s.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-[#495E79] mb-2 text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {s.title}
                </h3>
                <p className="text-[#5F7C84] text-xs leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* AI Prompts callout */}
          <div className="max-w-2xl mx-auto bg-[#495E79] rounded-2xl p-7 text-center mb-10">
            <Zap className="w-8 h-8 text-[#FECFA5] mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              3 AI Prompts Included
            </h3>
            <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Copy and paste these prompts directly into ChatGPT or Claude. They're
              designed to turn your completed workbook into a personalized investing
              action plan — no prompt engineering required.
            </p>
          </div>

          <div className="max-w-sm mx-auto text-center">
            <Button
              size="lg"
              className="w-full bg-[#F16953] hover:bg-[#d95840] text-white font-bold text-base shadow-xl shadow-[#F16953]/25 py-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              onClick={() => PREMIUM_CHECKOUT_URL ? window.open(PREMIUM_CHECKOUT_URL, "_blank") : alert("Checkout coming soon — check back shortly!")}
            >
              Get Premium Edition — $17
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-[#5F7C84] text-xs mt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              One-time payment. Instant download. PDF + DOCX included.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-16 bg-[#FAF9F7]">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Free vs Premium — side by side.
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#FECFA5]/60 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-[#495E79] px-5 py-3">
              <div className="col-span-1" />
              <div className="text-center">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Free</span>
              </div>
              <div className="text-center">
                <span className="text-[#FECFA5] text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Premium $17</span>
              </div>
            </div>

            {comparisonRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-5 py-3.5 border-b border-[#FECFA5]/30 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FAF9F7]"}`}
              >
                <div className="col-span-1 text-sm text-[#495E79] pr-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {row.feature}
                </div>
                <div className="flex items-center justify-center">
                  {row.free ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5F7C84]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#495E79]/20" />
                  )}
                </div>
                <div className="flex items-center justify-center">
                  {row.premium ? (
                    <CheckCircle2 className="w-4 h-4 text-[#F16953]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#495E79]/20" />
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 px-5 py-4 bg-[#FAF9F7] gap-3">
              <div className="col-span-1" />
              <div className="flex justify-center">
                <a href="#free">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#495E79]/30 text-[#495E79] hover:bg-[#495E79] hover:text-white text-xs font-semibold transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Download
                  </Button>
                </a>
              </div>
              <div className="flex justify-center">
                <Button
                  size="sm"
                  className="bg-[#F16953] hover:bg-[#d95840] text-white text-xs font-bold shadow-md shadow-[#F16953]/20"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  onClick={() => PREMIUM_CHECKOUT_URL ? window.open(PREMIUM_CHECKOUT_URL, "_blank") : alert("Checkout coming soon!")}
                >
                  Get — $17
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 bg-white border-y border-[#FECFA5]/50">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              What people are saying.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Marcus T.", role: "First-time investor", quote: "I finally understood where my money was going. The cleanup matrix alone was worth it.", stars: 5 },
              { name: "Priya S.", role: "Side-hustle earner", quote: "The AI prompts saved me hours. I pasted them into ChatGPT and got a real action plan.", stars: 5 },
              { name: "Jordan K.", role: "Dividend investor", quote: "Clean, simple, and actually useful. I've tried three other planners — this one I actually filled out.", stars: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-[#FAF9F7] rounded-xl p-5 border border-[#FECFA5]/60">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 bg-[#FAF9F7] scroll-mt-20">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#495E79]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Frequently asked questions.
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#FECFA5]/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAF9F7] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#495E79] pr-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#F16953] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#5F7C84] flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-[#FECFA5]/40">
                    <p className="text-[#5F7C84] text-sm leading-relaxed pt-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-[#5F7C84] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Still have a question?{" "}
              <Link href="/contact">
                <span className="text-[#F16953] font-medium hover:underline">
                  Contact us at info@roobensfinds.com
                </span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 bg-[#495E79]">
        <div className="container max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ready to get organized?
          </h2>
          <p className="text-white/65 mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Start with the free version — no email, no account needed.
            Upgrade to Premium when you want the full workbook with AI prompts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#free">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-[#495E79] font-semibold px-8 w-full sm:w-auto transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Download className="mr-2 w-4 h-4" />
                Download Free
              </Button>
            </a>
            <Button
              size="lg"
              className="bg-[#F16953] hover:bg-[#d95840] text-white font-bold px-8 shadow-xl shadow-[#F16953]/30 w-full sm:w-auto"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              onClick={() => PREMIUM_CHECKOUT_URL ? window.open(PREMIUM_CHECKOUT_URL, "_blank") : alert("Checkout coming soon — check back shortly!")}
            >
              Get Premium — $17
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <p className="text-white/40 text-xs mt-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Educational planning tool only. Not financial advice. | info@roobensfinds.com | www.roobensfinds.com
          </p>
        </div>
      </section>
    </div>
  );
}
