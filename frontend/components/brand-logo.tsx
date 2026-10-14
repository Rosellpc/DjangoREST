import Link from "next/link"

export function BrandLogo({ className = "" }: { className?: string }) {
  return <Link href="/" aria-label="StreamFlix, página principal" className={`brand-logo ${className}`}>
    <span className="brand-wordmark">STREAMFLIX</span>
  </Link>
}
