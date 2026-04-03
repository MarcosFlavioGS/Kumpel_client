# Kumpel App — Project Analysis

This document summarizes the **Kumpel** frontend: a group chat client that talks to a **Phoenix (Elixir)** backend over **REST** and **Phoenix Channels (WebSockets)**.

---

## Purpose

- **Sign up / log in** against the API; persist a JWT and basic user fields in the browser.
- **List, create, and subscribe to chat rooms**; open a room and send/receive messages in real time.

---

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 15** (App Router), **React 18** |
| Language | **TypeScript** (`strict: true`) |
| Styling | **Tailwind CSS 3**, **tailwindcss-animate** |
| UI primitives | **shadcn/ui** (Radix primitives, `new-york` style, `lucide-react` icons) |
| Client state | **Zustand** with `persist` and `devtools` |
| Realtime | **`phoenix` JS** client (`Socket`, `Channel`) |
| Package manager | **Yarn 4** (`packageManager` in `package.json`; Vercel uses Corepack via `vercel.json`) |
| Lint | **ESLint** with `eslint-config-next` (`next/core-web-vitals`, `next/typescript`) |

Dev script uses **Turbopack** (`next dev --turbopack`).

---

## Repository Layout

```
kumpel_app/
├── doc/
│   └── project_analysis.md    # This file
├── public/                     # Static assets (e.g. logo.svg)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout, fonts, metadata, StoreHydration
│   │   ├── page.tsx            # "/" — registration
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── stores/             # Zustand stores (user, chat)
│   │   └── hooks/              # Custom hooks (import as @/hooks/… — see tsconfig paths)
│   ├── components/             # Feature + shared UI
│   │   ├── ui/                 # shadcn components
│   │   ├── dashboard.tsx, chatRoom.tsx, dialogs, landing, etc.
│   ├── config.ts               # API_URL / WS_URL from env + dev localhost normalization
│   ├── lib/utils.ts            # cn() helper (shadcn)
│   ├── lib/kumpel-ui.ts        # Shared form field classes (Discord-style inputs)
│   └── type/                   # Shared TS types (e.g. Message)
├── components.json             # shadcn config (aliases: @/components, @/lib, …)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json               # paths: "@/*" → "./src/*"
└── vercel.json                 # Yarn 4 install on Vercel
```

**Imports:** `tsconfig.json` maps `@/hooks/*` → `src/app/hooks/*`, matching shadcn’s `components.json` `hooks` alias.

---

## Runtime Configuration

`src/config.ts` exports:

- **`API_URL`** — from `NEXT_PUBLIC_API_URL`, or `http://localhost:4000` in development, or `https://kumpel-back.fly.dev` in production.
- **`WS_URL`** — from `NEXT_PUBLIC_WS_URL`, or `ws://localhost:4000` / `wss://kumpel-back.fly.dev` accordingly.

In development, **https/wss URLs pointing at localhost are rewritten to http/ws** with a console warning, because local Phoenix typically runs without TLS.

---

## Application Flow

### Routing (App Router)

| Route | Role |
|-------|------|
| `/` | Registration form → `POST /api/users` → stores token → `/dashboard` |
| `/login` | Login → `POST /api/auth/login` → token → `/dashboard` |
| `/dashboard` | Loads rooms via `GET /api/currentUser` (Bearer token); sidebar + `ChatRoom` |

`RootLayout` wraps children in **`StoreHydration`**, which defers rendering until after mount so **Zustand `persist` + `localStorage`** does not mismatch SSR HTML.

### Authentication & storage

- **`useUserStore`**: `token`, `userName`, `email`; persisted to `localStorage` as `userStore`.
- **`useChatStore`**: in-memory message list for the active view; also persisted (name: `chatStore`) — worth being aware of for multi-tab / stale history behavior.
- Dashboard redirects to `/` if there is no token or on **401** from `currentUser`.

### Realtime

- **`useChannel`** (`@/hooks/useChannel`) creates a Phoenix `Socket` to `WS_URL/socket`, joins `channelName` (e.g. `chat_room:<room_uuid>`) with optional join payload `{ code }` and optional `token` in socket params.
- **`ChatRoom`** passes **`token`** into `useChannel` (Phoenix socket `params`) when present, merges `new_message` into `useChatStore`, surfaces **connection status** in the header, and can show **browser notifications** when the tab is hidden.

