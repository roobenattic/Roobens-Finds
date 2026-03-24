import { Button } from "@/components/ui/button";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center px-6">
      <section className="max-w-2xl w-full text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 shadow-xl">
          <p
            className="text-sm uppercase tracking-[0.2em] text-white/60 mb-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Roobens Finds
          </p>

          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            You're in ✅
          </h1>

          <p
            className="text-white/80 text-base md:text-lg mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Thanks for subscribing to Roobens Finds.
          </p>

          <p
            className="text-white/70 text-sm md:text-base mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Check your inbox for future updates. For now, start with my current
            favorite finds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/finds" className="inline-block w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-6 py-3 shadow-lg shadow-[#F16953]/25"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                See My Favorite Finds
              </Button>
            </a>

            <a
              href="/"
              className="text-white/70 hover:text-white text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Back to homepage
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
