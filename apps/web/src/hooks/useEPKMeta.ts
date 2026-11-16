import { useEffect } from 'react'
import type { EPK } from '../content/schema'
import { absoluteUrl, resolvePageMeta } from '../seo/meta'

const upsertMeta = (key: 'name' | 'property', value: string, content: string | undefined) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`)
  if (!content) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(key, value)
    document.head.appendChild(element)
  }
  element.content = content
}

const upsertLink = (rel: string, href: string | undefined) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!href) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

/**
 * Keeps the document title, description, canonical link, robots and share tags in sync with
 * the current route. index.html ships the home page's tags (see the seo plugin in vite.config.ts).
 */
export const useEPKMeta = (epk: EPK, pathname: string) => {
  useEffect(() => {
    const meta = resolvePageMeta(epk, pathname)
    const origin = epk.metadata?.siteUrl ?? window.location.origin
    const url = absoluteUrl(origin, meta.path)
    const image = absoluteUrl(origin, meta.image)

    document.title = meta.title
    upsertMeta('name', 'description', meta.description)
    upsertMeta('name', 'robots', meta.noIndex ? 'noindex, nofollow' : undefined)
    upsertLink('canonical', meta.noIndex ? undefined : url)
    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)
    upsertMeta('property', 'og:image:alt', meta.imageAlt)
    upsertMeta('name', 'twitter:title', meta.title)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'twitter:image', image)
  }, [epk, pathname])
}
