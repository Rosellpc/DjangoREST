"use client"

import { cn } from "@/lib/utils"

// Base skeleton with shimmer animation
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
    />
  )
}

// Video card skeleton
export function VideoCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] md:w-[200px] lg:w-[240px]">
      <Skeleton className="aspect-video rounded mb-2" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

// Video row skeleton
export function VideoRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mb-8">
      <Skeleton className="h-6 w-40 mb-4 mx-4 md:mx-12" />
      <div className="flex gap-2 overflow-hidden px-4 md:px-12">
        {Array.from({ length: count }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Top 10 card skeleton
export function Top10CardSkeleton({ rank }: { rank: number }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="flex items-end">
        <div className="relative w-[80px] md:w-[100px] h-[140px] md:h-[180px] flex-shrink-0">
          <span
            className="absolute -right-4 bottom-0 text-[140px] md:text-[180px] font-black leading-none select-none text-muted/50"
            style={{
              fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
            }}
          >
            {rank}
          </span>
        </div>
        <Skeleton className="w-[100px] md:w-[130px] h-[140px] md:h-[180px] -ml-4" />
      </div>
    </div>
  )
}

// Top 10 row skeleton
export function Top10RowSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 px-4 md:px-12">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex gap-6 overflow-hidden px-4 md:px-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <Top10CardSkeleton key={i} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}

// Continue watching card skeleton
export function ContinueWatchingCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] md:w-[280px]">
      <div className="relative">
        <Skeleton className="aspect-video rounded" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <Skeleton className="h-full w-1/2" />
        </div>
      </div>
      <div className="mt-2">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Continue watching row skeleton
export function ContinueWatchingRowSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-6 w-48 mb-4 mx-4 md:mx-12" />
      <div className="flex gap-3 overflow-hidden px-4 md:px-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <ContinueWatchingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Hero banner skeleton
export function HeroBannerSkeleton() {
  return (
    <div className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-muted">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 pb-32 md:pb-48 px-4 md:px-12">
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full max-w-md" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Full page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-12 py-4 bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Skeleton className="h-8 w-32" />
            <div className="hidden md:flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>

      <HeroBannerSkeleton />
      
      <div className="-mt-32 relative z-10 space-y-2">
        <ContinueWatchingRowSkeleton />
        <Top10RowSkeleton />
        <VideoRowSkeleton />
        <VideoRowSkeleton />
      </div>
    </div>
  )
}

// Profile card skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

// Profile selector skeleton
export function ProfileSelectorSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-10 w-40" />
    </div>
  )
}

// Episode card skeleton
export function EpisodeCardSkeleton() {
  return (
    <div className="flex gap-4 p-4">
      <Skeleton className="w-8 h-8" />
      <Skeleton className="w-36 md:w-48 aspect-video flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
