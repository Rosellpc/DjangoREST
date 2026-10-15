"use client"

import { useEffect, useRef } from "react"
import { CalendarDays, CreditCard, RefreshCw, UserRound, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProfile } from "@/lib/profile-context"

function formatDate(value: string | null | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return "No registrada"
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(new Date(value))
}

export function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { account, accountLoading, accountError, reloadAccount } = useAuth()
  const { currentProfile } = useProfile()
  const user = account?.user
  const subscription = account?.subscription
  const fullName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username : ""
  const statuses: Record<string, string> = { active: "Activa", trial: "Prueba", past_due: "Pendiente de pago", canceled: "Cancelada" }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { dialog.close(); document.body.style.overflow = previous }
  }, [open])

  return <dialog ref={dialogRef} aria-labelledby="account-title" className="movie-dialog max-w-xl" onCancel={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="p-6 sm:p-8">
      <div className="mb-7 flex items-center justify-between gap-4"><div><p className="cinema-eyebrow text-primary">Tu espacio en StreamFlix</p><h2 id="account-title" className="mt-2 text-2xl font-semibold">Mi cuenta</h2></div><button autoFocus onClick={onClose} aria-label="Cerrar mi cuenta" className="pagination-button"><X className="size-4" /></button></div>
      {accountError && <div role="alert" className="mb-5 rounded-xl border border-primary/30 p-4 text-sm"><p>{accountError}</p><button onClick={reloadAccount} disabled={accountLoading} className="mt-3 underline underline-offset-4">Reintentar</button></div>}
      {(!account && !accountError) || accountLoading ? <p role="status" className="py-10 text-center text-sm text-muted-foreground">Cargando los datos de tu cuenta…</p> : account && <>
        <section className="rounded-xl border border-white/10 p-5">
          <div className="mb-4 flex items-center gap-3"><UserRound className="size-5 text-primary" /><h3 className="font-semibold">Titular de la cuenta</h3></div>
          <p className="break-words text-xl font-semibold">{fullName}</p><p className="mt-1 break-words text-sm text-muted-foreground">@{user?.username}</p>
          <dl className="mt-5 space-y-3 text-sm"><AccountRow label="Correo" value={user?.email || "Sin correo registrado"} /><AccountRow label="Miembro desde" value={formatDate(user?.date_joined)} /><AccountRow label="Perfil en uso" value={currentProfile?.name || "Sin perfil seleccionado"} /></dl>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 p-5">
          <div className="mb-5 flex items-center gap-3"><CreditCard className="size-5 text-primary" /><h3 className="font-semibold">Tu suscripción</h3></div>
          {subscription ? <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-2xl font-semibold">{subscription.plan.name}</p><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">{statuses[subscription.status] ?? subscription.status}</span></div>
            <dl className="space-y-3 text-sm"><AccountRow label="Fecha de inicio" value={formatDate(subscription.starts_at)} /><AccountRow label="Fecha de finalización" value={subscription.ends_at ? formatDate(subscription.ends_at) : "Sin fecha registrada"} /><AccountRow label="Perfiles incluidos" value={String(subscription.plan.max_profiles)} /><AccountRow label="Pantallas simultáneas" value={String(subscription.plan.max_concurrent_streams)} /><AccountRow label="Renovación automática" value={subscription.auto_renew ? "Activada" : "Desactivada"} /></dl>
            {subscription.payment_provider === "simulated" && <p className="mt-5 rounded-lg bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">Suscripción de demostración. No se realizan cobros ni se ha programado una próxima fecha de pago.</p>}
          </> : <p className="text-sm text-muted-foreground">Tu cuenta todavía no tiene una suscripción registrada.</p>}
        </section>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />Fechas en hora de Colombia</p><button onClick={reloadAccount} className="cinema-button-secondary"><RefreshCw className="size-3.5" />Actualizar datos</button></div>
      </>}
    </div>
  </dialog>
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-wrap justify-between gap-x-6 gap-y-1"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>
}
