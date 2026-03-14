/**
 * Disclaimer — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Fonts: Poppins (headings), DM Sans (body)
 */
export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">
      {/* Hero */}
      <section className="bg-[#495E79] py-14 md:py-16">
        <div className="container max-w-3xl mx-auto text-center">
          <h1
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Disclaimer
          </h1>
          <p
            className="text-white/60 mt-3 text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Last updated: March 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 md:py-16">
        <div className="container max-w-3xl mx-auto">
          <div
            className="prose prose-slate max-w-none text-[#495E79]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>Not Financial Advice</h2>
            <p>
              All content, tools, digital products, and resources provided by Roobens Finds at{" "}
              <a href="https://www.roobensfinds.com" className="text-[#F16953] hover:underline">
                www.roobensfinds.com
              </a>{" "}
              are for <strong>educational and personal organization purposes only</strong>.
            </p>
            <p>
              Nothing on this website — including but not limited to the Portfolio Planner, blog articles, newsletter content, or any other materials — constitutes:
            </p>
            <ul>
              <li>Financial advice</li>
              <li>Investment recommendations</li>
              <li>Tax advice</li>
              <li>Legal advice</li>
              <li>Professional financial guidance of any kind</li>
            </ul>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>Consult a Professional</h2>
            <p>
              Before making any financial, investment, or tax decisions, you should always consult with a qualified and licensed financial advisor, tax professional, or legal counsel who understands your specific situation and goals.
            </p>
            <p>
              Roobens Finds does not know your personal financial situation, risk tolerance, income, or investment goals. The tools and content provided are general in nature and may not be appropriate for your circumstances.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>No Guarantees</h2>
            <p>
              Roobens Finds makes no representations or warranties regarding the accuracy, completeness, or suitability of any content or tools for any particular purpose. All information is provided "as is" and may change without notice.
            </p>
            <p>
              Past performance of any investment or financial strategy mentioned or referenced is not indicative of future results. Investing involves risk, including the possible loss of principal.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>Affiliate Links</h2>
            <p>
              Some links on this website may be affiliate links. This means Roobens Finds may earn a small commission if you make a purchase through those links, at no additional cost to you. We only recommend products and services we genuinely believe are useful.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>Limitation of Liability</h2>
            <p>
              By using this website and any products or resources provided, you agree that Roobens Finds and its owner(s) shall not be held liable for any financial losses, damages, or other consequences resulting from your use of the information or tools provided.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>Contact</h2>
            <p>
              If you have questions about this Disclaimer, contact us at{" "}
              <a href="mailto:info@roobensfinds.com" className="text-[#F16953] hover:underline">
                info@roobensfinds.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
