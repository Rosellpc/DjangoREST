"use client"

import { useEffect, useMemo, useState } from "react"
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
  const { isPlayerOpen, playingVideo, closePlayer } = useVideo()

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      try {
        setCatalogLoading(true)
        const movies = await fetchCatalog()
        if (!mounted) return
        setCatalog(movies.map(toStreamVideo))
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
  }, [])

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
  const continueWatching = useMemo(
    () =>
      catalog.slice(0, 6).map((video, index) => ({
        ...video,
        progress: 20 + index * 12,
        episodeInfo: index % 2 === 0 ? `S1:E${index + 1}` : undefined,
      })),
    [catalog]
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
    <main className="min-h-screen bg-background">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} onMyListClick={() => setIsMyListOpen(true)} />

      <HeroBanner
        title={featuredContent.title}
        description={featuredContent.description}
        backgroundImage={featuredContent.backgroundImage}
        previewVideoSrc={featuredContent.previewVideoSrc}
      />

      <div className="-mt-32 relative z-10 space-y-2">
        <ContinueWatchingRow videos={continueWatching} />
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
        videoSrc={playingVideo?.videoSrc}
        posterImage={playingVideo?.thumbnail}
      />
    </main>
  )
}

export default function Home() {
  return (
    <ProfileProvider>
      <VideoProvider>
        <StreamingApp />
      </VideoProvider>
    </ProfileProvider>
  )
}
