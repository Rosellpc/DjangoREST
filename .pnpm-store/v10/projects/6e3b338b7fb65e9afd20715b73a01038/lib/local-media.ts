const LOCAL_POSTER_COUNT = 15

export const LOCAL_POSTERS = Array.from(
  { length: LOCAL_POSTER_COUNT },
  (_, index) => `/posters/${index + 1}.jpg`
)

const RAW_LOCAL_VIDEOS = [
  "/videos/video.mp4",
  "/videos/video (1).mp4",
  "/videos/video (2).mp4",
  "/videos/video (3).mp4",
  "/videos/video (4).mp4",
  "/videos/video (5).mp4",
  "/videos/video (6).mp4",
]

export const LOCAL_VIDEOS = RAW_LOCAL_VIDEOS.map((path) => encodeURI(path))

export function getPosterByIndex(index: number): string {
  return LOCAL_POSTERS[Math.abs(index) % LOCAL_POSTERS.length]
}

export function getVideoByIndex(index: number): string {
  return LOCAL_VIDEOS[Math.abs(index) % LOCAL_VIDEOS.length]
}
