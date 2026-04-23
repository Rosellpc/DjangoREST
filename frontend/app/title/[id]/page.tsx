"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  ChevronDown,
  ChevronLeft,
  Volume2,
  VolumeX,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VideoProvider, useVideo } from "@/lib/video-context"
import { VideoPlayer } from "@/components/stream/video-player"
import { cn } from "@/lib/utils"
import { getPosterByIndex, getVideoByIndex } from "@/lib/local-media"

// Mock data for a full title
const getTitleData = (id: string) => ({
  id,
  title: "The Last Frontier",
  tagline: "The journey begins where hope ends",
  description:
    "In a world ravaged by climate change, a small group of survivors must navigate treacherous landscapes and rival factions to find humanity's last hope for survival. An epic journey of courage, sacrifice, and the unbreakable human spirit that will redefine what it means to be human.",
  longDescription:
    "Set in 2157, Earth has become nearly uninhabitable. Rising sea levels have swallowed coastal cities, extreme weather events are commonplace, and resources are scarce. Amidst this chaos, Dr. Elena Chen discovers a signal from a long-forgotten space station that may hold the key to humanity's survival. Together with a ragtag group of survivors, she must traverse the dangerous wasteland that was once North America, facing hostile factions, extreme conditions, and their own inner demons.",
  backgroundImage: getPosterByIndex(Number(id) || 0),
  posterImage: getPosterByIndex((Number(id) || 0) + 1),
  logoImage: null,
  match: 98,
  year: "2024",
  rating: "TV-MA",
  seasons: 3,
  type: "series",
  genres: ["Drama", "Sci-Fi", "Adventure", "Thriller"],
  tags: ["Dystopian", "Post-Apocalyptic", "Ensemble Cast", "Strong Female Lead"],
  maturityRating: {
    rating: "TV-MA",
    description: "Violence, Language, Nudity",
  },
  cast: [
    {
      id: "c1",
      name: "Emma Stone",
      role: "Dr. Elena Chen",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "c2",
      name: "Oscar Isaac",
      role: "Marcus Webb",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    },
    {
      id: "c3",
      name: "Zendaya",
      role: "Maya",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    },
    {
      id: "c4",
      name: "John Boyega",
      role: "Captain Drake",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    },
    {
      id: "c5",
      name: "Florence Pugh",
      role: "Sarah",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
    },
    {
      id: "c6",
      name: "Idris Elba",
      role: "The Commander",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    },
  ],
  creators: ["Christopher Nolan", "Jonathan Nolan"],
  writers: ["Lisa Joy", "David S. Goyer"],
  episodes: {
    1: [
      {
        id: "s1e1",
        number: 1,
        title: "The Signal",
        duration: "58m",
        description:
          "Dr. Elena Chen discovers a mysterious signal that could change everything. As she investigates its origin, she uncovers a conspiracy that reaches the highest levels of the remaining government.",
        thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80",
      },
      {
        id: "s1e2",
        number: 2,
        title: "Into the Wasteland",
        duration: "52m",
        description:
          "Elena assembles a team to journey into the forbidden wasteland. They face their first major obstacle when they encounter a hostile faction.",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
      },
      {
        id: "s1e3",
        number: 3,
        title: "The Outpost",
        duration: "55m",
        description:
          "The group finds temporary refuge at an abandoned military outpost, but they soon realize they're not alone. Tensions rise as supplies run low.",
        thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80",
      },
      {
        id: "s1e4",
        number: 4,
        title: "Ghosts of the Past",
        duration: "54m",
        description:
          "Marcus's dark past catches up with him when the group enters his former territory. Elena must decide if she can still trust him.",
        thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
      },
      {
        id: "s1e5",
        number: 5,
        title: "The Storm",
        duration: "51m",
        description:
          "A massive superstorm forces the team to take shelter in an underground bunker, where they discover evidence of what really happened.",
        thumbnail: "https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=400&q=80",
      },
      {
        id: "s1e6",
        number: 6,
        title: "Point of No Return",
        duration: "62m",
        description:
          "Season finale. The team reaches their destination but faces an impossible choice. Elena must sacrifice everything for the mission.",
        thumbnail: "https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=400&q=80",
      },
    ],
    2: [
      {
        id: "s2e1",
        number: 1,
        title: "New Horizons",
        duration: "56m",
        description:
          "Six months after the events of Season 1, the survivors face a new threat as they try to rebuild.",
        thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
      },
      {
        id: "s2e2",
        number: 2,
        title: "The Betrayal",
        duration: "54m",
        description:
          "A shocking betrayal threatens to tear the group apart. Elena discovers the true cost of leadership.",
        thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80",
      },
      {
        id: "s2e3",
        number: 3,
        title: "Underground",
        duration: "52m",
        description:
          "The team ventures into the underground cities, discovering a hidden civilization with its own rules.",
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80",
      },
    ],
    3: [
      {
        id: "s3e1",
        number: 1,
        title: "Final Dawn",
        duration: "58m",
        description:
          "The beginning of the end. As the final season opens, the stakes have never been higher.",
        thumbnail: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80",
      },
    ],
  },
  trailers: [
    {
      id: "tr1",
      title: "Official Trailer",
      duration: "2:45",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
    },
    {
      id: "tr2",
      title: "Season 2 Teaser",
      duration: "1:30",
      thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80",
    },
    {
      id: "tr3",
      title: "Behind the Scenes",
      duration: "8:22",
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80",
    },
  ],
  moreLikeThis: [
    {
      id: "m1",
      title: "Dark Horizons",
      thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&q=80",
      match: 92,
      year: "2024",
      rating: "TV-MA",
    },
    {
      id: "m2",
      title: "The Expanse",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
      match: 89,
      year: "2023",
      rating: "TV-14",
    },
    {
      id: "m3",
      title: "Quantum Shift",
      thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&q=80",
      match: 95,
      year: "2024",
      rating: "PG-13",
    },
    {
      id: "m4",
      title: "Survivors",
      thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&q=80",
      match: 87,
      year: "2023",
      rating: "TV-MA",
    },
    {
      id: "m5",
      title: "New Earth",
      thumbnail: "https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=300&q=80",
      match: 91,
      year: "2024",
      rating: "PG-13",
    },
    {
      id: "m6",
      title: "Colony",
      thumbnail: "https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=300&q=80",
      match: 84,
      year: "2024",
      rating: "TV-14",
    },
  ],
})

