import { clearTokens, getRefreshToken, setTokens } from "@/lib/auth-tokens"

export interface AuthUser {
  id: number
  username: string
  email?: string
}

interface AuthPayload {
  access: string
  refresh: string
  user?: AuthUser
}

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as Record<string, unknown>
    const firstValue = Object.values(payload)[0]
    if (Array.isArray(firstValue)) return String(firstValue[0])
    if (typeof firstValue === "string") return firstValue
    return JSON.stringify(payload)
  } catch {
    return response.statusText || "Request failed"
  }
}

async function authRequest(path: string, body: Record<string, unknown>): Promise<AuthPayload> {
  const response = await fetch(`/api/backend/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const payload = (await response.json()) as AuthPayload
  setTokens(payload.access, payload.refresh)
  return payload
}

export async function login(username: string, password: string): Promise<AuthPayload> {
  return authRequest("token/", { username, password })
}

export async function register(username: string, password: string, email?: string): Promise<AuthPayload> {
  return authRequest("auth/register/", { username, password, email })
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  const response = await fetch("/api/backend/token/refresh/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  })

  if (!response.ok) {
    clearTokens()
    return null
  }

  const payload = (await response.json()) as { access: string; refresh?: string }
  setTokens(payload.access, payload.refresh)
  return payload.access
}

export async function blacklistRefreshToken(): Promise<void> {
  const refresh = getRefreshToken()
  clearTokens()
  if (!refresh) return

  await fetch("/api/backend/token/blacklist/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  }).catch(() => undefined)
}
