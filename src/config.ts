/**
 * Defaults: local Phoenix in development (`bun run dev`), production Fly URLs otherwise.
 * Override with NEXT_PUBLIC_API_URL / NEXT_PUBLIC_WS_URL (e.g. in `.env.local`).
 *
 * Local `mix phx.server` is plain HTTP — use `http://` and `ws://` for localhost, not
 * `https://` / `wss://` (TLS on a clear channel triggers Bandit: "looks like TLS on a clear channel").
 */
const isDev = process.env.NODE_ENV === 'development'

function normalizeLocalUrl(
  url: string,
  kind: 'http' | 'ws'
): string {
  if (!isDev) return url
  try {
    const u = new URL(url)
    const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
    if (!local) return url

    if (kind === 'http' && u.protocol === 'https:') {
      u.protocol = 'http:'
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          '[kumpel] NEXT_PUBLIC_API_URL used https:// for localhost; Phoenix dev is HTTP only. Using http:// instead.'
        )
      }
      return u.href.replace(/\/$/, '')
    }
    if (kind === 'ws' && u.protocol === 'wss:') {
      u.protocol = 'ws:'
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          '[kumpel] NEXT_PUBLIC_WS_URL used wss:// for localhost; Phoenix dev uses ws://. Using ws:// instead.'
        )
      }
      return u.href.replace(/\/$/, '')
    }
  } catch {
    /* keep original */
  }
  return url
}

const rawApi =
  process.env.NEXT_PUBLIC_API_URL ||
  (isDev ? 'http://localhost:4000' : 'https://kumpel-back.fly.dev')

const rawWs =
  process.env.NEXT_PUBLIC_WS_URL ||
  (isDev ? 'ws://localhost:4000' : 'wss://kumpel-back.fly.dev')

export const API_URL = normalizeLocalUrl(rawApi, 'http')
export const WS_URL = normalizeLocalUrl(rawWs, 'ws')
