import { getPosterByIndex, getVideoByIndex } from "@/lib/local-media"

export interface CatalogMovie {
  film_id: number
  title: string
  description: string | null
  release_year: number | null
  rating: string | null
  length: number | null
}

export interface CatalogPage {
  count: number
  next: string | null
  previous: string | null
  results: CatalogMovie[]
}

export interface StreamVideo {
  id: string
  title: string
  thumbnail: string
  videoSrc: string
  match: number
  year: string
  duration: string
  rating: string
  genres: string[]
  description: string
}

export async function fetchCatalog(): Promise<CatalogMovie[]> {
  const response = await fetch("/api/catalog", { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as CatalogPage
  return payload.results ?? []
}

export function toStreamVideo(movie: CatalogMovie): StreamVideo {
  const filmId = String(movie.film_id)
  const rating = movie.rating ?? "NR"
  const releaseYear = movie.release_year ? String(movie.release_year) : "N/A"
  const minutes = movie.length ?? 0
  const poster = getPosterByIndex(movie.film_id)
  const videoSrc = getVideoByIndex(movie.film_id)

  return {
    id: filmId,
    title: movie.title,
    thumbnail: poster,
    videoSrc,
    match: 80 + (movie.film_id % 20),
    year: releaseYear,
    duration: minutes > 0 ? `${minutes}m` : "N/A",
    rating,
    genres: [rating, "Catalog"],
    description: movie.description ?? "No description available.",
  }
}
