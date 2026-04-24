"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import {
  ApiAuthError,
  createMyListItem,
  createWatchHistoryItem,
  deleteMyListItem,
  listMyListItems,
  listWatchHistory,
  updateWatchHistoryItem,
} from "@/lib/subscriptions-api"
import { getPosterByIndex, getVideoByIndex } from "@/lib/local-media"

export interface Video {
  id: string
  title: string
  thumbnail: string
  match?: number
  year?: string
  duration?: string
  rating?: string
  genres?: string[]
  description?: string
  type?: "movie" | "series"
  seasons?: number
  episodes?: Episode[]
  cast?: CastMember[]
  videoSrc?: string
}

export interface Episode {
  id: string
  number: number
  season: number
  title: string
  duration: string
  description: string
  thumbnail: string
}

export interface CastMember {
  id: string
  name: string
  role: string
  image: string
}

export interface WatchProgress {
  videoId: string
  progress: number
  currentTime: number
  duration: number
  lastWatched: Date
}

const PROFILE_ID_STORAGE_KEY = "streamflix_profile_id"

interface VideoContextType {
  myList: Video[]
  addToMyList: (video: Video) => void
  removeFromMyList: (videoId: string) => void
  isInMyList: (videoId: string) => boolean
  selectedVideo: Video | null
  openVideoModal: (video: Video) => void
  closeVideoModal: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  likedVideos: Set<string>
  dislikedVideos: Set<string>
  toggleLike: (videoId: string) => void
  toggleDislike: (videoId: string) => void
  isLiked: (videoId: string) => boolean
  isDisliked: (videoId: string) => boolean
  isPlayerOpen: boolean
  playingVideo: Video | null
  openPlayer: (video: Video) => void
  closePlayer: () => void
  watchProgress: Map<string, WatchProgress>
  updateWatchProgress: (videoId: string, progress: WatchProgress) => void
  getWatchProgress: (videoId: string) => WatchProgress | undefined
  continueWatching: Video[]
  registerCatalogVideos: (videos: Video[]) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

function profileIdFromStorage(): number | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(PROFILE_ID_STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

function toVideoFromFilmId(filmId: number, cached?: Video): Video {
  if (cached) return cached
  return {
    id: String(filmId),
    title: `Title #${filmId}`,
    thumbnail: getPosterByIndex(filmId),
    videoSrc: getVideoByIndex(filmId),
    match: 80 + (filmId % 20),
    year: "N/A",
    duration: "N/A",
    rating: "NR",
    genres: ["Catalog"],
    description: "No description available.",
  }
}

export function VideoProvider({ children }: { children: ReactNode }) {
  const [myList, setMyList] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set())
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null)
  const [watchProgress, setWatchProgress] = useState<Map<string, WatchProgress>>(new Map())
  const [continueWatching, setContinueWatching] = useState<Video[]>([])
  const [catalogById, setCatalogById] = useState<Map<string, Video>>(new Map())
  const [myListItemIds, setMyListItemIds] = useState<Map<string, number>>(new Map())
  const [historyItemIds, setHistoryItemIds] = useState<Map<string, number>>(new Map())
  const [apiEnabled, setApiEnabled] = useState(false)
  const [activeProfileId, setActiveProfileId] = useState<number | null>(() => profileIdFromStorage())

