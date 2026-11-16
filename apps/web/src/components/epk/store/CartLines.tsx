import { Link } from 'react-router-dom'
import type { CartItem } from '../../../store/cart'
import { removeFromCart, setQuantity } from '../../../store/cart'
import { formatMoney } from '../../../utils/format'
import { ProductThumb } from './ProductThumb'
import { Stepper } from './Stepper'

type CartLinesProps = {
  items: CartItem[]
  currency: string
  /** full = cart page, compact = summaries and the mini cart. */
  size?: 'full' | 'compact'
  editable?: boolean
  emptyText: string
  emptyCta?: { label: string; url: string }
}

export function CartLines({ items, currency, size = 'full', editable = false, emptyText, emptyCta }: CartLinesProps) {
  const full = size === 'full'

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center gap-4 text-center ${full ? 'py-10' : 'py-4'}`}>
        <p className={full ? 'text-xl' : 'text-[15px]'}>{emptyText}</p>
        {emptyCta && (
          <Link className="rounded-full bg-brand-secondary px-6 py-3 text-[15px] font-semibold text-brand-accent" to={emptyCta.url}>
            {emptyCta.label}
          </Link>
        )}
      </div>
    )
  }

  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li className={`flex flex-wrap items-center border-brand-secondary/15 not-first:border-t ${full ? 'gap-5 py-5' : 'gap-3.5 py-3'}`} key={item.id}>
          <ProductThumb alt={item.name} className={full ? 'h-24 w-24 rounded-2xl sm:h-26 sm:w-26' : 'h-14 w-14 rounded-xl'} src={item.image} />
          <div className="flex min-w-0 flex-[1_1_120px] flex-col gap-1">
            <p className={`font-semibold ${full ? 'text-lg' : 'text-[15px]'}`}>{item.name}</p>
            <p className="text-[13px] text-brand-primary-dark">
              {[item.size ? `Size ${item.size}` : full ? 'One size' : null, editable ? null : `Qty ${item.qty}`].filter(Boolean).join(' · ')}
            </p>
            {editable && (
              <button
                aria-label={`Remove ${item.name}${item.size ? `, size ${item.size}` : ''}`}
                className="self-start text-[13px] text-brand-primary-dark underline underline-offset-2 hover:text-brand-secondary"
                onClick={() => removeFromCart(item.id)}
                type="button"
              >
                Remove
              </button>
            )}
          </div>
          {editable && (
            <Stepper label={`Quantity for ${item.name}`} onChange={(qty) => setQuantity(item.id, qty)} size={full ? 'lg' : 'sm'} value={item.qty} />
          )}
          <p className={`min-w-16 text-right font-semibold tabular-nums ${full ? 'text-lg' : 'text-[15px]'}`}>{formatMoney(item.price * item.qty, currency)}</p>
        </li>
      ))}
    </ul>
  )
}
