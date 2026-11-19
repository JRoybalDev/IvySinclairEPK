import { useEffect, useSyncExternalStore } from 'react'
import type { EPK, ShopItem, Store, StoreRegion } from '../content/schema'
import { parsePrice } from '../utils/format'
import { getProducts } from '../utils/products'
import { repriceCart } from './cart'

// Which merch store region (shop.store.regions) the visitor shops in. Visitors only get the
// store for their own country; there is no way to switch.
// - The country comes from /api/geo (Vercel's IP country), falling back to the browser language
//   (en-GB → GB) when that's unavailable, e.g. in local dev. It's detected once per browser
//   session and kept in sessionStorage.
// - Countries no region lists get store.defaultRegion (or the first region).

type RegionState = {
  country: string | null // detected ISO country code
}

const COUNTRY_KEY = 'ivy-sinclair-country-v1'
const COUNTRY_CODE = /^[A-Z]{2}$/
const EMPTY: RegionState = { country: null }

let state: RegionState = EMPTY
let loaded = false
let detectionStarted = false
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

const readStorage = (storage: () => Storage, key: string) => {
  try {
    return storage().getItem(key)
  } catch {
    return null // storage blocked (private mode, etc.)
  }
}

const writeStorage = (storage: () => Storage, key: string, value: string) => {
  try {
    storage().setItem(key, value)
  } catch {
    // Ignore; the in-memory state still applies for this page view.
  }
}

/** `?country=GB` on any page forces a country, for testing (dev and preview deploys only). */
const countryOverride = () => {
  if (!import.meta.env.VITE_ALLOW_COUNTRY_OVERRIDE) return null
  const value = new URLSearchParams(window.location.search).get('country')?.toUpperCase()
  return value && COUNTRY_CODE.test(value) ? value : null
}

const load = () => {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  const override = countryOverride()
  // Saved for the session so the cart and checkout keep the forced country.
  if (override) writeStorage(() => window.sessionStorage, COUNTRY_KEY, override)
  const country = override ?? readStorage(() => window.sessionStorage, COUNTRY_KEY)
  state = { country: country && COUNTRY_CODE.test(country) ? country : null }
}

const subscribe = (listener: () => void) => {
  load()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getState = () => {
  load()
  return state
}

const browserCountry = () => {
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    try {
      const region = new Intl.Locale(tag).region
      if (region && COUNTRY_CODE.test(region)) return region
    } catch {
      // Malformed language tag; try the next one.
    }
  }
  return null
}

const fetchCountry = async () => {
  try {
    const response = await fetch('/api/geo', { signal: AbortSignal.timeout?.(4000) })
    if (!response.ok) return null
    const data = (await response.json()) as { country?: unknown }
    return typeof data.country === 'string' && COUNTRY_CODE.test(data.country) ? data.country : null
  } catch {
    return null
  }
}

const detectCountry = async () => {
  load()
  if (detectionStarted || state.country) return
  detectionStarted = true
  const country = (await fetchCountry()) ?? browserCountry()
  if (!country) return
  writeStorage(() => window.sessionStorage, COUNTRY_KEY, country)
  state = { country }
  emit()
}

/** The configured regions, or one implicit region in the products' own currency. */
export const getRegions = (epk: EPK): StoreRegion[] => {
  const regions = epk.shop?.store?.regions ?? []
  if (regions.length > 0) return regions
  return [{ id: 'default', label: '', name: '', currency: getProducts(epk)[0]?.currency ?? 'USD', countries: [] }]
}

export const resolveRegion = (epk: EPK, { country }: RegionState): StoreRegion => {
  const regions = getRegions(epk)
  const fallback = regions.find((region) => region.id === epk.shop?.store?.defaultRegion) ?? regions[0]
  return (country ? regions.find((region) => region.countries.includes(country)) : undefined) ?? fallback
}

/** A product's price in the region (the schema guarantees one exists for every region). */
export const regionalPrice = (product: ShopItem, region: StoreRegion) =>
  parsePrice(product.regionPrices?.[region.id] ?? product.price)

/** The store with the region's shipping prices, free-shipping threshold and shipping copy. */
export const regionalStore = (store: Store, region: StoreRegion): Store => ({
  ...store,
  freeShippingThreshold: region.freeShippingThreshold ?? store.freeShippingThreshold,
  shippingMethods: store.shippingMethods.map((method) => ({ ...method, price: region.shippingPrices?.[method.id] ?? method.price })),
  perks: region.shippingPerk
    ? store.perks.map((perk) => (perk.icon === 'truck' ? { ...perk, ...region.shippingPerk } : perk))
    : store.perks,
  product: region.shippingReturns ? { ...store.product, shippingReturns: region.shippingReturns } : store.product,
})

/** The visitor's store region. Also keeps the cart priced in that region's currency. */
export function useStoreRegion(epk: EPK) {
  const current = useSyncExternalStore(subscribe, getState, () => EMPTY)
  const region = resolveRegion(epk, current)
  const hasRegions = (epk.shop?.store?.regions.length ?? 0) > 0

  useEffect(() => {
    if (hasRegions) void detectCountry()
  }, [hasRegions])

  useEffect(() => {
    const products = getProducts(epk)
    repriceCart((productId) => {
      const product = products.find((item) => item.id === productId)
      return product ? regionalPrice(product, region) : undefined
    })
  }, [epk, region])

  return {
    region,
    currency: region.currency,
    priceOf: (product: ShopItem) => regionalPrice(product, region),
  }
}
