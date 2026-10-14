"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Check, Play, Plus, X } from "lucide-react"
import { useVideo } from "@/lib/video-context"

export function MovieDetails() {
  const ref = useRef<HTMLDialogElement>(null)
  const { selectedVideo, closeVideoModal, openPlayer, isInMyList, addToMyList, removeFromMyList } = useVideo()
  useEffect(() => {
    const dialog = ref.current
    if (!selectedVideo || !dialog) return
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { dialog.close(); document.body.style.overflow = previousOverflow }
  }, [selectedVideo])
  const saved = selectedVideo ? isInMyList(selectedVideo.id) : false
  return <dialog ref={ref} aria-labelledby="movie-detail-title" onCancel={closeVideoModal} onClick={(event) => { if (event.target === event.currentTarget) closeVideoModal() }} className="movie-dialog">
    {selectedVideo && <div className="relative grid overflow-hidden rounded-2xl bg-card sm:grid-cols-[0.8fr_1.2fr]">
      <button autoFocus onClick={closeVideoModal} aria-label="Cerrar detalles" className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white"><X className="size-4" /></button>
      <div className="relative min-h-64 sm:aspect-[2/3]"><Image src={selectedVideo.thumbnail} alt="" fill sizes="(max-width: 640px) 90vw, 320px" className="object-cover" /></div>
      <div className="flex flex-col justify-center p-6 sm:p-9"><p className="cinema-eyebrow text-primary">Movies · StreamFlix</p><h2 id="movie-detail-title" className="mt-4 text-3xl font-bold">{selectedVideo.title}</h2>
        <p className="mt-4 flex items-center gap-3 text-xs text-muted-foreground"><span>{selectedVideo.year}</span><span>{selectedVideo.duration}</span><span className="rounded border border-white/20 px-1.5 py-0.5">{selectedVideo.rating}</span></p>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{selectedVideo.description || "Esta película todavía no tiene una descripción disponible."}</p>
        <div className="mt-8 flex flex-wrap gap-3"><button onClick={() => { closeVideoModal(); openPlayer(selectedVideo) }} className="cinema-button-primary"><Play className="size-4 fill-current" />Reproducir</button>
          <button onClick={() => saved ? removeFromMyList(selectedVideo.id) : addToMyList(selectedVideo)} aria-pressed={saved} className="cinema-button-secondary">{saved ? <Check className="size-4" /> : <Plus className="size-4" />}{saved ? "En My List" : "Guardar"}</button></div>
      </div>
    </div>}
  </dialog>
}
