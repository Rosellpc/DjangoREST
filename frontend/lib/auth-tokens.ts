export const ACCESS_TOKEN_KEY = "streamflix_access_token"
export const REFRESH_TOKEN_KEY = "streamflix_refresh_token"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("jwt_access_token")
  )
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return (
    window.localStorage.getItem(REFRESH_TOKEN_KEY) ||
    window.localStorage.getItem("refresh_token") ||
    window.localStorage.getItem("jwt_refresh_token")
  )
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return
  ;[
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    "access_token",
    "refresh_token",
    "jwt_access_token",
    "jwt_refresh_token",
  ].forEach((key) => window.localStorage.removeItem(key))
}
