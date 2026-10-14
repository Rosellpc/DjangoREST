"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { fetchCatalog, toStreamVideo, type StreamVideo } from "@/lib/catalog-api"
import { useVideo } from "@/lib/video-context"

interface LibraryState {
  catalog: StreamVideo[]
  loading: boolean
  error: string | null
  reload: () => void
}
const LibraryContext = createContext<LibraryState | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<StreamVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const { registerCatalogVideos } = useVideo()
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const movies = (await fetchCatalog()).map(toStreamVideo)
        if (cancelled) return
        setCatalog(movies)
        registerCatalogVideos(movies)
      } catch {
        if (!cancelled) setError("No pudimos cargar las películas. Inténtalo de nuevo.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [revision, registerCatalogVideos])
  return <LibraryContext.Provider value={{ catalog, loading, error, reload: () => setRevision((value) => value + 1) }}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) throw new Error("useLibrary requires LibraryProvider")
  return context
}
