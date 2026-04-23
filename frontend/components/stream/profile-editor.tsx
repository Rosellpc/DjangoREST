"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Pencil, Lock, Trash2, ChevronRight, Check, X } from "lucide-react"
import {
  useProfile,
  AVATAR_COLORS,
  LANGUAGES,
  MATURITY_RATINGS,
  type Profile,
} from "@/lib/profile-context"

interface ProfileEditorProps {
  profile: Profile | null
  onClose: () => void
}

type EditorView = "main" | "avatar" | "language" | "maturity" | "pin" | "delete"

export function ProfileEditor({ profile, onClose }: ProfileEditorProps) {
  const { addProfile, updateProfile, deleteProfile, setPin, removePin, profiles } = useProfile()
  const isNewProfile = !profile

  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(0)
  const [isKids, setIsKids] = useState(false)
  const [language, setLanguage] = useState("en")
  const [maturityRating, setMaturityRating] = useState<Profile["maturityRating"]>("NC-17")
  const [autoplayNext, setAutoplayNext] = useState(true)
  const [autoplayPreviews, setAutoplayPreviews] = useState(true)
  const [gameHandle, setGameHandle] = useState("")
  const [hasPin, setHasPin] = useState(false)

  const [currentView, setCurrentView] = useState<EditorView>("main")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState("")

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      const colorIndex = profiles.indexOf(profile) % AVATAR_COLORS.length
      setSelectedColor(colorIndex)
      setIsKids(profile.isKids)
      setLanguage(profile.language)
      setMaturityRating(profile.maturityRating)
      setAutoplayNext(profile.autoplayNextEpisode)
      setAutoplayPreviews(profile.autoplayPreviews)
      setGameHandle(profile.gameHandle || "")
      setHasPin(profile.hasPin)
    }
  }, [profile, profiles])

  const handleSave = () => {
    if (!name.trim()) return

    if (isNewProfile) {
      addProfile({
        name: name.trim(),
        avatarUrl: "",
        isKids,
        maturityRating: isKids ? "G" : maturityRating,
        language,
        autoplayNextEpisode: autoplayNext,
        autoplayPreviews: autoplayPreviews,
        hasPin: false,
        gameHandle: gameHandle.trim() || undefined,
      })
    } else if (profile) {
      updateProfile(profile.id, {
        name: name.trim(),
        isKids,
        maturityRating: isKids ? "G" : maturityRating,
        language,
        autoplayNextEpisode: autoplayNext,
        autoplayPreviews: autoplayPreviews,
        gameHandle: gameHandle.trim() || undefined,
      })
    }
    onClose()
  }

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      setPinError("PIN must be 4 digits")
      return
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match")
      return
    }
    if (profile) {
      setPin(profile.id, newPin)
      setHasPin(true)
    }
    setCurrentView("main")
    setNewPin("")
    setConfirmPin("")
    setPinError("")
  }

  const handleRemovePin = () => {
    if (profile) {
      removePin(profile.id)
      setHasPin(false)
    }
    setCurrentView("main")
  }

  const handleDelete = () => {
    if (profile) {
      deleteProfile(profile.id)
    }
    onClose()
  }

  const avatarColor = AVATAR_COLORS[selectedColor]

  const renderMainView = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl md:text-4xl text-foreground">
          {isNewProfile ? "Add Profile" : "Edit Profile"}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setCurrentView("avatar")}
            className="relative group"
          >
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-md ${avatarColor.bg} flex items-center justify-center text-white text-5xl md:text-6xl font-bold`}
            >
              {isKids ? (
                <span className="text-2xl md:text-3xl">KIDS</span>
              ) : name ? (
                name.charAt(0).toUpperCase()
              ) : (
                "?"
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="w-8 h-8 text-white" />
            </div>
          </button>
          <button
            onClick={() => setCurrentView("avatar")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Change Avatar
          </button>
        </div>

        {/* Form Section */}
        <div className="flex-1 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full bg-muted/50 border border-border rounded px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter profile name"
            />
          </div>

          {/* Game Handle */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Game Handle
            </label>
            <input
              type="text"
              value={gameHandle}
              onChange={(e) => setGameHandle(e.target.value)}
              maxLength={16}
              className="w-full bg-muted/50 border border-border rounded px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your game handle (optional)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your handle is a unique name that is used in games on StreamFlix.
            </p>
          </div>

          {/* Language Setting */}
          <button
            onClick={() => setCurrentView("language")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="text-foreground text-left">Language</p>
              <p className="text-sm text-muted-foreground">
                {LANGUAGES.find((l) => l.code === language)?.name || "English"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Maturity Setting */}
          {!isKids && (
            <button
              onClick={() => setCurrentView("maturity")}
              className="w-full flex items-center justify-between p-4 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-foreground text-left">Maturity Settings</p>
                <p className="text-sm text-muted-foreground">
                  {MATURITY_RATINGS.find((r) => r.value === maturityRating)?.label || "All Maturity Ratings"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Profile Lock */}
          {!isNewProfile && !isKids && (
            <button
              onClick={() => setCurrentView("pin")}
              className="w-full flex items-center justify-between p-4 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-foreground text-left">Profile Lock</p>
                  <p className="text-sm text-muted-foreground">
                    {hasPin ? "PIN required to access this profile" : "Require a PIN to access this profile"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasPin && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    ON
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          )}

          {/* Autoplay Settings */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-medium text-foreground">Autoplay controls</h3>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">Autoplay next episode</span>
              <button
                onClick={() => setAutoplayNext(!autoplayNext)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoplayNext ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoplayNext ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">Autoplay previews</span>
              <button
                onClick={() => setAutoplayPreviews(!autoplayPreviews)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoplayPreviews ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoplayPreviews ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Kids Profile Toggle */}
          <label className="flex items-center justify-between cursor-pointer pt-4 border-t border-border">
            <div>
              <span className="text-foreground block">Kids Profile</span>
              <span className="text-sm text-muted-foreground">
                Only show content rated for children
              </span>
            </div>
            <button
              onClick={() => setIsKids(!isKids)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isKids ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isKids ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 pt-8 border-t border-border">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 px-6 py-3 bg-foreground text-background font-medium rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-muted-foreground text-muted-foreground rounded hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        {!isNewProfile && profiles.length > 1 && (
          <button
            onClick={() => setCurrentView("delete")}
            className="px-6 py-3 border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Profile
          </button>
        )}
      </div>
    </>
  )

  const renderAvatarView = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setCurrentView("main")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl text-foreground">Choose Avatar</h1>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {AVATAR_COLORS.map((color, index) => (
          <button
            key={color.name}
            onClick={() => {
              setSelectedColor(index)
              setCurrentView("main")
            }}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-md ${color.bg} flex items-center justify-center text-white text-2xl font-bold transition-all ${
              selectedColor === index
                ? "ring-4 ring-foreground scale-110"
                : "hover:scale-105"
            }`}
          >
            {name ? name.charAt(0).toUpperCase() : "?"}
          </button>
        ))}
      </div>
    </>
  )

  const renderLanguageView = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setCurrentView("main")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl text-foreground">Display Language</h1>
      </div>

      <div className="space-y-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code)
              setCurrentView("main")
            }}
            className={`w-full flex items-center justify-between p-4 rounded transition-colors ${
              language === lang.code
                ? "bg-muted"
                : "hover:bg-muted/50"
            }`}
          >
            <span className="text-foreground">{lang.name}</span>
            {language === lang.code && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>
    </>
  )

  const renderMaturityView = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setCurrentView("main")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl text-foreground">Viewing Restrictions</h1>
      </div>

      <p className="text-muted-foreground mb-6">
        Select the maturity rating for content shown on this profile.
      </p>

      <div className="space-y-2">
        {MATURITY_RATINGS.map((rating) => (
          <button
            key={rating.value}
            onClick={() => {
              setMaturityRating(rating.value)
              setCurrentView("main")
            }}
            className={`w-full flex items-center justify-between p-4 rounded transition-colors ${
              maturityRating === rating.value
                ? "bg-muted"
                : "hover:bg-muted/50"
            }`}
          >
            <div>
              <span className="text-foreground font-medium">{rating.label}</span>
              <p className="text-sm text-muted-foreground">{rating.description}</p>
            </div>
            {maturityRating === rating.value && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>
    </>
  )

  const renderPinView = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            setCurrentView("main")
            setNewPin("")
            setConfirmPin("")
            setPinError("")
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl text-foreground">Profile Lock</h1>
      </div>

      <div className="max-w-md">
        {hasPin ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded">
              <Lock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-foreground font-medium">Profile Lock is ON</p>
                <p className="text-sm text-muted-foreground">
                  A 4-digit PIN is required to access this profile
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setHasPin(false)
                  setNewPin("")
                  setConfirmPin("")
                }}
                className="flex-1 px-4 py-3 bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
              >
                Change PIN
              </button>
              <button
                onClick={handleRemovePin}
                className="flex-1 px-4 py-3 border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition-colors"
              >
                Remove PIN
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Create a 4-digit PIN to lock this profile. You will need to enter
              this PIN every time you want to access this profile.
            </p>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Enter PIN
              </label>
              <input
                type="tel"
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  setPinError("")
                }}
                className="w-full bg-muted/50 border border-border rounded px-4 py-3 text-foreground text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="----"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Confirm PIN
              </label>
              <input
                type="tel"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  setPinError("")
                }}
                className="w-full bg-muted/50 border border-border rounded px-4 py-3 text-foreground text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="----"
              />
            </div>

            {pinError && (
              <p className="text-red-500 text-sm">{pinError}</p>
            )}

            <button
              onClick={handleSetPin}
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set PIN
            </button>
          </div>
        )}
      </div>
    </>
  )

  const renderDeleteView = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setCurrentView("main")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl text-foreground">Delete Profile</h1>
      </div>

      <div className="max-w-md mx-auto text-center">
        <div
          className={`w-24 h-24 mx-auto rounded-md ${avatarColor.bg} flex items-center justify-center text-white text-4xl font-bold mb-6`}
        >
          {name ? name.charAt(0).toUpperCase() : "?"}
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">
          Delete this profile?
        </h2>
        <p className="text-muted-foreground mb-8">
          {`This will permanently delete the "${name}" profile and all of its data
          including watch history, My List, and settings. This action cannot be
          undone.`}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setCurrentView("main")}
            className="flex-1 px-4 py-3 border border-muted-foreground text-muted-foreground rounded hover:bg-muted transition-colors"
          >
            Keep Profile
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete Profile
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {currentView === "main" && renderMainView()}
        {currentView === "avatar" && renderAvatarView()}
        {currentView === "language" && renderLanguageView()}
        {currentView === "maturity" && renderMaturityView()}
        {currentView === "pin" && renderPinView()}
        {currentView === "delete" && renderDeleteView()}
      </div>
    </div>
  )
}
