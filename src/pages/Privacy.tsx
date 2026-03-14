/**
 * Privacy Policy — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Fonts: Poppins (headings), DM Sans (body)
 */
export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">
      {/* Hero */}
      <section className="bg-[#495E79] py-14 md:py-16">
        <div className="container max-w-3xl mx-auto text-center">
          <h1
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Privacy Policy
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
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>1. Introduction</h2>
            <p>
              Welcome to Roobens Finds ("we," "us," or "our"), accessible at{" "}
              <a href="https://www.roobensfinds.com" className="text-[#F16953] hover:underline">
                www.roobensfinds.com
              </a>
              . We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li>
                <strong>Email address</strong> — when you sign up for our newsletter or download a free resource.
              </li>
              <li>
                <strong>Name</strong> — when you submit a contact form.
              </li>
              <li>
                <strong>Purchase information</strong> — processed securely by our payment provider (e.g., Stripe or Gumroad). We do not store payment card details.
              </li>
              <li>
                <strong>Usage data</strong> — anonymous analytics data (pages visited, time on site) if analytics are enabled. No personally identifiable information is collected through analytics.
              </li>
            </ul>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Deliver digital products you have purchased or requested.</li>
              <li>Send you newsletters or updates you have opted into.</li>
              <li>Respond to your contact form messages.</li>
              <li>Improve the website and user experience.</li>
            </ul>
            <p>We do not sell, trade, or rent your personal information to third parties.</p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>4. Email Communications</h2>
            <p>
              If you subscribe to our newsletter, you will receive periodic emails about new tools, content, and updates from Roobens Finds. You can unsubscribe at any time using the unsubscribe link in any email we send.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>5. Third-Party Services</h2>
            <p>We may use the following third-party services:</p>
            <ul>
              <li>
                <strong>Email marketing</strong> (e.g., Mailchimp, ConvertKit) — to manage newsletter subscriptions.
              </li>
              <li>
                <strong>Payment processing</strong> (e.g., Stripe, Gumroad) — to process digital product purchases securely.
              </li>
              <li>
                <strong>Analytics</strong> (e.g., Umami) — privacy-friendly, cookie-free analytics to understand site usage.
              </li>
            </ul>
            <p>Each third-party service has its own privacy policy governing how they handle your data.</p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>6. Cookies</h2>
            <p>
              This website does not use tracking cookies. If analytics are enabled, they use a privacy-friendly, cookie-free solution. No personal data is collected through cookies.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>7. Data Retention</h2>
            <p>
              We retain your email address for as long as you remain subscribed to our list. You may request deletion of your data at any time by emailing{" "}
              <a href="mailto:info@roobensfinds.com" className="text-[#F16953] hover:underline">
                info@roobensfinds.com
              </a>
              .
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>8. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Withdraw consent at any time (e.g., unsubscribe from emails).</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:info@roobensfinds.com" className="text-[#F16953] hover:underline">
                info@roobensfinds.com
              </a>
              .
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the updated policy.
            </p>

            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#495E79" }}>10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:info@roobensfinds.com" className="text-[#F16953] hover:underline">
                info@roobensfinds.com
              </a>{" "}
              or visit{" "}
              <a href="https://www.roobensfinds.com" className="text-[#F16953] hover:underline">
                www.roobensfinds.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
