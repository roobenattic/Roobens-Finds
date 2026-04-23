/**
 * Navbar — Roobens Finds
 * Updated flow:
 * - Planner link visible in navbar
 * - Free = Try Planner
 * - Premium = Unlock AI Premium
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PREMIUM_CHECKOUT_URL, isConfigured } from "@/config";

const LOGO_DARK =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/RF_primary_logo_coral_4c3da9c0.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools" },
  { label: "Planner", href: "/portfolio-planner" },
  { label: "Finds", href: "/finds" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

const SHOP_URL = "https://shop.roobensfinds.com";
const FREE_PLANNER_ROUTE = "/portfolio-planner";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-white shadow-md shadow-[#495E79]/10"
          : "bg-white/98 backdrop-blur-sm shadow-sm shadow-[#495E79]/5"
      } border-b border-[#FECFA5]/60`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0">
            <img
              src={LOGO_DARK}
              alt="Roobens Finds"
              className="w-auto"
              loading="eager"
              style={{ width: "47px", height: "62px" }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.href)
                    ? "text-[#F16953] bg-[#F16953]/8"
                    : "text-[#495E79] hover:text-[#F16953] hover:bg-[#F16953]/5"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}

            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-md text-[#495E79] hover:text-[#F16953] hover:bg-[#F16953]/5 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Shop
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href={FREE_PLANNER_ROUTE}>
              <Button
                variant="outline"
                size="sm"
                className="border-[#495E79]/25 text-[#495E79] hover:bg-[#495E79] hover:text-white font-medium text-sm transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Try Planner
              </Button>
            </Link>

            {isConfigured(PREMIUM_CHECKOUT_URL) ? (
              <a href={PREMIUM_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold text-sm shadow-md shadow-[#F16953]/20"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Unlock AI Premium
                </Button>
              </a>
            ) : (
              <Link href="/product">
                <Button
                  size="sm"
                  className="bg-[#F16953] hover:bg-[#d95840] text-white font-semibold text-sm shadow-md shadow-[#F16953]/20"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Unlock AI Premium
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#495E79] p-2 rounded-md hover:bg-[#FAF9F7] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-[#FECFA5]/60 shadow-lg">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.href)
                    ? "text-[#F16953] bg-[#F16953]/8"
                    : "text-[#495E79] hover:text-[#F16953] hover:bg-[#FAF9F7]"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}

            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md text-[#495E79] hover:text-[#F16953] hover:bg-[#FAF9F7] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Shop
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </a>

            <div className="mt-3 pt-3 border-t border-[#FECFA5]/60 flex flex-col gap-2">
              <Link href={FREE_PLANNER_ROUTE}>
                <Button
                  variant="outline"
                  className="w-full border-[#495E79]/25 text-[#495E79] font-medium"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Try Free Planner
                </Button>
              </Link>

              {isConfigured(PREMIUM_CHECKOUT_URL) ? (
                <a href={PREMIUM_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    className="w-full bg-[#F16953] hover:bg-[#d95840] text-white font-semibold"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Unlock AI Premium
                  </Button>
                </a>
              ) : (
                <Link href="/product">
                  <Button
                    className="w-full bg-[#F16953] hover:bg-[#d95840] text-white font-semibold"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Unlock AI Premium
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}