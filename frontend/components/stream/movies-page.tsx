"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUpRight, Check, Film, Info, Play, Plus } from "lucide-react"
import { useLibrary } from "@/lib/library-context"
import { useVideo } from "@/lib/video-context"
import { MovieBrowser } from "./movie-browser"
import { MovieGridSkeleton } from "./movie-tile"

export function MoviesPage() {
  const { catalog, loading, error, reload } = useLibrary()
  const { openPlayer, openVideoModal, addToMyList, removeFromMyList, isInMyList, continueWatching, libraryError } = useVideo()
  const featured = catalog[0]
  const saved = featured ? isInMyList(featured.id) : false
  return <>
    <section className="library-container relative overflow-hidden pb-12 pt-12 sm:pt-16">
      <div className="movie-hero-glow" aria-hidden="true" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="max-w-xl">
          <p className="cinema-eyebrow"><span className="size-1.5 rounded-full bg-primary" />Cine para cada momento</p>
          <h1 className="mt-5 text-6xl font-bold tracking-[-0.06em] sm:text-8xl">Movies<span className="text-primary">.</span></h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">Encuentra tu próxima gran historia. Explora el catálogo, guarda tus favoritas y disfruta a tu ritmo.</p>
          {featured && <div className="mt-9 border-l-2 border-primary pl-5">
            <p className="cinema-eyebrow text-muted-foreground">En portada</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{featured.title}</h2>
            <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground"><span>{featured.year}</span><span>{featured.duration}</span><span className="rounded border border-white/20 px-1.5 py-0.5">{featured.rating}</span></p>
            <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-muted-foreground">{featured.description}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button onClick={() => openPlayer(featured)} className="cinema-button-primary"><Play className="size-4 fill-current" />Reproducir</button>
              <button onClick={() => openVideoModal(featured)} className="cinema-button-secondary"><Info className="size-4" />Detalles</button>
              <button onClick={() => saved ? removeFromMyList(featured.id) : addToMyList(featured)} aria-pressed={saved} aria-label={saved ? "Quitar película destacada de My List" : "Guardar película destacada en My List"} className="cinema-button-secondary px-3">{saved ? <Check className="size-4" /> : <Plus className="size-4" />}</button>
            </div>
          </div>}
          {!featured && <a href="#movie-catalog" className="cinema-button-secondary mt-8"><ArrowDown className="size-4" />Explorar películas</a>}
        </div>
        <div className="poster-stage relative mx-auto hidden h-[420px] w-full max-w-lg sm:block" aria-hidden="true">
          {catalog.slice(0, 3).map((movie, index) => <div key={movie.id} className={`hero-poster hero-poster-${index}`}><Image src={movie.thumbnail} alt="" fill priority={index === 0} sizes="240px" className="object-cover" /></div>)}
          {loading && <div className="absolute inset-10 animate-pulse rounded-2xl bg-white/5" />}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
      <div className="relative mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-muted-foreground">
        <p className="flex items-center gap-2"><Film className="size-4 text-primary" />{loading ? "Preparando tu selección…" : `${catalog.length.toLocaleString("es-CO")} películas por descubrir`}</p>
        <a href="#movie-catalog" className="flex items-center gap-2 hover:text-foreground">Explorar catálogo<ArrowDown className="size-3.5" /></a>
      </div>
    </section>
    {continueWatching.length > 0 && <section className="library-container mb-12">
      <div className="mb-5 flex items-end justify-between"><div><p className="cinema-eyebrow text-muted-foreground">Tu sesión continúa</p><h2 className="mt-2 text-xl font-semibold">Donde lo dejaste</h2></div><Link href="/my-list" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">My List<ArrowUpRight className="size-4" /></Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{continueWatching.slice(0, 3).map((video) => <button key={video.id} onClick={() => openPlayer(video)} className="group relative overflow-hidden rounded-xl border border-white/10 bg-card text-left">
        <div className="relative aspect-[2.5/1]"><Image src={video.thumbnail} alt="" fill sizes="(max-width: 640px) 90vw, 30vw" className="object-cover opacity-50 transition-opacity group-hover:opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" /><div className="absolute inset-0 flex items-center gap-4 px-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30"><Play className="size-4 fill-current" /></span><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{video.title}</h3><p className="mt-1 text-xs text-white/60">Continuar viendo</p></div></div></div>
      </button>)}</div>
    </section>}
    <section id="movie-catalog" className="library-container scroll-mt-28">
      <div className="mb-7"><p className="cinema-eyebrow text-muted-foreground">La siguiente historia te espera</p><h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Todas las películas</h2></div>
      {libraryError && <p role="alert" className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">{libraryError}</p>}
      {error ? <div role="alert" className="rounded-xl border border-primary/30 p-6"><p>{error}</p><button onClick={reload} className="cinema-button-secondary mt-4">Reintentar</button></div> : loading ? <MovieGridSkeleton /> : <MovieBrowser videos={catalog} />}
    </section>
  </>
}