---

## Backend Contract (Summary)

Aligned with `README.md`:

- **REST** (base `API_URL`): register, login, `currentUser`, create room, subscribe to room.
- **WebSocket**: topic `chat_room:<room_id>`, join payload includes room **code**; pushes/receives `new_message` (and related events as implemented server-side).

---

## UI & design system (Discord-adjacent)

The UI aims for a **modern, Discord-like** dark shell: deep grey surfaces, **blurple** accent (`#5865F2`), subtle borders, and clear hierarchy—not a pixel-perfect Discord clone, but the same visual language.

### Tokens

- **Tailwind** `kumpel.*` colors are defined in **`tailwind.config.ts`** (`bg`, `sidebar`, `elevated`, `input`, `border`, `hover`, `accent`, `accent-hover`, `muted`, `danger`, `success`).
- **shadcn CSS variables** under **`.dark`** in **`src/app/globals.css`** are tuned to match that shell so default `bg-background`, borders, and primary actions stay coherent.
- **Shadows**: `shadow-kumpel-glow` (panels), `shadow-kumpel-accent` (accent glow on loader).

### Layout & theme

- **`RootLayout`**: `className="dark"` on `<html>` (with `suppressHydrationWarning`), **Inter** via `next/font`, `antialiased`, base **`bg-kumpel-bg`** on `<body>`.
- **Auth screens** (`/`, `/login`): utility classes **`kumpel-auth-bg`** (radial blurple glow + `#313338`) and **`kumpel-auth-panel`** (glassy sidebar panel, rounded-2xl). Links use **`kumpel-link`**.
- **`StoreHydration`**: branded full-screen loader instead of a blank flash while persisted state is ready.

### Components

- **Button** variant **`kumpel`**: blurple primary with focus ring (`src/components/ui/button.tsx`).
- **Forms**: shared classes from **`src/lib/kumpel-ui.ts`** (`kumpelFieldClass`, `kumpelLabelClass`, `kumpelInputClassName`) for inputs and labels on auth and dialogs.
- **Dashboard**: channel list as **accessible buttons** (not div cards) with **selection** state (accent bar, ring on avatar), **skeleton** loading, **empty state** copy when no channel is selected; **“Channels”** header + optional display name.
- **Chat**: **connection pill** (dot + status) and **join error** banner; **message list** sits in a fixed-width **thread column** (`md`: 48rem, `lg`: 52rem) with a slightly **lighter translucent surface** (`bg-kumpel-sidebar/35`), **inset top highlight**, and **vertical borders**, flanked on wide viewports by **darker elevated rails** so the center does not read as “empty margins on the same flat color”; **message bubbles** (rounded, hover row tint); **own messages** aligned with distinct bubble style; **stable display color** per username (hash of name); **“Latest”** scroll affordance when the user has scrolled up; **composer** widths match the thread column; composer disabled until connected; placeholders reflect connecting/waiting.
- **Dialogs**: **`DialogOverlay`** uses light **backdrop blur**; modal content uses `kumpel` panel colors, **`Cancel`** + primary actions, **Enter** submits via `<form>` on create/join.

### Maintenance

When you change colors, spacing, or UX patterns, update **`tailwind.config.ts`**, **`globals.css`**, and/or **`kumpel-ui.ts`** together, and adjust this section so assistants and humans stay aligned.

---

## Deployment

- **Vercel**: `vercel.json` ensures **Yarn 4** install; set **`NEXT_PUBLIC_API_URL`** and **`NEXT_PUBLIC_WS_URL`** for the deployed API/WebSocket endpoints.

---

## Possible Follow-Ups (Non-blocking)

- Consider **route groups**, **middleware**, or **server-side session checks** if you want stricter protection than client-only redirects.
- **Stable message IDs** from the API would allow stricter list keys than `timestamp + index + user`.

---

*Last updated from repository scan — intended for maintainers and AI assistants; keep in sync when architecture or env vars change materially.*
