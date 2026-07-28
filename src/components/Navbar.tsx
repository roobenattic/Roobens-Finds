import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ExternalLink, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PREMIUM_APP_ROUTE, PREMIUM_APP_STATUS, SHOP_URL } from "@/config";

const LOGO_DARK =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663430392752/ACudkEUZtZSJcQ9QHfKGZL/RF_primary_logo_coral_4c3da9c0.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Planner", href: "/portfolio-planner" },
  { label: "Tools", href: "/tools" },
  { label: "Finds", href: "/finds" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const premiumLabel =
    PREMIUM_APP_STATUS === "live" ? "Open Premium" : "Premium Preview";
  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b border-[#FECFA5]/40 transition ${
        scrolled || isOpen
          ? "bg-white shadow-md shadow-[#495E79]/10"
          : "bg-white/95 backdrop-blur"
      }`}
      aria-label="Primary navigation"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex-shrink-0" aria-label="Roobens Finds home">
          <img src={LOGO_DARK} alt="" className="h-[58px] w-[44px] object-contain" />
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-[#F16953]/10 text-[#F16953]"
                  : "text-[#495E79] hover:bg-[#F16953]/5 hover:text-[#F16953]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#495E79] hover:text-[#F16953]"
          >
            Shop <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/portfolio-planner">
            <Button variant="outline" size="sm">Free Diagnosis</Button>
          </Link>
          <Link href={PREMIUM_APP_ROUTE}>
            <Button size="sm" className="bg-[#F16953] hover:bg-[#d95840]">
              {premiumLabel}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-md p-2 text-[#495E79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F16953] md:hidden"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-[#FECFA5]/50 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md px-4 py-3 text-sm font-medium text-[#495E79]">
                {link.label}
              </Link>
            ))}
            <a href={SHOP_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-3 text-sm font-medium text-[#495E79]">
              Shop
            </a>
            <div className="mt-2 grid gap-2 border-t border-[#FECFA5]/50 pt-3">
              <Link href="/portfolio-planner"><Button variant="outline" className="w-full">Free Diagnosis</Button></Link>
              <Link href={PREMIUM_APP_ROUTE}><Button className="w-full bg-[#F16953]">{premiumLabel}</Button></Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
