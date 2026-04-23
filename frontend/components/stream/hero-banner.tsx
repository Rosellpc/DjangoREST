"use client"

import { Play, Info, Volume2, VolumeX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useVideo } from "@/lib/video-context"
import { useState, useEffect, useRef } from "react"

interface HeroBannerProps {
  title: string
  description: string
  backgroundImage: string
  previewVideoSrc?: string
  logo?: string
}

export function HeroBanner({ title, description, backgroundImage, previewVideoSrc }: HeroBannerProps) {
  const { openVideoModal, openPlayer } = useVideo()
  const [isMuted, setIsMuted] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewEnded, setPreviewEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasPreview = Boolean(previewVideoSrc)

  // Show preview after 2 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setShowPreview(true)
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const featuredVideo = {
    id: "featured",
    title,
    thumbnail: backgroundImage,
    videoSrc: previewVideoSrc,
    description,
    match: 98,
    year: "2024",
    duration: "2h 28m",
    rating: "TV-MA",
    genres: ["Drama", "Sci-Fi", "Adventure"],
    type: "movie" as const,
  }

  const handlePlay = () => {
    openPlayer(featuredVideo)
  }

  const handleMoreInfo = () => {
    openVideoModal(featuredVideo)
  }

  const handleReplay = () => {
    setPreviewEnded(false)
    setShowPreview(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  return (
    <div className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className={`object-cover transition-opacity duration-1000 ${showPreview && !previewEnded && hasPreview ? "opacity-0" : "opacity-100"}`}
          priority
        />
      </div>

      {/* Preview video */}
      {showPreview && !previewEnded && hasPreview && (
        <video
          ref={videoRef}
          src={previewVideoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          onEnded={() => setPreviewEnded(true)}
          playsInline
        />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Content rating badge */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
        <div className="bg-muted/60 border-l-2 border-foreground px-4 py-1">
          <span className="text-sm font-medium">TV-MA</span>
        </div>
      </div>

      {/* Sound/Replay controls */}
      <div className="absolute right-4 md:right-12 bottom-40 md:bottom-48 flex items-center gap-3">
        {showPreview && !previewEnded && hasPreview && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full border border-foreground/50 flex items-center justify-center hover:border-foreground transition-colors bg-background/20 backdrop-blur"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        )}
        {previewEnded && (
          <button
            onClick={handleReplay}
            className="w-10 h-10 rounded-full border border-foreground/50 flex items-center justify-center hover:border-foreground transition-colors bg-background/20 backdrop-blur"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-32 md:pb-48 px-4 md:px-12">
        <div className="max-w-xl">
          {/* Series/Film badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-primary font-bold text-lg">S</span>
              <span className="text-sm font-medium tracking-widest text-muted-foreground">
                SERIES
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance drop-shadow-lg">
            {title}
          </h1>
          
          {/* Top 10 badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-primary/90 px-2 py-1 rounded">
              <span className="font-bold text-sm">TOP</span>
              <span className="font-bold text-sm">10</span>
            </div>
            <span className="text-sm font-medium">#1 in TV Shows Today</span>
          </div>

          <p className="text-foreground/90 text-sm md:text-base mb-6 line-clamp-3 text-pretty max-w-lg">
            {description}
          </p>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              onClick={handlePlay}
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2 h-12 px-8"
            >
              <Play className="w-6 h-6 fill-current" />
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleMoreInfo}
              className="bg-muted/80 text-foreground hover:bg-muted font-semibold gap-2 h-12 px-6"
            >
              <Info className="w-6 h-6" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
