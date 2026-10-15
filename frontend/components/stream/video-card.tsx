"use client"

import Image from "next/image"
import { Check, Plus } from "lucide-react"
import { useVideo, type Video } from "@/lib/video-context"

export function VideoCard(video: Video) {
  const { openVideoModal, addToMyList, removeFromMyList, isInMyList } = useVideo()
  const saved = isInMyList(video.id)
  return <article className="shelf-card group">
    <div className="relative">
      <button onClick={() => openVideoModal(video)} aria-label={`Ver detalles de ${video.title}`} className="relative block aspect-[2/3] w-full overflow-hidden rounded-lg bg-card">
        <Image src={video.thumbnail} alt="" fill sizes="(max-width: 640px) 130px, (max-width: 1024px) 160px, 185px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      </button>
      <button aria-label={`${saved ? "Quitar" : "Guardar"} ${video.title} ${saved ? "de" : "en"} My List`} aria-pressed={saved} onClick={() => saved ? removeFromMyList(video.id) : addToMyList(video)} className="absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/75 text-white">{saved ? <Check className="size-4" /> : <Plus className="size-4" />}</button>
    </div>
    <button onClick={() => openVideoModal(video)} className="mt-3 block w-full truncate text-left text-xs font-medium sm:text-sm" title={video.title}>{video.title}</button>
    <p className="mt-1 text-[11px] text-muted-foreground">{video.year}<span className="mx-2">·</span>{video.duration}</p>
  </article>
}
