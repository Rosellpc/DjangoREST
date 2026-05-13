import { refreshAccessToken } from "@/lib/auth-api"
import { getAccessToken } from "@/lib/auth-tokens"

export class ApiAuthError extends Error {
  constructor(message = "Missing or invalid auth token") {
    super(message)
    this.name = "ApiAuthError"
  }
}

export interface ApiPage<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiPlan {
  id: number
  code: string
  name: string
  monthly_price: string
  max_profiles: number
  max_concurrent_streams: number
  is_active: boolean
}

export interface ApiSubscription {
  id: number
  user: number
  plan: ApiPlan
  status: string
  starts_at: string
  ends_at: string | null
  auto_renew: boolean
  payment_provider: string
  payment_brand: string
  payment_last4: string
  billing_email: string
  created_at: string
  updated_at: string
}

export interface ApiProfile {
  id: number
  subscription: number
  name: string
  is_kids: boolean
  avatar_key: string
  maturity_rating: "G" | "PG" | "PG-13" | "R" | "NC-17"
  language: string
  autoplay_next_episode: boolean
  autoplay_previews: boolean
  has_pin: boolean
  pin: string
  game_handle: string
  created_at: string
  updated_at: string
}

export interface ApiMyListItem {
  id: number
  profile: number
  film_id: number
  created_at: string
}

export interface ApiWatchHistoryItem {
  id: number
  profile: number
  film_id: number
  progress_seconds: number
  completed: boolean
  last_watched_at: string
  created_at: string
  updated_at: string
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new ApiAuthError()

  const headers = new Headers(init.headers)
  headers.set("authorization", `Bearer ${token}`)
  if (!headers.has("content-type") && init.body) {
    headers.set("content-type", "application/json")
  }

  let response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
    cache: "no-store",
  })

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers.set("authorization", `Bearer ${refreshed}`)
      response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
        ...init,
        headers,
        cache: "no-store",
      })
    }
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiAuthError("Unauthorized")
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request failed (${response.status}): ${body}`)
  }

  if (response.status === 204) return null as T
  return (await response.json()) as T
}

export async function listPlans(): Promise<ApiPlan[]> {
  const response = await fetch("/api/backend/subscriptions/plans/", { cache: "no-store" })
  if (!response.ok) throw new Error(`Failed to load plans (${response.status})`)
  const payload = (await response.json()) as ApiPage<ApiPlan>
  return payload.results ?? []
}

export async function listUserSubscriptions(): Promise<ApiSubscription[]> {
  const payload = await apiFetch<ApiPage<ApiSubscription>>("subscriptions/subscriptions/")
  return payload.results ?? []
}

export async function createUserSubscription(
  planId: number,
  billing: Partial<{
    payment_provider: string
    payment_brand: string
    payment_last4: string
    billing_email: string
  }> = {}
): Promise<ApiSubscription> {
  return apiFetch<ApiSubscription>("subscriptions/subscriptions/", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId, status: "active", ...billing }),
  })
}

export async function listProfiles(): Promise<ApiProfile[]> {
  const payload = await apiFetch<ApiPage<ApiProfile>>("subscriptions/profiles/")
  return payload.results ?? []
}

export async function createProfile(payload: {
  name: string
  is_kids?: boolean
  avatar_key?: string
  maturity_rating?: ApiProfile["maturity_rating"]
  language?: string
  autoplay_next_episode?: boolean
  autoplay_previews?: boolean
  has_pin?: boolean
  pin?: string
  game_handle?: string
}): Promise<ApiProfile> {
  return apiFetch<ApiProfile>("subscriptions/profiles/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateProfile(
  profileId: number,
  payload: Partial<{
    name: string
    is_kids: boolean
    avatar_key: string
    maturity_rating: ApiProfile["maturity_rating"]
    language: string
    autoplay_next_episode: boolean
    autoplay_previews: boolean
    has_pin: boolean
    pin: string
    game_handle: string
  }>
): Promise<ApiProfile> {
  return apiFetch<ApiProfile>(`subscriptions/profiles/${profileId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteProfile(profileId: number): Promise<void> {
  await apiFetch<void>(`subscriptions/profiles/${profileId}/`, { method: "DELETE" })
}

export async function listMyListItems(): Promise<ApiMyListItem[]> {
  const payload = await apiFetch<ApiPage<ApiMyListItem>>("subscriptions/my-list/")
  return payload.results ?? []
}

export async function createMyListItem(profileId: number, filmId: number): Promise<ApiMyListItem> {
  return apiFetch<ApiMyListItem>("subscriptions/my-list/", {
    method: "POST",
    body: JSON.stringify({ profile: profileId, film_id: filmId }),
  })
}

export async function deleteMyListItem(itemId: number): Promise<void> {
  await apiFetch<void>(`subscriptions/my-list/${itemId}/`, { method: "DELETE" })
}

export async function listWatchHistory(): Promise<ApiWatchHistoryItem[]> {
  const payload = await apiFetch<ApiPage<ApiWatchHistoryItem>>("subscriptions/history/")
  return payload.results ?? []
}

export async function createWatchHistoryItem(payload: {
  profile: number
  film_id: number
  progress_seconds: number
  completed: boolean
  last_watched_at: string
}): Promise<ApiWatchHistoryItem> {
  return apiFetch<ApiWatchHistoryItem>("subscriptions/history/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateWatchHistoryItem(
  itemId: number,
  payload: Partial<{
    progress_seconds: number
    completed: boolean
    last_watched_at: string
  }>
): Promise<ApiWatchHistoryItem> {
  return apiFetch<ApiWatchHistoryItem>(`subscriptions/history/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}
