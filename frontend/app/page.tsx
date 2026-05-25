"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Navbar } from "@/components/stream/navbar"
import { HeroBanner } from "@/components/stream/hero-banner"
import { VideoRow } from "@/components/stream/video-row"
import { Top10Row } from "@/components/stream/top10-row"
import { ContinueWatchingRow } from "@/components/stream/continue-watching-row"
import { VideoModal } from "@/components/stream/video-modal"
import { VideoPlayer } from "@/components/stream/video-player"
import { SearchModal } from "@/components/stream/search-modal"
import { MyListModal } from "@/components/stream/my-list-modal"
import { ProfileSelector } from "@/components/stream/profile-selector"
import { ProfileEditor } from "@/components/stream/profile-editor"
import { AuthScreen } from "@/components/stream/auth-screen"
import { SubscriptionScreen } from "@/components/stream/subscription-screen"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { VideoProvider, useVideo } from "@/lib/video-context"
import { ProfileProvider, useProfile } from "@/lib/profile-context"
import { fetchCatalog, toStreamVideo, type StreamVideo } from "@/lib/catalog-api"
import { getPosterByIndex, getVideoByIndex } from "@/lib/local-media"

function StreamingApp() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMyListOpen, setIsMyListOpen] = useState(false)
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
    openVideoModal,
    registerCatalogVideos,
    updateWatchProgress,
    getWatchProgress,
  } = useVideo()

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      try {
        setCatalogLoading(true)
        const movies = await fetchCatalog()
        if (!mounted) return
        const streamVideos = movies.map(toStreamVideo)
        setCatalog(streamVideos)
        registerCatalogVideos(streamVideos)
        setCatalogError(null)
      } catch {
        if (!mounted) return
        setCatalog([])
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

  const top10Today = useMemo(() => catalog.slice(0, 10), [catalog])
  const trendingNow = useMemo(() => catalog.slice(0, 12), [catalog])
  const topRated = useMemo(() => catalog.slice(12, 24), [catalog])
  const newReleases = useMemo(() => catalog.slice(24, 36), [catalog])
  const actionMovies = useMemo(() => catalog.slice(36, 48), [catalog])
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
  const feedHighlights = useMemo(() => catalog.slice(0, 8), [catalog])

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
    <main className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} onMyListClick={() => setIsMyListOpen(true)} />

      <HeroBanner
        title={featuredContent.title}
        description={featuredContent.description}
        backgroundImage={featuredContent.backgroundImage}
        previewVideoSrc={featuredContent.previewVideoSrc}
      />

      <div className="-mt-32 relative z-10 space-y-4">
        <section className="px-4 md:px-12">
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 md:p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">For You</p>
                <h2 className="mt-1 text-xl font-semibold">Tu feed de hoy</h2>
              </div>
              <button
                onClick={() => setIsMyListOpen(true)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              >
                Ver mi lista
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {feedHighlights.map((video) => (
                <button
                  key={`feed-${video.id}`}
                  onClick={() => openVideoModal(video)}
                  className="group text-left"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70" />
                    <p className="absolute bottom-2 left-2 line-clamp-1 text-xs font-semibold">{video.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
        <ContinueWatchingRow videos={continueWatchingWithProgress} />
        <Top10Row title="Top 10 Movies" videos={top10Today} />
        <VideoRow title="Trending Now" videos={trendingNow} />
        <VideoRow title="Top Rated" videos={topRated.length > 0 ? topRated : trendingNow} />
        <VideoRow title="New Releases" videos={newReleases.length > 0 ? newReleases : trendingNow} />
        <VideoRow title="Action Movies" videos={actionMovies.length > 0 ? actionMovies : trendingNow} />
      </div>

      {(catalogLoading || catalogError) && (
        <div className="px-4 md:px-12 py-4">
          {catalogLoading && <p className="text-sm text-muted-foreground">Loading catalog from API...</p>}
          {catalogError && <p className="text-sm text-destructive">{catalogError}</p>}
        </div>
      )}

      <footer className="py-12 px-4 md:px-12 border-t border-border mt-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground text-sm mb-6">Questions? Contact us.</p>
          <p className="text-muted-foreground text-xs mt-8">StreamFlix Demo</p>
        </div>
      </footer>

      <VideoModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MyListModal isOpen={isMyListOpen} onClose={() => setIsMyListOpen(false)} />

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
  const { isAuthenticated, isLoading, sessionVersion } = useAuth()
  const [subscriptionReadyForSession, setSubscriptionReadyForSession] = useState<number | null>(null)
  const subscriptionReady = subscriptionReadyForSession === sessionVersion
  const handleSubscriptionReady = useCallback(
    () => setSubscriptionReadyForSession(sessionVersion),
    [sessionVersion]
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
