import type { Video } from "./video-context"

export interface MovieFilters {
  query: string
  rating: string
  duration: string
  sort: string
}

export function filterMovies<T extends Video>(videos: T[], filters: MovieFilters): T[] {
  const query = filters.query.trim().toLocaleLowerCase()
  const result = videos.filter((video) => {
    const minutes = Number.parseInt(video.duration ?? "", 10)
    return (!query || `${video.title} ${video.description ?? ""}`.toLocaleLowerCase().includes(query))
      && (filters.rating === "all" || video.rating === filters.rating)
      && (filters.duration === "all" || (Number.isFinite(minutes) &&
        (filters.duration === "short" ? minutes < 90 : filters.duration === "medium" ? minutes >= 90 && minutes <= 120 : minutes > 120)))
  })
  if (filters.sort === "title") result.sort((a, b) => a.title.localeCompare(b.title))
  if (filters.sort === "year") result.sort((a, b) => (Number.parseInt(b.year ?? "", 10) || 0) - (Number.parseInt(a.year ?? "", 10) || 0))
  if (filters.sort === "duration") result.sort((a, b) => (Number.parseInt(a.duration ?? "", 10) || 0) - (Number.parseInt(b.duration ?? "", 10) || 0))
  return result
}
