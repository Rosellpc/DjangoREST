"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { blacklistRefreshToken, login, refreshAccessToken, register } from "@/lib/auth-api"
import { clearTokens, getAccessToken, getRefreshToken } from "@/lib/auth-tokens"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  sessionVersion: number
  error: string | null
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string, email?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionVersion, setSessionVersion] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      const access = getAccessToken()
      const refresh = getRefreshToken()

      if (access) {
        if (mounted) {
          setIsAuthenticated(true)
          setSessionVersion((current) => current + 1)
        }
      } else if (refresh) {
        const refreshed = await refreshAccessToken()
        if (mounted) {
          setIsAuthenticated(Boolean(refreshed))
          if (refreshed) setSessionVersion((current) => current + 1)
        }
      } else {
        clearTokens()
      }

      if (mounted) setIsLoading(false)
    }

    void bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null)
    try {
      await login(username, password)
      setIsAuthenticated(true)
      setSessionVersion((current) => current + 1)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not sign in."
      setError(message)
      throw caught
    }
  }, [])

  const signUp = useCallback(async (username: string, password: string, email?: string) => {
    setError(null)
    try {
      await register(username, password, email)
      setIsAuthenticated(true)
      setSessionVersion((current) => current + 1)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not create the account."
      setError(message)
      throw caught
    }
  }, [])

  const signOut = useCallback(async () => {
    await blacklistRefreshToken()
    window.localStorage.removeItem("streamflix_profile_id")
    setIsAuthenticated(false)
    setSessionVersion((current) => current + 1)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      sessionVersion,
      error,
      signIn,
      signUp,
      signOut,
    }),
    [error, isAuthenticated, isLoading, sessionVersion, signIn, signOut, signUp]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
