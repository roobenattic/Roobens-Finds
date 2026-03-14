#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Roobens Finds / Portfolio Planner
# Vercel CLI deployment script
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh           # preview deployment (staging)
#   ./deploy.sh --prod    # production deployment (live)
#
# Prerequisites:
#   - Node.js 18+
#   - npm (comes with Node.js)
#   - A Vercel account (free at https://vercel.com)
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log()    { echo -e "${CYAN}[deploy]${RESET} $1"; }
ok()     { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()   { echo -e "${YELLOW}[!]${RESET} $1"; }
error()  { echo -e "${RED}[✗]${RESET} $1"; exit 1; }

echo ""
echo -e "${BOLD}Roobens Finds — Vercel Deployment Script${RESET}"
echo "────────────────────────────────────────"
echo ""

# ── 1. Check we are in the right directory ────────────────────────────────────
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ] || [ ! -f "index.html" ]; then
  error "Run this script from the project root (the folder containing package.json, vite.config.ts, and index.html)."
fi
ok "Project root confirmed."

# ── 2. Check Node.js version ─────────────────────────────────────────────────
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  error "Node.js 18 or higher is required. Current version: $(node -v 2>/dev/null || echo 'not found'). Download at https://nodejs.org"
fi
ok "Node.js $(node -v) detected."

# ── 3. Install project dependencies ──────────────────────────────────────────
log "Installing dependencies..."
npm install --silent
ok "Dependencies installed."

# ── 4. Run production build ───────────────────────────────────────────────────
log "Building for production..."
npm run build
ok "Build complete. Output in dist/"

# ── 5. Check src/config.ts for unfilled placeholders ─────────────────────────
log "Checking src/config.ts for unfilled TODO placeholders..."
TODOS=$(grep -c "YOUR_" src/config.ts 2>/dev/null || true)
if [ "$TODOS" -gt 0 ]; then
  warn "$TODOS integration placeholder(s) still unfilled in src/config.ts."
  warn "The site will deploy, but buttons for download, checkout, newsletter,"
  warn "and contact form will show fallback alerts until you fill them in."
  echo ""
fi

# ── 6. Install Vercel CLI if not present ─────────────────────────────────────
if ! command -v vercel &> /dev/null; then
  log "Vercel CLI not found. Installing globally..."
  npm install -g vercel
  ok "Vercel CLI installed."
else
  ok "Vercel CLI $(vercel --version) already installed."
fi

# ── 7. Deploy ─────────────────────────────────────────────────────────────────
echo ""
if [ "$1" == "--prod" ]; then
  log "Deploying to ${BOLD}PRODUCTION${RESET}..."
  echo ""
  vercel --prod \
    --build-env NODE_ENV=production \
    --yes
  echo ""
  ok "Production deployment complete."
  echo ""
  echo -e "${BOLD}Your site is live at:${RESET} https://www.roobensfinds.com"
  echo -e "(If this is your first deploy, go to Vercel Dashboard → Settings → Domains to connect www.roobensfinds.com)"
else
  log "Deploying to ${BOLD}PREVIEW${RESET} (staging)..."
  warn "To deploy to production, run:  ./deploy.sh --prod"
  echo ""
  vercel \
    --build-env NODE_ENV=production \
    --yes
  echo ""
  ok "Preview deployment complete."
  echo ""
  echo "Review the preview URL above, then run  ./deploy.sh --prod  to go live."
fi

echo ""
echo "────────────────────────────────────────"
echo -e "${BOLD}Next steps:${RESET}"
echo "  1. Open src/config.ts and fill in any remaining TODO values."
echo "  2. Connect your domain: Vercel Dashboard → Your Project → Settings → Domains → Add www.roobensfinds.com"
echo "  3. For questions: info@roobensfinds.com"
echo ""
