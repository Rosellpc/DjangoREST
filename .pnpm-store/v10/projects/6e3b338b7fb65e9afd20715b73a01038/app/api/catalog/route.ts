import { NextResponse } from "next/server"

export async function GET() {
  const backendBase =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000/api"

  const upstream = await fetch(`${backendBase}/movies/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
