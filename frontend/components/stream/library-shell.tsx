"use client"

import { useCallback, useState, type ReactNode } from "react"
import { SiteFooter } from "./site-footer"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { ProfileProvider, useProfile } from "@/lib/profile-context"
import { VideoProvider, useVideo } from "@/lib/video-context"
import { LibraryProvider, useLibrary } from "@/lib/library-context"
import { AuthScreen } from "./auth-screen"
import { SubscriptionScreen } from "./subscription-screen"
import { ProfileSelector } from "./profile-selector"
import { ProfileEditor } from "./profile-editor"
import { Navbar } from "./navbar"
import { SearchModal } from "./search-modal"
import { MovieDetails } from "./movie-details"
import { VideoPlayer } from "./video-player"

function StreamingLibrary({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { catalog } = useLibrary()
  const { isProfileSelected, showManageProfiles, setShowManageProfiles, editingProfile, setEditingProfile } = useProfile()
  const { playingVideo, isPlayerOpen, closePlayer, updateWatchProgress } = useVideo()
  if (showManageProfiles) return <ProfileEditor profile={editingProfile} onClose={() => {
    setShowManageProfiles(false)
    setEditingProfile(null)
  }} />
  if (!isProfileSelected) return <ProfileSelector onManageProfiles={() => {}} />
  return <div className="app-shell cinema-library min-h-screen bg-background">
    <a href="#library-main" className="skip-link">Saltar al contenido</a>
    <Navbar onSearchClick={() => setSearchOpen(true)} />
    <main id="library-main" tabIndex={-1}>{children}</main>
    <SiteFooter />
    <MovieDetails videos={catalog} />
    <SearchModal videos={catalog} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    <VideoPlayer isOpen={isPlayerOpen} onClose={closePlayer} videoTitle={playingVideo?.title ?? ""}
      videoId={playingVideo?.id} videoSrc={playingVideo?.videoSrc} posterImage={playingVideo?.thumbnail}
      onProgressUpdate={(currentTime, duration) => {
        if (!playingVideo || duration <= 0) return
        updateWatchProgress(playingVideo.id, { videoId: playingVideo.id, currentTime, duration,
          progress: Math.min(100, Math.max(0, currentTime / duration * 100)), lastWatched: new Date() })
      }} />
  </div>
}

function AuthenticatedLibrary({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, sessionVersion, reloadAccount } = useAuth()
  const [readySession, setReadySession] = useState<number | null>(null)
  const onReady = useCallback(() => { setReadySession(sessionVersion); reloadAccount() }, [sessionVersion, reloadAccount])
  if (isLoading) return <div className="flex min-h-screen items-center justify-center" role="status">Preparando tu sesión…</div>
  if (!isAuthenticated) return <AuthScreen />
  if (readySession !== sessionVersion) return <SubscriptionScreen onReady={onReady} />
  return <ProfileProvider><VideoProvider><LibraryProvider><StreamingLibrary>{children}</StreamingLibrary></LibraryProvider></VideoProvider></ProfileProvider>
}
export function LibraryShell({ children }: { children: ReactNode }) {
  return <AuthProvider><AuthenticatedLibrary>{children}</AuthenticatedLibrary></AuthProvider>
}
