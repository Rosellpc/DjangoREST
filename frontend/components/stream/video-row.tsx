"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Video } from "@/lib/video-context"
import { VideoCard } from "./video-card"

export function VideoRow({ title, videos }: { title: string; videos: Video[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  if (!videos.length) return null
  const scroll = (direction: number) => scrollRef.current?.scrollBy({ left: direction * scrollRef.current.clientWidth * 0.8, behavior: "smooth" })
  return <section aria-label={title}>
    <div className="library-container mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
      <div className="flex items-center gap-3"><Link href="/movies" className="text-xs text-muted-foreground hover:text-foreground">Ver todas</Link><div className="hidden gap-2 md:flex"><button aria-label={`Anterior en ${title}`} onClick={() => scroll(-1)} className="pagination-button"><ChevronLeft className="size-4" /></button><button aria-label={`Siguiente en ${title}`} onClick={() => scroll(1)} className="pagination-button"><ChevronRight className="size-4" /></button></div></div>
    </div>
    <div ref={scrollRef} className="shelf-track scrollbar-hide">{videos.map((video) => <VideoCard key={video.id} {...video} />)}</div>
  </section>
}
