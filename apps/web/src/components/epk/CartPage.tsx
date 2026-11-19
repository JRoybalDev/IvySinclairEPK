import { Link } from 'react-router-dom'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { getTotals, useCart } from '../../store/cart'
import { regionalStore, useStoreRegion } from '../../store/region'
import { getProducts } from '../../utils/products'
import { CartLines } from './store/CartLines'
import { CheckoutSteps } from './store/CheckoutSteps'
import { FreeShippingBar } from './store/FreeShippingBar'
import { OrderTotals } from './store/OrderTotals'
import { ProductCard } from './store/ProductCard'
import { StoreUnavailable } from './store/StoreUnavailable'

export function CartPage() {
  const { epk } = useEPKOutlet()
  const cart = useCart()
  const { region, currency } = useStoreRegion(epk)
  const baseStore = epk.shop?.store
  if (!baseStore) return <StoreUnavailable />

  const store = regionalStore(baseStore, region)
  const { subtotal, count } = getTotals(cart.items, store, cart.methodId)
  const freeShipping = store.freeShippingThreshold > 0 && subtotal >= store.freeShippingThreshold
  const inCart = new Set(cart.items.map((item) => item.productId))
  const suggestions = getProducts(epk).filter((product) => !inCart.has(product.id)).slice(0, 4)

  return (
    <div className="page-shell py-12 lg:py-16" data-section="cart">
      <CheckoutSteps current={0} steps={store.steps} />
      <Link className="mt-10 inline-block text-sm font-semibold hover:underline" to="/merch">{store.cart.keepShoppingLabel}</Link>
      <h1 className="mt-3 font-script text-[56px] leading-none sm:text-[64px]">{store.cart.title}</h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Items" className="rounded-3xl bg-brand-accent/70 px-5 py-6 shadow-sm sm:px-8">
          <FreeShippingBar currency={currency} subtotal={subtotal} threshold={store.freeShippingThreshold} />
          <div className="mt-4">
            <CartLines currency={currency} editable emptyCta={{ label: 'Shop merch', url: '/merch' }} emptyText={store.cart.emptyText} items={cart.items} />
          </div>
        </section>
        <aside aria-labelledby="summary-title" className="rounded-3xl bg-brand-accent/85 px-6 py-7 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold" id="summary-title">{store.cart.summaryTitle}</h2>
          <div className="mt-5">
            <OrderTotals count={count} currency={currency} shipping={freeShipping ? 0 : null} subtotal={subtotal} total={subtotal} totalLabel="Estimated total" />
          </div>
          {cart.items.length > 0 ? (
            <Link className="mt-6 flex h-13 items-center justify-center rounded-full bg-brand-secondary font-semibold text-brand-accent transition-colors hover:bg-brand-secondary/90" to="/checkout">
              {store.cart.checkoutLabel}
            </Link>
          ) : (
            <span aria-disabled className="mt-6 flex h-13 items-center justify-center rounded-full bg-brand-secondary/40 font-semibold text-brand-accent">
              {store.cart.checkoutLabel}
            </span>
          )}
          {store.cart.footnote && <p className="mt-4 text-center text-xs text-brand-primary-dark">{store.cart.footnote}</p>}
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section aria-labelledby="cart-suggestions-title" className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-script text-[40px] leading-none" id="cart-suggestions-title">{store.product.relatedTitle}</h2>
            <Link className="text-sm font-semibold hover:underline" to="/merch">View all →</Link>
          </div>
          <ul className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {suggestions.map((product) => <li key={product.id}><ProductCard product={product} /></li>)}
          </ul>
        </section>
      )}
    </div>
  )
}
