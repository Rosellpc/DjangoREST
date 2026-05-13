"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import {
  ApiAuthError,
  createProfile,
  deleteProfile as deleteProfileRequest,
  listProfiles,
  listUserSubscriptions,
  updateProfile as updateProfileRequest,
  type ApiProfile,
} from "@/lib/subscriptions-api"

export interface Profile {
  id: string
  name: string
  avatarUrl: string
  isKids: boolean
  maturityRating: "G" | "PG" | "PG-13" | "R" | "NC-17"
  language: string
  autoplayNextEpisode: boolean
  autoplayPreviews: boolean
  hasPin: boolean
  pin?: string
  gameHandle?: string
  createdAt: Date
}

const PROFILE_ID_STORAGE_KEY = "streamflix_profile_id"
const MAX_PROFILES_FALLBACK = 5

export const AVATAR_OPTIONS = [
  "/avatars/avatar-red.png",
  "/avatars/avatar-blue.png",
  "/avatars/avatar-green.png",
  "/avatars/avatar-yellow.png",
  "/avatars/avatar-purple.png",
  "/avatars/avatar-orange.png",
  "/avatars/avatar-pink.png",
  "/avatars/avatar-teal.png",
  "/avatars/avatar-kids-1.png",
  "/avatars/avatar-kids-2.png",
]

export const AVATAR_COLORS = [
  { name: "Red", bg: "bg-red-500", color: "#ef4444" },
  { name: "Blue", bg: "bg-blue-500", color: "#3b82f6" },
  { name: "Green", bg: "bg-green-500", color: "#22c55e" },
  { name: "Yellow", bg: "bg-yellow-500", color: "#eab308" },
  { name: "Purple", bg: "bg-purple-500", color: "#a855f7" },
  { name: "Orange", bg: "bg-orange-500", color: "#f97316" },
  { name: "Pink", bg: "bg-pink-500", color: "#ec4899" },
  { name: "Teal", bg: "bg-teal-500", color: "#14b8a6" },
]

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Espanol" },
  { code: "pt", name: "Portugues" },
  { code: "fr", name: "Francais" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
]

export const MATURITY_RATINGS = [
  { value: "G", label: "All Ages", description: "Suitable for all ages" },
  { value: "PG", label: "PG", description: "Parental guidance suggested" },
  { value: "PG-13", label: "PG-13", description: "Parents strongly cautioned" },
  { value: "R", label: "R", description: "Restricted - Under 17 requires parent" },
  { value: "NC-17", label: "NC-17", description: "Adults only" },
] as const

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "local-default",
    name: "User",
    avatarUrl: "",
    isKids: false,
    maturityRating: "NC-17",
    language: "en",
    autoplayNextEpisode: true,
    autoplayPreviews: true,
    hasPin: false,
    createdAt: new Date(),
  },
]

