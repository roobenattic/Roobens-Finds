/**
 * Terms of Use — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Fonts: Poppins (headings), DM Sans (body)
 */
export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">
      {/* Hero */}
      <section className="bg-[#495E79] py-14 md:py-16">
        <div className="container max-w-3xl mx-auto text-center">
          <h1
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Terms of Use
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
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Roobens Finds website at{" "}
              <a href="https://www.roobensfinds.com" className="text-[#F16953] hover:underline">
                www.roobensfinds.com
              </a>{" "}
              and any digital products offered through it, you agree to be bound by these Terms of Use. If you do not agree, please do not use this website.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>2. Digital Products</h2>
            <p>
              Roobens Finds offers digital products including, but not limited to, the Portfolio Planner (free and premium editions). All digital products are delivered electronically and are for personal, non-commercial use only.
            </p>
            <ul>
              <li>You may not resell, redistribute, or share purchased digital products with others.</li>
              <li>You may not reproduce or republish content from digital products without written permission.</li>
              <li>All purchases are final. Due to the digital nature of the products, refunds are not offered unless the file is defective or undeliverable.</li>
            </ul>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>3. Educational Use Only</h2>
            <p>
              All content, tools, and resources provided by Roobens Finds are for educational and personal organization purposes only. Nothing on this website constitutes financial advice, investment recommendations, or professional financial guidance. See our full{" "}
              <a href="/disclaimer" className="text-[#F16953] hover:underline">
                Disclaimer
              </a>{" "}
              for details.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>4. Intellectual Property</h2>
            <p>
              All content on this website — including text, graphics, logos, digital products, and design — is the property of Roobens Finds and is protected by applicable intellectual property laws. You may not copy, modify, or distribute any content without prior written consent.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>5. User Conduct</h2>
            <p>When using this website, you agree not to:</p>
            <ul>
              <li>Use the site for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to any part of the site.</li>
              <li>Transmit any harmful, offensive, or disruptive content.</li>
              <li>Misrepresent your identity or affiliation with any person or organization.</li>
            </ul>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>6. Third-Party Links</h2>
            <p>
              This website may contain links to third-party websites. These links are provided for convenience only. Roobens Finds does not endorse or take responsibility for the content, privacy practices, or terms of any third-party site.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>7. Limitation of Liability</h2>
            <p>
              Roobens Finds and its owner(s) shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or any digital products purchased through it. All products are provided "as is" without warranty of any kind.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>8. Changes to These Terms</h2>
            <p>
              We reserve the right to update these Terms of Use at any time. Changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the updated terms.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>9. Contact</h2>
            <p>
              For questions about these Terms of Use, contact us at{" "}
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
