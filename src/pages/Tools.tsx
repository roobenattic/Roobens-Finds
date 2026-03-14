/**
 * Tools Page — Roobens Finds Digital Product Catalog
 * Design: Warm Authority — cream #FAF9F7, navy #495E79, gold #F16953
 * Structure: Brand tools catalog — flagship + upcoming products
 * Built to scale as more digital tools are added to the brand.
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Wallet,
  Target,
  CreditCard,
  ArrowRight,
  Download,
  Lock,
  CheckCircle2,
  Sparkles,
  Star,
} from "lucide-react";

const PRODUCT_MOCKUP = "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/product-mockup-JTHwG2mphwMYfjMFiBKXCW.webp";

const tools = [
  {
    id: "portfolio-planner",
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Portfolio Planner",
    tagline: "Organize your investments in one clean planner",
    desc: "A beginner-friendly digital planner to track your stocks, ETFs, dividends, and investment goals. Available free or as a one-time premium upgrade.",
    price: "Free / $17",
    priceNote: "Free version + $17 one-time for premium",
    status: "live",
    badge: "Flagship",
    badgeColor: "bg-[#F16953] text-white",
    features: [
      "Basic portfolio tracker (Free)",
      "Dividend income log (Premium)",
      "Asset allocation view (Premium)",
      "Goal planner & review templates",
      "AI instruction page (Premium)",
      "Beginner investing guide",
    ],
    href: "/product",
    freeHref: "/product#free",
    premiumHref: "/product#premium",
    image: PRODUCT_MOCKUP,
  },
  {
    id: "budget-tracker",
    icon: <Wallet className="w-6 h-6" />,
    title: "Budget Tracker",
    tagline: "Save more, spend smarter, stress less",
    desc: "A simple monthly budget planner designed for people who want to take control of their spending and build a savings habit that actually sticks.",
    price: "Coming Soon",
    priceNote: "Notify me when it launches",
    status: "coming-soon",
    badge: "Coming Soon",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      "Monthly income & expense tracker",
      "Category-based spending breakdown",
      "Savings goal progress tracker",
      "Bill payment reminder section",
      "Monthly review template",
    ],
    href: "/tools",
    freeHref: null,
    premiumHref: null,
    image: null,
  },
  {
    id: "savings-goal-planner",
    icon: <Target className="w-6 h-6" />,
    title: "Savings Goal Planner",
    tagline: "Set a target. Build a plan. Hit your goal.",
    desc: "Set savings targets, track your progress, and celebrate milestones on the road to financial freedom. Designed for people who need a clear, visual plan.",
    price: "In Development",
    priceNote: "Subscribe to get early access",
    status: "in-development",
    badge: "In Development",
    badgeColor: "bg-emerald-100 text-emerald-700",
    features: [
      "Multi-goal savings tracker",
      "Visual progress milestones",
      "Timeline & deadline planner",
      "Contribution calculator",
      "Motivation & habit tracker",
    ],
    href: "/tools",
    freeHref: null,
    premiumHref: null,
    image: null,
  },
  {
    id: "debt-payoff-planner",
    icon: <CreditCard className="w-6 h-6" />,
    title: "Debt Payoff Planner",
    tagline: "See your debt-free date and stay on track",
    desc: "Visualize your debt-free date and stay motivated with a clear, step-by-step payoff strategy. Supports snowball and avalanche methods.",
    price: "Planned",
    priceNote: "Subscribe to be notified",
    status: "planned",
    badge: "Planned",
    badgeColor: "bg-amber-100 text-amber-700",
    features: [
      "Debt inventory tracker",
      "Snowball & avalanche methods",
      "Monthly payment planner",
      "Debt-free date calculator",
      "Progress visualization",
    ],
    href: "/tools",
    freeHref: null,
    premiumHref: null,
    image: null,
  },
];

const categories = [
  { label: "All Tools", count: 4 },
  { label: "Investing", count: 1 },
  { label: "Budgeting", count: 1 },
  { label: "Savings", count: 1 },
  { label: "Debt", count: 1 },
];

export default function Tools() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">
      {/* Hero */}
      <section className="bg-[#495E79] py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#F16953] blur-3xl" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <span className="text-[#F16953] text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Roobens Finds
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-5 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Simple Tools for Smarter Personal Finance
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              We build beginner-friendly digital tools that help everyday people
              organize their money, track their investments, and build
              long-term financial habits — without the overwhelm.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {[
                "Beginner-friendly by design",
                "No subscriptions",
                "Instant digital downloads",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F16953]" />
                  <span className="text-white/65 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="bg-white border-b border-[#FECFA5] sticky top-16 z-30">
        <div className="container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  i === 0
                    ? "bg-[#495E79] text-white"
                    : "bg-[#FAF9F7] text-[#495E79]/60 hover:bg-[#FECFA5] border border-[#FECFA5]"
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {cat.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${i === 0 ? "bg-white/20 text-white" : "bg-[#495E79]/10 text-[#495E79]/50"}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 md:py-20 bg-[#FAF9F7]">
        <div className="container">
          <div className="space-y-8">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`bg-white border rounded-sm overflow-hidden transition-all ${
                  tool.status === "live"
                    ? "border-[#F16953]/40 shadow-md shadow-[#F16953]/5"
                    : "border-[#FECFA5]"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Content */}
                  <div className="lg:col-span-8 p-7 md:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        tool.status === "live" ? "bg-[#F16953]/15 text-[#F16953]" : "bg-[#FAF9F7] text-[#495E79]/30"
                      }`}>
                        {tool.status === "live" ? tool.icon : <Lock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                          <h2 className="text-[#495E79] font-bold text-xl" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.4rem" }}>
                            {tool.title}
                          </h2>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tool.badgeColor}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {tool.badge}
                          </span>
                        </div>
                        <p className="text-[#F16953] text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {tool.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="text-[#495E79]/65 text-sm leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {tool.desc}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {tool.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${tool.status === "live" ? "text-[#F16953]" : "text-[#495E79]/25"}`} />
                          <span className={`text-xs ${tool.status === "live" ? "text-[#495E79]/75" : "text-[#495E79]/40"}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {tool.status === "live" ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Link href={tool.freeHref!}>
                          <Button variant="outline" className="border-[#495E79]/25 text-[#495E79] hover:bg-[#495E79] hover:text-white font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            <Download className="mr-2 w-4 h-4" />
                            Get Free Version
                          </Button>
                        </Link>
                        <Link href={tool.premiumHref!}>
                          <Button className="bg-[#F16953] hover:bg-[#a0822e] text-white font-semibold shadow-md shadow-[#F16953]/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Get Premium — $17
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={tool.href}>
                          <span className="text-[#495E79]/50 text-sm hover:text-[#F16953] transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Full details →
                          </span>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[#FAF9F7] border border-[#FECFA5] rounded-sm px-4 py-2.5">
                          <Sparkles className="w-4 h-4 text-[#495E79]/30" />
                          <span className="text-[#495E79]/50 text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {tool.priceNote}
                          </span>
                        </div>
                        <Link href="/contact">
                          <Button variant="outline" size="sm" className="border-[#495E79]/20 text-[#495E79]/60 hover:border-[#F16953]/40 hover:text-[#F16953] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Notify Me
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Image / Preview */}
                  <div className="lg:col-span-4 bg-[#FAF9F7] border-t lg:border-t-0 lg:border-l border-[#FECFA5] flex items-center justify-center p-6">
                    {tool.image ? (
                      <img
                        src={tool.image}
                        alt={`${tool.title} preview`}
                        className="w-full max-w-xs rounded-sm shadow-lg"
                      />
                    ) : (
                      <div className="w-full max-w-xs aspect-[4/3] rounded-sm bg-[#FECFA5]/60 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#FECFA5] flex items-center justify-center text-[#495E79]/25">
                          <Lock className="w-5 h-5" />
                        </div>
                        <span className="text-[#495E79]/35 text-xs font-medium uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Preview Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand promise */}
      <section className="py-16 bg-[#495E79]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-[#F16953] text-[#F16953]" />
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Every Tool We Build Follows the Same Promise
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
              {[
                { title: "Simple by Design", desc: "No jargon. No complexity. Every tool is built so you can start using it in minutes." },
                { title: "Built for Beginners", desc: "We design for people who are just starting out — not for finance professionals." },
                { title: "One-Time, No Subscriptions", desc: "Pay once and own it forever. We believe in fair, transparent pricing." },
              ].map((p, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-5 text-left">
                  <h3 className="text-[#F16953] font-bold text-base mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.05rem" }}>{p.title}</h3>
                  <p className="text-white/55 text-xs leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
