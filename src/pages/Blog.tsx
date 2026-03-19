/**
 * Blog Page — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Peach #FECFA5, Cream #FAF9F7
 * Fonts: Poppins (headings), DM Sans (body)
 */

import { ArrowRight, Clock, Tag } from "lucide-react";
import { Link } from "wouter";
import { NEWSLETTER_ENDPOINT } from "@/config";

const BLOG_IMG = "/blog-hero-desk.jpg";

const articles = [
  {
    id: 1,
    title: "3 Practical Desk Gadgets I Actually Use",
    excerpt:
      "Three simple desk gadgets that made my everyday workflow cleaner, easier, and more consistent — without overcomplicating the setup.",
    category: "Practical Finds",
    readTime: "4 min read",
    date: "March 17, 2026",
    slug: "3-practical-desk-gadgets-i-actually-use",
    published: true,
  },
  {
    id: 2,
    title: "Why the Logitech MX Keys Still Earns a Spot on My Desk",
    excerpt:
      "A simple look at why this keyboard still works so well for writing, planning, and everyday creator work.",
    category: "Creator Gear",
    readTime: "3 min read",
    date: "March 17, 2026",
    slug: "why-the-logitech-mx-keys-still-earns-a-spot-on-my-desk",
    published: false,
  },
  {
    id: 3,
    title: "My Practical Desk Setup for Work, Content, and Everyday Use",
    excerpt:
      "The real desk setup I use to stay organized, create content, and keep my workflow simple without too much clutter.",
    category: "Desk Setup",
    readTime: "5 min read",
    date: "March 17, 2026",
    slug: "my-practical-desk-setup-for-work-content-and-everyday-use",
    published: false,
  },
];

const categoryColors: Record<string, string> = {
  "Desk Setup": "bg-[#FECFA5]/50 text-[#495E79]",
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
            <div className="order-1">
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
                Honest, practical articles on getting organized, using better
                tools, and making clearer decisions — written in plain language,
                no jargon.
              </p>
            </div>

            <div className="order-2">
              <img
                src={BLOG_IMG}
                alt="Practical guides from Roobens Finds"
                className="w-full h-[220px] sm:h-[280px] lg:h-auto object-cover rounded-2xl shadow-xl"
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

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-[#495E79]/40">
                      <Clock className="w-3.5 h-3.5" />
                      <span
                        className="text-xs"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {article.readTime}
                      </span>
                      <span
                        className="text-xs ml-2"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        · {article.date}
                      </span>
                    </div>

                    {article.published ? (
                      <Link href={`/blog/${article.slug}`}>
                        <span
                          className="flex items-center gap-1 text-[#F16953] text-xs font-semibold hover:gap-2 transition-all cursor-pointer"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Read Article
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    ) : (
                      <span
                        className="text-xs font-semibold text-[#495E79]/40"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

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
              Get New Guides, Finds, and Tools First
            </h2>

            <p
              className="text-white/60 text-sm mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Subscribe to get new guides, product updates, and early access to
              new Roobens Finds tools — delivered free to your inbox.
            </p>

            <form
              action={NEWSLETTER_ENDPOINT}
              method="post"
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 border border-white/20 rounded-sm text-sm text-white bg-white/10 placeholder:text-white/40 focus:outline-none focus:border-[#F16953] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />

              <input type="hidden" name="embed" value="1" />
              <input type="hidden" name="tag" value="blog" />

              <button
                type="submit"
                className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-6 py-3 rounded-sm text-sm whitespace-nowrap transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Join the Free Newsletter
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
