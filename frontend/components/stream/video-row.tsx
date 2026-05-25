"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { VideoCard } from "./video-card"

interface Video {
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

interface VideoRowProps {
  title: string
  videos: Video[]
}

export function VideoRow({ title, videos }: VideoRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative group/row mb-6 md:mb-8">
      <h2 className="text-foreground text-base sm:text-lg md:text-xl font-semibold mb-2 md:mb-3 px-3 sm:px-4 md:px-12">
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-30 hidden md:flex w-12 bg-background/50 opacity-0 group-hover/row:opacity-100 transition-opacity items-center justify-center hover:bg-background/80"
        >
          <ChevronLeft className="w-8 h-8 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-3 sm:px-4 md:px-12 pb-6 md:pb-20"
        >
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              videoSrc={video.videoSrc}
              match={video.match}
              year={video.year}
              duration={video.duration}
              rating={video.rating}
              genres={video.genres}
            />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-30 hidden md:flex w-12 bg-background/50 opacity-0 group-hover/row:opacity-100 transition-opacity items-center justify-center hover:bg-background/80"
        >
          <ChevronRight className="w-8 h-8 text-foreground" />
        </button>
      </div>
    </div>
  )
}

