import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { formatMoney, parsePrice } from '../../utils/format'
import { findProduct, getProducts, hasSizes } from '../../utils/products'
import { AddToCart } from './store/AddToCart'
import { MiniCart } from './store/MiniCart'
import { ProductCard } from './store/ProductCard'

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-brand-secondary/20">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <FiPlus aria-hidden className="h-4.5 w-4.5 transition-transform duration-200 group-open:rotate-45" />
      </summary>
      <div className="pb-5 text-[15px] leading-relaxed">{children}</div>
    </details>
  )
}

/** Vine flourish in each corner of the product area (decorative, wide screens only). */
function Corners({ src }: { src: string }) {
  const corner = 'pointer-events-none absolute hidden w-32 select-none xl:block'
  return (
    <>
      <img alt="" aria-hidden className={`${corner} left-10 top-6`} src={src} />
      <img alt="" aria-hidden className={`${corner} right-10 top-6 -scale-x-100`} src={src} />
      <img alt="" aria-hidden className={`${corner} bottom-6 left-10 -scale-y-100`} src={src} />
      <img alt="" aria-hidden className={`${corner} bottom-6 right-10 -scale-100`} src={src} />
    </>
  )
}

export function ProductPage() {
  const { epk } = useEPKOutlet()
  const { slug } = useParams()
  const [miniCartOpen, setMiniCartOpen] = useState(false)
  const store = epk.shop?.store
  const product = findProduct(epk, slug)

  if (!store || !product) {
    return (
      <section className="page-shell py-24 text-center">
        <h1 className="font-script text-[56px]">Product not found</h1>
        <p className="mt-3">That item isn’t in the store.</p>
        <Link className="mt-6 inline-block rounded-full bg-brand-secondary px-6 py-3 font-semibold text-brand-accent" to="/merch">Back to merch</Link>
      </section>
    )
  }

  const related = getProducts(epk).filter((item) => item.id !== product.id).slice(0, 3)
  const sizeGuide = store.product.sizeGuide

  return (
    <div data-section="product">
      <div className="relative">
        {epk.branding.cornerMotif && <Corners src={epk.branding.cornerMotif} />}
        <section className="page-shell grid items-center gap-10 py-14 md:grid-cols-2 lg:gap-14 lg:py-24 xl:max-w-4xl">
          <div className="grid aspect-square place-items-center rounded-3xl bg-brand-accent/75 shadow-sm">
            <img alt={product.imageAlt ?? product.name} className="h-[82%] w-[82%] object-contain" fetchPriority="high" src={product.image} />
          </div>
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex gap-2 text-[13px]">
                <li><Link className="font-semibold hover:underline" to="/merch">{store.title}</Link></li>
                <li aria-hidden className="text-brand-secondary/45">/</li>
                <li aria-current="page" className="text-brand-primary-dark">{product.name}</li>
              </ol>
            </nav>
            <h1 className="mt-4 text-[38px] leading-tight sm:text-[44px]">{product.name}</h1>
            <p className="mt-2 text-[22px] tabular-nums">{formatMoney(parsePrice(product.price), product.currency)}</p>
            <div className="mt-6">
              <AddToCart label={store.addToCartLabel} onAdded={() => setMiniCartOpen(true)} product={product} />
            </div>
            {product.description && <p className="mt-8 text-[15px] leading-relaxed">{product.description}</p>}
            {product.descriptionList && product.descriptionList.length > 0 && (
              <ol className="mt-3 columns-2 text-[15px] leading-relaxed">
                {product.descriptionList.map((line) => <li key={line}>{line}</li>)}
              </ol>
            )}
            {product.footnote && <p className="mt-3 text-[13px] text-brand-primary-dark">{product.footnote}</p>}
            <div className="mt-6 border-t border-brand-secondary/20">
              {product.details && product.details.length > 0 && (
                <Accordion title="Details">
                  <ul className="list-disc pl-5">
                    {product.details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                </Accordion>
              )}
              <Accordion title="Shipping & returns">
                <p>{store.product.shippingReturns}</p>
              </Accordion>
              {hasSizes(product) && sizeGuide && (
                <Accordion title="Size guide">
                  <table className="w-full text-left text-sm tabular-nums">
                    <thead>
                      <tr>{sizeGuide.headers.map((header) => <th className="py-1.5 font-semibold" key={header} scope="col">{header}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sizeGuide.rows.map((row) => (
                        <tr className="border-t border-brand-secondary/10" key={row[0]}>
                          {row.map((cell, index) => index === 0
                            ? <th className="py-1.5 font-semibold" key={cell} scope="row">{cell}</th>
                            : <td className="py-1.5" key={`${row[0]}-${index}`}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sizeGuide.note && <p className="mt-3 text-[13px] text-brand-primary-dark">{sizeGuide.note}</p>}
                </Accordion>
              )}
            </div>
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="page-shell pb-20">
          <h2 className="font-script text-[44px] leading-none" id="related-title">{store.product.relatedTitle}</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
            {related.map((item) => <li key={item.id}><ProductCard product={item} /></li>)}
          </ul>
        </section>
      )}

      <MiniCart currency={product.currency} onClose={() => setMiniCartOpen(false)} open={miniCartOpen} store={store} />
    </div>
  )
}
