/**
 * Finds Page — Roobens Finds
 * Purpose: Curated recommendations — gadgets, creator gear, productivity tools, honest picks.
 * Design: Deep Slate #495E79, Coral #F16953, Peach #FECFA5, Cream #FAF9F7
 * Fonts: Poppins (headings), DM Sans (body)
 * NOTE: No Books. No finance categories. Clearly different from Tools page.
 * Categories: All | Gadgets | Creator Gear | Productivity | Lifestyle
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Star, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FREE_DOWNLOAD_URL, isConfigured } from "@/config";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }),
};

type Category = "All" | "Gadgets" | "Creator Gear" | "Productivity" | "Lifestyle";
const categories: Category[] = ["All", "Gadgets", "Creator Gear", "Productivity", "Lifestyle"];

interface Find {
  category: "Gadgets" | "Creator Gear" | "Productivity" | "Lifestyle";
  title: string;
  subtitle: string;
  desc: string;
  pros: string[];
  price: string;
  rating: number;
  badge?: string;
  href: string;
  affiliate: boolean;
}

const finds: Find[] = [
  {
    category: "Gadgets",
    title: "Anker 10,000mAh Power Bank",
    subtitle: "Portable charger",
    desc: "The most reliable portable charger we've used. Slim enough to carry daily, powerful enough to charge a phone twice or keep a laptop alive on the go. No drama, no dead batteries.",
    pros: ["Slim and lightweight", "Dual USB-A + USB-C", "Fast charging support", "Reliable brand"],
    price: "~$25–$35",
    rating: 5,
    badge: "Daily Carry",
    href: "https://www.anker.com/collections/portable-chargers",
    affiliate: false,
  },
  {
    category: "Gadgets",
    title: "Tile Mate Tracker",
    subtitle: "Bluetooth item tracker",
    desc: "Attach it to your keys, bag, or wallet and never waste time searching again. Simple, effective, and works with both iOS and Android. A small thing that saves real frustration.",
    pros: ["Works with iOS and Android", "Loud ring", "Community find network", "Replaceable battery"],
    price: "~$25",
    rating: 4,
    href: "https://www.thetileapp.com",
    affiliate: false,
  },
  {
    category: "Gadgets",
    title: "Belkin 3-in-1 Wireless Charger",
    subtitle: "Multi-device charging pad",
    desc: "Charge your phone, earbuds, and smartwatch at the same time without hunting for cables. Clean desk, less clutter, one less thing to think about.",
    pros: ["Charges 3 devices at once", "No cable mess", "Compatible with MagSafe", "Compact footprint"],
    price: "~$60–$80",
    rating: 4,
    badge: "Desk Essential",
    href: "https://www.belkin.com/3-in-1-wireless-charger/",
    affiliate: false,
  },
  {
    category: "Creator Gear",
    title: "Logitech MX Keys",
    subtitle: "Wireless keyboard",
    desc: "The keyboard we use every day for writing, planning, and content creation. Quiet, comfortable, and built for long sessions. Works across Mac, Windows, and iPad seamlessly.",
    pros: ["Multi-device pairing", "Backlit keys", "Comfortable for long typing sessions", "USB-C charging"],
    price: "~$109",
    rating: 5,
    badge: "Daily Driver",
    href: "https://www.logitech.com/en-us/products/keyboards/mx-keys-wireless-keyboard.html",
    affiliate: false,
  },
  {
    category: "Creator Gear",
    title: "Notion",
    subtitle: "All-in-one workspace",
    desc: "Where we plan content, track ideas, manage projects, and write drafts. Flexible enough to replace five different apps. Free tier is genuinely useful.",
    pros: ["Free tier available", "Databases + docs in one", "Templates for everything", "Works on all devices"],
    price: "Free / ~$10/month",
    rating: 5,
    badge: "Editor's Pick",
    href: "https://www.notion.so",
    affiliate: false,
  },
  {
    category: "Productivity",
    title: "Toggl Track",
    subtitle: "Time tracking app",
    desc: "A simple, free time tracker that helps you understand where your hours actually go. Useful for freelancers, creators, and anyone trying to be more intentional with their time.",
    pros: ["Free tier is generous", "Simple one-click tracking", "Reports and insights", "Works on all platforms"],
    price: "Free / ~$9/month",
    rating: 4,
    href: "https://toggl.com/track/",
    affiliate: false,
  },
  {
    category: "Productivity",
    title: "Canva Pro",
    subtitle: "Design tool",
    desc: "Our go-to for creating social graphics, product mockups, and presentation slides. The free version is solid, but Pro unlocks brand kits and background removal that save real time.",
    pros: ["Drag-and-drop simplicity", "Huge template library", "Brand kit feature", "Background remover"],
    price: "Free / ~$13/month",
    rating: 4,
    badge: "Creator Staple",
    href: "https://www.canva.com",
    affiliate: false,
  },
  {
    category: "Lifestyle",
    title: "Standing Desk Converter",
    subtitle: "Desk ergonomics",
    desc: "A simple riser that converts any desk into a standing desk. If you work from home, alternating between sitting and standing makes a real difference in energy and focus.",
    pros: ["No full desk replacement needed", "Adjustable height", "Fits most desks", "Improves posture"],
    price: "~$60–$120",
    rating: 4,
    href: "https://www.amazon.com/s?k=standing+desk+converter",
    affiliate: false,
  },
  {
    category: "Lifestyle",
    title: "Hydro Flask 32 oz",
    subtitle: "Insulated water bottle",
    desc: "Keeps water cold for 24 hours, hot drinks warm for 12. Durable enough to survive years of daily use. Simple upgrade that actually changes how much water you drink.",
    pros: ["TempShield insulation", "Dishwasher safe lid", "Durable powder coat", "Lifetime warranty"],
    price: "~$45–$55",
    rating: 5,
    badge: "Worth It",
    href: "https://www.hydroflask.com",
    affiliate: false,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-[#F16953] text-[#F16953]" : "text-[#495E79]/20"}`}
        />
      ))}
    </div>
  );
}

export default function Finds() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = activeCategory === "All" ? finds : finds.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Hero */}
      <section className="bg-[#495E79] pt-20 pb-16">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span
              className="inline-block bg-[#FECFA5]/20 text-[#FECFA5] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Honest Picks Only
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Things We Actually Use
            </h1>
            <p
              className="text-[#FECFA5]/80 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Curated gadgets, creator gear, and practical tools that have genuinely helped us work smarter and create better. No filler, no paid placements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-[#FECFA5]/60 sticky top-16 z-30">
        <div className="container py-3">
          {/* Desktop pills */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#495E79] text-white shadow-sm"
                    : "bg-[#FAF9F7] text-[#495E79] hover:bg-[#FECFA5]/40 border border-[#FECFA5]"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {cat}
                {activeCategory === cat && cat !== "All" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({finds.filter((f) => f.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile collapsible */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 bg-[#FAF9F7] border border-[#FECFA5] rounded-xl text-sm font-medium text-[#495E79]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F16953]" />
                {activeCategory}
                {activeCategory !== "All" && (
                  <span className="text-xs text-[#495E79]/50">
                    ({filtered.length})
                  </span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileOpen && (
              <div className="mt-2 bg-white border border-[#FECFA5] rounded-xl overflow-hidden shadow-lg">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setMobileOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-[#FECFA5]/40 last:border-0 ${
                      activeCategory === cat
                        ? "bg-[#495E79]/8 text-[#F16953]"
                        : "text-[#495E79] hover:bg-[#FAF9F7]"
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {cat}
                    {cat !== "All" && (
                      <span className="ml-2 text-xs text-[#495E79]/40">
                        ({finds.filter((f) => f.category === cat).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#495E79]/50 text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No finds in this category yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((find, i) => (
                <motion.div
                  key={`${find.category}-${find.title}`}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="bg-white rounded-2xl border border-[#FECFA5]/60 shadow-sm shadow-[#495E79]/5 p-6 flex flex-col hover:shadow-md hover:shadow-[#495E79]/10 transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="text-xs font-semibold text-[#5F7C84] bg-[#FAF9F7] border border-[#FECFA5] px-2 py-0.5 rounded-full"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {find.category}
                        </span>
                        {find.badge && (
                          <span
                            className="text-xs font-semibold bg-[#F16953]/10 text-[#F16953] px-2 py-0.5 rounded-full"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {find.badge}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-lg font-bold text-[#495E79] leading-tight"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {find.title}
                      </h3>
                      <p
                        className="text-sm text-[#495E79]/60 mt-0.5"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {find.subtitle}
                      </p>
                    </div>
                    <StarRating rating={find.rating} />
                  </div>
                  {/* Description */}
                  <p
                    className="text-[#495E79]/75 text-sm leading-relaxed mb-4 flex-1"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {find.desc}
                  </p>
                  {/* Pros */}
                  <ul className="space-y-1.5 mb-4">
                    {find.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-[#495E79]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <CheckCircle2 className="w-4 h-4 text-[#F16953] flex-shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#495E79]/8">
                    <span
                      className="text-sm font-semibold text-[#495E79]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {find.price}
                    </span>
                    <a
                      href={find.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F16953] hover:text-[#d95840] transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      View
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  {find.affiliate && (
                    <p className="text-xs text-[#495E79]/40 mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      * Affiliate link — we may earn a small commission at no extra cost to you.
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#495E79] py-16">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Looking for our digital tools?
          </h2>
          <p
            className="text-[#FECFA5]/80 mb-8 text-base"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            The Portfolio Planner is our flagship digital tool — free to download, with a one-time premium upgrade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools">
              <Button
                className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-8"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Browse All Tools
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            {isConfigured(FREE_DOWNLOAD_URL) ? (
              <a href={FREE_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="border-[#FECFA5]/40 text-[#FECFA5] hover:bg-[#FECFA5]/10 font-semibold px-8"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Get the Free Planner
                </Button>
              </a>
            ) : (
              <Link href="/product">
                <Button
                  variant="outline"
                  className="border-[#FECFA5]/40 text-[#FECFA5] hover:bg-[#FECFA5]/10 font-semibold px-8"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Get the Free Planner
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
