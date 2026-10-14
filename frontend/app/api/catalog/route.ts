import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const backendBase =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000/api"

  const target = new URL(`${backendBase.replace(/\/$/, "")}/movies/`)
  target.search = new URL(request.url).search
  const upstream = await fetch(target, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
