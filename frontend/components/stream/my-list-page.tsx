"use client"

import Link from "next/link"
import { ArrowUpRight, Bookmark, Film, Plus } from "lucide-react"
import { useLibrary } from "@/lib/library-context"
import { useProfile } from "@/lib/profile-context"
import { useVideo } from "@/lib/video-context"
import { MovieBrowser } from "./movie-browser"
import { MovieGridSkeleton, MovieTile } from "./movie-tile"

export function MyListPage() {
  const { catalog, loading: catalogLoading } = useLibrary()
  const { currentProfile } = useProfile()
  const { myList, libraryLoading, libraryError, reloadLibrary } = useVideo()
  return <div className="library-container pt-12 sm:pt-16">
    <section className="relative mb-10 overflow-hidden border-b border-white/10 pb-10">
      <Bookmark className="pointer-events-none absolute -right-6 -top-8 size-64 rotate-12 text-white/[0.025] sm:right-10" strokeWidth={0.75} aria-hidden="true" />
      <p className="cinema-eyebrow"><span className="size-1.5 rounded-full bg-primary" />La colección de {currentProfile?.name}</p>
      <div className="relative mt-5 flex flex-wrap items-end justify-between gap-6">
        <div><h1 className="text-5xl font-bold tracking-[-0.05em] sm:text-7xl">My List<span className="text-primary">.</span></h1><p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">Esas historias que no quieres perder de vista. Todas tus películas guardadas, en un solo lugar.</p></div>
        <Link href="/movies" className="cinema-button-secondary"><Plus className="size-4" />Descubrir películas<ArrowUpRight className="size-4" /></Link>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Bookmark className="size-3.5 text-primary" />{libraryLoading ? "Cargando tu colección…" : `${myList.length} ${myList.length === 1 ? "película guardada" : "películas guardadas"}`}</p>
    </section>
    {libraryError && <div role="alert" className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5"><p className="text-sm">{libraryError}</p><button onClick={reloadLibrary} className="mt-3 text-sm font-semibold underline underline-offset-4">Volver a sincronizar</button></div>}
    {libraryLoading || (catalogLoading && myList.length > 0) ? <MovieGridSkeleton /> : myList.length > 0 ? <MovieBrowser videos={myList} savedPage /> : !libraryError && <>
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-16 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5"><Bookmark className="size-7 text-primary" strokeWidth={1.5} /></div>
        <p className="cinema-eyebrow text-muted-foreground">Tu próxima noche de cine empieza aquí</p><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Haz espacio para tus favoritas.</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Pulsa + en una película para guardarla. Cuando quieras verla, te estará esperando en My List.</p>
        <Link href="/movies" className="cinema-button-primary mt-7"><Film className="size-4" />Explorar Movies<ArrowUpRight className="size-4" /></Link>
      </section>
      {!catalogLoading && catalog.length > 0 && <section className="mt-12"><div className="mb-6 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Un punto de partida</h2><Link href="/movies" className="text-xs text-muted-foreground hover:text-foreground">Ver catálogo →</Link></div><div className="movie-grid">{catalog.slice(0, 6).map((video) => <MovieTile key={video.id} video={video} />)}</div></section>}
    </>}
  </div>
}
