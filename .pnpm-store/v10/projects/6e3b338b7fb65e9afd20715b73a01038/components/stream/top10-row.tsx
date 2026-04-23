"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Play, Plus, Check, ThumbsUp, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useVideo, type Video } from "@/lib/video-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Top10Video {
  id: string
  title: string
  thumbnail: string
  videoSrc?: string
  match?: number
  year?: string
  duration?: string
  rating?: string
  genres?: string[]
}

interface Top10RowProps {
  title: string
  videos: Top10Video[]
}

function Top10Card({ video, rank }: { video: Top10Video; rank: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const {
    openVideoModal,
    addToMyList,
    removeFromMyList,
    isInMyList,
    toggleLike,
    isLiked,
    openPlayer,
  } = useVideo()

  const inList = isInMyList(video.id)
  const liked = isLiked(video.id)

  const videoData: Video = {
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail,
    videoSrc: video.videoSrc,
    match: video.match,
    year: video.year,
    duration: video.duration,
    rating: video.rating,
    genres: video.genres,
  }

  const handleMyListClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inList) {
      removeFromMyList(video.id)
    } else {
      addToMyList(videoData)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(video.id)
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPlayer(videoData)
  }

  return (
    <div
      className="relative flex-shrink-0 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openVideoModal(videoData)}
    >
      <div className="flex items-end">
        {/* Large number */}
        <div className="relative w-[80px] md:w-[100px] h-[140px] md:h-[180px] flex-shrink-0">
          <span
            className={cn(
              "absolute -right-4 bottom-0 text-[140px] md:text-[180px] font-black leading-none select-none transition-transform duration-300",
              "text-transparent bg-clip-text",
              "[-webkit-text-stroke:3px_var(--muted-foreground)]",
              isHovered && "scale-105"
            )}
            style={{
              fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
            }}
          >
            {rank}
          </span>
        </div>

        {/* Video thumbnail */}
        <div
          className={cn(
            "relative w-[100px] md:w-[130px] h-[140px] md:h-[180px] rounded overflow-hidden transition-all duration-300 -ml-4",
            isHovered ? "scale-105 z-20 shadow-2xl" : "scale-100 z-10"
          )}
        >
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100px, 130px"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          )}
        </div>
      </div>

      {/* Hover card */}
      {isHovered && (
        <div className="absolute top-full left-[60px] md:left-[80px] right-0 w-[160px] md:w-[200px] bg-card rounded-b p-3 shadow-2xl z-30 -mt-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handlePlayClick}
              className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center hover:bg-foreground/90 transition-colors"
            >
              <Play className="w-4 h-4 text-background fill-background" />
            </button>
            <button
              onClick={handleMyListClick}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                inList
                  ? "bg-foreground border-foreground text-background"
                  : "border-muted-foreground hover:border-foreground"
              )}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-foreground" />}
            </button>
            <button
              onClick={handleLikeClick}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                liked
                  ? "bg-foreground border-foreground text-background"
                  : "border-muted-foreground hover:border-foreground"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", liked ? "fill-current" : "text-foreground")} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                openVideoModal(videoData)
              }}
              className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors ml-auto"
            >
              <ChevronDown className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="text-green-500 font-semibold">{video.match || 95}% Match</span>
            <span className="border border-muted-foreground px-1 text-muted-foreground">
              {video.rating || "TV-MA"}
            </span>
          </div>

          <div className="text-xs text-muted-foreground truncate">{video.title}</div>
        </div>
      )}
    </div>
  )
}

export function Top10Row({ title, videos }: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative group/row mb-8">
      <h2 className="text-foreground text-lg md:text-xl font-semibold mb-3 px-4 md:px-12 flex items-center gap-3">
        <span className="bg-primary text-primary-foreground px-2 py-0.5 text-sm font-bold rounded">
          TOP 10
        </span>
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-background/50 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-background/80"
        >
          <ChevronLeft className="w-8 h-8 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-32"
        >
          {videos.slice(0, 10).map((video, index) => (
            <Top10Card key={video.id} video={video} rank={index + 1} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-background/50 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-background/80"
        >
          <ChevronRight className="w-8 h-8 text-foreground" />
        </button>
      </div>
    </div>
  )
}