  const loadRemoteState = useCallback(
    async (profileId: number) => {
      try {
        const [remoteList, remoteHistory] = await Promise.all([listMyListItems(), listWatchHistory()])
        setApiEnabled(true)

        const nextListIds = new Map<string, number>()
        const nextMyList = remoteList
          .filter((item) => item.profile === profileId)
          .map((item) => {
            const videoId = String(item.film_id)
            nextListIds.set(videoId, item.id)
            return toVideoFromFilmId(item.film_id, catalogById.get(videoId))
          })

        const nextHistoryIds = new Map<string, number>()
        const nextWatchProgress = new Map<string, WatchProgress>()
        const nextContinueWatching: Video[] = []

        remoteHistory
          .filter((item) => item.profile === profileId)
          .forEach((item) => {
            const videoId = String(item.film_id)
            nextHistoryIds.set(videoId, item.id)
            const durationGuess = Math.max(item.progress_seconds * 1.4, 120)
            const progressPercent = item.completed
              ? 100
              : Math.min(95, Math.max(5, (item.progress_seconds / durationGuess) * 100))
            nextWatchProgress.set(videoId, {
              videoId,
              currentTime: item.progress_seconds,
              duration: durationGuess,
              progress: progressPercent,
              lastWatched: new Date(item.last_watched_at),
            })

            if (!item.completed && progressPercent >= 5) {
              nextContinueWatching.push(toVideoFromFilmId(item.film_id, catalogById.get(videoId)))
            }
          })

        setMyList(nextMyList)
        setMyListItemIds(nextListIds)
        setWatchProgress(nextWatchProgress)
        setHistoryItemIds(nextHistoryIds)
        setContinueWatching(nextContinueWatching)
      } catch (error) {
        if (error instanceof ApiAuthError) {
          setApiEnabled(false)
        }
      }
    },
    [catalogById]
  )

  useEffect(() => {
    if (activeProfileId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadRemoteState(activeProfileId)
    }

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ profileId?: string }>
      const rawId = customEvent.detail?.profileId
      const parsed = Number(rawId)
      const nextId = Number.isNaN(parsed) ? profileIdFromStorage() : parsed
      setActiveProfileId(nextId)
      if (nextId) {
        void loadRemoteState(nextId)
      }
    }

