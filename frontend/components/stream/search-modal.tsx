"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import Image from "next/image"
import { useVideo } from "@/lib/video-context"
import { trendingNow, topRated, newReleases, actionMovies } from "@/lib/video-data"
import { getPosterByIndex, getVideoByIndex } from "@/lib/local-media"

const allVideos = [...trendingNow, ...topRated, ...newReleases, ...actionMovies].map((video, index) => ({
  ...video,
  thumbnail: getPosterByIndex(index),
  videoSrc: getVideoByIndex(index),
}))

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { searchQuery, setSearchQuery, openVideoModal } = useVideo()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const filteredVideos = allVideos.filter(
    (video, index, self) =>
      video.title.toLowerCase().includes(localQuery.toLowerCase()) &&
      self.findIndex((v) => v.id === video.id) === index
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSearchQuery(localQuery)
  }, [localQuery, setSearchQuery])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "auto"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const handleVideoClick = (video: (typeof allVideos)[0]) => {
    openVideoModal(video)
    onClose()
    setLocalQuery("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 pt-20">
        {/* Search input */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for movies, TV shows..."
            className="w-full bg-muted border border-border rounded-lg py-4 pl-14 pr-14 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search results */}
        {localQuery.length > 0 ? (
          <div>
            <p className="text-muted-foreground mb-4">
              {filteredVideos.length} result{filteredVideos.length !== 1 && "s"} for &quot;{localQuery}&quot;
            </p>
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="text-left group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-black ml-0.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-medium text-sm truncate">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {video.year} • {video.genres?.join(", ")}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for &quot;{localQuery}&quot;</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or check the spelling
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {["Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setLocalQuery(term)}
                    className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
