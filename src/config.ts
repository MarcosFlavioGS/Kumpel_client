/**
 * Defaults: local Phoenix in development (`npm run dev`), production Fly URLs otherwise.
 * Override with NEXT_PUBLIC_API_URL / NEXT_PUBLIC_WS_URL (e.g. in `.env.local`).
 */
const isDev = process.env.NODE_ENV === 'development'

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isDev ? 'http://localhost:4000' : 'https://kumpel-back.fly.dev')

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (isDev ? 'ws://localhost:4000' : 'wss://kumpel-back.fly.dev')