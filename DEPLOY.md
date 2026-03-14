# Deployment Guide — Roobens Finds

This guide covers every supported deployment path for the Roobens Finds website. The recommended path is **Vercel via the included `deploy.sh` script**, which handles the build, pre-flight checks, and deployment in a single command.

---

## Before You Deploy

Open `src/config.ts` and fill in your integration values. The site will deploy without them, but the download button, checkout button, newsletter form, and contact form will show fallback alerts until they are connected.

```ts
// src/config.ts — fill these in before going live
export const FREE_DOWNLOAD_URL     = "https://...";   // your hosted free PDF
export const PREMIUM_CHECKOUT_URL  = "https://...";   // your Gumroad or Stripe link
export const NEWSLETTER_ENDPOINT   = "https://...";   // your email provider endpoint
export const CONTACT_FORM_ENDPOINT = "https://...";   // your Formspree endpoint

export const SOCIAL = {
  twitter:   "https://twitter.com/YOUR_HANDLE",
  instagram: "https://instagram.com/YOUR_HANDLE",
  youtube:   "https://youtube.com/@YOUR_CHANNEL",
};
```

---

## Option A — Vercel CLI (Recommended)

The included `deploy.sh` script handles everything: dependency install, production build, config check, and deployment.

### Step 1 — Prerequisites

Ensure Node.js 18 or higher is installed. Verify with:

```bash
node -v
```

If Node.js is not installed, download it from [nodejs.org](https://nodejs.org).

### Step 2 — Make the script executable (first time only)

```bash
chmod +x deploy.sh
```

### Step 3 — Deploy to preview (staging)

Run a preview deployment first to verify everything looks correct before going live:

```bash
./deploy.sh
```

The script will:
1. Confirm you are in the correct project directory.
2. Check your Node.js version.
3. Run `npm install`.
4. Run `npm run build` and confirm the build succeeds.
5. Warn you about any unfilled `TODO` placeholders in `src/config.ts`.
6. Install the Vercel CLI if it is not already present.
7. Log you in to Vercel (browser window will open on first run).
8. Deploy to a preview URL (e.g., `https://roobens-finds-abc123.vercel.app`).

### Step 4 — Deploy to production

Once you are satisfied with the preview, deploy to production:

```bash
./deploy.sh --prod
```

| Command | Target | URL |
|---|---|---|
| `./deploy.sh` | Preview / staging | Auto-generated Vercel URL |
| `./deploy.sh --prod` | Production | Your connected custom domain |

### Step 5 — Connect your custom domain

After the first production deployment, connect `www.roobensfinds.com` in the Vercel dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and open your project.
2. Navigate to **Settings → Domains**.
3. Click **Add Domain** and enter `www.roobensfinds.com`.
4. Vercel will provide DNS records. Add them in your domain registrar's DNS settings.
5. Propagation typically takes 5–30 minutes.

---

## Option B — Vercel Dashboard (No CLI)

If you prefer a point-and-click setup, use the Vercel dashboard directly.

### Step 1 — Push to GitHub

Initialize a git repository and push the project:

```bash
git init
git add .
git commit -m "Initial commit — Roobens Finds"
git remote add origin https://github.com/YOUR_USERNAME/roobens-finds.git
git push -u origin main
```

### Step 2 — Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Click **Import Git Repository** and select your `roobens-finds` repo.
3. On the configuration screen, set:

| Setting | Value |
|---|---|
| Framework Preset | Vite (auto-detected) |
| Root Directory | `/` (leave as default — `index.html` is at the project root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

4. Click **Deploy**.

### Step 3 — Connect your domain

Follow the same steps as Option A, Step 5 above.

---

## Option C — Netlify

1. Push to GitHub as described in Option B, Step 1.
2. Go to [netlify.com](https://netlify.com) and click **Add new site → Import an existing project**.
3. Connect your GitHub repo.
4. Set the build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |

5. Add a `_redirects` file in `public/` to handle SPA routing:

```
/* /index.html 200
```

6. Click **Deploy site**.

---

## Option D — Manual / Any Static Host

Run the production build locally and upload the output:

```bash
npm install
npm run build
```

The `dist/` folder contains the complete static site. Upload its contents to any static file host (AWS S3 + CloudFront, GitHub Pages, Cloudflare Pages, etc.).

**Important for SPA routing:** Whichever host you use, configure it to serve `index.html` for all routes. Without this, direct links to `/product`, `/about`, etc. will return 404 errors. The included `vercel.json` handles this automatically on Vercel.

---

## Environment Variables

This project has no required environment variables for the frontend. All integration values are set directly in `src/config.ts` as TypeScript constants, which are compiled into the bundle at build time.

If you later upgrade to a full-stack setup (e.g., adding a backend API), you can move sensitive values to `.env` files and reference them via `import.meta.env.VITE_*`.

---

## Deployment Checklist

| Item | Status |
|---|---|
| `src/config.ts` — all TODO values filled | Confirm before deploying |
| `npm run build` passes with 0 errors | Confirmed by `deploy.sh` |
| `vercel.json` present at project root | Included — handles SPA routing |
| `public/logo-dark.png` and `public/logo-white.png` present | Included |
| Custom domain connected in Vercel | Do after first production deploy |
| Legal pages reviewed (`/privacy`, `/terms`, `/disclaimer`) | Review before going live |

---

## Troubleshooting

**Routes return 404 when accessed directly (e.g., `/product`)**
This means the host is not configured for SPA routing. On Vercel, the included `vercel.json` handles this automatically. On Netlify, add a `_redirects` file as described in Option C.

**Build fails with TypeScript errors**
Run `npx tsc --noEmit` locally to see the exact errors. All known issues were resolved before this ZIP was packaged.

**Vercel CLI asks me to log in**
Run `vercel login` once before running `deploy.sh`. A browser window will open for authentication.

**The download or checkout button shows a fallback alert**
This means `FREE_DOWNLOAD_URL` or `PREMIUM_CHECKOUT_URL` in `src/config.ts` is still empty. Set the URL, rebuild, and redeploy.

---

*For questions: info@roobensfinds.com | www.roobensfinds.com*
