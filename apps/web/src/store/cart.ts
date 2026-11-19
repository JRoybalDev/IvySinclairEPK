import { useSyncExternalStore } from 'react'
import type { ShippingMethod, Store } from '../content/schema'

// Demo cart: kept in localStorage so it survives reloads and stays in sync across tabs.
// Nothing here talks to a server; "placing" an order only moves the cart into lastOrder.

export type CartItem = {
  id: string // product id + size, so each size is its own line
  productId: string
  name: string
  price: number
  image?: string
  size?: string
  qty: number
}

export type Order = {
  id: string
  currency?: string // missing on orders placed before store regions existed
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  count: number
  methodId: string
  placedAt: string
}

type CartState = {
  items: CartItem[]
  methodId: string | null
  lastOrder: Order | null
}

export const MAX_QTY = 99
const STORAGE_KEY = 'ivy-sinclair-cart-v1'
const EMPTY: CartState = { items: [], methodId: null, lastOrder: null }

let state: CartState = EMPTY
let loaded = false
const listeners = new Set<() => void>()

const parse = (raw: string | null): CartState => {
  if (!raw) return EMPTY
  try {
    const parsed = JSON.parse(raw) as Partial<CartState>
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      methodId: typeof parsed.methodId === 'string' ? parsed.methodId : null,
      lastOrder: parsed.lastOrder ?? null,
    }
  } catch {
    return EMPTY
  }
}

const emit = () => listeners.forEach((listener) => listener())

const load = () => {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    state = parse(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    // Storage blocked (private mode, etc.): the cart still works for this page view.
  }
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = parse(event.newValue)
    emit()
  })
}

const setState = (next: CartState) => {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors; in-memory state is still updated.
  }
  emit()
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

export const useCart = () => useSyncExternalStore(subscribe, getState, () => EMPTY)

export const addToCart = (
  item: Omit<CartItem, 'id' | 'qty'>,
  qty = 1,
) => {
  const current = getState()
  const id = item.size ? `${item.productId}|${item.size}` : item.productId
  const existing = current.items.find((line) => line.id === id)
  const items = existing
    ? current.items.map((line) => (line.id === id ? { ...line, qty: Math.min(MAX_QTY, line.qty + qty) } : line))
    : [...current.items, { ...item, id, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]
  setState({ ...current, items })
}

export const setQuantity = (id: string, qty: number) => {
  const current = getState()
  const items = qty <= 0
    ? current.items.filter((line) => line.id !== id)
    : current.items.map((line) => (line.id === id ? { ...line, qty: Math.min(MAX_QTY, qty) } : line))
  setState({ ...current, items })
}

export const removeFromCart = (id: string) => {
  const current = getState()
  setState({ ...current, items: current.items.filter((line) => line.id !== id) })
}

/**
 * Updates line prices after the store region changes, so the cart is always in one currency.
 * `priceOf` returns a product's price in the current region. No-op when nothing changes.
 */
export const repriceCart = (priceOf: (productId: string) => number | undefined) => {
  const current = getState()
  let changed = false
  const items = current.items.map((line) => {
    const price = priceOf(line.productId)
    if (price === undefined || price === line.price) return line
    changed = true
    return { ...line, price }
  })
  if (changed) setState({ ...current, items })
}

export const setShippingMethod =(methodId: string) => setState({ ...getState(), methodId })

/** The selected shipping method, falling back to the first one. */
export const getShippingMethod = (store: Store, methodId: string | null): ShippingMethod =>
  store.shippingMethods.find((method) => method.id === methodId) ?? store.shippingMethods[0]

export const shippingPrice = (store: Store, method: ShippingMethod, subtotal: number) =>
  method.freeOverThreshold && store.freeShippingThreshold > 0 && subtotal >= store.freeShippingThreshold
    ? 0
    : method.price

export const getTotals = (items: CartItem[], store: Store, methodId: string | null) => {
  const subtotal = items.reduce((sum, line) => sum + line.price * line.qty, 0)
  const count = items.reduce((sum, line) => sum + line.qty, 0)
  const method = getShippingMethod(store, methodId)
  const shipping = items.length === 0 ? 0 : shippingPrice(store, method, subtotal)
  return { subtotal, count, shipping, total: subtotal + shipping, method }
}

/** Moves the cart into lastOrder and empties it. Returns the order, or null for an empty cart. */
export const placeOrder = (store: Store, currency: string): Order | null => {
  const current = getState()
  if (current.items.length === 0) return null
  const { subtotal, count, shipping, total, method } = getTotals(current.items, store, current.methodId)
  const order: Order = {
    id: `IVY-${Math.floor(100000 + Math.random() * 900000)}`,
    currency,
    items: current.items,
    subtotal,
    count,
    shipping,
    total,
    methodId: method.id,
    placedAt: new Date().toISOString(),
  }
  setState({ items: [], methodId: current.methodId, lastOrder: order })
  return order
}