interface ProfileContextType {
  profiles: Profile[]
  currentProfile: Profile | null
  isProfileSelected: boolean
  addProfile: (profile: Omit<Profile, "id" | "createdAt">) => void
  updateProfile: (id: string, updates: Partial<Profile>) => void
  deleteProfile: (id: string) => void
  selectProfile: (id: string) => void
  switchProfile: () => void
  verifyPin: (id: string, pin: string) => boolean
  setPin: (id: string, pin: string) => void
  removePin: (id: string) => void
  canAddMoreProfiles: boolean
  showManageProfiles: boolean
  setShowManageProfiles: (show: boolean) => void
  editingProfile: Profile | null
  setEditingProfile: (profile: Profile | null) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

function mapApiProfile(api: ApiProfile): Profile {
  return {
    id: String(api.id),
    name: api.name,
    avatarUrl: api.avatar_key,
    isKids: api.is_kids,
    maturityRating: api.maturity_rating,
    language: api.language,
    autoplayNextEpisode: api.autoplay_next_episode,
    autoplayPreviews: api.autoplay_previews,
    hasPin: api.has_pin,
    pin: api.pin,
    gameHandle: api.game_handle || undefined,
    createdAt: new Date(api.created_at),
  }
}

function notifyProfileChanged(profileId: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PROFILE_ID_STORAGE_KEY, profileId)
  window.dispatchEvent(new CustomEvent("streamflix-profile-changed", { detail: { profileId } }))
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isProfileSelected, setIsProfileSelected] = useState(false)
  const [showManageProfiles, setShowManageProfiles] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [maxProfiles, setMaxProfiles] = useState(MAX_PROFILES_FALLBACK)
  const [apiEnabled, setApiEnabled] = useState(false)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        const subscriptions = await listUserSubscriptions()
        const activeSubscription = subscriptions[0]
        if (!activeSubscription) return

        const fetchedProfiles = await listProfiles()
        const ensuredProfiles =
          fetchedProfiles.length > 0 ? fetchedProfiles : [await createProfile({ name: "User" })]

        const mappedProfiles = ensuredProfiles.map(mapApiProfile)
        if (!mounted) return

        setApiEnabled(true)
        setMaxProfiles(activeSubscription.plan.max_profiles)
        setProfiles(mappedProfiles)

        const remembered = window.localStorage.getItem(PROFILE_ID_STORAGE_KEY)
        const selected = mappedProfiles.find((profile) => profile.id === remembered) ?? mappedProfiles[0] ?? null

        setCurrentProfile(selected)
        setIsProfileSelected(Boolean(selected))
        if (selected) notifyProfileChanged(selected.id)
      } catch (error) {
        if (!mounted) return
        setApiEnabled(false)
        setProfiles(DEFAULT_PROFILES)
        if (!(error instanceof ApiAuthError)) {
          console.error("Profile bootstrap failed:", error)
        }
      }
    }

    void bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  const addProfile = useCallback(
    (profileData: Omit<Profile, "id" | "createdAt">) => {
      if (profiles.length >= maxProfiles) return

      if (!apiEnabled) {
        const localId = `local-${Date.now()}`
        setProfiles((prev) => [
          ...prev,
          {
            ...profileData,
            id: localId,
            createdAt: new Date(),
          },
        ])
        return
      }

      void (async () => {
        const created = await createProfile({
          name: profileData.name,
          is_kids: profileData.isKids,
          avatar_key: profileData.avatarUrl,
          maturity_rating: profileData.isKids ? "G" : profileData.maturityRating,
          language: profileData.language,
          autoplay_next_episode: profileData.autoplayNextEpisode,
          autoplay_previews: profileData.autoplayPreviews,
          has_pin: profileData.hasPin,
          pin: profileData.pin ?? "",
          game_handle: profileData.gameHandle ?? "",
        })
        const profile = mapApiProfile(created)
        setProfiles((prev) => [...prev, profile])
      })()
    },
    [apiEnabled, maxProfiles, profiles.length]
  )

  const updateProfile = useCallback(
    (id: string, updates: Partial<Profile>) => {
      setProfiles((prev) => prev.map((profile) => (profile.id === id ? { ...profile, ...updates } : profile)))
      if (currentProfile?.id === id) {
        setCurrentProfile((prev) => (prev ? { ...prev, ...updates } : null))
      }

      if (!apiEnabled) return
      const numericId = Number(id)
      if (Number.isNaN(numericId)) return

      void updateProfileRequest(numericId, {
        name: updates.name,
        is_kids: updates.isKids,
        avatar_key: updates.avatarUrl,
        maturity_rating: updates.maturityRating,
        language: updates.language,
        autoplay_next_episode: updates.autoplayNextEpisode,
        autoplay_previews: updates.autoplayPreviews,
        has_pin: updates.hasPin,
        pin: updates.pin ?? (updates.hasPin === false ? "" : undefined),
        game_handle: updates.gameHandle,
      })
    },
    [apiEnabled, currentProfile?.id]
  )

  const deleteProfile = useCallback(
    (id: string) => {
      if (profiles.length <= 1) return

      setProfiles((prev) => prev.filter((profile) => profile.id !== id))
      if (currentProfile?.id === id) {
        setCurrentProfile(null)
        setIsProfileSelected(false)
      }

      if (!apiEnabled) return
      const numericId = Number(id)
      if (Number.isNaN(numericId)) return
      void deleteProfileRequest(numericId)
    },
    [apiEnabled, currentProfile?.id, profiles.length]
  )

  const selectProfile = useCallback(
    (id: string) => {
      const selected = profiles.find((profile) => profile.id === id)
      if (!selected) return
      setCurrentProfile(selected)
      setIsProfileSelected(true)
      setShowManageProfiles(false)
      notifyProfileChanged(id)
    },
    [profiles]
  )

  const switchProfile = useCallback(() => {
    setCurrentProfile(null)
    setIsProfileSelected(false)
    setShowManageProfiles(false)
  }, [])

  const verifyPin = useCallback(
    (id: string, pin: string) => {
      const profile = profiles.find((candidate) => candidate.id === id)
      return profile?.pin === pin
    },
    [profiles]
  )

  const setPin = useCallback(
    (id: string, pin: string) => {
      updateProfile(id, { hasPin: true, pin })
    },
    [updateProfile]
  )

  const removePin = useCallback(
    (id: string) => {
      updateProfile(id, { hasPin: false, pin: undefined })
    },
    [updateProfile]
  )

  const canAddMoreProfiles = useMemo(() => profiles.length < maxProfiles, [maxProfiles, profiles.length])

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        isProfileSelected,
        addProfile,
        updateProfile,
        deleteProfile,
        selectProfile,
        switchProfile,
        verifyPin,
        setPin,
        removePin,
        canAddMoreProfiles,
        showManageProfiles,
        setShowManageProfiles,
        editingProfile,
        setEditingProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
