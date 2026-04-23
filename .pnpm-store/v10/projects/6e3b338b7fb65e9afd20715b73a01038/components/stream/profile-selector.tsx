"use client"

import { useState } from "react"
import { Plus, Pencil, Lock } from "lucide-react"
import { useProfile, AVATAR_COLORS, type Profile } from "@/lib/profile-context"

interface ProfileSelectorProps {
  onManageProfiles: () => void
}

export function ProfileSelector({ onManageProfiles }: ProfileSelectorProps) {
  const { profiles, selectProfile, canAddMoreProfiles, setEditingProfile, setShowManageProfiles } = useProfile()
  const [isManaging, setIsManaging] = useState(false)
  const [pinModal, setPinModal] = useState<{ profile: Profile } | null>(null)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState(false)

  const handleProfileClick = (profile: Profile) => {
    if (isManaging) {
      setEditingProfile(profile)
      setShowManageProfiles(true)
    } else if (profile.hasPin) {
      setPinModal({ profile })
      setPinInput("")
      setPinError(false)
    } else {
      selectProfile(profile.id)
    }
  }

  const handlePinSubmit = () => {
    if (pinModal && pinInput === pinModal.profile.pin) {
      selectProfile(pinModal.profile.id)
      setPinModal(null)
    } else {
      setPinError(true)
      setPinInput("")
    }
  }

  const handleAddProfile = () => {
    setEditingProfile(null)
    setShowManageProfiles(true)
  }

  const getAvatarColor = (index: number) => {
    return AVATAR_COLORS[index % AVATAR_COLORS.length]
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-5xl text-foreground mb-2">{"Who's watching?"}</h1>
      <p className="text-muted-foreground mb-12 text-center">
        Select your profile to continue
      </p>

      <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl">
        {profiles.map((profile, index) => {
          const avatarColor = getAvatarColor(index)
          return (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              className="group flex flex-col items-center gap-3 focus:outline-none"
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 md:w-32 md:h-32 rounded-md ${avatarColor.bg} flex items-center justify-center text-white text-4xl md:text-5xl font-bold transition-all duration-200 group-hover:ring-4 group-hover:ring-foreground group-focus:ring-4 group-focus:ring-foreground ${
                    isManaging ? "opacity-50" : ""
                  }`}
                >
                  {profile.isKids ? (
                    <span className="text-2xl md:text-3xl">KIDS</span>
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isManaging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                    <Pencil className="w-8 h-8 text-white" />
                  </div>
                )}
                {profile.hasPin && !isManaging && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-foreground" />
                  </div>
                )}
              </div>
              <span
                className={`text-muted-foreground group-hover:text-foreground transition-colors text-sm md:text-base ${
                  isManaging ? "opacity-50" : ""
                }`}
              >
                {profile.name}
              </span>
            </button>
          )
        })}

        {canAddMoreProfiles && (
          <button
            onClick={handleAddProfile}
            className="group flex flex-col items-center gap-3 focus:outline-none"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-md border-2 border-muted-foreground/40 flex items-center justify-center text-muted-foreground transition-all duration-200 group-hover:border-foreground group-hover:text-foreground group-focus:border-foreground group-focus:text-foreground">
              <Plus className="w-12 h-12 md:w-16 md:h-16" />
            </div>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm md:text-base">
              Add Profile
            </span>
          </button>
        )}
      </div>

      <button
        onClick={() => setIsManaging(!isManaging)}
        className={`mt-12 px-6 py-2 border rounded text-sm tracking-wider transition-colors ${
          isManaging
            ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
            : "border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground"
        }`}
      >
        {isManaging ? "DONE" : "MANAGE PROFILES"}
      </button>

      {/* PIN Entry Modal */}
      {pinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-card p-8 rounded-lg max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center mb-6">
              <div
                className={`w-16 h-16 rounded-md ${getAvatarColor(profiles.indexOf(pinModal.profile)).bg} flex items-center justify-center text-white text-2xl font-bold mb-3`}
              >
                {pinModal.profile.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Profile Lock is ON
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Enter your PIN to access this profile
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-14 border-2 rounded flex items-center justify-center text-2xl font-bold ${
                      pinError
                        ? "border-red-500"
                        : pinInput[i]
                          ? "border-foreground"
                          : "border-muted"
                    }`}
                  >
                    {pinInput[i] ? "*" : ""}
                  </div>
                ))}
              </div>

              {pinError && (
                <p className="text-red-500 text-sm text-center">
                  Incorrect PIN. Please try again.
                </p>
              )}

              <input
                type="tel"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setPinInput(value)
                  setPinError(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pinInput.length === 4) {
                    handlePinSubmit()
                  }
                }}
                className="w-full bg-muted/50 border border-border rounded px-4 py-3 text-center text-lg tracking-[1em] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="----"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setPinModal(null)}
                  className="flex-1 px-4 py-2 border border-muted-foreground text-muted-foreground rounded hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 4}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>

              <button className="w-full text-sm text-muted-foreground hover:text-foreground">
                Forgot PIN?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
