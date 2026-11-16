import type { Store } from '../../../content/schema'
import { setShippingMethod, shippingPrice } from '../../../store/cart'
import { formatMoney } from '../../../utils/format'

type DeliveryOptionsProps = {
  store: Store
  selectedId: string
  subtotal: number
  currency: string
}

/** Shipping method choice; updates the checkout total. */
export function DeliveryOptions({ store, selectedId, subtotal, currency }: DeliveryOptionsProps) {
  return (
    <div aria-label="Delivery method" className="flex flex-col gap-3" role="radiogroup">
      {store.shippingMethods.map((method) => {
        const selected = method.id === selectedId
        const price = shippingPrice(store, method, subtotal)
        return (
          <button
            aria-checked={selected}
            className={`flex items-center gap-3.5 rounded-2xl px-4.5 py-4 text-left transition-colors ${selected ? 'border-2 border-brand-secondary bg-white/85' : 'border border-brand-secondary/20 bg-white/40 hover:bg-white/60'}`}
            key={method.id}
            onClick={() => setShippingMethod(method.id)}
            role="radio"
            type="button"
          >
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? 'border-brand-secondary' : 'border-brand-secondary/35'}`}>
              {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-secondary" />}
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="font-semibold">{method.label}</span>
              <span className="text-[13px] text-brand-primary-dark">{method.detail}</span>
            </span>
            <span className="text-[15px] font-semibold tabular-nums">{price === 0 ? 'Free' : formatMoney(price, currency)}</span>
          </button>
        )
      })}
    </div>
  )
}
