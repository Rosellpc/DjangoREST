import type { Metadata } from "next"
import { MyListPage } from "@/components/stream/my-list-page"

export const metadata: Metadata = { title: "My List | StreamFlix" }
export default function Page() { return <MyListPage /> }
