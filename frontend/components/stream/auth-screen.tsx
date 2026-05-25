"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react"

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
    <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="/videos/video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary">STREAMFLIX</p>
          <h1 className="text-5xl font-bold leading-tight">Tu catalogo conectado a Django.</h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Inicia sesion para guardar perfiles, lista personal e historial directamente en la base de datos.
          </p>
          <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Sesiones seguras con JWT
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,90,95,0.25),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(255,130,70,0.15),transparent_35%)] lg:hidden" />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">STREAMFLIX</p>
            <h1 className="mt-3 text-3xl font-bold">Bienvenido de vuelta</h1>
            <p className="mt-2 text-sm text-muted-foreground">Tu experiencia personalizada empieza aqui.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/85 p-6 shadow-2xl backdrop-blur">
            <div className="mb-2">
              <h2 className="text-xl font-semibold">{isRegistering ? "Crea tu cuenta" : "Inicia sesion"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRegistering ? "Empieza en menos de un minuto." : "Continua donde te quedaste."}
              </p>
            </div>

            <div className="mb-6 mt-5 flex rounded-xl border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-foreground outline-none transition focus:border-primary"
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
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-foreground outline-none transition focus:border-primary"
                    autoComplete="email"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-muted-foreground" htmlFor="password">
                  Contrasena
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-foreground outline-none transition focus:border-primary"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !username.trim() || !password}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
