"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, ChevronDown, Film, LogOut, Pencil, Search, UserRound, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useVideo } from "@/lib/video-context"
import { useProfile, AVATAR_COLORS } from "@/lib/profile-context"
import { BrandLogo } from "@/components/brand-logo"
import { LiquidGlass } from "@/components/ui/liquid-glass"

export function Navbar({ onSearchClick }: { onSearchClick: () => void }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { signOut } = useAuth()
  const { myList } = useVideo()
  const { currentProfile, profiles, switchProfile, setEditingProfile, setShowManageProfiles } = useProfile()
  const color = AVATAR_COLORS[Math.max(0, profiles.findIndex((profile) => profile.id === currentProfile?.id)) % AVATAR_COLORS.length]
  const links = [{ href: "/movies", label: "Movies", icon: Film }, { href: "/my-list", label: "My List", icon: Bookmark }]
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false) }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", escape)
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape) }
  }, [])
  return <>
    <header className={`${pathname === "/" ? "fixed inset-x-0" : "sticky"} top-3 z-40 px-3 sm:px-6`}>
      <LiquidGlass className="glass-navbar mx-auto max-w-[1344px]">
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-12">
          <BrandLogo />
          <nav aria-label="Principal" className="hidden items-center gap-1.5 md:flex">
            {links.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
              className={`glass-nav-link ${pathname === href ? "glass-nav-link-active" : ""}`}>
              {label}{href === "/my-list" && myList.length > 0 && <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px]">{myList.length}</span>}
            </Link>)}
          </nav>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={onSearchClick} aria-label="Buscar películas" className="glass-nav-link"><Search className="size-5" /><span className="hidden lg:inline">Buscar</span></button>
          <span className="h-6 w-px bg-white/10" aria-hidden="true" />
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Opciones de perfil" aria-expanded={menuOpen} aria-controls="profile-menu" className="flex items-center gap-2.5">
              <span className={`relative flex size-9 items-center justify-center overflow-hidden rounded-full ${color.bg} text-sm font-semibold`}>
                {currentProfile?.avatarUrl ? <Image src={currentProfile.avatarUrl} alt="" fill sizes="36px" className="object-cover" /> : currentProfile?.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-sm sm:inline">{currentProfile?.name}</span><ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && <LiquidGlass id="profile-menu" className="glass-dropdown absolute right-0 top-full mt-5 w-60 p-2">
              <p className="px-3 py-2 text-xs text-muted-foreground">Tu espacio de cine</p>
              <button className="profile-menu-item" onClick={() => { setMenuOpen(false); switchProfile() }}><Users className="size-4" />Cambiar perfil</button>
              <button className="profile-menu-item" onClick={() => { setMenuOpen(false); setEditingProfile(currentProfile); setShowManageProfiles(true) }}><Pencil className="size-4" />Editar perfil</button>
              <div className="my-2 border-t border-white/10" />
              <button className="profile-menu-item text-primary" onClick={() => { setMenuOpen(false); void signOut() }}><LogOut className="size-4" />Cerrar sesión</button>
            </LiquidGlass>}
          </div>
        </div>
      </div>
      </LiquidGlass>
    </header>
    <nav aria-label="Navegación móvil" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm md:hidden">
      <LiquidGlass className="p-2">
      <div className="grid grid-cols-4 gap-1">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`mobile-nav-item glass-mobile-link ${pathname === href ? "glass-nav-link-active" : ""}`}><Icon className="size-5" />{label}</Link>)}
        <button onClick={onSearchClick} className="mobile-nav-item glass-mobile-link"><Search className="size-5" />Buscar</button>
        <button onClick={switchProfile} className="mobile-nav-item glass-mobile-link"><UserRound className="size-5" />Perfil</button>
      </div>
      </LiquidGlass>
    </nav>
  </>
}
