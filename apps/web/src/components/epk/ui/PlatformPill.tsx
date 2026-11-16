import type { PlatformLink } from '../../../content/schema'
import { platformInfo } from './platforms'

type PlatformPillProps = {
  link: PlatformLink
  surface?: 'light' | 'dark'
}

/** Rounded streaming link with the platform's brand-colored icon. */
export function PlatformPill({ link, surface = 'light' }: PlatformPillProps) {
  const { label, Icon, color } = platformInfo[link.platform]
  const look = surface === 'dark'
    ? 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20'
    : 'border-brand-secondary/15 bg-white/60 text-brand-secondary hover:bg-white/90'

  return (
    <a
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-colors ${look}`}
      href={link.url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
        <Icon aria-hidden className="h-4 w-4" style={{ color }} />
      </span>
      {link.label ?? label}
    </a>
  )
}
