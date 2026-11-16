import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ShopItem } from '../../../content/schema'
import { addToCart } from '../../../store/cart'
import { formatMoney, parsePrice } from '../../../utils/format'
import { hasSizes, productPath } from '../../../utils/products'

type ProductCardProps = {
  product: ShopItem
  /** "full" adds the badge, size note and a quick add / choose size button. */
  variant?: 'full' | 'compact'
  addLabel?: string
  chooseSizeLabel?: string
}

const actionClass = 'flex h-11 w-full items-center justify-center rounded-full border border-brand-secondary text-[15px] font-semibold transition-colors'

export function ProductCard({ product, variant = 'compact', addLabel = 'Add to cart', chooseSizeLabel = 'Choose size' }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const price = formatMoney(parsePrice(product.price), product.currency)
  const href = productPath(product)

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(timer)
  }, [added])

  return (
    <article className="group relative flex flex-col rounded-3xl bg-brand-accent/80 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none">
      {variant === 'full' && product.badge && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-brand-secondary px-3 py-1 text-xs font-semibold text-brand-accent">{product.badge}</span>
      )}
      <Link className="flex flex-1 flex-col" to={href}>
        <div className="grid aspect-square place-items-center">
          <img
            alt={product.imageAlt ?? product.name}
            className="h-[80%] w-[80%] object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            loading="lazy"
            src={product.image}
          />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h3 className={variant === 'full' ? 'text-lg font-semibold' : 'text-sm font-semibold'}>{product.name}</h3>
          <span className={`tabular-nums ${variant === 'full' ? 'text-base' : 'text-sm'}`}>{price}</span>
        </div>
        {variant === 'full' && product.sizeNote && <p className="mt-1 text-sm text-brand-primary-dark">{product.sizeNote}</p>}
      </Link>
      {variant === 'full' && (
        <div className="mt-4">
          {hasSizes(product) ? (
            <Link className={`${actionClass} hover:bg-brand-secondary hover:text-brand-accent`} to={href}>{chooseSizeLabel}</Link>
          ) : (
            <button
              className={`${actionClass} ${added ? 'bg-brand-secondary text-brand-accent' : 'hover:bg-brand-secondary hover:text-brand-accent'}`}
              onClick={() => {
                addToCart({ productId: product.id, name: product.name, price: parsePrice(product.price), image: product.image })
                setAdded(true)
              }}
              type="button"
            >
              {added ? 'Added ✓' : addLabel}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
