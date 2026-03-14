/**
 * Disclaimer — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Fonts: Poppins (headings), DM Sans (body)
 * UI polish: improved section heading hierarchy, spacing, and list readability
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
      <section className="py-14 md:py-18">
        <div className="container max-w-3xl mx-auto">
          <div
            className="space-y-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >

            <div className="space-y-4">
              <h2
                className="text-xl md:text-2xl font-bold text-[#495E79] border-b border-[#FECFA5]/60 pb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Not Financial Advice
              </h2>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                All content, tools, digital products, and resources provided by Roobens Finds at{" "}
                <a href="https://www.roobensfinds.com" className="text-[#F16953] hover:underline font-medium">
                  www.roobensfinds.com
                </a>{" "}
                are for <strong className="text-[#495E79] font-semibold">educational and personal organization purposes only</strong>.
              </p>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                Nothing on this website — including but not limited to the Portfolio Planner, blog articles, newsletter content, or any other materials — constitutes:
              </p>
              <ul className="space-y-2 pl-1">
                {[
                  "Financial advice",
                  "Investment recommendations",
                  "Tax advice",
                  "Legal advice",
                  "Professional financial guidance of any kind",
                ].map((item ) => (
                  <li key={item} className="flex items-start gap-2.5 text-[#495E79]/80 text-base">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F16953] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className="text-xl md:text-2xl font-bold text-[#495E79] border-b border-[#FECFA5]/60 pb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Consult a Professional
              </h2>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                Before making any financial, investment, or tax decisions, you should always consult with a qualified and licensed financial advisor, tax professional, or legal counsel who understands your specific situation and goals.
              </p>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                Roobens Finds does not know your personal financial situation, risk tolerance, income, or investment goals. The tools and content provided are general in nature and may not be appropriate for your circumstances.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className="text-xl md:text-2xl font-bold text-[#495E79] border-b border-[#FECFA5]/60 pb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                No Guarantees
              </h2>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                Roobens Finds makes no representations or warranties regarding the accuracy, completeness, or suitability of any content or tools for any particular purpose. All information is provided "as is" and may change without notice.
              </p>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                Past performance of any investment or financial strategy mentioned or referenced is not indicative of future results. Investing involves risk, including the possible loss of principal.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className="text-xl md:text-2xl font-bold text-[#495E79] border-b border-[#FECFA5]/60 pb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Affiliate Links
              </h2>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                Some links on this website may be affiliate links. This means Roobens Finds may earn a small commission if you make a purchase through those links, at no additional cost to you. We only recommend products and services we genuinely believe are useful.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className="text-xl md:text-2xl font-bold text-[#495E79] border-b border-[#FECFA5]/60 pb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Limitation of Liability
              </h2>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                By using this website and any products or resources provided, you agree that Roobens Finds and its owner(s) shall not be held liable for any financial losses, damages, or other consequences resulting from your use of the information or tools provided.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className="text-xl md:text-2xl font-bold text-[#495E79] border-b border-[#FECFA5]/60 pb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Contact
              </h2>
              <p className="text-[#495E79]/80 leading-relaxed text-base">
                If you have questions about this Disclaimer, contact us at{" "}
                <a href="mailto:info@roobensfinds.com" className="text-[#F16953] hover:underline font-medium">
                  info@roobensfinds.com
                </a>
                .
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
