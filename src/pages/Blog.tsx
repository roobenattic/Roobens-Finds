/**
 * Blog Page — Warm Authority Design System
 * Beginner investing educational articles, ETF/dividend/portfolio topics
 */
import { Link } from "wouter";
import { ArrowRight, Clock, Tag } from "lucide-react";

const BLOG_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/blog-investing-9YxaxXtRwLxKDxUYed52Ww.webp";

const categories = ["All", "ETF Investing", "Dividend Stocks", "Portfolio Planning", "Beginner Tips", "Financial Goals"];

const articles = [
  {
    id: 1,
    title: "What Is an ETF? A Beginner's Complete Guide",
    excerpt: "ETFs (Exchange-Traded Funds) are one of the simplest ways to start investing. In this guide, we break down exactly what they are, how they work, and why beginners love them.",
    category: "ETF Investing",
    readTime: "6 min read",
    date: "March 10, 2026",
    featured: true,
    slug: "what-is-an-etf-beginners-guide",
  },
  {
    id: 2,
    title: "How to Build a Dividend Portfolio from Scratch",
    excerpt: "Dividend investing is one of the most reliable ways to build passive income over time. Here is a step-by-step guide to getting started, even with a small amount of money.",
    category: "Dividend Stocks",
    readTime: "8 min read",
    date: "March 5, 2026",
    featured: true,
    slug: "build-dividend-portfolio-from-scratch",
  },
  {
    id: 3,
    title: "5 Common Portfolio Planning Mistakes Beginners Make",
    excerpt: "Most beginner investors make the same mistakes. In this article, we cover the five most common portfolio planning errors and exactly how to avoid them.",
    category: "Portfolio Planning",
    readTime: "5 min read",
    date: "February 28, 2026",
    featured: false,
    slug: "5-portfolio-planning-mistakes-beginners",
  },
  {
    id: 4,
    title: "The Best ETFs for Beginner Investors in 2026",
    excerpt: "Not all ETFs are created equal. We have reviewed the top beginner-friendly ETFs available today, covering index funds, dividend ETFs, and sector funds.",
    category: "ETF Investing",
    readTime: "7 min read",
    date: "February 20, 2026",
    featured: false,
    slug: "best-etfs-for-beginners-2026",
  },
  {
    id: 5,
    title: "How to Track Your Investments Without Stress",
    excerpt: "Keeping track of your portfolio does not have to be complicated. Here is a simple system for monitoring your investments without spending hours on spreadsheets.",
    category: "Portfolio Planning",
    readTime: "4 min read",
    date: "February 15, 2026",
    featured: false,
    slug: "track-investments-without-stress",
  },
  {
    id: 6,
    title: "Understanding Asset Allocation: A Beginner's Guide",
    excerpt: "Asset allocation is the foundation of any good investment strategy. Learn what it means, why it matters, and how to find the right balance for your goals.",
    category: "Beginner Tips",
    readTime: "6 min read",
    date: "February 8, 2026",
    featured: false,
    slug: "understanding-asset-allocation-beginners",
  },
  {
    id: 7,
    title: "How to Set Financial Goals That Actually Work",
    excerpt: "Setting vague goals like 'save more money' rarely works. Here is a practical framework for setting specific, measurable investment goals that you will actually achieve.",
    category: "Financial Goals",
    readTime: "5 min read",
    date: "February 1, 2026",
    featured: false,
    slug: "set-financial-goals-that-work",
  },
  {
    id: 8,
    title: "Dividend Reinvestment: The Power of Compounding",
    excerpt: "Reinvesting your dividends is one of the most powerful strategies for long-term wealth building. Here is how it works and why it matters for your portfolio.",
    category: "Dividend Stocks",
    readTime: "5 min read",
    date: "January 25, 2026",
    featured: false,
    slug: "dividend-reinvestment-power-of-compounding",
  },
];

const categoryColors: Record<string, string> = {
  "ETF Investing": "bg-blue-50 text-blue-700",
  "Dividend Stocks": "bg-green-50 text-green-700",
  "Portfolio Planning": "bg-[#F16953]/10 text-[#F16953]",
  "Beginner Tips": "bg-purple-50 text-purple-700",
  "Financial Goals": "bg-orange-50 text-orange-700",
};

export default function Blog() {
  const featured = articles.filter((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">
      {/* Hero */}
      <section className="bg-[#495E79] py-20 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                className="text-[#F16953] text-sm font-semibold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                The Blog
              </span>
              <h1
                className="text-3xl md:text-5xl font-bold text-white mt-3 mb-5 leading-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Investing Made Simple
              </h1>
              <p
                className="text-white/60 text-base leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Beginner-friendly articles on ETFs, dividend investing,
                portfolio planning, and building long-term wealth. No jargon,
                no hype — just practical guidance.
              </p>
            </div>
            <div className="hidden lg:block">
              <img
                src={BLOG_IMG}
                alt="Investing resources and guides"
                className="w-full rounded-sm shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-[#FECFA5] sticky top-16 z-30">
        <div className="container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  cat === "All"
                    ? "bg-[#495E79] text-white"
                    : "bg-[#FAF9F7] text-[#495E79]/60 hover:bg-[#FECFA5] border border-[#FECFA5]"
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 md:py-20 bg-[#FAF9F7]">
        <div className="container">
          <h2
            className="text-2xl md:text-3xl font-bold text-[#495E79] mb-8"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {featured.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-[#FECFA5] rounded-sm overflow-hidden hover:border-[#F16953]/40 hover:shadow-md transition-all group"
              >
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[article.category] || "bg-gray-100 text-gray-600"}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {article.category}
                    </span>
                  </div>
                  <h3
                    className="text-[#495E79] font-bold text-xl mb-3 group-hover:text-[#F16953] transition-colors leading-snug"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {article.title}
                  </h3>
                  <p
                    className="text-[#495E79]/60 text-sm leading-relaxed mb-5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#495E79]/40">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {article.readTime}
                        </span>
                      </div>
                      <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {article.date}
                      </span>
                    </div>
                    <button
                      className="flex items-center gap-1 text-[#F16953] text-xs font-semibold hover:gap-2 transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Read More
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* All Articles */}
          <h2
            className="text-2xl md:text-3xl font-bold text-[#495E79] mb-8"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            All Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-[#FECFA5] rounded-sm p-5 hover:border-[#F16953]/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3.5 h-3.5 text-[#F16953]" />
                  <span
                    className="text-xs text-[#F16953] font-medium"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {article.category}
                  </span>
                </div>
                <h3
                  className="text-[#495E79] font-bold text-base mb-2 group-hover:text-[#F16953] transition-colors leading-snug"
                  style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.1rem" }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-[#495E79]/60 text-xs leading-relaxed mb-4 line-clamp-3"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#495E79]/40">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {article.readTime}
                    </span>
                  </div>
                  <button
                    className="text-[#F16953] text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-[#495E79]">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Never Miss a New Article or Tool
            </h2>
            <p
              className="text-white/60 text-sm mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Subscribe to get new investing guides, product updates, and early
              access to new Roobens Finds tools — delivered free to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-white/20 rounded-sm text-sm text-white bg-white/10 placeholder:text-white/40 focus:outline-none focus:border-[#F16953] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <button
                type="submit"
                className="bg-[#F16953] hover:bg-[#a0822e] text-white font-semibold px-6 py-3 rounded-sm text-sm whitespace-nowrap transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Subscribe Free
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
