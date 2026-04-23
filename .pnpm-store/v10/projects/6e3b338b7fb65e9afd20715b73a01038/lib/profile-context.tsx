"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

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
    id: "1",
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

const MAX_PROFILES = 5

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isProfileSelected, setIsProfileSelected] = useState(false)
  const [showManageProfiles, setShowManageProfiles] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

  const addProfile = useCallback((profileData: Omit<Profile, "id" | "createdAt">) => {
    if (profiles.length >= MAX_PROFILES) return

    const newProfile: Profile = {
      ...profileData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setProfiles((prev) => [...prev, newProfile])
  }, [profiles.length])

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
    if (currentProfile?.id === id) {
      setCurrentProfile((prev) => prev ? { ...prev, ...updates } : null)
    }
  }, [currentProfile?.id])

  const deleteProfile = useCallback((id: string) => {
    if (profiles.length <= 1) return
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    if (currentProfile?.id === id) {
      setCurrentProfile(null)
      setIsProfileSelected(false)
    }
  }, [profiles.length, currentProfile?.id])

  const selectProfile = useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id)
    if (profile) {
      setCurrentProfile(profile)
      setIsProfileSelected(true)
      setShowManageProfiles(false)
    }
  }, [profiles])

  const switchProfile = useCallback(() => {
    setCurrentProfile(null)
    setIsProfileSelected(false)
    setShowManageProfiles(false)
  }, [])

  const verifyPin = useCallback((id: string, pin: string) => {
    const profile = profiles.find((p) => p.id === id)
    return profile?.pin === pin
  }, [profiles])

  const setPin = useCallback((id: string, pin: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hasPin: true, pin } : p))
    )
  }, [])

  const removePin = useCallback((id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hasPin: false, pin: undefined } : p))
    )
  }, [])

  const canAddMoreProfiles = profiles.length < MAX_PROFILES

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
