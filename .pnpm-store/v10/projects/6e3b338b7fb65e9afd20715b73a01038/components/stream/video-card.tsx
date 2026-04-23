"use client"

import { useState } from "react"
import { Play, Plus, Check, ThumbsUp, ChevronDown, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useVideo, type Video } from "@/lib/video-context"

interface VideoCardProps {
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

export function VideoCard({
  id,
  title,
  thumbnail,
  videoSrc,
  match = 95,
  year = "2024",
  duration = "2h 15m",
  rating = "TV-MA",
  genres = ["Action", "Drama"],
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const {
    openVideoModal,
    addToMyList,
    removeFromMyList,
    isInMyList,
    toggleLike,
    isLiked,
  } = useVideo()

  const inList = isInMyList(id)
  const liked = isLiked(id)

  const video: Video = {
    id,
    title,
    thumbnail,
    videoSrc,
    match,
    year,
    duration,
    rating,
    genres,
  }

  const handleMyListClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inList) {
      removeFromMyList(id)
    } else {
      addToMyList(video)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(id)
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openVideoModal(video)
  }

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openVideoModal(video)
  }

  return (
    <div
      className="relative flex-shrink-0 w-[160px] md:w-[200px] lg:w-[240px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openVideoModal(video)}
    >
      <div
        className={`relative aspect-video rounded overflow-hidden transition-all duration-300 ${
          isHovered ? "scale-110 z-20 shadow-2xl" : "scale-100 z-0"
        }`}
      >
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 240px"
        />

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        )}
      </div>

      {isHovered && (
        <div className="absolute top-full left-0 right-0 bg-card rounded-b p-3 shadow-2xl z-20 -mt-1 scale-110 origin-top">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handlePlayClick}
              className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center hover:bg-foreground/90 transition-colors"
            >
              <Play className="w-4 h-4 text-background fill-background" />
            </button>
            <button
              onClick={handleMyListClick}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                inList
                  ? "bg-foreground border-foreground text-background"
                  : "border-muted-foreground hover:border-foreground"
              }`}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-foreground" />}
            </button>
            <button
              onClick={handleLikeClick}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                liked
                  ? "bg-foreground border-foreground text-background"
                  : "border-muted-foreground hover:border-foreground"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : "text-foreground"}`} />
            </button>
            <Link
              href={`/title/${id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors"
              title="More info"
            >
              <Info className="w-4 h-4 text-foreground" />
            </Link>
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors ml-auto"
            >
              <ChevronDown className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="text-green-500 font-semibold">{match}% Match</span>
            <span className="border border-muted-foreground px-1 text-muted-foreground">{rating}</span>
            <span className="text-muted-foreground">{duration}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {genres.map((genre, i) => (
              <span key={genre}>
                {genre}
                {i < genres.length - 1 && <span className="mx-1">•</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
