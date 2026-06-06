# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reference docs

Before making non-trivial changes, read **`doc/project_analysis.md`**. It describes the stack (Next.js App Router, Phoenix WebSockets, Zustand, shadcn/ui), env vars, routing, and backend contract.

## Commands

```bash
bun install            # install dependencies
bun run dev            # dev server on http://localhost:3000 (Turbopack)
bun run build          # production build
bun start              # serve production build locally
bun run lint           # lint; fix new issues in touched files after edits
```

Environment: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`. Define in `.env.local`; defaults in `src/config.ts` point to `localhost:4000`.

## Architecture

**Routing** — Next.js App Router under `src/app/`. Thin `page.tsx` files render a single feature component from `src/components/`.

**State** — Zustand stores under `src/app/stores/`, exported from `index.ts`. `StoreHydration` in root layout prevents hydration mismatches when stores persist to `localStorage`.

**WebSocket** — `RoomSocketProvider` wraps the app and manages subscriptions to multiple `chat_room:*` Phoenix Channels. Components access channels via the `useChannel` hook (`src/app/hooks/`).

**Auth** — `src/lib/api-auth.ts` handles HTTP calls with JWT Bearer tokens and auto-refresh on 401.

**Styling** — Discord-adjacent design system: Tailwind `kumpel.*` colors, `kumpel-auth-*`/`kumpel-link` utilities in `globals.css`, shared field classes in `src/lib/kumpel-ui.ts`. Use `cn()` from `@/lib/utils` for conditional classes. shadcn/ui primitives live in `src/components/ui/`. See **`doc/project_analysis.md` → UI & design system** before large visual changes.

**Types** — Shared API/domain types in `src/type/`; avoid duplicating across components.

**Path alias** — `@/*` maps to `src/*`.

## Key conventions

- **Server Components by default** in `src/app/**`; add `'use client'` only for hooks, browser APIs, event handlers, or state.
- `NEXT_PUBLIC_*` vars only for browser-visible values. All API/WS bases go in `src/config.ts`.
- Custom hooks under `src/app/hooks/`; import with `@/hooks/…`.
- `strict` TypeScript; avoid `any`.
- Effect dependency arrays must be complete; if suppressing `exhaustive-deps`, add a short comment (see `ChatRoom` pattern).
- Prefer `next/link` / `next/navigation` over full page reloads.
- Use `next/image` for images in `public/`; keep `alt` text meaningful.

## Documentation

Docs are part of the same task as the code change — not extra scope.

- Update **`doc/project_analysis.md`** when architecture, routes, env vars, or backend contract changes.
- Update **`README.md`** when user-facing setup, prerequisites, scripts, or high-level features change.
- Link new files under `doc/` from `README.md` or `doc/project_analysis.md`.
