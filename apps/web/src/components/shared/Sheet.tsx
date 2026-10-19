// Shared component: portable between projects. See ./README.md for the rules.
// Requires: react

import { useEffect, useRef, type ReactNode } from 'react'

type SheetSide = 'top' | 'bottom'

const sidePanelClasses: Record<SheetSide, { position: string; closed: string; look: string }> = {
  top: { position: 'top-0', closed: '-translate-y-full', look: 'rounded-b-2xl' },
  bottom: { position: 'bottom-0', closed: 'translate-y-full', look: 'rounded-t-2xl' },
}

type SheetProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Edge of the viewport the panel slides in from. */
  side?: SheetSide
  /**
   * Distance from `side` where the panel's track starts, e.g. a header's height.
   * The panel is clipped to that track, so it slides out from under the header
   * instead of passing behind it. Numbers are pixels.
   */
  offset?: number | string
  /** Put this on the panel and point the toggle's `aria-controls` at it. */
  id?: string
  /** Panel styles. Replaces the default look; positioning and the slide transition are always kept. */
  className?: string
  /** Backdrop styles. Replaces the default dimmed overlay. */
  backdropClassName?: string
  /** Extra classes on the fixed wrapper, e.g. `lg:hidden` or a z-index. */
  rootClassName?: string
}

/**
 * A panel that slides in from the top or bottom edge of the viewport over a backdrop.
 * Closes on Escape or a backdrop click, locks page scroll while open, and is
 * `inert` while closed so its contents can't be tabbed to. It is a disclosure,
 * not a modal: the toggle that opens it stays usable, so render the toggle
 * above the backdrop (it uses z-40 by default) if it should close the sheet too.
 */
export function Sheet({
  open,
  onClose,
  children,
  side = 'bottom',
  offset = 0,
  id,
  className,
  backdropClassName = 'bg-black/40',
  rootClassName = 'z-40',
}: SheetProps) {
  const panelClasses = sidePanelClasses[side]
  const panelLook = className ?? `${panelClasses.look} bg-white p-6 pb-10 shadow-2xl`
  const panelRef = useRef<HTMLDivElement>(null)
  // Keep the latest onClose without re-running the open/close effect when it changes identity.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return

    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      // The panel is about to become inert; don't strand focus inside it.
      if (panel.contains(document.activeElement)) returnFocusTo?.focus()
    }
  }, [open])

  return (
    <div className={`fixed inset-0 ${open ? '' : 'pointer-events-none'} ${rootClassName}`} inert={!open}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'} ${backdropClassName}`}
        onClick={onClose}
      />
      {/* The track starts at `offset` and clips the panel, so it never slides over what's above it. */}
      <div
        className="pointer-events-none absolute inset-x-0 overflow-hidden"
        style={side === 'top' ? { top: offset, bottom: 0 } : { top: 0, bottom: offset }}
      >
        <div
          className={`pointer-events-auto absolute inset-x-0 ${panelClasses.position} max-h-[85%] overflow-y-auto transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? 'translate-y-0' : panelClasses.closed} ${panelLook}`}
          id={id}
          ref={panelRef}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
