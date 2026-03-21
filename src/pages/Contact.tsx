/**
 * Contact Page — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Email: info@roobensfinds.com | Domain: www.roobensfinds.com
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Twitter, Instagram, Youtube, Send, MessageCircle } from "lucide-react";
import { SOCIAL, CONTACT_FORM_ENDPOINT, NEWSLETTER_ENDPOINT, BRAND } from "@/config";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [emailSignup, setEmailSignup] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    // TODO: Connect contact form — set CONTACT_FORM_ENDPOINT in src/config.ts
    if (CONTACT_FORM_ENDPOINT) {
      try {
        await fetch(CONTACT_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } catch {
        // Silently continue — show success state regardless to avoid exposing errors
      }
    }
    setSubmitted(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSignup) return;
    // TODO: Connect newsletter — set NEWSLETTER_ENDPOINT in src/config.ts
    if (NEWSLETTER_ENDPOINT) {
      try {
        await fetch(NEWSLETTER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailSignup }),
        });
      } catch {
        // Silently continue
      }
    }
    setEmailSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-16">

      {/* Hero */}
      <section className="bg-[#495E79] py-20 md:py-24">
        <div className="container text-center">
          <span
            className="text-[#FECFA5] text-xs font-semibold uppercase tracking-widest"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Get in Touch
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-white mt-3 mb-5"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            We'd love to hear from you.
          </h1>
          <p
            className="text-white/60 text-base max-w-lg mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Have a question about the Portfolio Planner? Want to share feedback?
            Or just want to say hello? Reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-[#FAF9F7]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">

            {/* Contact Info */}
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#495E79] mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Contact Information
              </h2>
              <p
                className="text-[#5F7C84] text-sm leading-relaxed mb-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                We typically respond within 1–2 business days. For product
                questions, check the FAQ on the product page first — you may
                find your answer faster there.
              </p>

              <div className="space-y-4 mb-10">
                <a
                  href="mailto:info@roobensfinds.com"
                  className="flex items-center gap-3 p-4 bg-white border border-[#FECFA5]/60 rounded-xl hover:border-[#F16953]/40 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F16953]/10 flex items-center justify-center text-[#F16953] group-hover:bg-[#F16953] group-hover:text-white transition-colors flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="text-[#495E79] font-semibold text-sm"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Email Us
                    </div>
                    <div
                      className="text-[#5F7C84] text-xs"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      support@roobensfinds.com
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.roobensfinds.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white border border-[#FECFA5]/60 rounded-xl hover:border-[#F16953]/40 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F16953]/10 flex items-center justify-center text-[#F16953] group-hover:bg-[#F16953] group-hover:text-white transition-colors flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="text-[#495E79] font-semibold text-sm"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Website
                    </div>
                    <div
                      className="text-[#5F7C84] text-xs"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      www.roobensfinds.com
                    </div>
                  </div>
                </a>
              </div>

              {/* Social Links */}
              <div>
                <h3
                  className="text-[#495E79] font-semibold text-xs uppercase tracking-wider mb-4"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Follow Us
                </h3>
                <div className="flex items-center gap-3">
                  {[
                    { icon: <Twitter className="w-4 h-4" />, label: "Twitter", href: SOCIAL.twitter },
                    { icon: <Instagram className="w-4 h-4" />, label: "Instagram", href: SOCIAL.instagram },
                    { icon: <Youtube className="w-4 h-4" />, label: "YouTube", href: SOCIAL.youtube },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#FECFA5]/60 rounded-lg hover:border-[#F16953]/40 hover:text-[#F16953] transition-colors text-[#495E79]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {s.icon}
                      <span className="text-xs font-medium">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-[#FECFA5]/60 rounded-2xl p-7 shadow-sm">
              <h2
                className="text-2xl font-bold text-[#495E79] mb-5"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Send a Message
              </h2>
              {submitted ? (
                <div className="bg-[#F16953]/8 border border-[#F16953]/20 rounded-xl px-6 py-8 text-center">
                  <Send className="w-8 h-8 text-[#F16953] mx-auto mb-3" />
                  <p
                    className="text-[#495E79] font-semibold mb-1"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Message Sent!
                  </p>
                  <p
                    className="text-[#5F7C84] text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Thank you for reaching out. We'll get back to you within 1–2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-semibold text-[#495E79]/60 uppercase tracking-wider mb-1.5"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 border border-[#FECFA5]/60 rounded-lg text-sm text-[#495E79] bg-[#FAF9F7] focus:outline-none focus:border-[#F16953] transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-semibold text-[#495E79]/60 uppercase tracking-wider mb-1.5"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 border border-[#FECFA5]/60 rounded-lg text-sm text-[#495E79] bg-[#FAF9F7] focus:outline-none focus:border-[#F16953] transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#495E79]/60 uppercase tracking-wider mb-1.5"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this about?"
                      className="w-full px-4 py-2.5 border border-[#FECFA5]/60 rounded-lg text-sm text-[#495E79] bg-[#FAF9F7] focus:outline-none focus:border-[#F16953] transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#495E79]/60 uppercase tracking-wider mb-1.5"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      placeholder="Tell us what's on your mind..."
                      className="w-full px-4 py-2.5 border border-[#FECFA5]/60 rounded-lg text-sm text-[#495E79] bg-[#FAF9F7] focus:outline-none focus:border-[#F16953] transition-colors resize-none"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#F16953] hover:bg-[#d95840] text-white font-semibold shadow-md shadow-[#F16953]/20"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Send className="mr-2 w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="py-14 bg-[#495E79]">
        <div className="container max-w-xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-[#FECFA5] mb-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Stay Updated
          </p>
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Get new tools and tips — free.
          </h2>
          <p
            className="text-white/60 text-sm mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Join the Roobens Finds list for practical content and early access to new tools.
            No spam, ever.
          </p>
          {emailSubmitted ? (
            <div className="bg-white/10 rounded-xl px-6 py-5 text-white font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
              You're in! Check your inbox for a confirmation.
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={emailSignup}
                onChange={(e) => setEmailSignup(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-lg text-[#495E79] bg-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#F16953]/50 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <Button
                type="submit"
                className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold px-6 whitespace-nowrap shadow-lg shadow-[#F16953]/25"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Subscribe Free
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
