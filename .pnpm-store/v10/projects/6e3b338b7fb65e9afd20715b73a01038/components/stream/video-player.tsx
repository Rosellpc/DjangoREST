"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  Subtitles,
  X,
  RotateCcw,
  RotateCw,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
  videoSrc?: string
  posterImage?: string
}

export function VideoPlayer({
  isOpen,
  onClose,
  videoTitle,
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  posterImage,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(false)
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [isHoveringProgress, setIsHoveringProgress] = useState(false)
  const [hoverTime, setHoverTime] = useState(0)
  const [hoverPosition, setHoverPosition] = useState(0)

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // Show controls and reset timeout
  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSettings(false)
        setShowSubtitles(false)
      }, 3000)
    }
  }, [isPlaying])

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }, [isPlaying])

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error("Fullscreen error:", err)
    }
  }

  // Progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = clickPosition * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Progress bar hover
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const hoverPos = (e.clientX - rect.left) / rect.width
    setHoverPosition(e.clientX - rect.left)
    setHoverTime(hoverPos * duration)
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      )
    }
  }

  // Playback rate
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          skip(-10)
          break
        case "ArrowRight":
          e.preventDefault()
          skip(10)
          break
        case "ArrowUp":
          e.preventDefault()
          if (videoRef.current) {
            const newVol = Math.min(1, volume + 0.1)
            videoRef.current.volume = newVol
            setVolume(newVol)
            setIsMuted(false)
          }
          break
        case "ArrowDown":
          e.preventDefault()
          if (videoRef.current) {
            const newVol = Math.max(0, volume - 0.1)
            videoRef.current.volume = newVol
            setVolume(newVol)
            if (newVol === 0) setIsMuted(true)
          }
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen()
          } else {
            onClose()
          }
          break
      }
      showControlsWithTimeout()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isPlaying, volume, isFullscreen, togglePlay, showControlsWithTimeout, onClose])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("progress", onProgress)
    document.addEventListener("fullscreenchange", onFullscreenChange)

    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("progress", onProgress)
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  }, [])

  // Auto-play on open
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [isOpen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  if (!isOpen) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onMouseMove={showControlsWithTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterImage}
          className="w-full h-full object-contain bg-black"
          onClick={togglePlay}
          playsInline
        />

        {/* Subtitles overlay (mock) */}
        {subtitlesEnabled && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded text-white text-lg">
            [Sample subtitle text would appear here]
          </div>
        )}

        {/* Center play button overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        )}

        {/* Top gradient */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Top controls */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 p-4 flex items-center gap-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
            <span className="text-lg font-medium">Back to Browse</span>
          </button>
        </div>

        {/* Bottom gradient */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Bottom controls */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 space-y-3 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold text-white">{videoTitle}</h2>

          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-1 group cursor-pointer"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white/30 rounded-full" />
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-white/50 rounded-full"
              style={{ width: `${bufferedProgress}%` }}
            />
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Hover indicator */}
            {isHoveringProgress && (
              <>
                <div
                  className="absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2"
                  style={{ left: hoverPosition }}
                >
                  {formatTime(hoverTime)}
                </div>
                <div
                  className="absolute inset-y-0 w-0.5 bg-white"
                  style={{ left: hoverPosition }}
                />
              </>
            )}
            {/* Scrubber */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 transition-transform",
                isHoveringProgress ? "scale-100" : "scale-0 group-hover:scale-100"
              )}
              style={{ left: `${progress}%` }}
            />
            {/* Larger hit area */}
            <div className="absolute -inset-y-2 inset-x-0 group-hover:-inset-y-1" />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-white/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" fill="white" />
                ) : (
                  <Play className="w-8 h-8" fill="white" />
                )}
              </button>

              {/* Skip backward */}
              <button
                onClick={() => skip(-10)}
                className="p-2 text-white hover:text-white/80 transition-colors relative"
              >
                <RotateCcw className="w-6 h-6" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  10
                </span>
              </button>

              {/* Skip forward */}
              <button
                onClick={() => skip(10)}
                className="p-2 text-white hover:text-white/80 transition-colors relative"
              >
                <RotateCw className="w-6 h-6" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  10
                </span>
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:text-white/80 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>

              {/* Time display */}
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Next episode (mock) */}
              <button className="p-2 text-white hover:text-white/80 transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>

              {/* Subtitles */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubtitles(!showSubtitles)
                    setShowSettings(false)
                  }}
                  className={cn(
                    "p-2 transition-colors",
                    subtitlesEnabled
                      ? "text-primary"
                      : "text-white hover:text-white/80"
                  )}
                >
                  <Subtitles className="w-6 h-6" />
                </button>
                {showSubtitles && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-900/95 rounded-lg overflow-hidden shadow-xl">
                    <div className="p-3 border-b border-white/10">
                      <h3 className="text-white font-semibold">Subtitles</h3>
                    </div>
                    <div className="p-2">
                      {["Off", "English", "Spanish", "French"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSubtitlesEnabled(lang !== "Off")
                            setShowSubtitles(false)
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors",
                            (lang === "Off" && !subtitlesEnabled) ||
                              (lang === "English" && subtitlesEnabled)
                              ? "text-primary"
                              : "text-white"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings)
                    setShowSubtitles(false)
                  }}
                  className="p-2 text-white hover:text-white/80 transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-900/95 rounded-lg overflow-hidden shadow-xl">
                    <div className="p-3 border-b border-white/10">
                      <h3 className="text-white font-semibold">
                        Playback Speed
                      </h3>
                    </div>
                    <div className="p-2">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            changePlaybackRate(rate)
                            setShowSettings(false)
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors",
                            playbackRate === rate
                              ? "text-primary"
                              : "text-white"
                          )}
                        >
                          {rate === 1 ? "Normal" : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:text-white/80 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-6 h-6" />
                ) : (
                  <Maximize className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Close button (when not fullscreen) */}
        {!isFullscreen && (
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 p-2 text-white hover:text-white/80 transition-all",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}
