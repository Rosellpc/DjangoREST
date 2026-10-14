"use client"

import Image from "next/image"
import { Check, Info, Play, Plus, Trash2 } from "lucide-react"
import { useVideo, type Video } from "@/lib/video-context"

export function MovieTile({ video, savedPage = false }: { video: Video; savedPage?: boolean }) {
  const { openVideoModal, openPlayer, addToMyList, removeFromMyList, isInMyList } = useVideo()
  const saved = isInMyList(video.id)
  return <article className="movie-tile group min-w-0">
    <div className="relative">
      <button onClick={() => openVideoModal(video)} aria-label={`Ver detalles de ${video.title}`} className="relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-card text-left ring-1 ring-white/8">
        <Image src={video.thumbnail} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><Info className="size-3.5" />Ver detalles</span>
      </button>
      {saved && <span className="pointer-events-none absolute left-3 top-3 flex size-7 items-center justify-center rounded-full bg-primary text-white" aria-label="En My List"><Check className="size-4" /></span>}
      <button onClick={() => saved ? removeFromMyList(video.id) : addToMyList(video)}
        aria-label={`${saved ? "Quitar" : "Guardar"} ${video.title} ${saved ? "de" : "en"} My List`} aria-pressed={saved}
        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white backdrop-blur transition-colors hover:bg-primary">
        {savedPage ? <Trash2 className="size-4" /> : saved ? <Check className="size-4" /> : <Plus className="size-4" />}
      </button>
    </div>
    <div className="mt-3 flex items-start justify-between gap-2">
      <div className="min-w-0"><button onClick={() => openVideoModal(video)} className="block max-w-full truncate text-left text-sm font-semibold hover:text-primary" title={video.title}>{video.title}</button>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span>{video.year}</span><span aria-hidden="true">·</span><span>{video.duration}</span><span className="rounded border border-white/15 px-1.5 py-0.5 text-[9px]">{video.rating}</span></p>
      </div>
      <button onClick={() => openPlayer(video)} aria-label={`Reproducir ${video.title}`} className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Play className="size-3 fill-current" /></button>
    </div>
  </article>
}

export function MovieGridSkeleton() {
  return <div className="movie-grid" role="status" aria-label="Cargando películas">
    {Array.from({ length: 12 }, (_, index) => <div key={index} aria-hidden="true" className="animate-pulse"><div className="aspect-[2/3] rounded-xl bg-white/5" /><div className="mt-3 h-3 w-3/4 rounded bg-white/5" /><div className="mt-2 h-2 w-1/2 rounded bg-white/5" /></div>)}
  </div>
}
