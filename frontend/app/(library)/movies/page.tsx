import type { Metadata } from "next"
import { MoviesPage } from "@/components/stream/movies-page"

export const metadata: Metadata = { title: "Movies | StreamFlix" }
export default function Page() { return <MoviesPage /> }
