import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { HiBars3, HiXMark } from 'react-icons/hi2'
import { Sheet } from '../components/shared/Sheet'
import { SiteFooter } from '../components/epk/SiteFooter'
import { CtaButton } from '../components/epk/ui/CtaButton'
import { socialIcons } from '../components/epk/ui/platforms'
import { epk } from '../content'
import { useEPKMeta } from '../hooks/useEPKMeta'
import { getTotals, useCart } from '../store/cart'
import { getEPKBrandingStyle } from '../utils/brandingTheme'
import type { EPK } from '../content/schema'

const navLabels = {
  home: 'Home',
  music: 'Music',
  videos: 'Videos',
  shop: 'Merch',
  tour: 'Tour',
  vip: 'VIP',
  about: 'About Me',
  newsletter: 'Newsletter',
  contact: 'Contact',
} as const

const navPaths = {
  home: '/',
  music: '/music',
  videos: '/videos',
  shop: '/merch',
  tour: '/tour',
  vip: '/vip',
  about: '/about',
  newsletter: '/newsletter',
} as const

const pageLabelsByPath = {
  '/': 'Home',
  '/music': 'Music',
  '/videos': 'Videos',
  '/merch': 'Merch',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/confirmation': 'Order Confirmed',
  '/tour': 'Tour',
  '/vip': 'VIP',
  '/about': 'About',
  '/newsletter': 'Newsletter',
} as const

const getPageLabel = (pathname: string) =>
  pageLabelsByPath[pathname as keyof typeof pageLabelsByPath] ??
  (pathname.startsWith('/merch/') ? 'Merch' : 'Page')

const isConfiguredNavItem = (epk: EPK, item: EPK['nav'][number]) => {
  switch (item) {
    case 'vip':
      return Boolean(epk.vip)
    case 'shop':
      return Boolean(epk.shop)
    case 'contact':
      return Boolean(epk.contact.bookingEmail)
    default:
      return true
  }
}

const getExternalNavUrl = (epk: EPK, item: EPK['nav'][number]) => {
  switch (item) {
    case 'shop':
      return epk.shop?.redirectOnly ? epk.shop.externalStoreUrl : null
    case 'vip':
      return epk.vip?.redirectOnly && epk.vip.externalStoreUrl
        ? epk.vip.externalStoreUrl
        : null
    default:
      return null
  }
}

const menuIconClassName = 'absolute inset-0 w-8 h-8 transition-opacity duration-200'
const menuIconShown = 'opacity-100'
const menuIconHidden = 'opacity-0'

// Active page gets a thin underline; the mobile menu marks it with the darker sage instead.
const desktopNavLinkClassName =
  'border-b border-transparent pb-1 transition-colors duration-300 hover:border-brand-secondary/40 aria-[current=page]:border-brand-secondary'
const mobileNavLinkClassName = 'aria-[current=page]:text-brand-primary-dark'

// Matches Tailwind's `lg` breakpoint, where the full header nav takes over from the mobile menu.
const desktopNavQuery = '(min-width: 64rem)'

/** "Cart (n)" pill, rendered only while the cart has items. */
function CartPill({ onNavigate }: { onNavigate?: () => void }) {
  const cart = useCart()
  const store = epk.shop?.store
  if (!store || cart.items.length === 0) return null
  const { count } = getTotals(cart.items, store, cart.methodId)

  return (
    <Link
      aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="inline-flex h-10 items-center rounded-full bg-brand-secondary px-4 text-sm font-semibold tabular-nums text-brand-accent transition-colors hover:bg-brand-secondary/90"
      onClick={onNavigate}
      to="/cart"
    >
      Cart ({count})
    </Link>
  )
}

/** Scrolls to the top on page changes, or to the #hash target when there is one. */
function useScrollRestoration() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
}

