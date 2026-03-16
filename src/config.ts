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

// Premium checkout: direct link to Gumroad, Stripe, or Payhip checkout page.
// When set, the "Get Premium — $17" button opens this URL directly — no intermediate page.
export const PREMIUM_CHECKOUT_URL = "https://roobensdume.gumroad.com/l/portfolio-planner-premium?wanted=true"; // TODO: replace with real URL

// ── FORMS ─────────────────────────────────────────────────────────────────────
// Newsletter signup endpoint (e.g. Formspree, Mailchimp, ConvertKit)
export const NEWSLETTER_ENDPOINT = "YOUR_NEWSLETTER_FORM_ENDPOINT"; // TODO: replace

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
