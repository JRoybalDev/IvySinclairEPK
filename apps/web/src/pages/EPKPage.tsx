import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Sheet } from '../components/shared/Sheet'
import { SiteFooter } from '../components/epk/SiteFooter'
import { epk } from '../content'
import { useEPKMeta } from '../hooks/useEPKMeta'
import { getEPKBrandingStyle } from '../utils/brandingTheme'
import type { EPK } from '../content/schema'
import { CgShoppingCart } from 'react-icons/cg'
import { HiBars3, HiXMark } from 'react-icons/hi2'

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
  shop: '/shop',
  tour: '/tour',
  vip: '/vip',
  about: '/about',
  newsletter: '/newsletter',
} as const

const pageLabelsByPath = {
  '/': 'Home',
  '/music': 'Music',
  '/videos': 'Videos',
  '/shop': 'Merch',
  '/tour': 'Tour',
  '/vip': 'VIP',
  '/about': 'About',
  '/newsletter': 'Newsletter',
} as const

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

const menuIconClassName = 'absolute inset-0 w-8 h-8'
const menuIconShown = 'opacity-100'
const menuIconHidden = 'opacity-0'

// Desktop nav hover: cream reads on the green header. The mobile menu is tapped, so it has no hover,
// and it sits on a cream tint, so the current page uses a darker sage instead.
const desktopNavLinkClassName = 'transition-colors duration-350 hover:text-brand-accent'
const mobileNavLinkClassName = 'aria-[current=page]:text-brand-primary-dark'

// Matches Tailwind's `lg` breakpoint, where the full header nav takes over from the mobile menu.
const desktopNavQuery = '(min-width: 64rem)'

export function EPKPage() {
  const location = useLocation()
  const pageLabel =
    pageLabelsByPath[location.pathname as keyof typeof pageLabelsByPath] ??
    'Page'
  useEPKMeta(epk, pageLabel)

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
      {/*
        Sticky on every screen size; its background (the page texture) comes from getEPKBrandingStyle.
        Avoid transform/filter/backdrop-filter here: they would
        become the containing block for the mobile menu's fixed overlay and break it.
      */}
      <header data-section="site-header" ref={headerRef} className='sticky top-0 z-50 pb-3'>
        <div className='flex justify-between page-shell h-24 items-center'>
          {/* relative z-50 keeps the name and menu toggle above the mobile menu's backdrop. */}
          <div data-field="branding" className='relative z-50'>
            <NavLink className='flex items-center' to="/" aria-label={`${epk.artistName} home`} onClick={closeMenu}>
              {epk.branding.logoImage && (
                <img className='hidden lg:block' src={epk.branding.logoImage} alt={epk.artistName} />
              )}
              {/*
                Optically centered on the letters (cap height to baseline), not the descenders. With leading-none,
                Just Me Again Down Here's caps span 0.23em-0.82em of the 1em box, so a 0.03em nudge centers them.
                The "y" then hangs 0.43em below the baseline, which the h-24 header is tall enough to contain
                at 64px. Re-measure if the logo font or size changes.
              */}
              <span className={`block leading-none -translate-y-[0.03em] text-[64px] md:text-[48px] lg:text-[64px] font-script ${epk.branding.logoImage ? 'lg:hidden' : ''}`}>
                {brandName}
              </span>
            </NavLink>
          </div>
          <nav aria-label="Public EPK sections" data-section="site-navigation" className='hidden lg:flex gap-18'>
            {navItems.map((item) => renderNavItem(item, `text-[18px] font-josefin ${desktopNavLinkClassName}`))}
          </nav>
          <div className='hidden lg:flex gap-4'>
            {/* Cart goes where the Merch nav item does: the external store when shop is redirect-only, else /shop. */}
            {isConfiguredNavItem(epk, 'shop') && (() => {
              const shopUrl = getExternalNavUrl(epk, 'shop')
              const cartClassName = `block ${desktopNavLinkClassName}`
              const cartIcon = <CgShoppingCart aria-hidden className='w-6 h-6' />

              return shopUrl ? (
                <a aria-label={navLabels.shop} className={cartClassName} href={shopUrl} rel="noreferrer" target="_blank">
                  {cartIcon}
                </a>
              ) : (
                <NavLink aria-label={navLabels.shop} className={cartClassName} to={navPaths.shop}>
                  {cartIcon}
                </NavLink>
              )
            })()}
          </div>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className='relative z-50 -mr-2 p-2 lg:hidden'
            onClick={() => {
              // Measure on open: page scroll is locked while the menu is open, so this stays accurate.
              if (!menuOpen) setMenuOffset(headerRef.current?.getBoundingClientRect().bottom ?? 0)
              setMenuOpen(!menuOpen)
            }}
            type="button"
          >
            {/* Both icons stay rendered so the second image is already loaded when the menu toggles. */}
            <span className='relative block w-8 h-8'>
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
          <Sheet
            className='px-[var(--page-x)] pt-2 pb-8'
            // The branding image fills the screen behind the menu, with the page-color tint layered over it
            // (::after). Without an image, the tint and blur fall back to showing the page underneath.
            backdropClassName='bg-(image:--mobile-nav-background) bg-cover bg-center backdrop-blur-sm after:absolute after:inset-0 after:bg-(--color-page)/80'
            id="mobile-navigation"
            offset={menuOffset}
            onClose={closeMenu}
            open={menuOpen}
            rootClassName='z-40 lg:hidden'
            side="top"
          >
            <nav aria-label="Public EPK sections" data-section="mobile-navigation">
              <ul className='flex flex-col'>
                {navItems.map((item) => (
                  <li className='border-b border-[var(--color-border)] last:border-b-0' key={item}>
                    {renderNavItem(item, `block py-4 type-h3 font-josefin ${mobileNavLinkClassName}`, closeMenu)}
                  </li>
                ))}
              </ul>
            </nav>
          </Sheet>
        </div>
      </header>
      <Outlet context={{ epk }} />
      <SiteFooter epk={epk} />
    </main>
  )
}
