"use client"

import { useEffect, useState } from "react"
import { X, Play, Plus, Check, ThumbsUp, ThumbsDown, Volume2, VolumeX, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useVideo } from "@/lib/video-context"
import { cn } from "@/lib/utils"
import { getPosterByIndex } from "@/lib/local-media"

const similarContent = [
  { id: "s1", title: "Dark Matter", thumbnail: getPosterByIndex(1), match: 92, year: "2024", rating: "TV-MA" },
  { id: "s2", title: "The Expanse", thumbnail: getPosterByIndex(2), match: 89, year: "2023", rating: "TV-14" },
  { id: "s3", title: "Interstellar", thumbnail: getPosterByIndex(3), match: 95, year: "2024", rating: "PG-13" },
  { id: "s4", title: "Arrival", thumbnail: getPosterByIndex(4), match: 87, year: "2023", rating: "PG-13" },
  { id: "s5", title: "Blade Runner", thumbnail: getPosterByIndex(5), match: 91, year: "2024", rating: "R" },
  { id: "s6", title: "Dune", thumbnail: getPosterByIndex(6), match: 94, year: "2024", rating: "PG-13" },
]

const mockEpisodes = [
  { number: 1, title: "The Beginning", duration: "52m", description: "Our heroes embark on an extraordinary journey that will change everything they know.", thumbnail: getPosterByIndex(7) },
  { number: 2, title: "Into the Unknown", duration: "48m", description: "As dangers mount, difficult choices must be made about the path forward.", thumbnail: getPosterByIndex(8) },
  { number: 3, title: "Breaking Point", duration: "55m", description: "Tensions reach a fever pitch as secrets are revealed and alliances tested.", thumbnail: getPosterByIndex(9) },
  { number: 4, title: "No Return", duration: "51m", description: "With everything on the line, our heroes face their greatest challenge yet.", thumbnail: getPosterByIndex(10) },
  { number: 5, title: "The Reckoning", duration: "58m", description: "The season finale brings shocking revelations and sets the stage for what's to come.", thumbnail: getPosterByIndex(11) },
]

