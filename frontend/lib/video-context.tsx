"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

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
  progress: number // 0-100
  currentTime: number // seconds
  duration: number // seconds
  lastWatched: Date
}

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
  // Video player state
  isPlayerOpen: boolean
  playingVideo: Video | null
  openPlayer: (video: Video) => void
  closePlayer: () => void
  // Watch history/progress
  watchProgress: Map<string, WatchProgress>
  updateWatchProgress: (videoId: string, progress: WatchProgress) => void
  getWatchProgress: (videoId: string) => WatchProgress | undefined
  continueWatching: Video[]
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

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

  const addToMyList = useCallback((video: Video) => {
    setMyList((prev) => {
      if (prev.find((v) => v.id === video.id)) return prev
      return [...prev, video]
    })
  }, [])

  const removeFromMyList = useCallback((videoId: string) => {
    setMyList((prev) => prev.filter((v) => v.id !== videoId))
  }, [])

  const isInMyList = useCallback(
    (videoId: string) => myList.some((v) => v.id === videoId),
    [myList]
  )

  const openVideoModal = useCallback((video: Video) => {
    setSelectedVideo(video)
  }, [])

  const closeVideoModal = useCallback(() => {
    setSelectedVideo(null)
  }, [])

  const toggleLike = useCallback((videoId: string) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
        // Remove from disliked if present
        setDislikedVideos((d) => {
          const newD = new Set(d)
          newD.delete(videoId)
          return newD
        })
      }
      return newSet
    })
  }, [])

  const toggleDislike = useCallback((videoId: string) => {
    setDislikedVideos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
        // Remove from liked if present
        setLikedVideos((l) => {
          const newL = new Set(l)
          newL.delete(videoId)
          return newL
        })
      }
      return newSet
    })
  }, [])

  const isLiked = useCallback(
    (videoId: string) => likedVideos.has(videoId),
    [likedVideos]
  )

  const isDisliked = useCallback(
    (videoId: string) => dislikedVideos.has(videoId),
    [dislikedVideos]
  )

  // Video player functions
  const openPlayer = useCallback((video: Video) => {
    setPlayingVideo(video)
    setIsPlayerOpen(true)
    setSelectedVideo(null) // Close modal when opening player
  }, [])

  const closePlayer = useCallback(() => {
    setIsPlayerOpen(false)
    setPlayingVideo(null)
  }, [])

  // Watch progress functions
  const updateWatchProgress = useCallback((videoId: string, progress: WatchProgress) => {
    setWatchProgress((prev) => {
      const newMap = new Map(prev)
      newMap.set(videoId, progress)
      return newMap
    })
    
    // Update continue watching list
    setContinueWatching((prev) => {
      // Only add if progress is between 5% and 95%
      if (progress.progress >= 5 && progress.progress < 95) {
        const existingIndex = prev.findIndex((v) => v.id === videoId)
        if (existingIndex === -1) {
          // Need to find the video from somewhere - will be set by the caller
          return prev
        }
        // Move to front
        const video = prev[existingIndex]
        const newList = prev.filter((v) => v.id !== videoId)
        return [video, ...newList]
      } else if (progress.progress >= 95) {
        // Remove from continue watching when finished
        return prev.filter((v) => v.id !== videoId)
      }
      return prev
    })
  }, [])

  const getWatchProgress = useCallback(
    (videoId: string) => watchProgress.get(videoId),
    [watchProgress]
  )

  return (
    <VideoContext.Provider
      value={{
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
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider")
  }
  return context
}
