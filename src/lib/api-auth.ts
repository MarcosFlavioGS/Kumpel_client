import { API_URL } from '@/config'
import { useUserStore } from '@/app/stores'

/** Response shape for `POST /api/auth/refresh` and login (refresh field). */
export interface AuthTokensResponse {
  token: string
  refresh: string
}

let refreshInFlight: Promise<boolean> | null = null

/**
 * Exchanges the stored refresh token for new access + refresh tokens.
 * Single-flight: concurrent callers share one refresh request.
 * On failure, clears auth (invalid/expired refresh).
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const { refreshToken, token, setTokens, clearAuth } = useUserStore.getState()

    if (!refreshToken) {
      if (token) clearAuth()
      return false
    }

    let response: Response
    try {
      response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      })
    } catch {
      return false
    }

    if (!response.ok) {
      clearAuth()
      return false
    }

    let data: AuthTokensResponse
    try {
      data = (await response.json()) as AuthTokensResponse
    } catch {
      clearAuth()
      return false
    }

    if (typeof data.token !== 'string' || typeof data.refresh !== 'string') {
      clearAuth()
      return false
    }

    setTokens({ token: data.token, refreshToken: data.refresh })
    return true
  })()

  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

function requestUrlKey(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

/**
 * `fetch` with Bearer access token from the user store. On **401**, attempts one
 * refresh via `POST /api/auth/refresh`, updates tokens, then retries the request once.
 * Does not intercept 401 on the refresh endpoint itself.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { retryOn401?: boolean } = {}
): Promise<Response> {
  const retryOn401 = options.retryOn401 ?? true

  const buildHeaders = (): Headers => {
    const headers = new Headers(init.headers)
    const token = useUserStore.getState().token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  }

  let response = await fetch(input, { ...init, headers: buildHeaders() })

  if (response.status !== 401 || !retryOn401) {
    return response
  }

  const url = requestUrlKey(input)
  if (url.includes('/api/auth/refresh')) {
    return response
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return response
  }

  response = await fetch(input, { ...init, headers: buildHeaders() })

  if (response.status === 401) {
    useUserStore.getState().clearAuth()
  }

  return response
}
