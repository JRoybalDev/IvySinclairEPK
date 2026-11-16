import { Link, useNavigate } from 'react-router-dom'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { getTotals, placeOrder, useCart } from '../../store/cart'
import { storeCurrency } from '../../utils/products'
import { CartLines } from './store/CartLines'
import { CheckoutSteps } from './store/CheckoutSteps'
import { DeliveryOptions } from './store/DeliveryOptions'
import { OrderTotals } from './store/OrderTotals'
import { StoreUnavailable } from './store/StoreUnavailable'

const fieldWidths = { full: 'col-span-6', half: 'col-span-6 sm:col-span-3', third: 'col-span-6 sm:col-span-2' } as const

export function CheckoutPage() {
  const { epk } = useEPKOutlet()
  const cart = useCart()
  const navigate = useNavigate()
  const store = epk.shop?.store
  if (!store) return <StoreUnavailable />

  const currency = storeCurrency(epk)
  const totals = getTotals(cart.items, store, cart.methodId)
  const { checkout } = store

  const onPlaceOrder = () => {
    if (placeOrder(store)) navigate('/confirmation')
  }

  return (
    <div className="page-shell py-12 lg:py-16" data-section="checkout">
      <CheckoutSteps current={1} steps={store.steps} />
      <Link className="mt-10 inline-block text-sm font-semibold hover:underline" to="/cart">{checkout.backLabel}</Link>
      <h1 className="mt-3 font-script text-[56px] leading-none sm:text-[64px]">{checkout.title}</h1>

      {cart.items.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-brand-accent/70 px-6 py-6 shadow-sm">
          <CartLines currency={currency} emptyCta={{ label: 'Shop merch', url: '/merch' }} emptyText={store.cart.emptyText} items={[]} />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-5">
            {checkout.expressOptions.length > 0 && (
              <section aria-labelledby="express-title" className="rounded-3xl bg-brand-accent/70 px-6 py-6 shadow-sm">
                <h2 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary-dark" id="express-title">{checkout.expressLabel}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                  {checkout.expressOptions.map((option) => (
                    <li className="flex h-12 items-center justify-center rounded-xl bg-brand-secondary font-semibold text-brand-accent" key={option}>
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex items-center gap-4 text-[13px] text-brand-primary-dark before:h-px before:flex-1 before:bg-brand-secondary/20 after:h-px after:flex-1 after:bg-brand-secondary/20">
                  {checkout.dividerLabel}
                </p>
              </section>
            )}

            {checkout.sections.map((section, index) => (
              <section aria-labelledby={`checkout-section-${index}`} className="rounded-3xl bg-brand-accent/70 px-6 py-6 shadow-sm" key={section.title}>
                <h2 className="flex items-center gap-3 text-lg font-semibold" id={`checkout-section-${index}`}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-secondary text-[13px] text-brand-accent">{index + 1}</span>
                  {section.title}
                </h2>
                <div className="mt-5">
                  {section.kind === 'delivery' ? (
                    <DeliveryOptions currency={currency} selectedId={totals.method.id} store={store} subtotal={totals.subtotal} />
                  ) : (
                    // Display-only: these look like fields but nothing can be typed or collected.
                    <dl className="grid grid-cols-6 gap-4">
                      {section.fields.map((field) => (
                        <div className={fieldWidths[field.width]} key={field.label}>
                          <dt className="mb-1.5 text-[13px] font-semibold">{field.label}</dt>
                          <dd className="flex h-12 items-center rounded-xl border border-brand-secondary/20 bg-white/55 px-4 text-brand-secondary/50">
                            {field.placeholder}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </section>
            ))}
            <p className="text-center text-[13px] text-brand-primary-dark">{store.demoNotice}</p>
          </div>

          <aside aria-labelledby="checkout-summary-title" className="rounded-3xl bg-brand-accent/85 px-6 py-7 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-semibold" id="checkout-summary-title">{store.cart.summaryTitle}</h2>
            <div className="mt-3">
              <CartLines currency={currency} emptyText={store.cart.emptyText} items={cart.items} size="compact" />
            </div>
            <div className="mt-4 border-t border-brand-secondary/15 pt-5">
              <OrderTotals count={totals.count} currency={currency} shipping={totals.shipping} subtotal={totals.subtotal} total={totals.total} />
            </div>
            <button className="mt-6 h-13 w-full rounded-full bg-brand-secondary font-semibold text-brand-accent transition-colors hover:bg-brand-secondary/90" onClick={onPlaceOrder} type="button">
              {checkout.placeOrderLabel}
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
