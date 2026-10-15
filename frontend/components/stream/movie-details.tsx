"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Check, Play, Plus, X } from "lucide-react"
import { useVideo, type Video } from "@/lib/video-context"
import { MovieTile } from "./movie-tile"

export function MovieDetails({ videos = [] }: { videos?: Video[] }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { selectedVideo, closeVideoModal, openPlayer, isInMyList, addToMyList, removeFromMyList, libraryError } = useVideo()
  useEffect(() => {
    const dialog = ref.current
    if (!selectedVideo || !dialog) return
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { dialog.close(); document.body.style.overflow = previousOverflow }
  }, [selectedVideo])
  const saved = selectedVideo ? isInMyList(selectedVideo.id) : false
  const suggestions = videos.filter((video) => video.id !== selectedVideo?.id).slice(0, 4)
  return <dialog ref={ref} aria-labelledby="movie-detail-title" onCancel={closeVideoModal} onClick={(event) => { if (event.target === event.currentTarget) closeVideoModal() }} className="movie-dialog movie-detail-dialog">
    {selectedVideo && <>
      <div className="detail-toolbar"><p className="cinema-eyebrow text-muted-foreground">StreamFlix · Películas</p><button autoFocus onClick={closeVideoModal} aria-label="Cerrar detalles" className="flex size-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"><X className="size-5" /></button></div>
      <div className="detail-layout">
        <div className="detail-art"><Image src={selectedVideo.thumbnail} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" /></div>
        <div className="detail-copy">
          <h2 id="movie-detail-title" className="text-balance break-words text-2xl font-semibold leading-tight sm:text-3xl">{selectedVideo.title}</h2>
          <p className="featured-metadata"><span>{selectedVideo.year}</span><span className="rounded border border-white/20 px-1.5 py-0.5">{selectedVideo.rating}</span><span>{selectedVideo.duration}</span></p>
          <div className="detail-actions"><button onClick={() => { closeVideoModal(); openPlayer(selectedVideo) }} className="cinema-button-primary"><Play className="size-4 fill-current" />Reproducir</button><button onClick={() => saved ? removeFromMyList(selectedVideo.id) : addToMyList(selectedVideo)} aria-pressed={saved} className="cinema-button-secondary">{saved ? <Check className="size-4" /> : <Plus className="size-4" />}{saved ? "Guardada en My List" : "Añadir a My List"}</button></div>
          <div className="mt-7"><h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Sinopsis</h3><p className="text-sm leading-7 text-white/80">{selectedVideo.description || "Esta película todavía no tiene una descripción disponible."}</p></div>
          {libraryError && <p role="alert" className="mt-4 text-sm text-red-300">{libraryError}</p>}
        </div>
      </div>
      {suggestions.length > 0 && <section className="detail-suggestions"><h3 className="mb-5 text-lg font-semibold">Más por descubrir</h3><div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">{suggestions.map((video) => <MovieTile key={video.id} video={video} />)}</div></section>}
    </>}
  </dialog>
}
