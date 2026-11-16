import type { Release, ShopItem } from '../content/schema'

export const parsePrice = (price: string | number | undefined) => {
  if (typeof price === 'number') return price
  const value = Number.parseFloat(String(price ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(value) ? value : 0
}

export const formatMoney = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

export const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const productSlug = (item: Pick<ShopItem, 'slug' | 'name'>) => item.slug || slugify(item.name)

export const releaseYear = (release: Pick<Release, 'releaseDate'>) => release.releaseDate?.slice(0, 4)

export const releaseTypeLabels: Record<Release['type'], string> = {
  album: 'Album',
  single: 'Single',
  ep: 'EP',
  mix: 'Mix',
  compilation: 'Compilation',
  deluxe: 'Deluxe',
  collab: 'Collab',
}

/** True for on-site paths ("/merch"), false for full URLs and mailto: links. */
export const isInternalUrl = (url: string) => url.startsWith('/') && !url.startsWith('//')