    window.addEventListener("streamflix-profile-changed", handler as EventListener)
    return () => window.removeEventListener("streamflix-profile-changed", handler as EventListener)
  }, [activeProfileId, loadRemoteState])

  const registerCatalogVideos = useCallback((videos: Video[]) => {
    setCatalogById((prev) => {
      const next = new Map(prev)
      videos.forEach((video) => next.set(video.id, video))
      return next
    })

    setMyList((prev) => prev.map((video) => videos.find((candidate) => candidate.id === video.id) ?? video))
    setContinueWatching((prev) =>
      prev.map((video) => videos.find((candidate) => candidate.id === video.id) ?? video)
    )
  }, [])

  const addToMyList = useCallback(
    (video: Video) => {
      setMyList((prev) => {
        if (prev.some((item) => item.id === video.id)) return prev
        return [...prev, video]
      })

      if (!apiEnabled || !activeProfileId) return
      const filmId = Number(video.id)
      if (Number.isNaN(filmId)) return

      void (async () => {
        try {
          const created = await createMyListItem(activeProfileId, filmId)
          setMyListItemIds((prev) => {
            const next = new Map(prev)
            next.set(video.id, created.id)
            return next
          })
        } catch {
          // Keep optimistic UI state.
        }
      })()
    },
    [activeProfileId, apiEnabled]
  )

  const removeFromMyList = useCallback(
    (videoId: string) => {
      setMyList((prev) => prev.filter((video) => video.id !== videoId))

      if (!apiEnabled) return
      const itemId = myListItemIds.get(videoId)
      if (!itemId) return

      void (async () => {
        try {
          await deleteMyListItem(itemId)
          setMyListItemIds((prev) => {
            const next = new Map(prev)
            next.delete(videoId)
            return next
          })
        } catch {
          // Keep optimistic UI state.
        }
      })()
    },
    [apiEnabled, myListItemIds]
  )

  const isInMyList = useCallback((videoId: string) => myList.some((video) => video.id === videoId), [myList])

  const openVideoModal = useCallback((video: Video) => setSelectedVideo(video), [])
  const closeVideoModal = useCallback(() => setSelectedVideo(null), [])

  const toggleLike = useCallback((videoId: string) => {
    setLikedVideos((prev) => {
      const next = new Set(prev)
      if (next.has(videoId)) {
        next.delete(videoId)
      } else {
        next.add(videoId)
        setDislikedVideos((disliked) => {
          const cleaned = new Set(disliked)
          cleaned.delete(videoId)
          return cleaned
        })
      }
      return next
    })
  }, [])

  const toggleDislike = useCallback((videoId: string) => {
    setDislikedVideos((prev) => {
      const next = new Set(prev)
      if (next.has(videoId)) {
        next.delete(videoId)
      } else {
        next.add(videoId)
        setLikedVideos((liked) => {
          const cleaned = new Set(liked)
          cleaned.delete(videoId)
          return cleaned
        })
      }
      return next
    })
  }, [])

  const isLiked = useCallback((videoId: string) => likedVideos.has(videoId), [likedVideos])
  const isDisliked = useCallback((videoId: string) => dislikedVideos.has(videoId), [dislikedVideos])

  const openPlayer = useCallback((video: Video) => {
    setPlayingVideo(video)
    setIsPlayerOpen(true)
    setSelectedVideo(null)
  }, [])

  const closePlayer = useCallback(() => {
    setIsPlayerOpen(false)
    setPlayingVideo(null)
  }, [])

  const updateWatchProgress = useCallback(
    (videoId: string, progress: WatchProgress) => {
      setWatchProgress((prev) => {
        const next = new Map(prev)
        next.set(videoId, progress)
        return next
      })

      const sourceVideo =
        catalogById.get(videoId) ??
        myList.find((video) => video.id === videoId) ??
        continueWatching.find((video) => video.id === videoId) ??
        toVideoFromFilmId(Number(videoId))

      setContinueWatching((prev) => {
        if (progress.progress >= 95) {
          return prev.filter((video) => video.id !== videoId)
        }
        if (progress.progress < 5) return prev
        const existing = prev.filter((video) => video.id !== videoId)
        return [sourceVideo, ...existing]
      })

      if (!apiEnabled || !activeProfileId) return
      const filmId = Number(videoId)
      if (Number.isNaN(filmId)) return

      const payload = {
        progress_seconds: Math.round(progress.currentTime),
        completed: progress.progress >= 95,
        last_watched_at: progress.lastWatched.toISOString(),
      }

      void (async () => {
        try {
          const existingHistoryId = historyItemIds.get(videoId)
          if (existingHistoryId) {
            await updateWatchHistoryItem(existingHistoryId, payload)
            return
          }

          const created = await createWatchHistoryItem({
            profile: activeProfileId,
            film_id: filmId,
            ...payload,
          })
          setHistoryItemIds((prev) => {
            const next = new Map(prev)
            next.set(videoId, created.id)
            return next
          })
        } catch {
          // Keep optimistic UI state.
        }
      })()
    },
    [activeProfileId, apiEnabled, catalogById, continueWatching, historyItemIds, myList]
  )

  const getWatchProgress = useCallback((videoId: string) => watchProgress.get(videoId), [watchProgress])

  const value = useMemo<VideoContextType>(
    () => ({
      myList,
      addToMyList,
      removeFromMyList,
      isInMyList,
      selectedVideo,
      openVideoModal,
      closeVideoModal,
      searchQuery,
      setSearchQuery,
      likedVideos,
      dislikedVideos,
      toggleLike,
      toggleDislike,
      isLiked,
      isDisliked,
      isPlayerOpen,
      playingVideo,
      openPlayer,
      closePlayer,
      watchProgress,
      updateWatchProgress,
      getWatchProgress,
      continueWatching,
      registerCatalogVideos,
    }),
    [
      myList,
      addToMyList,
      removeFromMyList,
      isInMyList,
      selectedVideo,
      openVideoModal,
      closeVideoModal,
      searchQuery,
      likedVideos,
      dislikedVideos,
      toggleLike,
      toggleDislike,
      isLiked,
      isDisliked,
      isPlayerOpen,
      playingVideo,
      openPlayer,
      closePlayer,
      watchProgress,
      updateWatchProgress,
      getWatchProgress,
      continueWatching,
      registerCatalogVideos,
    ]
  )

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider")
  }
  return context
}
