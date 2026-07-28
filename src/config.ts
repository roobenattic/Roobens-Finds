/**
 * Site Configuration — Roobens Finds
 * ─────────────────────────────────────────────────────────────────────────────
 * All integration URLs live here. Replace the TODO values before going live.
 * No other file needs to be edited to wire up CTAs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── PRODUCT LINKS ─────────────────────────────────────────────────────────────
// Free download: direct link to the hosted PDF (Google Drive, Gumroad, Dropbox, etc.)
// When set, the "Download Free Version" button opens this URL directly — no intermediate page.
export const FREE_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1SMY6XVmmbWDmVxAsxtwryixSEkB19EEY"; // TODO: replace with real URL

// Legacy checkout retained behind the Premium app status flag during migration.
// Public Planner 2.0 CTAs must route through the preview or waitlist first.
export const PREMIUM_CHECKOUT_URL = "https://roobensfinds.gumroad.com/l/portfolio-planner-premium?wanted=true"; // TODO: replace with real URL

export const PREMIUM_APP_STATUS: "preview" | "waitlist" | "live" = "preview";
export const PREMIUM_APP_ROUTE = "/premium-preview";
export const ENABLE_PAID_AI_CHAT = false;

// ── FORMS ─────────────────────────────────────────────────────────────────────
// Newsletter signup endpoint (e.g. Formspree, Mailchimp, ConvertKit)
export const NEWSLETTER_ENDPOINT = "https://buttondown.com/api/emails/embed-subscribe/roobensfinds"; // TODO: replace

// Contact form endpoint (e.g. Formspree: https://formspree.io/f/YOUR_ID)
export const CONTACT_FORM_ENDPOINT = "YOUR_CONTACT_FORM_ENDPOINT"; // TODO: replace

// ── SOCIAL ────────────────────────────────────────────────────────────────────
export const SOCIAL = {
  twitter: "https://twitter.com/roobensfinds",       // TODO: update to real handle
  instagram: "https://instagram.com/roobensfinds",   // TODO: update to real handle
  youtube: "https://youtube.com/@roobensfinds",      // TODO: update to real channel
  email: "mailto:support@roobensfinds.com",
};

// ── SHOP ──────────────────────────────────────────────────────────────────────
export const SHOP_URL = "https://shop.roobensfinds.com"; // TODO: update when shop is live

// ── HELPERS ───────────────────────────────────────────────────────────────────
// Returns true if a URL has been configured (not a TODO placeholder)
export function isConfigured(url: string): boolean {
  return Boolean(url) && !url.startsWith("YOUR_");
}
