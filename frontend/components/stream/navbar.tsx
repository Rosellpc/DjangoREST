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
import { AccountDialog } from "./account-dialog"

export function Navbar({ onSearchClick }: { onSearchClick: () => void }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { signOut, account, accountLoading, accountError } = useAuth()
  const accountName = account ? [account.user.first_name, account.user.last_name].filter(Boolean).join(" ") || account.user.username : "Mi cuenta"
  const planName = account?.subscription?.plan.name
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
    <header className="site-header sticky top-0 z-40 px-3 pt-2 sm:px-6 sm:pt-3">
      <LiquidGlass className="glass-navbar mx-auto max-w-[1344px]">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <BrandLogo />
          <nav aria-label="Principal" className="hidden items-center gap-1.5 md:flex">
            {links.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
              className={`glass-nav-link ${pathname === href ? "glass-nav-link-active" : ""}`}>
              {label}{href === "/my-list" && myList.length > 0 && <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px]">{myList.length}</span>}
            </Link>)}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button onClick={onSearchClick} aria-label="Buscar películas" className="glass-nav-link hidden md:flex"><Search className="size-5" /><span className="hidden lg:inline">Buscar</span></button>
          <span className="hidden h-6 w-px bg-white/10 md:block" aria-hidden="true" />
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Opciones de perfil" aria-expanded={menuOpen} aria-controls="profile-menu" className="flex items-center gap-2.5">
              <span className={`relative flex size-9 items-center justify-center overflow-hidden rounded-full ${color.bg} text-sm font-semibold`}>
                {currentProfile?.avatarUrl ? <Image src={currentProfile.avatarUrl} alt="" fill sizes="36px" unoptimized className="object-cover" /> : currentProfile?.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-36 text-left sm:block"><span className="block truncate text-sm">{accountName}</span><span className="block truncate text-[10px] text-white/60">{accountLoading ? "Cargando cuenta…" : accountError ? "Cuenta no disponible" : planName ? `Plan ${planName}` : "Ver mi cuenta"}</span></span><ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && <LiquidGlass id="profile-menu" className="glass-dropdown absolute right-0 top-full mt-5 w-60 p-2">
              <div className="border-b border-white/10 px-3 py-3"><p className="truncate text-sm font-semibold">{accountName}</p><p className="mt-1 text-xs text-white/60">{planName ? `Plan ${planName} · ` : ""}Perfil: {currentProfile?.name}</p></div>
              <button className="profile-menu-item mt-1" onClick={() => { setMenuOpen(false); setAccountOpen(true) }}><UserRound className="size-4" />Mi cuenta y suscripción</button>
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
    <nav aria-label="Navegación móvil" className="mobile-dock fixed inset-x-4 z-40 mx-auto max-w-xs md:hidden">
      <LiquidGlass className="p-1">
      <div className="grid grid-cols-4 gap-1">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`mobile-nav-item glass-mobile-link ${pathname === href ? "glass-nav-link-active" : ""}`}><Icon className="size-5" />{label}</Link>)}
        <button onClick={onSearchClick} className="mobile-nav-item glass-mobile-link"><Search className="size-5" />Buscar</button>
        <button onClick={() => setAccountOpen(true)} className="mobile-nav-item glass-mobile-link"><UserRound className="size-5" />Cuenta</button>
      </div>
      </LiquidGlass>
    </nav>
    <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
  </>
}
