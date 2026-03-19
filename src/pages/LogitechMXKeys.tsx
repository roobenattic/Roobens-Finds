import { Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
const ARTICLE_IMG = "/finds/logitech-mx-key.jpg";
export default function LogitechMXKeys() {
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
            Creator Gear
          </p>

          <h1
            className="text-3xl md:text-5xl font-bold text-[#495E79] leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Why the Logitech MX Keys Still Earns a Spot on My Desk
          </h1>

          <p
            className="text-[#5F7C84] text-base md:text-lg leading-relaxed max-w-3xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            A simple look at why this keyboard still works so well for writing,
            planning, and everyday creator work.
          </p>

          <div
            className="flex flex-wrap items-center gap-3 mt-5 text-sm text-[#5F7C84]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>March 17, 2026</span>
            <span>•</span>
            <span>3 min read</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl mx-auto">
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#FECFA5]/50 shadow-sm bg-white">
  <img
    src={ARTICLE_IMG}
    alt="Logitech MX Keys keyboard"
    className="w-full h-[220px] sm:h-[300px] object-cover"
  />
</div>
          <div className="bg-white rounded-2xl border border-[#FECFA5]/50 p-6 md:p-8 shadow-sm">
            <div
              className="space-y-5 text-[#495E79] leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <p>
                Some tools feel impressive for a week, then quietly disappear
                from your routine. The Logitech MX Keys has been the opposite
                for me. It keeps earning its place because it makes daily work
                feel easier without demanding attention.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Comfortable for long sessions
              </h2>
              <p>
                The first thing I notice with this keyboard is comfort. Whether
                I’m writing, planning content, answering emails, or organizing
                ideas, it feels stable and easy to stay with for longer blocks
                of work.
              </p>
              <p>
                That matters more than people think. A keyboard that feels good
                makes it easier to stay focused and keep momentum.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Clean, quiet, and simple
              </h2>
              <p>
                I also like that it doesn’t make the desk feel noisy or messy.
                It looks clean, sounds controlled, and fits into a setup without
                trying to steal the whole show.
              </p>
              <p>
                That’s important for me because I prefer tools that support the
                workflow instead of constantly competing for attention.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Works well for creator workflow
              </h2>
              <p>
                For planning content, writing notes, organizing ideas, and doing
                general computer work, this keyboard still feels like one of the
                safest recommendations I can make.
              </p>
              <p>
                It doesn’t need flashy marketing to prove itself. It just keeps
                doing the job well.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Final thought
              </h2>
              <p>
                The reason the MX Keys still earns a spot on my desk is simple:
                it removes friction. It helps the workflow feel calmer, more
                comfortable, and more consistent.
              </p>
              <p>
                That’s exactly the kind of creator gear I want Roobens Finds to
                highlight — tools that stay useful long after the first
                impression.
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
                Browse more practical finds and tools
              </h3>

              <p
                className="text-sm text-[#5F7C84] mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Explore more creator-friendly picks and practical tools for your
                workflow.
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
