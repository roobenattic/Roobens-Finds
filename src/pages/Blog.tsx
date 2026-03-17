/**
 * Blog Page — Roobens Finds
 * 3 focused articles: practical, personal, creator-voice guides.
 * Topics: personal finance organization, practical tools, smarter decisions.
 * Design: Deep Slate #495E79, Coral #F16953, Peach #FECFA5, Cream #FAF9F7
 * Fonts: Poppins (headings), DM Sans (body)
 */
import { ArrowRight, Clock, Tag } from "lucide-react";

const BLOG_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/blog-investing-9YxaxXtRwLxKDxUYed52Ww.webp";

const articles = [
  {
    id: 1,
    title: "Why I Stopped Using Spreadsheets to Track My Money",
    excerpt:
      "I used to have five different spreadsheets for five different things. None of them were up to date. Here is what I switched to — and why it actually stuck.",
    category: "Personal Finance",
    readTime: "5 min read",
    date: "March 10, 2026",
    slug: "stopped-using-spreadsheets-to-track-money",
  },
  {
    id: 2,
    title: "How to Get a Clear Picture of Your Finances in One Afternoon",
    excerpt:
      "You do not need a financial advisor or a complicated system. You need one focused session and the right structure. Here is exactly how to do it.",
    category: "Getting Organized",
    readTime: "6 min read",
    date: "March 5, 2026",
    slug: "clear-picture-of-finances-one-afternoon",
  },
  {
    id: 3,
    title: "The Tools We Actually Use to Stay Organized",
    excerpt:
      "From digital planners to note-taking apps, here are the tools we rely on every day to stay on top of goals, content, and finances — without the overwhelm.",
    category: "Tools & Productivity",
    readTime: "4 min read",
    date: "February 20, 2026",
    slug: "tools-we-use-to-stay-organized",
  },
];

const categoryColors: Record<string, string> = {
  "Desk set up": "bg-[#FECFA5]/50 text-[#495E79]",
  "Creator Gear": "bg-[#F16953]/10 text-[#F16953]",
  "Practical Finds": "bg-green-50 text-green-700",
};

export default function Blog() {
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
                Practical Guides for Smarter Decisions
              </h1>
              <p
                className="text-white/60 text-base leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Honest, practical articles on getting organized, using better tools, and making clearer decisions — written in plain language, no jargon.
              </p>
            </div>
            <div className="hidden lg:block">
              <img
                src={BLOG_IMG}
                alt="Practical guides from Roobens Finds"
                className="w-full rounded-sm shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-20 bg-[#FAF9F7]">
        <div className="container">
          <h2
            className="text-2xl md:text-3xl font-bold text-[#495E79] mb-8"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-[#FECFA5] rounded-sm overflow-hidden hover:border-[#F16953]/40 hover:shadow-md transition-all group"
              >
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-3.5 h-3.5 text-[#F16953]" />
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        categoryColors[article.category] || "bg-gray-100 text-gray-600"
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {article.category}
                    </span>
                  </div>
                  <h3
                    className="text-[#495E79] font-bold text-lg mb-3 group-hover:text-[#F16953] transition-colors leading-snug"
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
                    <div className="flex items-center gap-1 text-[#495E79]/40">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {article.readTime}
                      </span>
                      <span className="text-xs ml-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        · {article.date}
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

          {/* Coming soon note */}
          <p
            className="text-center text-[#5F7C84] text-sm mt-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            More articles coming soon — subscribe below to be notified.
          </p>
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
              Subscribe to get new guides, product updates, and early access to new
              Roobens Finds tools — delivered free to your inbox.
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
                className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-6 py-3 rounded-sm text-sm whitespace-nowrap transition-colors"
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
