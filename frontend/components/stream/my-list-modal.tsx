"use client"

import { useEffect } from "react"
import { X, Play, Trash2 } from "lucide-react"
import Image from "next/image"
import { useVideo } from "@/lib/video-context"

interface MyListModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MyListModal({ isOpen, onClose }: MyListModalProps) {
  const { myList, removeFromMyList, openVideoModal } = useVideo()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "auto"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const handleVideoClick = (video: (typeof myList)[0]) => {
    openVideoModal(video)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-4xl bg-card rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 mt-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">My List</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {myList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Play className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add movies and TV shows to your list to watch them later. Click the + button on any
                title to add it to your list.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {myList.map((video) => (
                <div key={video.id} className="group relative">
                  <button
                    onClick={() => handleVideoClick(video)}
                    className="w-full text-left"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-medium text-sm truncate">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {video.year} • {video.genres?.join(", ")}
                    </p>
                  </button>
                  <button
                    onClick={() => removeFromMyList(video.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