export function EPKPage() {
  const location = useLocation()
  useEPKMeta(epk, getPageLabel(location.pathname))
  useScrollRestoration()

  const [menuOpen, setMenuOpen] = useState(false)
  // Where the header ends on screen when the menu opens; the menu slides out from there.
  const [menuOffset, setMenuOffset] = useState(0)
  const headerRef = useRef<HTMLElement>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Close the mobile menu if the viewport grows to the desktop layout, so its scroll lock doesn't linger.
  useEffect(() => {
    const desktop = window.matchMedia(desktopNavQuery)
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  const brandingStyle = getEPKBrandingStyle(epk.branding)
  const brandName = epk.branding.logoText || epk.artistName
  const navItems = epk.nav.filter((item) => isConfiguredNavItem(epk, item))
  const socials = Object.keys(socialIcons)
    .map((key) => [key, epk.footer.socials[key as keyof typeof epk.footer.socials]] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))

  const renderNavItem = (item: EPK['nav'][number], className: string, onNavigate?: () => void) => {
    const externalNavUrl = getExternalNavUrl(epk, item)

    if (item === 'contact') {
      return (
        <a className={className} href={`mailto:${epk.contact.bookingEmail}`} key={item} onClick={onNavigate}>
          {navLabels[item]}
        </a>
      )
    }

    if (externalNavUrl) {
      return (
        <a className={className} href={externalNavUrl} key={item} onClick={onNavigate} rel="noreferrer" target="_blank">
          {navLabels[item]}
        </a>
      )
    }

    return (
      <NavLink className={className} end={item === 'home'} key={item} onClick={onNavigate} to={navPaths[item]}>
        {navLabels[item]}
      </NavLink>
    )
  }

  return (
    <main data-template="epk-public-shell" style={brandingStyle.variables}>
      {brandingStyle.css && <style>{brandingStyle.css}</style>}
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-brand-secondary focus:px-4 focus:py-2 focus:text-brand-accent" href="#content">
        Skip to content
      </a>
      {/*
        The frosted cream bar is its own layer behind the header content. Keep transform, filter and
        backdrop-filter off the header itself: they would become the containing block for the mobile
        menu's fixed overlay and break it.
      */}
      <header data-section="site-header" ref={headerRef} className="sticky top-0 z-50">
        <div aria-hidden className="absolute inset-0 border-b border-brand-secondary/10 bg-brand-accent/80 backdrop-blur-md" />
        <div className="page-shell relative grid h-22 grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          {/* relative z-50 keeps the name and menu toggle above the mobile menu's backdrop. */}
          <div data-field="branding" className="relative z-50">
            <NavLink className="inline-flex items-center" to="/" aria-label={`${epk.artistName} home`} onClick={closeMenu}>
              {epk.branding.logoImage && (
                <img className="hidden lg:block" src={epk.branding.logoImage} alt={epk.artistName} />
              )}
              {/*
                Optically centered on the letters (cap height to baseline), not the descenders: with leading-none,
                Just Me Again Down Here's caps span 0.23em-0.82em of the 1em box, so a 0.03em nudge centers them.
              */}
              <span className={`block -translate-y-[0.03em] whitespace-nowrap font-script text-[44px] leading-none sm:text-[56px] ${epk.branding.logoImage ? 'lg:hidden' : ''}`}>
                {brandName}
              </span>
            </NavLink>
          </div>
          <nav aria-label="Main" data-section="site-navigation" className="hidden gap-12 lg:flex">
            {navItems.map((item) => renderNavItem(item, `font-josefin text-[18px] ${desktopNavLinkClassName}`))}
          </nav>
          <div className="relative z-50 flex items-center justify-end gap-3">
            <CartPill onNavigate={closeMenu} />
            <button
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="-mr-2 p-2 lg:hidden"
              onClick={() => {
                // Measure on open: page scroll is locked while the menu is open, so this stays accurate.
                if (!menuOpen) setMenuOffset(headerRef.current?.getBoundingClientRect().bottom ?? 0)
                setMenuOpen(!menuOpen)
              }}
              type="button"
            >
              {/* Both icons stay rendered so the second image is already loaded when the menu toggles. */}
              <span className="relative block h-8 w-8">
                {epk.branding.menuOpenIcon ? (
                  <img alt="" className={`${menuIconClassName} ${menuOpen ? menuIconHidden : menuIconShown}`} src={epk.branding.menuOpenIcon} />
                ) : (
                  <HiBars3 className={`${menuIconClassName} ${menuOpen ? menuIconHidden : menuIconShown}`} />
                )}
                {epk.branding.menuCloseIcon ? (
                  <img alt="" className={`${menuIconClassName} ${menuOpen ? menuIconShown : menuIconHidden}`} src={epk.branding.menuCloseIcon} />
                ) : (
                  <HiXMark className={`${menuIconClassName} ${menuOpen ? menuIconShown : menuIconHidden}`} />
                )}
              </span>
            </button>
          </div>
          <Sheet
            className="min-h-full px-[var(--page-x)] pb-10 pt-4"
            // The branding image fills the screen behind the menu, with the page-color tint layered over it.
            backdropClassName="bg-(image:--mobile-nav-background) bg-cover bg-center after:absolute after:inset-0 after:bg-(--color-page)/85"
            id="mobile-navigation"
            offset={menuOffset}
            onClose={closeMenu}
            open={menuOpen}
            rootClassName="z-40 lg:hidden"
            side="top"
          >
            <nav aria-label="Main" data-section="mobile-navigation">
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li className="border-b border-brand-secondary/10 last:border-b-0" key={item}>
                    {renderNavItem(item, `block py-3 font-script text-[46px] leading-tight ${mobileNavLinkClassName}`, closeMenu)}
                  </li>
                ))}
              </ul>
            </nav>
            {epk.branding.navCta && (
              <div className="mt-6">
                <CtaButton cta={epk.branding.navCta} fullWidth onClick={closeMenu} size="lg" />
              </div>
            )}
            {socials.length > 0 && (
              <ul className="mt-8 flex justify-center gap-5">
                {socials.map(([key, url]) => {
                  const { label, Icon } = socialIcons[key]
                  return (
                    <li key={key}>
                      <a aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-brand-secondary/25 hover:bg-brand-secondary hover:text-brand-accent" href={url} rel="noreferrer" target="_blank">
                        <Icon aria-hidden className="h-5 w-5" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </Sheet>
        </div>
      </header>
      <div id="content">
        <Outlet context={{ epk }} />
      </div>
      <SiteFooter epk={epk} navItems={navItems.map((item) => ({ key: item, label: navLabels[item], url: getExternalNavUrl(epk, item) ?? (item === 'contact' ? `mailto:${epk.contact.bookingEmail}` : navPaths[item]) }))} />
    </main>
  )
}
