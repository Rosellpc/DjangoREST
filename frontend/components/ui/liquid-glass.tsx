import type { ComponentPropsWithoutRef } from "react"

/** A translucent surface with CSS reflections and a solid fallback. */
export function LiquidGlass({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={`liquid-glass ${className}`} {...props} />
}
