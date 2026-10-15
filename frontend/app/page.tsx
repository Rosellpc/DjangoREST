"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/stream/navbar"
import { HeroBanner } from "@/components/stream/hero-banner"
import { VideoRow } from "@/components/stream/video-row"
import { ContinueWatchingRow } from "@/components/stream/continue-watching-row"
import { MovieDetails } from "@/components/stream/movie-details"
import { VideoPlayer } from "@/components/stream/video-player"
import { SearchModal } from "@/components/stream/search-modal"
import { ProfileSelector } from "@/components/stream/profile-selector"
import { ProfileEditor } from "@/components/stream/profile-editor"
import { AuthScreen } from "@/components/stream/auth-screen"
import { SubscriptionScreen } from "@/components/stream/subscription-screen"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { VideoProvider, useVideo } from "@/lib/video-context"
import { ProfileProvider, useProfile } from "@/lib/profile-context"
import { fetchCatalog, toStreamVideo, type StreamVideo } from "@/lib/catalog-api"
import { getPosterByIndex, getVideoByIndex } from "@/lib/local-media"
import { SiteFooter } from "@/components/stream/site-footer"

function StreamingApp() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [catalog, setCatalog] = useState<StreamVideo[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  const { isProfileSelected, showManageProfiles, setShowManageProfiles, editingProfile, setEditingProfile } =
    useProfile()
  const {
    isPlayerOpen,
    playingVideo,
    closePlayer,
    continueWatching,
    registerCatalogVideos,
    updateWatchProgress,
    getWatchProgress,
  } = useVideo()

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      try {
        setCatalogLoading(true)
        const movies = await fetchCatalog((partial) => {
          if (!mounted) return
          const videos = partial.map(toStreamVideo)
          setCatalog(videos)
          registerCatalogVideos(videos)
        })
        if (!mounted) return
        const streamVideos = movies.map(toStreamVideo)
        setCatalog(streamVideos)
        registerCatalogVideos(streamVideos)
        setCatalogError(null)
      } catch {
        if (!mounted) return
        setCatalogError("We could not load the catalog from the backend API.")
      } finally {
        if (mounted) {
          setCatalogLoading(false)
        }
      }
    }

    void loadCatalog()
    return () => {
      mounted = false
    }
  }, [registerCatalogVideos])

  const featuredContent = useMemo(() => {
    if (catalog.length === 0) {
      return {
        title: "StreamFlix",
        description: "Loading catalog...",
        backgroundImage: getPosterByIndex(0),
        previewVideoSrc: getVideoByIndex(0),
      }
    }

    const featured = catalog[0]
    return {
      title: featured.title,
      description: featured.description,
      backgroundImage: featured.thumbnail,
      previewVideoSrc: featured.videoSrc,
    }
  }, [catalog])

  const discover = useMemo(() => catalog.slice(1, 13), [catalog])
  const movieNight = useMemo(() => catalog.slice(13, 25), [catalog])
  const shortMovies = useMemo(() => catalog.filter((movie) => Number.parseInt(movie.duration, 10) < 90).slice(0, 12), [catalog])
  const continueWatchingWithProgress = useMemo(
    () =>
      continueWatching
        .map((video) => {
          const progress = getWatchProgress(video.id)
          if (!progress) return null
          return {
            ...video,
            progress: progress.progress,
          }
        })
        .filter((video): video is NonNullable<typeof video> => Boolean(video)),
    [continueWatching, getWatchProgress]
  )

  if (!isProfileSelected && !showManageProfiles) {
    return <ProfileSelector onManageProfiles={() => setShowManageProfiles(true)} />
  }

  if (showManageProfiles) {
    return (
      <ProfileEditor
        profile={editingProfile}
        onClose={() => {
          setShowManageProfiles(false)
          setEditingProfile(null)
        }}
      />
    )
  }

  return (
    <main className="app-shell min-h-screen bg-background">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />

      <HeroBanner
        video={catalog[0]}
        title={featuredContent.title}
        description={featuredContent.description}
        backgroundImage={featuredContent.backgroundImage}
        previewVideoSrc={featuredContent.previewVideoSrc}
      />

      <div className="home-shelves">
        <div className="library-container flex flex-wrap items-end justify-between gap-4">
          <div><p className="cinema-eyebrow text-muted-foreground">Tu espacio de cine</p><h2 className="mt-2 text-xl font-semibold sm:text-2xl">?Qu? quieres ver hoy?</h2></div>
          <Link href="/movies" className="text-xs text-muted-foreground hover:text-foreground">Explorar todas las pel?culas ?</Link>
        </div>
        <ContinueWatchingRow videos={continueWatchingWithProgress} />
        <VideoRow title="Para descubrir" videos={discover} />
        <VideoRow title="Una noche de cine" videos={movieNight} />
        <VideoRow title="Menos de 90 minutos" videos={shortMovies} />
      </div>

      {(catalogLoading || catalogError) && (
        <div className="px-4 md:px-12 py-4">
          {catalogLoading && <p className="text-sm text-muted-foreground">Loading catalog from API...</p>}
          {catalogError && <p className="text-sm text-destructive">{catalogError}</p>}
        </div>
      )}

      <SiteFooter />

      <MovieDetails videos={catalog} />
      <SearchModal videos={catalog} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <VideoPlayer
        isOpen={isPlayerOpen}
        onClose={closePlayer}
        videoTitle={playingVideo?.title || ""}
        videoId={playingVideo?.id}
        videoSrc={playingVideo?.videoSrc}
        posterImage={playingVideo?.thumbnail}
        onProgressUpdate={(currentTime, duration) => {
          if (!playingVideo || duration <= 0) return
          const progress = Math.min(100, Math.max(0, (currentTime / duration) * 100))
          updateWatchProgress(playingVideo.id, {
            videoId: playingVideo.id,
            currentTime,
            duration,
            progress,
            lastWatched: new Date(),
          })
        }}
      />
    </main>
  )
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, sessionVersion, reloadAccount } = useAuth()
  const [subscriptionReadyForSession, setSubscriptionReadyForSession] = useState<number | null>(null)
  const subscriptionReady = subscriptionReadyForSession === sessionVersion
  const handleSubscriptionReady = useCallback(
    () => { setSubscriptionReadyForSession(sessionVersion); reloadAccount() },
    [sessionVersion, reloadAccount]
  )

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading session...
      </main>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  if (!subscriptionReady) {
    return <SubscriptionScreen onReady={handleSubscriptionReady} />
  }

  return (
    <ProfileProvider>
      <VideoProvider>
        <StreamingApp />
      </VideoProvider>
    </ProfileProvider>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
