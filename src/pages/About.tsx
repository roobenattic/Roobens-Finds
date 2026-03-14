/**
 * About Page — Warm Authority Design System
 * Brand story, mission, personal tone, why I created Portfolio Planner
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Target, Lightbulb } from "lucide-react";

const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/about-bg-JaGk3h9zWUkpLrW9zp8KUQ.webp";

const values = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Simplicity First",
    desc: "Finance does not have to be complicated. We believe the best tools are the ones that feel easy to use every single day.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Built for Real People",
    desc: "Not for Wall Street traders. For everyday people who want to build wealth slowly, steadily, and with confidence.",
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: "Education Over Hype",
    desc: "We focus on long-term thinking, not get-rich-quick schemes. Real knowledge builds real financial freedom.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">
      {/* Hero */}
      <section
        className="relative py-24 md:py-32 overflow-hidden"
        style={{
          backgroundImage: `url(${ABOUT_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#495E79]/90 via-[#495E79]/70 to-[#495E79]/40" />
        <div className="container relative z-10">
          <div className="max-w-xl">
            <span
              className="text-[#F16953] text-sm font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Our Story
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold text-white mt-3 mb-5 leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Behind Roobens Finds
            </h1>
            <p
              className="text-white/70 text-base leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              A growing digital product brand built around one core belief: personal finance should be simple, organized, and accessible for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 md:py-24 bg-[#FAF9F7]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <span
                className="text-[#F16953] text-sm font-semibold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                The Story
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#495E79] mt-2 mb-6"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                The Story Behind Roobens Finds
              </h2>
              <div className="space-y-5 text-[#495E79]/70 text-base leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p>
                  A few years ago, I started investing. I was excited — but also
                  completely lost. I had a brokerage account, a few ETFs, and
                  absolutely no idea how to keep track of what I owned or where
                  I was going.
                </p>
                <p>
                  I tried spreadsheets. I tried apps. Everything either felt too
                  complicated or too basic. I wanted something in between —
                  something that felt organized, professional, and easy to
                  actually use every week.
                </p>
                <p>
                  So I built it myself. I created a planner that worked for me —
                  simple enough to use consistently, but detailed enough to give
                  me real clarity about my portfolio. I shared it with a few
                  friends. They loved it. And that is how the Portfolio Planner
                  was born.
                </p>
                <p>
                  Roobens Finds is now a growing digital product brand. The
                  Portfolio Planner is our flagship tool — but it is just the
                  beginning. We are building a complete suite of beginner-friendly
                  financial tools to help everyday people take control of their
                  money, one step at a time.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Mission Box */}
              <div className="bg-[#495E79] rounded-sm p-8">
                <span
                  className="text-[#F16953] text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Our Mission
                </span>
                <h3
                  className="text-white text-2xl font-bold mt-2 mb-4"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Make Investing Simple for Everyone
                </h3>
                <p
                  className="text-white/60 text-sm leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Our mission is to help beginner investors feel confident,
                  organized, and in control of their financial future. We do
                  this by creating simple, practical tools that remove the
                  overwhelm from investing.
                </p>
                <div className="mt-6 gold-border-left">
                  <p
                    className="text-white/70 text-sm italic"
                    style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem" }}
                  >
                    "You do not need to be a finance expert to invest well. You
                    just need a clear system."
                  </p>
                  <span
                    className="text-[#F16953] text-xs font-semibold mt-2 block"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    — Roobens, Founder
                  </span>
                </div>
              </div>

              {/* Values */}
              <div className="space-y-4">
                {values.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white border border-[#FECFA5] rounded-sm p-5 hover:border-[#F16953]/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-sm bg-[#F16953]/10 flex items-center justify-center text-[#F16953] flex-shrink-0">
                      {v.icon}
                    </div>
                    <div>
                      <div
                        className="text-[#495E79] font-semibold text-sm mb-1"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {v.title}
                      </div>
                      <div
                        className="text-[#495E79]/60 text-xs leading-relaxed"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {v.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why I Created the Planner */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <span
              className="text-[#F16953] text-sm font-semibold uppercase tracking-widest"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The Product
            </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#495E79] mt-2 mb-6"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Our Flagship Tool: The Portfolio Planner
              </h2>
            <div className="text-left space-y-5 text-[#495E79]/70 text-base leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <p>
                When I first started investing, I felt like I was flying blind.
                I had money in the market, but I had no real system for
                understanding what I owned, how it was performing, or whether I
                was on track to meet my goals.
              </p>
              <p>
                The Portfolio Planner was created to solve that problem. It is
                not a complicated software tool. It is a clean, organized
                digital planner that gives you a clear picture of your
                investments — in a format that is easy to update and easy to
                understand.
              </p>
              <p>
                I built it for people like me — busy, curious, and serious about
                building wealth over time, but not interested in spending hours
                staring at complicated charts. If that sounds like you, this
                planner was made for you.
              </p>
            </div>
            <div className="mt-10">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/product">
                  <Button
                    size="lg"
                    className="bg-[#F16953] hover:bg-[#a0822e] text-white font-semibold px-10"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    See the Portfolio Planner
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#495E79]/25 text-[#495E79] hover:bg-[#495E79] hover:text-white font-semibold px-10"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Browse All Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-[#FAF9F7]">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <p
              className="text-xs text-[#495E79]/40 text-center leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <strong className="text-[#495E79]/60">Disclaimer:</strong> All content on this website and within the Portfolio Planner is for educational and personal organization purposes only. Nothing here constitutes financial advice. Please consult a licensed financial advisor for personalized guidance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
