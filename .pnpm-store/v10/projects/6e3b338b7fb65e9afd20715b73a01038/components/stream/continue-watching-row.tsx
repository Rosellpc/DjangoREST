"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Play, X, Info } from "lucide-react"
import Image from "next/image"
import { useVideo, type Video } from "@/lib/video-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ContinueWatchingVideo extends Video {
  progress: number // 0-100
  episodeInfo?: string // e.g., "S2:E5"
}

interface ContinueWatchingRowProps {
  videos: ContinueWatchingVideo[]
}

function ContinueWatchingCard({ video }: { video: ContinueWatchingVideo }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const { openVideoModal, openPlayer } = useVideo()

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPlayer(video)
  }

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation()
    openVideoModal(video)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowRemoveConfirm(true)
  }

  return (
    <div
      className="relative flex-shrink-0 w-[200px] md:w-[280px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowRemoveConfirm(false)
      }}
      onClick={() => openPlayer(video)}
    >
      <div
        className={cn(
          "relative aspect-video rounded overflow-hidden transition-all duration-300",
          isHovered ? "scale-105 z-20 shadow-2xl" : "scale-100 z-0"
        )}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 200px, 280px"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${video.progress}%` }}
          />
        </div>

        {/* Play button on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <button
              onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors group"
            >
              <Play className="w-7 h-7 text-black fill-black ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Episode info badge */}
        {video.episodeInfo && (
          <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs font-medium">
            {video.episodeInfo}
          </div>
        )}

        {/* Remove button */}
        {isHovered && !showRemoveConfirm && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Remove confirmation */}
        {showRemoveConfirm && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4">
            <p className="text-sm text-center mb-3">Remove from Continue Watching?</p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Would remove from list
                  setShowRemoveConfirm(false)
                }}
                className="px-3 py-1 bg-foreground text-background text-sm rounded font-medium hover:bg-foreground/90"
              >
                Remove
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowRemoveConfirm(false)
                }}
                className="px-3 py-1 bg-muted text-foreground text-sm rounded font-medium hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm truncate flex-1">{video.title}</h4>
          {isHovered && (
            <button
              onClick={handleInfo}
              className="w-6 h-6 rounded-full border border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors"
            >
              <Info className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {video.episodeInfo ? `${video.episodeInfo} • ` : ""}
          {Math.round(100 - video.progress)} min remaining
        </p>
      </div>
    </div>
  )
}

export function ContinueWatchingRow({ videos }: ContinueWatchingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  if (videos.length === 0) return null

  return (
    <div className="relative group/row mb-8">
      <h2 className="text-foreground text-lg md:text-xl font-semibold mb-3 px-4 md:px-12">
        Continue Watching
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-background/50 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-background/80"
        >
          <ChevronLeft className="w-8 h-8 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
        >
          {videos.map((video) => (
            <ContinueWatchingCard key={video.id} video={video} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-background/50 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-background/80"
        >
          <ChevronRight className="w-8 h-8 text-foreground" />
        </button>
      </div>
    </div>
  )
}
