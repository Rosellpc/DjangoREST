import { NextRequest, NextResponse } from "next/server"

const backendBase =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000/api"

async function proxy(request: NextRequest, path: string[]) {
  const url = new URL(request.url)
  const normalizedBase = backendBase.replace(/\/$/, "")
  const joinedPath = path.join("/")
  const djangoPath = joinedPath.endsWith("/") ? joinedPath : `${joinedPath}/`
  const target = `${normalizedBase}/${djangoPath}${url.search}`

  const headers = new Headers()
  const authorization = request.headers.get("authorization")
  if (authorization) headers.set("authorization", authorization)
  headers.set("accept", "application/json")

  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  const method = request.method.toUpperCase()
  const init: RequestInit = { method, headers }

  if (!["GET", "HEAD"].includes(method)) {
    init.body = await request.text()
  }

  const upstream = await fetch(target, init)
  const text = await upstream.text()

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(request, path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(request, path)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(request, path)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(request, path)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxy(request, path)
}