function TitleContent({ id }: { id: string }) {
  const titleData = getTitleData(id)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [activeTab, setActiveTab] = useState<"episodes" | "trailers" | "similar">("episodes")
  const [isMuted, setIsMuted] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const {
    addToMyList,
    removeFromMyList,
    isInMyList,
    toggleLike,
    toggleDislike,
    isLiked,
    isDisliked,
    isPlayerOpen,
    playingVideo,
    openPlayer,
    closePlayer,
  } = useVideo()

  const inList = isInMyList(titleData.id)
  const liked = isLiked(titleData.id)
  const disliked = isDisliked(titleData.id)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMyListClick = () => {
    if (inList) {
      removeFromMyList(titleData.id)
    } else {
      addToMyList({
        id: titleData.id,
        title: titleData.title,
        thumbnail: titleData.posterImage,
        match: titleData.match,
        year: titleData.year,
        rating: titleData.rating,
        genres: titleData.genres,
      })
    }
  }

  const handlePlay = () => {
    openPlayer({
      id: titleData.id,
      title: titleData.title,
      thumbnail: titleData.backgroundImage,
      videoSrc: getVideoByIndex(Number(titleData.id) || 0),
    })
  }

  const currentEpisodes =
    titleData.episodes[selectedSeason as keyof typeof titleData.episodes] || []

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation bar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 md:px-12 py-4 transition-all duration-300",
          isScrolled ? "bg-background/95 backdrop-blur-md" : "bg-gradient-to-b from-black/80 to-transparent"
        )}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className={cn("font-medium", isScrolled ? "opacity-100" : "opacity-0")}>
              Back to Browse
            </span>
          </Link>
          {isScrolled && (
            <h1 className="text-lg font-semibold truncate animate-in fade-in slide-in-from-left-4">
              {titleData.title}
            </h1>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <div className="relative h-[70vh] md:h-[80vh]">
        <div className="absolute inset-0">
          <Image
            src={titleData.backgroundImage}
            alt={titleData.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        {/* Sound control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute right-4 md:right-12 bottom-1/3 w-10 h-10 rounded-full border border-foreground/50 flex items-center justify-center hover:border-foreground transition-colors bg-background/20 backdrop-blur z-10"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Rating badge */}
        <div className="absolute right-0 bottom-1/3 translate-y-1/2 flex items-center z-10">
          <div className="bg-muted/60 border-l-2 border-foreground px-4 py-1">
            <span className="text-sm font-medium">{titleData.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{titleData.title}</h1>
            {titleData.tagline && (
              <p className="text-lg text-muted-foreground mb-4 italic">{titleData.tagline}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Button
                size="lg"
                onClick={handlePlay}
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2 h-12 px-8"
              >
                <Play className="w-6 h-6 fill-current" />
                Play
              </Button>

              <button
                onClick={handleMyListClick}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                  inList
                    ? "bg-foreground border-foreground text-background"
                    : "border-muted-foreground hover:border-foreground"
                )}
                title={inList ? "Remove from My List" : "Add to My List"}
              >
                {inList ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>

              <button
                onClick={() => toggleLike(titleData.id)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                  liked
                    ? "bg-foreground border-foreground text-background"
                    : "border-muted-foreground hover:border-foreground"
                )}
                title="I like this"
              >
                <ThumbsUp className={cn("w-5 h-5", liked && "fill-current")} />
              </button>

              <button
                onClick={() => toggleDislike(titleData.id)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                  disliked
                    ? "bg-foreground border-foreground text-background"
                    : "border-muted-foreground hover:border-foreground"
                )}
                title="Not for me"
              >
                <ThumbsDown className={cn("w-5 h-5", disliked && "fill-current")} />
              </button>

              <button
                className="w-12 h-12 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-sm flex-wrap mb-4">
              <span className="text-green-500 font-semibold">{titleData.match}% Match</span>
              <span>{titleData.year}</span>
              <span className="border border-muted-foreground px-2 py-0.5 text-xs">
                {titleData.rating}
              </span>
              <span>{titleData.seasons} Seasons</span>
              <span className="border border-muted-foreground px-2 py-0.5 text-xs">HD</span>
              <span className="border border-muted-foreground px-2 py-0.5 text-xs">5.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="px-4 md:px-12 py-8">
        {/* Description and metadata */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <p className="text-foreground/90 leading-relaxed text-lg mb-4">
              {titleData.description}
            </p>
            <p className="text-muted-foreground leading-relaxed">{titleData.longDescription}</p>
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Cast: </span>
              <span className="text-foreground">
                {titleData.cast.map((c) => c.name).join(", ")}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Genres: </span>
              <span className="text-foreground">{titleData.genres.join(", ")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">This show is: </span>
              <span className="text-foreground">{titleData.tags.join(", ")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Creators: </span>
              <span className="text-foreground">{titleData.creators.join(", ")}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("episodes")}
              className={cn(
                "pb-4 text-base font-semibold transition-colors relative",
                activeTab === "episodes"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Episodes
              {activeTab === "episodes" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("trailers")}
              className={cn(
                "pb-4 text-base font-semibold transition-colors relative",
                activeTab === "trailers"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Trailers & More
              {activeTab === "trailers" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("similar")}
              className={cn(
                "pb-4 text-base font-semibold transition-colors relative",
                activeTab === "similar"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              More Like This
              {activeTab === "similar" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Episodes tab */}
        {activeTab === "episodes" && (
          <div>
            {/* Season selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none bg-card border border-border rounded-md px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  {Array.from({ length: titleData.seasons }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-5 h-5" />
                <span className="text-sm">Download</span>
              </button>
            </div>

            {/* Episodes list */}
            <div className="space-y-4">
              {currentEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={handlePlay}
                >
                  <div className="flex items-center justify-center w-8 text-2xl font-light text-muted-foreground">
                    {episode.number}
                  </div>
                  <div className="relative w-36 md:w-48 aspect-video flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={episode.thumbnail}
                      alt={episode.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">{episode.title}</h4>
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

        {/* Trailers tab */}
        {activeTab === "trailers" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {titleData.trailers.map((trailer) => (
              <div key={trailer.id} className="group cursor-pointer" onClick={handlePlay}>
                <div className="relative aspect-video rounded overflow-hidden mb-2">
                  <Image
                    src={trailer.thumbnail}
                    alt={trailer.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="font-medium">{trailer.title}</h4>
                <p className="text-sm text-muted-foreground">{trailer.duration}</p>
              </div>
            ))}
          </div>
        )}

        {/* Similar content tab */}
        {activeTab === "similar" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {titleData.moreLikeThis.map((item) => (
              <Link key={item.id} href={`/title/${item.id}`} className="group cursor-pointer">
                <div className="relative aspect-video rounded overflow-hidden mb-2">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-green-500 text-sm font-semibold">{item.match}% Match</span>
                  <span className="text-xs text-muted-foreground border border-muted-foreground px-1">
                    {item.rating}
                  </span>
                </div>
                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.year}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Cast section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6">Cast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {titleData.cast.map((member) => (
              <div key={member.id} className="text-center group cursor-pointer">
                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-sm">{member.name}</h4>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About section */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-xl font-semibold mb-6">About {titleData.title}</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <p>
                <span className="text-muted-foreground">Creators: </span>
                <span>{titleData.creators.join(", ")}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Cast: </span>
                <span>{titleData.cast.map((c) => c.name).join(", ")}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Writers: </span>
                <span>{titleData.writers.join(", ")}</span>
              </p>
            </div>
            <div className="space-y-3">
              <p>
                <span className="text-muted-foreground">Genres: </span>
                <span>{titleData.genres.join(", ")}</span>
              </p>
              <p>
                <span className="text-muted-foreground">This show is: </span>
                <span>{titleData.tags.join(", ")}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Maturity Rating: </span>
                <span className="inline-flex items-center gap-2">
                  <span className="border border-muted-foreground px-1 text-xs">
                    {titleData.maturityRating.rating}
                  </span>
                  {titleData.maturityRating.description}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        isOpen={isPlayerOpen}
        onClose={closePlayer}
        videoTitle={playingVideo?.title || titleData.title}
        videoSrc={playingVideo?.videoSrc}
        posterImage={playingVideo?.thumbnail || titleData.backgroundImage}
      />
    </main>
  )
}

export default function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  return (
    <VideoProvider>
      <TitleContent id={resolvedParams.id} />
    </VideoProvider>
  )
}
