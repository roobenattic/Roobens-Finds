import { Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PracticalDeskSetup() {
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
            Desk Setup
          </p>

          <h1
            className="text-3xl md:text-5xl font-bold text-[#495E79] leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            My Practical Desk Setup for Work, Content, and Everyday Use
          </h1>

          <p
            className="text-[#5F7C84] text-base md:text-lg leading-relaxed max-w-3xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            The real desk setup I use to stay organized, create content, and keep
            my workflow simple without too much clutter.
          </p>

          <div
            className="flex flex-wrap items-center gap-3 mt-5 text-sm text-[#5F7C84]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>March 17, 2026</span>
            <span>•</span>
            <span>5 min read</span>
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
                I’ve learned that a good desk setup does not need to be expensive,
                complicated, or full of gear. What matters more is whether it helps
                you work clearly, stay organized, and reduce small points of
                friction during the day.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                I keep the setup simple on purpose
              </h2>
              <p>
                The best setup for me is one that supports the work without making
                itself the center of attention. I want the desk to feel clean,
                practical, and easy to reset. That usually means fewer objects,
                better placement, and tools I actually use every day.
              </p>
              <p>
                When the desk feels calmer, it is easier to think, write, plan,
                and move from one task to the next without feeling mentally crowded.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                The tools I rely on most
              </h2>
              <p>
                My setup usually centers around a solid keyboard, a comfortable
                mouse, a clean charging solution, and a few accessories that reduce
                clutter instead of adding to it. I’m less interested in flashy gear
                and more interested in tools that hold up over time.
              </p>
              <p>
                That is what makes a setup practical: each item has a clear role,
                and nothing is there just to fill space.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Why workflow matters more than looks
              </h2>
              <p>
                A beautiful desk is nice, but I care more about whether the setup
                helps me stay consistent. If I can sit down and start quickly, keep
                things charged, avoid cable mess, and stay comfortable for longer
                sessions, then the setup is doing its job.
              </p>
              <p>
                Good workflow usually looks cleaner anyway, because the desk stops
                fighting you.
              </p>

              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Final thought
              </h2>
              <p>
                My desk setup is not built around hype. It is built around clarity,
                comfort, and daily usefulness. That is the standard I want Roobens
                Finds to follow: practical tools, honest picks, and setups that
                work in real life.
              </p>
              <p>
                The goal is simple — less clutter, less friction, and a workflow
                that feels easier to return to every day.
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
                Explore more finds and creator-friendly tools
              </h3>

              <p
                className="text-sm text-[#5F7C84] mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Browse more practical recommendations for your desk, workflow, and
                everyday setup.
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