export function VideoModal() {
  const {
    selectedVideo,
    closeVideoModal,
    addToMyList,
    removeFromMyList,
    isInMyList,
    toggleLike,
    toggleDislike,
    isLiked,
    isDisliked,
    openPlayer,
    getWatchProgress,
  } = useVideo()

  const [isMuted, setIsMuted] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [activeTab, setActiveTab] = useState<"episodes" | "similar" | "details">("episodes")

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideoModal()
    }
    if (selectedVideo) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "auto"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [selectedVideo, closeVideoModal])

  if (!selectedVideo) return null

  const inList = isInMyList(selectedVideo.id)
  const liked = isLiked(selectedVideo.id)
  const disliked = isDisliked(selectedVideo.id)
  const progress = getWatchProgress(selectedVideo.id)
  const isSeries = selectedVideo.type === "series"

  const handleMyListClick = () => {
    if (inList) {
      removeFromMyList(selectedVideo.id)
    } else {
      addToMyList(selectedVideo)
    }
  }

  const handlePlay = () => {
    openPlayer(selectedVideo)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 md:py-8 px-2 md:px-4"
      onClick={closeVideoModal}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-4xl bg-card rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeVideoModal}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image/video section */}
        <div className="relative aspect-video">
          <Image
            src={selectedVideo.thumbnail}
            alt={selectedVideo.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 group"
            >
              <Play className="w-10 h-10 text-primary-foreground fill-primary-foreground ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{selectedVideo.title}</h2>
            
            {/* Progress bar if watching */}
            {progress && progress.progress > 0 && progress.progress < 95 && (
              <div className="mb-4">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Resume watching - {Math.round(progress.progress)}% complete
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-2 rounded font-semibold hover:bg-foreground/90 transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
                {progress && progress.progress > 5 ? "Resume" : "Play"}
              </button>
              
              <button
                onClick={handleMyListClick}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  inList
                    ? "bg-foreground border-foreground text-background"
                    : "border-muted-foreground hover:border-foreground"
                )}
                title={inList ? "Remove from My List" : "Add to My List"}
              >
                {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => toggleLike(selectedVideo.id)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  liked
                    ? "bg-foreground border-foreground text-background"
                    : "border-muted-foreground hover:border-foreground"
                )}
                title="I like this"
              >
                <ThumbsUp className={cn("w-5 h-5", liked && "fill-current")} />
              </button>
              
              <button
                onClick={() => toggleDislike(selectedVideo.id)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  disliked
                    ? "bg-foreground border-foreground text-background"
                    : "border-muted-foreground hover:border-foreground"
                )}
                title="Not for me"
              >
                <ThumbsDown className={cn("w-5 h-5", disliked && "fill-current")} />
              </button>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors ml-auto"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-green-500 font-semibold">
              {selectedVideo.match || 95}% Match
            </span>
            <span className="text-muted-foreground">{selectedVideo.year || "2024"}</span>
            <span className="border border-muted-foreground px-2 py-0.5 text-xs text-muted-foreground">
              {selectedVideo.rating || "TV-MA"}
            </span>
            <span className="text-muted-foreground">{selectedVideo.duration || "2h 15m"}</span>
            <span className="border border-muted-foreground px-2 py-0.5 text-xs text-muted-foreground">
              HD
            </span>
            {isSeries && (
              <span className="text-muted-foreground">3 Seasons</span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <p className="text-foreground/90 leading-relaxed">
                {selectedVideo.description ||
                  "An epic journey into the unknown. This captivating story follows our heroes as they face incredible challenges, discover hidden truths, and forge unbreakable bonds. With stunning visuals and a gripping narrative, this is a must-watch experience that will keep you on the edge of your seat."}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Cast: </span>
                <span className="text-foreground">John Smith, Jane Doe, Mike Johnson</span>
              </p>
              <p>
                <span className="text-muted-foreground">Genres: </span>
                <span className="text-foreground">
                  {(selectedVideo.genres || ["Drama", "Action"]).join(", ")}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">This show is: </span>
                <span className="text-foreground">Suspenseful, Exciting, Dark</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-4">
            <div className="flex gap-6">
              {isSeries && (
                <button
                  onClick={() => setActiveTab("episodes")}
                  className={cn(
                    "pb-3 text-sm font-semibold transition-colors relative",
                    activeTab === "episodes" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Episodes
                  {activeTab === "episodes" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab("similar")}
                className={cn(
                  "pb-3 text-sm font-semibold transition-colors relative",
                  activeTab === "similar" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                More Like This
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={cn(
                  "pb-3 text-sm font-semibold transition-colors relative",
                  activeTab === "details" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Trailers & More
              </button>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "episodes" && isSeries && (
            <div className="space-y-4">
              {/* Season selector */}
              <div className="relative inline-block">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none bg-card border border-border rounded px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>Season 1</option>
                  <option value={2}>Season 2</option>
                  <option value={3}>Season 3</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Episodes list */}
              <div className="space-y-3">
                {mockEpisodes.map((episode) => (
                  <div
                    key={episode.number}
                    className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={handlePlay}
                  >
                    <div className="relative w-32 aspect-video flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={episode.thumbnail}
                        alt={episode.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">
                          {episode.number}. {episode.title}
                        </h4>
                        <span className="text-sm text-muted-foreground">{episode.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "similar" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarContent.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    closeVideoModal()
                    // Would open new modal
                  }}
                >
                  <div className="relative aspect-video rounded overflow-hidden mb-2">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-10 h-10 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-500 text-sm font-semibold">{item.match}% Match</span>
                    <span className="text-xs text-muted-foreground border border-muted-foreground px-1">
                      {item.rating}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mt-1 truncate">{item.title}</h4>
                </div>
              ))}
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Trailer", "Teaser", "Behind the Scenes"].map((item, i) => (
                  <div
                    key={i}
                    className="group cursor-pointer"
                    onClick={handlePlay}
                  >
                    <div className="relative aspect-video rounded overflow-hidden mb-2 bg-muted">
                      <Image
                        src={getPosterByIndex(12 + i)}
                        alt={item}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10 text-white" fill="white" />
                      </div>
                    </div>
                    <h4 className="font-medium text-sm">{item}</h4>
                    <p className="text-xs text-muted-foreground">2:30</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
