import type React from "react"
import type { Metadata } from "next"
import "@fontsource/space-grotesk/400.css"
import "@fontsource/space-grotesk/300.css"
import "@fontsource/space-grotesk/500.css"
import "@fontsource/space-grotesk/700.css"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/jetbrains-mono/700.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "StreamFlix | Cine a tu ritmo",
  description: "Descubre películas, guarda tus favoritas y disfruta de tu próxima historia en StreamFlix.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
