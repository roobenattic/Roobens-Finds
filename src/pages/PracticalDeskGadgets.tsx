import { Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PracticalDeskGadgets() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <section className="pt-24 pb-12 bg-white border-b border-[#FECFA5]/50">
        <div className="container max-w-4xl mx-auto">
          <Link href="/blog">
            <span
              className="inline-flex items-center gap-2 text-sm text-[#5F7C84] hover:text-[#F16953] transition-colors cursor-pointer mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </span>
          </Link>

          <p
            className="text-xs font-semibold uppercase tracking-widest text-[#F16953] mb-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Practical Finds
          </p>

          <h1
            className="text-3xl md:text-5xl font-bold text-[#495E79] leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            3 Practical Desk Gadgets I Actually Use
          </h1>

          <p
            className="text-[#5F7C84] text-base md:text-lg leading-relaxed max-w-3xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            These are three desk gadgets I keep coming back to because they
            actually make my everyday setup cleaner, easier, and more reliable.
            Nothing flashy — just useful tools that earn their place.
          </p>

          <div
            className="flex flex-wrap items-center gap-3 mt-5 text-sm text-[#5F7C84]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>March 17, 2026</span>
            <span>•</span>
            <span>4 min read</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#FECFA5]/50 p-6 md:p-8 shadow-sm">
            <div
              className="space-y-5 text-[#495E79] leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <p>
                Over time, I’ve realized I don’t need a desk full of gadgets.
                I just need a few tools that make work and content creation feel
                smoother. The best desk gadgets are the ones you stop thinking
                about because they quietly do their job well.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                1. Anker 10,000mAh Power Bank
              </h2>
              <p>
                This is one of those tools that solves a problem before it
                becomes annoying. I like keeping a power bank close because it
                gives me backup power without having to hunt for a cable or wall
                outlet every time a device gets low.
              </p>
              <p>
                It’s small enough to keep near my desk or throw in a bag, and it
                makes my setup feel more reliable overall.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                2. Belkin 3-in-1 Wireless Charger
              </h2>
              <p>
                One of the easiest ways to make a desk look cleaner is to reduce
                cable clutter. That’s why this charger stands out. Instead of
                having separate chargers everywhere, I can keep things more
                organized in one place.
              </p>
              <p>
                It’s the kind of upgrade that makes a setup feel calmer and more
                intentional without needing a full desk makeover.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                3. Logitech MX Keys
              </h2>
              <p>
                This is the keyboard I’d point to first if someone asked me what
                actually helps with long writing sessions, planning, and general
                computer work. It feels quiet, solid, and comfortable without
                trying too hard.
              </p>
              <p>
                For me, it’s one of those tools that supports focus. When a
                keyboard feels right, the whole workflow feels better.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Final thought
              </h2>
              <p>
                The common thread with all three of these is simple: they reduce
                friction. They help the desk feel cleaner, the workflow feel
                smoother, and the setup feel more useful in real life.
              </p>
              <p>
                That’s the kind of find I want Roobens Finds to be known for —
                not hype, just practical things that actually help.
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-[#FECFA5] bg-[#FAF9F7] p-5">
              <p
                className="text-xs font-semibold uppercase tracking-widest text-[#F16953] mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Next step
              </p>

              <h3
                className="text-xl font-bold text-[#495E79] mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Browse the finds or view the tools
              </h3>

              <p
                className="text-sm text-[#5F7C84] mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Explore more practical picks and creator-friendly tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/finds">
                  <Button
                    className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Browse Finds
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/tools">
                  <Button
                    variant="outline"
                    className="border-[#495E79]/30 text-[#495E79] hover:bg-[#495E79] hover:text-white font-semibold"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    View Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
