import type { EPK, ShopItem } from '../content/schema'
import { productSlug } from './format'

/** Products sold in the on-site store (shop.featuredItems marked isFeatured). */
export const getProducts = (epk: EPK): ShopItem[] =>
  (epk.shop?.featuredItems ?? []).filter((item) => item.isFeatured)

export const findProduct = (epk: EPK, slug: string | undefined) =>
  getProducts(epk).find((item) => productSlug(item) === slug)

export const productPath = (item: ShopItem) => `/merch/${productSlug(item)}`

export const hasSizes = (item: ShopItem) => (item.sizes?.length ?? 0) > 0

/** The store's currency, taken from the first product. */
export const storeCurrency = (epk: EPK) => getProducts(epk)[0]?.currency ?? 'USD'
