"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { Loader2, LogIn, UserPlus } from "lucide-react"

import { useAuth } from "@/lib/auth-context"

type Mode = "login" | "register"

export function AuthScreen() {
  const { error, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>("login")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegistering = mode === "register"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim() || !password) return

    setIsSubmitting(true)
    try {
      if (isRegistering) {
        await signUp(username.trim(), password, email.trim() || undefined)
      } else {
        await signIn(username.trim(), password)
      }
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="/videos/video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary">STREAMFLIX</p>
          <h1 className="text-5xl font-bold leading-tight">Tu catálogo conectado a Django.</h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Inicia sesión para guardar perfiles, lista personal e historial directamente en la base de datos.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">STREAMFLIX</p>
            <h1 className="mt-3 text-3xl font-bold">Entra a tu cuenta</h1>
          </div>

          <div className="rounded-lg border border-border bg-card/80 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 flex rounded-md border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Registro
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground" htmlFor="username">
                  Usuario
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-muted/40 px-3 text-foreground outline-none transition focus:border-primary"
                  autoComplete="username"
                />
              </div>

              {isRegistering && (
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 w-full rounded-md border border-border bg-muted/40 px-3 text-foreground outline-none transition focus:border-primary"
                    autoComplete="email"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-muted-foreground" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-muted/40 px-3 text-foreground outline-none transition focus:border-primary"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !username.trim() || !password}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRegistering ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isRegistering ? "Crear cuenta" : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
