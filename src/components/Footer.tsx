/**
 * Footer — Roobens Finds
 * Brand: Deep Slate #495E79, Coral #F16953, Soft Peach #FECFA5
 * Fonts: Poppins (headings), DM Sans (body)
 * Architecture: Tools | Finds | Company | Resources
 */
import { Link } from "wouter";
import { Twitter, Instagram, Youtube, Mail, ArrowRight, ExternalLink } from "lucide-react";

const LOGO_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/RF_logo_monochrome_white_0682786a.png";
const SHOP_URL = "https://shop.roobensfinds.com";

const toolLinks = [
  { label: "Portfolio Planner", href: "/product" },
  { label: "View All Tools", href: "/tools" },
];

const findsLinks = [
  { label: "All Finds", href: "/finds" },
  { label: "Gadgets", href: "/finds" },
  { label: "Creator Gear", href: "/finds" },
  { label: "Productivity", href: "/finds" },
];

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "About Roobens Finds", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "FAQ", href: "/#faq" },
  { label: "How to Organize Your Finances", href: "/blog" },
  { label: "Get Organized in One Afternoon", href: "/blog" },
  { label: "Tools We Use", href: "/blog" },
];

export default function Footer() {
  return (
    <footer className="bg-[#495E79] text-white/80">
      {/* Top band */}
      <div className="border-b border-white/10">
        <div className="container py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">

            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4">
              <Link href="/" className="flex items-center mb-5 w-fit">
                <img src={LOGO_WHITE} alt="Roobens Finds" className="h-9 w-auto" />
              </Link>

              <p
                className="text-sm text-white/60 leading-relaxed max-w-xs mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Practical digital tools, curated product finds, and honest guides — built for people who want to make smarter everyday decisions without the overwhelm.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2.5 mb-5">
                {[
                  { icon: <Twitter className="w-3.5 h-3.5" />, label: "Twitter", href: "https://twitter.com/roobensfinds" },
                  { icon: <Instagram className="w-3.5 h-3.5" />, label: "Instagram", href: "https://instagram.com/roobensfinds" },
                  { icon: <Youtube className="w-3.5 h-3.5" />, label: "YouTube", href: "https://youtube.com/@roobensfinds" },
                  { icon: <Mail className="w-3.5 h-3.5" />, label: "Email", href: "mailto:support@roobensfinds.com" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target={s.label !== "Email" ? "_blank" : undefined}
                    rel={s.label !== "Email" ? "noopener noreferrer" : undefined}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F16953] transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Shop link */}
              <a
                href={SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#FECFA5] text-sm font-semibold hover:gap-2.5 transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Visit the Shop
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Tools */}
            <div className="md:col-span-2">
              <h4
                className="text-white font-semibold text-xs uppercase tracking-widest mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Our Tools
              </h4>
              <ul className="space-y-2.5">
                {toolLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href}>
                      <span
                        className="text-sm text-white/60 hover:text-[#FECFA5] transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Finds */}
            <div className="md:col-span-2">
              <h4
                className="text-white font-semibold text-xs uppercase tracking-widest mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Finds
              </h4>
              <ul className="space-y-2.5">
                {findsLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href}>
                      <span
                        className="text-sm text-white/60 hover:text-[#FECFA5] transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h4
                className="text-white font-semibold text-xs uppercase tracking-widest mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Company
              </h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href}>
                      <span
                        className="text-sm text-white/60 hover:text-[#FECFA5] transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="md:col-span-2">
              <h4
                className="text-white font-semibold text-xs uppercase tracking-widest mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Resources
              </h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href}>
                      <span
                        className="text-sm text-white/60 hover:text-[#FECFA5] transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
          <div className="mt-4">
  <a
    href="https://buttondown.com/roobensfinds"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-[#FECFA5] text-sm font-semibold hover:gap-2.5 transition-all"
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    Subscribe Free
    <ArrowRight className="w-3.5 h-3.5" />
  </a>
</div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-b border-white/10">
        <div className="container py-5">
          <p
            className="text-xs text-white/40 leading-relaxed max-w-3xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <strong className="text-white/50">Educational Disclaimer:</strong> All content and tools provided by Roobens Finds are for educational and personal organization purposes only. Nothing on this website constitutes financial advice, investment recommendations, or professional financial guidance. Always consult a licensed financial advisor before making investment decisions.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs text-white/40"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            © {new Date().getFullYear()} Roobens Finds. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Use", href: "/terms" },
              { label: "Disclaimer", href: "/disclaimer" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
