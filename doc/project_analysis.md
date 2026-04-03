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
| Package manager | **Bun** (`packageManager` in `package.json`; lockfile **`bun.lock`**; Vercel install via **`vercel.json`**) |
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
│   │   └── hooks/              # e.g. useChannel, useMediaQuery (@/hooks/…)
│   ├── components/             # Feature + shared UI
│   │   ├── ui/                 # shadcn components
│   │   ├── dashboard.tsx, chatRoom.tsx, roomSocketProvider.tsx, dialogs, landing, etc.
│   ├── config.ts               # API_URL / WS_URL from env + dev localhost normalization
│   ├── lib/utils.ts            # cn() helper (shadcn)
│   ├── lib/kumpel-ui.ts        # Shared form field classes (Discord-style inputs)
│   └── type/                   # Shared TS types (e.g. Message)
├── components.json             # shadcn config (aliases: @/components, @/lib, …)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json               # paths: "@/*" → "./src/*"
└── vercel.json                 # `bun install --frozen-lockfile` on Vercel
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
- **`useChatStore`**: **`messagesByRoomId`** (per-room arrays, last **250** messages per room), **`unreadByRoomId`** (badge counts). Persisted under **`localStorage`** key **`kumpel-chat`** (`partialize` only messages + unread). **`resetChat`** on logout.
- Dashboard redirects to `/` if there is no token or on **401** from `currentUser`.

### Realtime

- **`RoomSocketProvider`** (`src/components/roomSocketProvider.tsx`): one Phoenix **`Socket`** (`WS_URL/socket`, `params.token`), joins **every** listed room as `chat_room:<uuid>` with `{ code }`. Incoming **`new_message`** → **`appendMessageForRoom`**; if the channel is not **active** (see below), increments **unread** and may fire **`Notification`** when the document is hidden.
- **Active channel** (no unread for that room): `activeChannelId` = selected room when the user **sees** the chat — on **mobile**, only when the chat pane is open (`showMobileChat`); on **`md+`**, whenever a room is selected (split view). Implemented with **`useMediaQuery('(min-width: 768px)')`** in the dashboard.
- **`ChatRoom`**: reads **`messagesByRoomId[room.id]`**, sends via **`useRoomSocket().sendRoomMessage`**, shows **per-room connection** status from the provider.
- **`useChannel`** (`@/hooks/useChannel`) remains available for simple single-channel usage; the dashboard uses **`RoomSocketProvider`** instead.

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
- **Dashboard**: channel list as **accessible buttons** with **selection** state, **unread badge** (red pill on avatar, up to **99+**), **skeleton** loading, **empty state** when no channel selected (desktop). **Mobile (`< md`)**: stacked list ↔ chat + **back**; **`activeChannelId`** logic ties unread to whether the user is actually viewing chat. **Desktop (`md+`)**: **272px** sidebar + main. **`h-dvh`**, **safe-area** padding where helpful.
- **Chat**: **connection pill** (dot + status) and **join error** banner; **message list** sits in a fixed-width **thread column** (`md`: 48rem, `lg`: 52rem) with a slightly **lighter translucent surface** (`bg-kumpel-sidebar/35`), **inset top highlight**, and **vertical borders**, flanked on wide viewports by **darker elevated rails** so the center does not read as “empty margins on the same flat color”; **message bubbles** (rounded, hover row tint); **own messages** aligned with distinct bubble style; **stable display color** per username (hash of name); **“Latest”** scroll affordance when the user has scrolled up; **composer** widths match the thread column; composer disabled until connected; placeholders reflect connecting/waiting.
- **Dialogs**: **`DialogOverlay`** uses light **backdrop blur**; modal content uses `kumpel` panel colors, **`Cancel`** + primary actions, **Enter** submits via `<form>` on create/join.

### Maintenance

When you change colors, spacing, or UX patterns, update **`tailwind.config.ts`**, **`globals.css`**, and/or **`kumpel-ui.ts`** together, and adjust this section so assistants and humans stay aligned.

---

## Background delivery, auth navigation, and long-lived sessions

### Why unread does not update when the app is in the background

- **WebSockets only work while the browser is allowed to run your JavaScript.** On **mobile**, when the user switches apps or minimizes the browser, the OS often **suspends the tab**: timers freeze, the socket may **close**, and **no client code runs** — so new messages are **not received** and the **unread badge cannot increment** until the user returns.
- **Phoenix** already tries to **reconnect when the tab becomes visible** again; the client also calls **`socket.connect()`** on **`visibilitychange` / `pageshow`** when disconnected, so **live delivery resumes after** the user opens the app again.
- **What this does *not* fix:** messages that arrived **while the tab was fully suspended** are **lost to the client** unless the **server stores history** and the app **fetches missed messages** (REST or replay on join). True **push while away** needs **Web Push** (service worker + backend integration with FCM/APNs) or a **native** client.

### Auth: back button and “session”

- **Session today:** a **JWT** (and related fields) in **`useUserStore`**, **persisted in `localStorage`** as `userStore`. There is **no refresh-token flow** in this repo yet; longevity depends on **API token expiry** only.
- **Back button:** Previously, **history** could stack **`/login` → `/dashboard`**, so **Back** returned to the login UI even though the token still existed. **Fix:** after login/signup use **`router.replace('/dashboard')`** (no extra history entry for the auth screen), and **`/` + `/login`** **`useEffect`** redirect to **`/dashboard`** when a **token** is already present so Back to auth routes bounces forward instead of showing a dead login form.
- **Stronger sessions (mostly backend):** **Refresh tokens** (short-lived access + long-lived refresh), **httpOnly cookies**, and **middleware**-based protection are **server concerns**; the SPA can then call a **refresh** endpoint before API/WebSocket calls. **OAuth** / **session cookies** follow the same pattern.

---

## Deployment

- **Vercel**: `vercel.json` runs **`bun install --frozen-lockfile`**; commit **`bun.lock`**. Set **`NEXT_PUBLIC_API_URL`** and **`NEXT_PUBLIC_WS_URL`** for the deployed API/WebSocket endpoints.

---

## Possible Follow-Ups (Non-blocking)

- Consider **route groups**, **middleware**, or **server-side session checks** if you want stricter protection than client-only redirects.
- **Stable message IDs** from the API would allow stricter list keys than `timestamp + index + user`.
- **Message history API** (per room, `since` cursor) to **backfill** after reconnect or background; **Web Push** for notifications when the app is not active.
- **Refresh-token** (or cookie session) flow on the **Phoenix** side and thin client glue to renew JWT before expiry.

---

*Last updated from repository scan — intended for maintainers and AI assistants; keep in sync when architecture or env vars change materially.*
