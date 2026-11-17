import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { animate, cubicBezier, easeInOut, useReducedMotion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

// The old page accelerates out and the new one decelerates in, with matching speed where they meet (both curves
// have slope 2 at the join), so it reads as one continuous sweep instead of stopping between pages.
const easeIn = cubicBezier(0.5, 0, 0.75, 0.5)
const easeOut = cubicBezier(0.25, 0.5, 0.5, 1)
const SLIDE_S = 0.45
// Longest the slide-in waits for a held section's images (the hero photo) to be ready to draw.
const IMAGE_WAIT_MS = 500

/** 1 = the right edge, -1 = the left edge. */
type Side = 1 | -1

/** Resolves after the next paint, so the new page is rendered before it slides in. */
const afterPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

/**
 * Positions the page at `offset` page-widths from its resting place (0 = on screen, ±1 = off an edge) at the given
 * opacity. Sections marked data-transition-hold are shifted back by the same amount, so they stay in place and only fade.
 */
function placePage(page: HTMLElement, holds: HTMLElement[], offset: number, opacity: number) {
  const x = offset * page.offsetWidth
  page.style.transform = `translateX(${x}px)`
  page.style.opacity = String(opacity)
  for (const hold of holds) hold.style.transform = `translateX(${-x}px)`
}

/**
 * Animates the page between two offsets (see placePage). Movement follows `ease`, but the fade runs evenly over the
 * whole slide (ease-in-out in time), so held sections like the hero visibly fade rather than popping at one end.
 */
function slidePage(page: HTMLElement, from: number, to: number, ease: (t: number) => number) {
  const holds = Array.from(page.querySelectorAll<HTMLElement>('[data-transition-hold]'))
  const fadingIn = to === 0
  const frame = (t: number) => {
    const fade = easeInOut(t)
    placePage(page, holds, from + (to - from) * ease(t), fadingIn ? fade : 1 - fade)
  }
  frame(0)
  return animate(0, 1, { duration: SLIDE_S, ease: 'linear', onUpdate: frame })
}

/** Resolves once the held sections' images are loaded and decoded (or after IMAGE_WAIT_MS), so the hero fades in whole. */
function heldImagesReady(holds: HTMLElement[]) {
  const images = holds.flatMap((hold) => Array.from(hold.querySelectorAll('img')))
  const ready = Promise.all(images.map((image) => image.decode().catch(() => undefined)))
  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS))])
}

/** Returns the page and its held sections to normal flow, so no transform is left behind. */
function resetPage(page: HTMLElement) {
  page.style.transform = ''
  page.style.opacity = ''
  page.removeAttribute('data-page-sliding')
  for (const hold of page.querySelectorAll<HTMLElement>('[data-transition-hold]')) hold.style.transform = ''
}

/**
 * Where a path sits in the page order: its own position, just after its parent for nested pages
 * (e.g. /merch/:slug after /merch), or after every listed page for anything else (legal pages, 404).
 */
function pageRank(order: readonly string[], path: string) {
  const own = order.indexOf(path)
  if (own >= 0) return own
  const parent = order.findIndex((listed) => listed !== '/' && path.startsWith(`${listed}/`))
  return parent >= 0 ? parent + 0.5 : order.length
}

/**
 * Slides the page itself between routes. Clicks on internal links are intercepted: the current page slides and fades
 * off one edge, the route changes while it's off screen, then the new page slides and fades in from the opposite edge.
 * The direction follows `order` (the nav order): moving to a later page travels right-to-left, like turning
 * forward; moving to an earlier one travels left-to-right.
 * Back/forward and programmatic navigations have already swapped the page, so they only play the slide-in.
 *
 * Wraps the page content (not the header, which stays put). The transform is cleared between transitions so
 * fixed-position children like the mini cart aren't trapped inside it.
 *
 * Photo heroes carry data-transition-hold: they stay put and fade in place while the rest of the page slides,
 * so their edges never travel across the screen.
 *
 * While sliding, the wrapper carries data-page-sliding: edge-to-edge sections marked data-bleed extend their
 * background past the screen edges (see index.css), so the color goes only when the section does.
 *
 * With `media` set, it only runs while that query matches; otherwise pages swap instantly.
 *
 * Links opt out with a data-no-transition attribute. Same-page links (#hash) and new-tab clicks are left alone.
 */
type PageTransitionProps = {
  children: ReactNode
  /** Page paths in nav order; sets the slide direction. */
  order: readonly string[]
  /** Media query the slide runs under (e.g. desktop widths). Outside it, pages swap instantly. */
  media?: string
}

export function PageTransition({ children, order, media }: PageTransitionProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  // busy: a transition is running. away: the old page has slid off, waiting for the route change.
  const busy = useRef(false)
  const away = useRef(false)
  const prevPath = useRef(pathname)
  // The edge the new page enters from.
  const entrySide = useRef<Side>(1)

  /** Starts a transition: a later page enters from the right (moving right-to-left), an earlier one from the left. */
  const begin = (from: string, to: string) => {
    busy.current = true
    entrySide.current = pageRank(order, to) >= pageRank(order, from) ? 1 : -1
  }

  // Slide the current page out, then navigate.
  useEffect(() => {
    if (reduceMotion) return

    const onClick = async (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download') || anchor.hasAttribute('data-no-transition')) return

      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (media && !window.matchMedia(media).matches) return

      // Runs in the capture phase, so React Router's <Link> sees defaultPrevented and leaves navigation to us.
      // The link's own onClick (e.g. closing the mobile menu) still runs.
      event.preventDefault()
      const page = pageRef.current
      if (busy.current || !page) return
      begin(window.location.pathname, url.pathname)
      page.setAttribute('data-page-sliding', '')

      // Leave through the edge opposite the one the new page will enter from.
      await slidePage(page, 0, entrySide.current === 1 ? -1 : 1, easeIn)
      away.current = true
      navigate(url.pathname + url.search + url.hash)
    }

    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- begin only reads `order`, listed below
  }, [media, navigate, order, reduceMotion])

  // Slide the new page in. A layout effect, so the page is moved off screen before the browser paints it.
  useLayoutEffect(() => {
    const from = prevPath.current
    if (from === pathname) return
    prevPath.current = pathname
    const page = pageRef.current
    if (reduceMotion || !page) return
    // Outside `media` (and with no slide-out already under way), the page just swaps.
    if (media && !window.matchMedia(media).matches && !away.current) return
    // A slide-in is already running (e.g. a <Navigate> redirect right after the route change): it will show this page.
    if (busy.current && !away.current) return

    // Back/forward or navigate() from code: no slide-out happened, so start a new transition here.
    if (!away.current) begin(from, pathname)
    away.current = false
    page.setAttribute('data-page-sliding', '')
    // Gather the new page's held sections now, before paint, so the hero never shows in the wrong place.
    const holds = Array.from(page.querySelectorAll<HTMLElement>('[data-transition-hold]'))
    placePage(page, holds, entrySide.current, 0)

    void (async () => {
      await Promise.all([afterPaint(), heldImagesReady(holds)])
      await slidePage(page, entrySide.current, 0, easeOut)
      resetPage(page)
      busy.current = false
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only route changes should start a slide-in
  }, [pathname])

  return <div ref={pageRef}>{children}</div>
}
