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

let cachedCatalog: { movies: CatalogMovie[]; expires: number } | null = null
let pendingCatalog: Promise<CatalogMovie[]> | null = null
const subscribers = new Set<(movies: CatalogMovie[]) => void>()

async function loadCatalog(): Promise<CatalogMovie[]> {
  async function page(number: number): Promise<CatalogPage> {
    const response = await fetch(`/api/catalog?page=${number}&page_size=200`)
    if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}`)
    return response.json()
  }
  const first = await page(1)
  const movies = [...first.results]
  const publish = () => subscribers.forEach((subscriber) => subscriber([...movies]))
  publish()
  // Use the actual page size so rolling deployments also work with the old API.
  const pages = first.next && first.results.length ? Math.ceil(first.count / first.results.length) : 1
  for (let next = 2; next <= pages; next += 2) {
    const batch = await Promise.all(Array.from({ length: Math.min(2, pages - next + 1) }, (_, index) => page(next + index)))
    batch.forEach((payload) => movies.push(...payload.results))
    publish()
  }
  cachedCatalog = { movies, expires: Date.now() + 300_000 }
  return movies
}

export async function fetchCatalog(onProgress?: (movies: CatalogMovie[]) => void): Promise<CatalogMovie[]> {
  if (cachedCatalog && cachedCatalog.expires > Date.now()) {
    onProgress?.(cachedCatalog.movies)
    return cachedCatalog.movies
  }
  if (onProgress) subscribers.add(onProgress)
  try {
    if (!pendingCatalog) pendingCatalog = loadCatalog().finally(() => { pendingCatalog = null })
    return await pendingCatalog
  } finally {
    if (onProgress) subscribers.delete(onProgress)
  }
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
