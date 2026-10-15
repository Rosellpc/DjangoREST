"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Info, Play, Plus } from "lucide-react"
import { useVideo, type Video } from "@/lib/video-context"

interface HeroBannerProps {
  video?: Video
  title: string
  description: string
  backgroundImage: string
  previewVideoSrc?: string
}

export function HeroBanner({ video, title, description, backgroundImage, previewVideoSrc }: HeroBannerProps) {
  const { openPlayer, openVideoModal, addToMyList, removeFromMyList, isInMyList } = useVideo()
  const [preview, setPreview] = useState(false)
  const saved = video ? isInMyList(video.id) : false
  return <section className="home-hero library-container" aria-label="Película en portada">
    <div className="featured-card">
      <div className="featured-art">
        <Image src={backgroundImage} alt="" fill priority sizes="(max-width: 768px) 95vw, 65vw" className="object-cover" />
        <div className="featured-shade" />
        {preview && previewVideoSrc && <video src={previewVideoSrc} autoPlay controls playsInline className="absolute inset-0 size-full bg-black object-contain" onEnded={() => setPreview(false)} onError={() => setPreview(false)} />}
      </div>
      <div className="featured-copy">
        <p className="cinema-eyebrow text-primary">Película en portada</p>
        <h1 className="featured-title">{title}</h1>
        {video && <p className="featured-metadata"><span>{video.year}</span><span className="rounded border border-white/20 px-1.5 py-0.5">{video.rating}</span><span>{video.duration}</span></p>}
        <p className="featured-description">{description}</p>
        <div className="featured-actions">
          <button disabled={!video} onClick={() => video && openPlayer(video)} className="cinema-button-primary"><Play className="size-4 fill-current" />Reproducir</button>
          <button disabled={!video} aria-pressed={saved} onClick={() => video && (saved ? removeFromMyList(video.id) : addToMyList(video))} className="cinema-button-secondary">{saved ? <Check className="size-4" /> : <Plus className="size-4" />}My List</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <button disabled={!video} onClick={() => video && openVideoModal(video)} className="inline-flex min-h-10 items-center gap-2 hover:text-foreground"><Info className="size-4" />Ver detalles</button>
          {previewVideoSrc && video && <button onClick={() => setPreview(!preview)} className="inline-flex min-h-10 items-center gap-2 hover:text-foreground"><Play className="size-3.5" />{preview ? "Cerrar avance" : "Ver avance"}</button>}
        </div>
      </div>
    </div>
  </section>
}
