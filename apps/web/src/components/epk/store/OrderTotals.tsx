import { formatMoney } from '../../../utils/format'

type OrderTotalsProps = {
  count: number
  subtotal: number
  /** null shows `pendingShippingText` (the cart page, before a method is picked). */
  shipping: number | null
  total: number
  currency: string
  totalLabel?: string
  pendingShippingText?: string
}

export function OrderTotals({ count, subtotal, shipping, total, currency, totalLabel = 'Total', pendingShippingText = 'Calculated at checkout' }: OrderTotalsProps) {
  const shippingText = shipping === null ? pendingShippingText : shipping === 0 ? 'Free' : formatMoney(shipping, currency)

  return (
    <dl className="flex flex-col gap-3 text-[15px]">
      <div className="flex justify-between">
        <dt>Subtotal ({count} {count === 1 ? 'item' : 'items'})</dt>
        <dd className="tabular-nums">{formatMoney(subtotal, currency)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Shipping</dt>
        <dd className="tabular-nums">{shippingText}</dd>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-brand-secondary/15 pt-4 text-lg font-semibold">
        <dt>{totalLabel}</dt>
        <dd className="text-2xl tabular-nums">{formatMoney(total, currency)}</dd>
      </div>
    </dl>
  )
}
