"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Bell, ChevronDown, User, Settings, HelpCircle, LogOut, Pencil, House, Bookmark, CircleUserRound } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useVideo } from "@/lib/video-context"
import { useProfile, AVATAR_COLORS } from "@/lib/profile-context"

interface NavbarProps {
  onSearchClick: () => void
  onMyListClick: () => void
}

export function Navbar({ onSearchClick, onMyListClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { signOut } = useAuth()
  const { myList } = useVideo()
  const { 
    profiles, 
    currentProfile, 
    switchProfile, 
    selectProfile,
    setShowManageProfiles,
    setEditingProfile 
  } = useProfile()
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const notifications = [
    { id: 1, title: "New Release", message: "The Last Frontier is now available", time: "2h ago" },
    { id: 2, title: "Continue Watching", message: "Continue watching Dark Horizons", time: "1d ago" },
    { id: 3, title: "Recommended", message: "Based on your watching: Neon Streets", time: "3d ago" },
  ]

  const getAvatarColor = (profileId: string) => {
    const index = profiles.findIndex(p => p.id === profileId)
    return AVATAR_COLORS[index % AVATAR_COLORS.length]
  }

  const otherProfiles = profiles.filter(p => p.id !== currentProfile?.id)

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-12 py-4 transition-colors duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="text-primary font-bold text-2xl tracking-tight">
          STREAMFLIX
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-foreground text-sm font-medium hover:text-muted-foreground transition-colors">
            Home
          </Link>
          <Link href="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            TV Shows
          </Link>
          <Link href="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            Movies
          </Link>
          <Link href="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            New & Popular
          </Link>
          <button
            onClick={onMyListClick}
            className="text-muted-foreground text-sm hover:text-foreground transition-colors flex items-center gap-1"
          >
            My List
            {myList.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {myList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="hidden md:inline-flex text-foreground hover:text-muted-foreground transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-foreground hover:text-muted-foreground transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className="w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {currentProfile && (
              currentProfile.avatarUrl ? (
                <img src={currentProfile.avatarUrl} alt={currentProfile.name} className="h-8 w-8 rounded object-cover" />
              ) : (
                <div
                  className={`w-8 h-8 rounded ${getAvatarColor(currentProfile.id).bg} flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {currentProfile.isKids ? "K" : currentProfile.name.charAt(0).toUpperCase()}
                </div>
              )
            )}
            <ChevronDown
              className={`w-4 h-4 text-foreground transition-transform duration-200 ${
                showProfileMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Other Profiles */}
              {otherProfiles.length > 0 && (
                <div className="py-2 border-b border-border">
                  {otherProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        selectProfile(profile.id)
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded ${getAvatarColor(profile.id).bg} flex items-center justify-center text-white text-sm font-medium`}
                      >
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.name} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          profile.isKids ? "K" : profile.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm">{profile.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Profile Management */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setEditingProfile(null)
                    setShowManageProfiles(true)
                    setShowProfileMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                  Manage Profiles
                </button>
                <button
                  onClick={switchProfile}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Switch Profile
                </button>
              </div>

              {/* Current Profile Info */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-3 mb-2">
                  {currentProfile && (
                    <div
                      className={`w-6 h-6 rounded ${getAvatarColor(currentProfile.id).bg} flex items-center justify-center text-white text-xs font-medium`}
                    >
                      {currentProfile.avatarUrl ? (
                        <img src={currentProfile.avatarUrl} alt={currentProfile.name} className="h-6 w-6 rounded object-cover" />
                      ) : (
                        currentProfile.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{currentProfile?.name}</p>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="py-1 border-t border-border">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Account Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Help Center
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    void signOut()
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3 text-primary"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of StreamFlix
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
    <nav className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
        <button className="flex flex-col items-center gap-1 rounded-xl bg-muted/40 px-2 py-2 text-xs text-foreground">
          <House className="h-4 w-4" />
          Inicio
        </button>
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          Buscar
        </button>
        <button
          onClick={onMyListClick}
          className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
        >
          <Bookmark className="h-4 w-4" />
          Mi lista
        </button>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
        >
          <CircleUserRound className="h-4 w-4" />
          Perfil
        </button>
      </div>
    </nav>
    </>
  )
}
