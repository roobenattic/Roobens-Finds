# Roobens Finds — Portfolio Planner Website

A static React + Vite + TypeScript website for **Roobens Finds** ([www.roobensfinds.com](https://www.roobensfinds.com)). Built with Tailwind CSS v4, shadcn/ui, Framer Motion, and Wouter for client-side routing.

**Contact:** info@roobensfinds.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Routing | Wouter |
| Styling | Tailwind CSS 4 |
| UI components | shadcn/ui (Radix UI) |
| Animations | Framer Motion |
| Toast notifications | Sonner |
| Package manager | npm |

---

## How to Run Locally

**Prerequisites:** Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The site will be available at `http://localhost:3000`.

> All source files live in `src/` at the project root. There is no `client/` subdirectory.

---

## How to Build

```bash
npm run build
```

The production build outputs to `dist/`. This is what gets deployed.

To preview the production build locally:

```bash
npm run preview
```

---

## How to Deploy to Vercel

This project includes a `vercel.json` at the root that handles SPA routing (all paths rewrite to `index.html`).

**Option A — Vercel CLI:**
```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel will auto-detect the Vite framework.

**Option B — Vercel Dashboard:**
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Leave **Root Directory** as `/` (the project root — `index.html` is at the root).
4. Set the **Build Command** to `npm run build`.
5. Set the **Output Directory** to `dist`.
6. Deploy.

> **Important:** The `vercel.json` at the project root ensures that routes like `/product`, `/about`, `/blog`, etc. all work correctly when accessed directly or refreshed.

---

## Pages

| Route | File | Status |
|---|---|---|
| `/` | `src/pages/Home.tsx` | Live |
| `/product` | `src/pages/Product.tsx` | Live |
| `/tools` | `src/pages/Tools.tsx` | Live |
| `/about` | `src/pages/About.tsx` | Live |
| `/blog` | `src/pages/Blog.tsx` | Live |
| `/contact` | `src/pages/Contact.tsx` | Live |
| `/privacy` | `src/pages/Privacy.tsx` | Live |
| `/terms` | `src/pages/Terms.tsx` | Live |
| `/disclaimer` | `src/pages/Disclaimer.tsx` | Live |

---

## Before Launch — Integration Checklist

All integration points are centralized in **`src/config.ts`**. Open that file and fill in each `TODO` item:

| Item | Config key in `src/config.ts` | Where to get it |
|---|---|---|
| Free PDF download URL | `FREE_DOWNLOAD_URL` | Upload to Google Drive, Gumroad, or S3 |
| Premium checkout URL | `PREMIUM_CHECKOUT_URL` | Create a product on [Gumroad](https://gumroad.com) or Stripe |
| Newsletter form endpoint | `NEWSLETTER_ENDPOINT` | [Mailchimp](https://mailchimp.com), [ConvertKit](https://convertkit.com), or [Beehiiv](https://beehiiv.com) |
| Contact form endpoint | `CONTACT_FORM_ENDPOINT` | [Formspree](https://formspree.io) (free tier available) |
| Twitter / X URL | `SOCIAL.twitter` | Your profile URL |
| Instagram URL | `SOCIAL.instagram` | Your profile URL |
| YouTube URL | `SOCIAL.youtube` | Your channel URL |

### Connecting the Free Download

Once you have a hosted file URL, set `FREE_DOWNLOAD_URL` in `src/config.ts`:

```ts
export const FREE_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID";
```

### Connecting the Premium Checkout

Create a product on Gumroad, then set `PREMIUM_CHECKOUT_URL`:

```ts
export const PREMIUM_CHECKOUT_URL = "https://yourname.gumroad.com/l/portfolio-planner";
```

### Connecting the Contact Form (Formspree)

1. Sign up at [formspree.io](https://formspree.io) — free tier allows 50 submissions/month.
2. Create a new form and copy your form ID.
3. Set `CONTACT_FORM_ENDPOINT`:

```ts
export const CONTACT_FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
```

### Connecting the Newsletter (Mailchimp example)

1. In Mailchimp, go to Audience → Signup forms → Embedded forms → copy the form action URL.
2. Set `NEWSLETTER_ENDPOINT`:

```ts
export const NEWSLETTER_ENDPOINT = "https://yourlist.us1.list-manage.com/subscribe/post?u=...&id=...";
```

### Analytics (Optional)

**Location:** `index.html` — analytics script is commented out.  
If you want privacy-friendly analytics, set up [Umami](https://umami.is) (free self-hosted or cloud). Uncomment the script tag and fill in your endpoint URL and website ID.

---

## Integration Status

| Item | Status | Action Required |
|---|---|---|
| Free PDF download button | Wired to `FREE_DOWNLOAD_URL` in `src/config.ts` | Set URL → button activates automatically |
| Premium $17 purchase button | Wired to `PREMIUM_CHECKOUT_URL` in `src/config.ts` | Set URL → button activates automatically |
| Newsletter signup forms | Wired to `NEWSLETTER_ENDPOINT` in `src/config.ts` | Set endpoint → form submits automatically |
| Contact form submission | Wired to `CONTACT_FORM_ENDPOINT` in `src/config.ts` | Set endpoint → form submits automatically |
| Social media links | Wired to `SOCIAL.*` in `src/config.ts` | Set your real profile URLs |
| Analytics | Commented out in `index.html` | Set up Umami → uncomment + fill in IDs |
| Custom domain | Not connected | Add `www.roobensfinds.com` in Vercel → Domains |
| Privacy Policy | Live at `/privacy` | Review and update with your real details |
| Terms of Use | Live at `/terms` | Review and update with your real details |
| Disclaimer | Live at `/disclaimer` | Review and update with your real details |
| SPA routing on Vercel | `vercel.json` included | No action needed |
| TypeScript build | 0 errors | No action needed |

---

## Project Structure

All source files are at the project root — there is no `client/` subdirectory.

```
roobens-finds-export/
├── index.html              # Entry HTML — Google Fonts (Poppins + DM Sans) loaded here
├── package.json            # npm dependencies and scripts
├── vite.config.ts          # Vite config — @ alias points to src/
├── tsconfig.json           # TypeScript config
├── vercel.json             # SPA rewrites for Vercel deployment
├── .gitignore
│
├── public/
│   ├── logo-dark.png       # Roobens Finds logo (dark, used in Navbar)
│   └── logo-white.png      # Roobens Finds logo (white, used in Footer)
│
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Route definitions + global layout (Navbar, Footer)
    ├── index.css           # Global styles + Tailwind + brand CSS variables
    ├── config.ts           # ★ Integration config — edit this before launch
    ├── const.ts            # Shared constants
    │
    ├── pages/
    │   ├── Home.tsx        # Homepage — hero, benefits, email capture
    │   ├── Product.tsx     # Product page — free/premium, comparison, FAQ
    │   ├── Tools.tsx       # Tools catalog — all current + upcoming products
    │   ├── About.tsx       # Brand story and mission
    │   ├── Blog.tsx        # Blog article listings
    │   ├── Contact.tsx     # Contact form + social links + newsletter
    │   ├── Privacy.tsx     # Privacy Policy
    │   ├── Terms.tsx       # Terms of Use
    │   ├── Disclaimer.tsx  # Financial disclaimer
    │   └── NotFound.tsx    # 404 page
    │
    ├── components/
    │   ├── Navbar.tsx      # Top navigation bar (responsive, sticky)
    │   ├── Footer.tsx      # Brand footer with links and social icons
    │   ├── ErrorBoundary.tsx
    │   └── ui/             # shadcn/ui component library
    │
    ├── contexts/
    │   └── ThemeContext.tsx # Light/dark theme provider
    │
    ├── hooks/
    │   ├── useComposition.ts  # IME composition handler (used by input + textarea)
    │   └── useMobile.tsx
    │
    └── lib/
        └── utils.ts        # cn() Tailwind class merge utility
```

---

## Brand Reference

| Token | Value |
|---|---|
| Primary (Deep Slate) | `#495E79` |
| Accent (Coral) | `#F16953` |
| Highlight (Soft Peach) | `#FECFA5` |
| Secondary (Muted Teal) | `#5F7C84` |
| Background | `#FAF9F7` |
| Heading font | Poppins |
| Body font | DM Sans |

---

*Built for Roobens Finds. For questions, email info@roobensfinds.com.*
