import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import type { Store } from '../../../content/schema'
import { getTotals, useCart } from '../../../store/cart'
import { formatMoney } from '../../../utils/format'
import { CartLines } from './CartLines'
import { FreeShippingBar } from './FreeShippingBar'

type MiniCartProps = {
  open: boolean
  onClose: () => void
  store: Store
  currency: string
}

/** Slide-out cart from the right, opened after adding to cart on the product page. */
export function MiniCart({ open, onClose, store, currency }: MiniCartProps) {
  const cart = useCart()
  const { subtotal } = getTotals(cart.items, store, cart.methodId)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className={`fixed inset-0 z-60 ${open ? '' : 'pointer-events-none'}`} inert={!open}>
      <div aria-hidden className={`absolute inset-0 bg-brand-secondary/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside
        aria-label={store.cart.title}
        aria-modal="true"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col gap-5 bg-brand-accent p-6 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-script text-[40px] leading-none">{store.cart.title}</h2>
          <button aria-label="Close cart" className="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-secondary/10" onClick={onClose} ref={closeRef} type="button">
            <FiX aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <FreeShippingBar currency={currency} subtotal={subtotal} threshold={store.freeShippingThreshold} />
        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          <CartLines currency={currency} editable emptyText={store.cart.emptyText} items={cart.items} size="compact" />
        </div>
        {cart.items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-brand-secondary/15 pt-5">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
            </div>
            <Link className="flex h-12 items-center justify-center rounded-full bg-brand-secondary font-semibold text-brand-accent" onClick={onClose} to="/checkout">
              {store.cart.checkoutLabel}
            </Link>
            <Link className="flex h-12 items-center justify-center rounded-full border border-brand-secondary font-semibold" onClick={onClose} to="/cart">
              View cart
            </Link>
            <p className="text-center text-xs text-brand-primary-dark">{store.demoNotice}</p>
          </div>
        )}
      </aside>
    </div>
  )
}
