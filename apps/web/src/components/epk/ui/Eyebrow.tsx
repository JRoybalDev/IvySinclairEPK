import type { ReactNode } from 'react'

/** Small spaced-out caps label above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${className ?? 'text-brand-primary-dark'}`}>{children}</p>
}
