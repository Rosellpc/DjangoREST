"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react"
import type { Video } from "@/lib/video-context"
import { filterMovies, type MovieFilters } from "@/lib/movie-browser"
import { MovieTile } from "./movie-tile"

const DEFAULT_FILTERS: MovieFilters = { query: "", rating: "all", duration: "all", sort: "catalog" }
const PAGE_SIZE = 24

export function MovieBrowser({ videos, savedPage = false }: { videos: Video[]; savedPage?: boolean }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const results = useMemo(() => filterMovies(videos, filters), [videos, filters])
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages)
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const ratings = [...new Set(videos.map((video) => video.rating).filter(Boolean))].sort()
  const change = (key: keyof MovieFilters, value: string) => { setFilters((previous) => ({ ...previous, [key]: value })); setPage(1) }
  const reset = () => { setFilters(DEFAULT_FILTERS); setPage(1) }
  const hasFilters = filters.query !== "" || filters.rating !== "all" || filters.duration !== "all"

  return <div>
    <div className="mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <label className="flex min-w-48 flex-1 items-center gap-3 rounded-lg bg-background/70 px-3 py-2.5"><Search className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">Buscar en {savedPage ? "My List" : "Movies"}</span><input value={filters.query} onChange={(event) => change("query", event.target.value)} placeholder="Busca una película…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        {filters.query && <button onClick={() => change("query", "")} aria-label="Borrar búsqueda"><X className="size-4 text-muted-foreground" /></button>}
      </label>
      <SlidersHorizontal className="hidden size-4 text-muted-foreground lg:block" aria-hidden="true" />
      <label className="browser-select"><span className="sr-only">Clasificación por edad</span><select value={filters.rating} onChange={(event) => change("rating", event.target.value)}><option value="all">Todas las edades</option>{ratings.map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></label>
      <label className="browser-select"><span className="sr-only">Duración</span><select value={filters.duration} onChange={(event) => change("duration", event.target.value)}><option value="all">Cualquier duración</option><option value="short">Menos de 90 min</option><option value="medium">90–120 min</option><option value="long">Más de 120 min</option></select></label>
      <label className="browser-select"><span className="sr-only">Ordenar películas</span><select value={filters.sort} onChange={(event) => change("sort", event.target.value)}><option value="catalog">{savedPage ? "Orden de guardado" : "Orden del catálogo"}</option><option value="title">Título: A–Z</option><option value="year">Año: más recientes</option><option value="duration">Duración: menor primero</option></select></label>
    </div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
      <p role="status" aria-live="polite">{results.length.toLocaleString("es-CO")} {results.length === 1 ? "película" : "películas"}{hasFilters ? " encontradas" : " disponibles"}</p>
      {hasFilters && <button onClick={reset} className="flex items-center gap-1.5 hover:text-foreground"><X className="size-3" />Limpiar filtros</button>}
    </div>
    {visible.length > 0 ? <div className="movie-grid">{visible.map((video) => <MovieTile key={video.id} video={video} savedPage={savedPage} />)}</div>
      : <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center"><Search className="mx-auto mb-4 size-8 text-muted-foreground" /><h3 className="text-xl font-semibold">No encontramos esa película</h3><p className="mt-2 text-sm text-muted-foreground">Prueba otro título o cambia los filtros.</p><button onClick={reset} className="cinema-button-secondary mt-6">Ver todas</button></div>}
    {pages > 1 && <nav aria-label="Páginas de películas" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
      <p className="text-xs text-muted-foreground">Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, results.length)} de {results.length}</p>
      <div className="flex items-center gap-4"><button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Página anterior" className="pagination-button"><ChevronLeft className="size-4" /></button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">Página <select aria-label="Ir a la página" value={currentPage} onChange={(event) => setPage(Number(event.target.value))} className="rounded-md border border-white/15 bg-card px-2 py-1.5 text-foreground">{Array.from({ length: pages }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select> de {pages}</label>
        <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === pages} aria-label="Página siguiente" className="pagination-button"><ChevronRight className="size-4" /></button></div>
    </nav>}
  </div>
}
