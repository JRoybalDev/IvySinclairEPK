import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { useCart } from '../../store/cart'
import { storeCurrency } from '../../utils/products'
import { CartLines } from './store/CartLines'
import { CheckoutSteps } from './store/CheckoutSteps'
import { OrderTotals } from './store/OrderTotals'
import { StoreUnavailable } from './store/StoreUnavailable'

const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

const addDays = (iso: string, days: number) => {
  const date = new Date(iso)
  date.setDate(date.getDate() + days)
  return date
}

export function ConfirmationPage() {
  const { epk } = useEPKOutlet()
  const { lastOrder } = useCart()
  const store = epk.shop?.store
  if (!store) return <StoreUnavailable />

  const copy = store.confirmation
  const currency = storeCurrency(epk)

  if (!lastOrder) {
    return (
      <div className="page-shell py-12 text-center lg:py-16">
        <CheckoutSteps current={2} steps={store.steps} />
        <p className="mt-16 text-xl">{copy.emptyText}</p>
        <Link className="mt-6 inline-block rounded-full bg-brand-secondary px-6 py-3 font-semibold text-brand-accent" to="/merch">{copy.continueLabel}</Link>
      </div>
    )
  }

  const [minDays, maxDays] = copy.deliveryWindowDays
  const delivery = `${dayFormat.format(addDays(lastOrder.placedAt, minDays))} – ${dayFormat.format(addDays(lastOrder.placedAt, maxDays))}`
  const info = [
    { label: copy.orderNumberLabel, value: `#${lastOrder.id}` },
    { label: copy.deliveryLabel, value: delivery },
    { label: copy.shipToLabel, value: copy.shipTo },
  ]

  return (
    <div className="page-shell py-12 lg:py-16" data-section="confirmation">
      <CheckoutSteps current={2} steps={store.steps} />
      <header className="mt-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-primary text-brand-secondary">
          <FiCheck aria-hidden className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-script text-[60px] leading-none sm:text-[72px]">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-[17px]">{copy.text}</p>
      </header>

      <dl className="mx-auto mt-10 grid max-w-3xl gap-px overflow-hidden rounded-3xl bg-brand-secondary/10 shadow-sm sm:grid-cols-3">
        {info.map((item) => (
          <div className="bg-brand-accent/85 px-6 py-5 text-center" key={item.label}>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-dark">{item.label}</dt>
            <dd className="mt-1.5 text-[17px] font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
        <section aria-labelledby="next-title" className="rounded-3xl bg-brand-accent/70 px-6 py-6 shadow-sm">
          <h2 className="text-lg font-semibold" id="next-title">{copy.nextTitle}</h2>
          <ol className="mt-5 flex flex-col gap-5">
            {copy.nextSteps.map((step, index) => (
              <li className="flex gap-4" key={step.title}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${index === 0 ? 'bg-brand-secondary text-brand-accent' : 'border border-brand-secondary/30'}`}>
                  {index === 0 ? <FiCheck aria-hidden /> : index + 1}
                </span>
                <span>
                  <span className="block font-semibold">{step.title}</span>
                  <span className="block text-sm text-brand-primary-dark">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="details-title" className="rounded-3xl bg-brand-accent/70 px-6 py-6 shadow-sm">
          <h2 className="text-lg font-semibold" id="details-title">{copy.detailsTitle}</h2>
          <div className="mt-2">
            <CartLines currency={currency} emptyText="" items={lastOrder.items} size="compact" />
          </div>
          <div className="mt-3 border-t border-brand-secondary/15 pt-4">
            <OrderTotals count={lastOrder.count} currency={currency} shipping={lastOrder.shipping} subtotal={lastOrder.subtotal} total={lastOrder.total} />
          </div>
        </section>
      </div>

      <p className="mt-8 text-center text-[13px] text-brand-primary-dark">{store.demoNotice}</p>
      <div className="mt-6 text-center">
        <Link className="inline-block rounded-full bg-brand-secondary px-7 py-3 font-semibold text-brand-accent" to="/merch">{copy.continueLabel}</Link>
      </div>
    </div>
  )
}
