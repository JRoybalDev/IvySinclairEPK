import { useEffect, useState } from 'react'
import type { ShopItem } from '../../../content/schema'
import { addToCart } from '../../../store/cart'
import { parsePrice } from '../../../utils/format'
import { hasSizes } from '../../../utils/products'
import { Stepper } from './Stepper'

type AddToCartProps = {
  product: ShopItem
  label: string
  onAdded?: () => void
}

/** Size picker, quantity stepper and Add to Cart button for the product page. */
export function AddToCart({ product, label, onAdded }: AddToCartProps) {
  const sizes = product.sizes ?? []
  const [size, setSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(timer)
  }, [added])

  const add = () => {
    if (hasSizes(product) && !size) {
      setError(true)
      return
    }
    addToCart(
      { productId: product.id, name: product.name, price: parsePrice(product.price), image: product.image, size: size ?? undefined },
      qty,
    )
    setError(false)
    setAdded(true)
    setQty(1)
    onAdded?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {sizes.length > 0 && (
        <div aria-label="Size" className="flex flex-wrap gap-2" role="radiogroup">
          {sizes.map((option) => {
            const selected = option === size
            return (
              <button
                aria-checked={selected}
                className={`h-12 min-w-12 rounded-2xl border px-3 text-lg transition-colors ${selected ? 'border-brand-secondary bg-brand-secondary text-brand-accent' : 'border-brand-secondary/45 hover:border-brand-secondary'}`}
                key={option}
                onClick={() => {
                  setSize(option)
                  setError(false)
                }}
                role="radio"
                type="button"
              >
                {option}
              </button>
            )
          })}
        </div>
      )}
      {error && <p className="text-sm text-(--color-danger)" role="alert">Please choose a size.</p>}
      <div className="flex items-center gap-3">
        <Stepper onChange={setQty} value={qty} />
        <button
          className={`h-13 flex-1 rounded-full font-semibold transition-colors ${added ? 'bg-brand-primary text-brand-secondary' : 'bg-brand-secondary text-brand-accent hover:bg-brand-secondary/90'}`}
          onClick={add}
          type="button"
        >
          {added ? 'Added to cart ✓' : label}
        </button>
      </div>
    </div>
  )
}
