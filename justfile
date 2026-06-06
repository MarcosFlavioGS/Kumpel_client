# Kumpel frontend — Next.js 15 / Bun
# Run `just` to list available recipes.

set dotenv-load := false

# List recipes
default:
    @just --list

# ── Dependencies ─────────────────────────────────────────────────────────────

# Install dependencies
deps:
    bun install

# Install with frozen lockfile (CI-safe)
deps-ci:
    bun install --frozen-lockfile

# ── Dev server ────────────────────────────────────────────────────────────────

# Start dev server with Turbopack (port 3000)
dev:
    bun run dev

# ── Build ─────────────────────────────────────────────────────────────────────

# Production build
build:
    bun run build

# Serve the production build locally
start:
    bun run start

# Type-check without emitting (uses tsc --noEmit)
typecheck:
    bun x tsc --noEmit

# ── Code quality ─────────────────────────────────────────────────────────────

# Run ESLint
lint:
    bun run lint

# Format with Prettier
fmt:
    bun x prettier --write "src/**/*.{ts,tsx,json,css}"

# Check formatting without writing (CI-safe)
fmt-check:
    bun x prettier --check "src/**/*.{ts,tsx,json,css}"

# ── Deploy (Vercel) ──────────────────────────────────────────────────────────

# Deploy to Vercel (preview)
deploy:
    vercel

# Deploy to Vercel production
deploy-prod:
    vercel --prod

# Pull Vercel env variables to .env.local
env-pull:
    vercel env pull .env.local
