import type { EPK, Metadata, PageMeta } from '../content/schema'
import { productSlug } from '../utils/format'
import { findProduct, getProducts } from '../utils/products'
import { upcomingDates } from '../utils/tour'

// Pure helpers shared by the browser (useEPKMeta) and the build (vite.config.ts seo plugin).

type PageKey = keyof Metadata['pages']

const routes: Record<string, { key: PageKey; label: string }> = {
  '/': { key: 'home', label: 'Home' },
  '/music': { key: 'music', label: 'Music' },
  '/tour': { key: 'tour', label: 'Tour' },
  '/merch': { key: 'merch', label: 'Merch' },
  '/about': { key: 'about', label: 'About' },
  '/videos': { key: 'videos', label: 'Videos' },
  '/vip': { key: 'vip', label: 'VIP' },
  '/newsletter': { key: 'newsletter', label: 'Newsletter' },
  '/ai-disclaimer': { key: 'aiDisclaimer', label: 'AI Disclaimer' },
  '/cart': { key: 'cart', label: 'Cart' },
  '/checkout': { key: 'checkout', label: 'Checkout' },
  '/confirmation': { key: 'confirmation', label: 'Order Confirmed' },
}

export type ResolvedMeta = {
  title: string
  description: string
  image?: string
  imageAlt?: string
  noIndex: boolean
  path: string
}

const trimPath = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname)

/** Title, description, share image and indexing for a route, from epk.metadata. */
export function resolvePageMeta(epk: EPK, pathname: string): ResolvedMeta {
  const path = trimPath(pathname)
  const metadata = epk.metadata
  const pages = metadata?.pages ?? {}
  const siteDescription = metadata?.description || epk.about.shortBio
  const fallback = {
    image: metadata?.socialImage,
    imageAlt: metadata?.socialImageAlt,
  }

  if (path.startsWith('/merch/')) {
    const product = findProduct(epk, path.slice('/merch/'.length))
    const template: PageMeta | undefined = pages.product
    if (product) {
      return {
        title: (template?.title ?? `{name} | ${epk.artistName}`).replace('{name}', product.name),
        description: product.description ?? template?.description ?? siteDescription,
        image: product.image ?? fallback.image,
        imageAlt: product.imageAlt ?? product.name,
        noIndex: template?.noIndex ?? false,
        path,
      }
    }
    return { title: `Not found | ${epk.artistName}`, description: siteDescription, ...fallback, noIndex: true, path }
  }

  const route = routes[path]
  if (!route) return { title: `Not found | ${epk.artistName}`, description: siteDescription, ...fallback, noIndex: true, path }

  const page: PageMeta | undefined = pages[route.key]
  const defaultTitle = route.key === 'home'
    ? metadata?.title || epk.pageTitle || epk.artistName
    : `${route.label} | ${epk.artistName}`

  return {
    title: page?.title ?? defaultTitle,
    description: page?.description ?? siteDescription,
    image: page?.image ?? fallback.image,
    imageAlt: page?.image ? page.title ?? defaultTitle : fallback.imageAlt,
    noIndex: page?.noIndex ?? false,
    path,
  }
}

/** Absolute URL for a site path or asset, when the site's origin is known. */
export const absoluteUrl = (origin: string | undefined, pathOrUrl: string | undefined) => {
  if (!pathOrUrl) return undefined
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  return origin ? `${origin.replace(/\/+$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}` : pathOrUrl
}

/** Indexable paths for the sitemap: main pages in the nav plus every product page. */
export function sitemapPaths(epk: EPK): string[] {
  const navPaths: Partial<Record<EPK['nav'][number], string>> = {
    home: '/', music: '/music', tour: '/tour', shop: '/merch', about: '/about', videos: '/videos', vip: '/vip', newsletter: '/newsletter',
  }
  const paths = epk.nav.map((item) => navPaths[item]).filter((path): path is string => Boolean(path))
  if (epk.aiDisclaimer) paths.push('/ai-disclaimer')
  if (epk.shop?.store && !epk.shop.redirectOnly) paths.push(...getProducts(epk).map((item) => `/merch/${productSlug(item)}`))
  return [...new Set(paths)].filter((path) => !resolvePageMeta(epk, path).noIndex)
}

// Profile links that are just a platform's home page (demo placeholders) aren't the artist's profiles.
const isProfileUrl = (url: string) => {
  try {
    return new URL(url).pathname.replace(/\/+$/, '').length > 0
  } catch {
    return false
  }
}

/** schema.org structured data: the artist, plus a MusicEvent for each announced tour date. */
export function buildJsonLd(epk: EPK, origin: string | undefined) {
  const artistId = absoluteUrl(origin, '/#artist')
  const sameAs = Object.values(epk.footer.socials).filter((url): url is string => Boolean(url) && isProfileUrl(url!))
  const artist = {
    '@type': 'MusicGroup',
    ...(artistId && origin && { '@id': artistId }),
    name: epk.artistName,
    description: epk.metadata?.description || epk.about.shortBio,
    genre: epk.about.genres,
    ...(origin && { url: origin }),
    image: absoluteUrl(origin, epk.metadata?.socialImage),
    ...(sameAs.length > 0 && { sameAs }),
  }
  const tourName = epk.tour.tourName
  const events = upcomingDates(epk.tour.dates).map((show) => ({
    '@type': 'MusicEvent',
    name: tourName ? `${epk.artistName}: ${tourName} at ${show.venue}` : `${epk.artistName} at ${show.venue}`,
    startDate: show.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'MusicVenue',
      name: show.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: show.city,
        ...(show.region && { addressRegion: show.region }),
        addressCountry: show.country,
      },
    },
    performer: origin ? { '@id': artistId } : { '@type': 'MusicGroup', name: epk.artistName },
    ...(show.ticketUrl && {
      offers: {
        '@type': 'Offer',
        url: show.ticketUrl,
        availability: show.isSoldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      },
    }),
  }))
  return { '@context': 'https://schema.org', '@graph': [artist, ...events] }
}
