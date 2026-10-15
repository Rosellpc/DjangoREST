"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useVideo, type Video } from "@/lib/video-context"

export function ContinueWatchingRow({ videos }: { videos: (Video & { progress: number })[] }) {
  const { openPlayer } = useVideo()
  if (!videos.length) return null
  return <section aria-label="Continuar viendo"><h2 className="library-container mb-4 text-lg font-semibold sm:text-xl">Continúa donde lo dejaste</h2>
    <div className="shelf-track scrollbar-hide">{videos.map((video) => <button key={video.id} onClick={() => openPlayer(video)} className="resume-card text-left">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-card"><Image src={video.thumbnail} alt="" fill sizes="(max-width: 640px) 220px, 280px" className="object-cover" /><span className="absolute inset-0 bg-black/25" /><span className="absolute inset-0 flex items-center justify-center"><span className="flex size-10 items-center justify-center rounded-full border border-white/50 bg-black/50"><Play className="size-4 fill-current" /></span></span><div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, video.progress))}%` }} /></div></div>
      <h3 className="mt-3 truncate text-sm font-medium">{video.title}</h3><p className="mt-1 text-xs text-muted-foreground">Continuar reproducción</p>
    </button>)}</div>
  </section>
}
