import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export function SiteFooter() {
  return <footer className="mt-16 border-t border-white/10 bg-black/15">
    <div className="library-container py-12 sm:py-16">
      <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr]">
        <div><BrandLogo /><p className="mt-5 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">Cine, a tu ritmo.</p><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Descubre historias, guarda tus favoritas y vuelve a ellas cuando quieras.</p></div>
        <div className="sm:justify-self-end"><p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Tu próxima historia</p>
          <nav aria-label="Enlaces del pie de página" className="flex flex-col gap-3 text-sm">
            <Link href="/" className="footer-link">Inicio<ArrowUpRight className="size-3.5" /></Link>
            <Link href="/movies" className="footer-link">Movies<ArrowUpRight className="size-3.5" /></Link>
            <Link href="/my-list" className="footer-link">My List<ArrowUpRight className="size-3.5" /></Link>
          </nav>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-muted-foreground"><p>© 2026 StreamFlix</p><p>Un espacio para disfrutar del cine.</p></div>
    </div>
  </footer>
}
