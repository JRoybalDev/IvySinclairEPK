import { FiLock, FiRotateCcw, FiTruck } from 'react-icons/fi'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { regionalStore, useStoreRegion } from '../../store/region'
import { getProducts } from '../../utils/products'
import { ShopGrid } from './ShopGrid'
import { ProductCard } from './store/ProductCard'
import { CtaButton } from './ui/CtaButton'
import { Eyebrow } from './ui/Eyebrow'
import { SectionTitle } from './ui/SectionTitle'

const perkIcons = { truck: FiTruck, returns: FiRotateCcw, lock: FiLock } as const

export function MerchPage() {
  const { epk } = useEPKOutlet()
  const { region } = useStoreRegion(epk)
  const baseStore = epk.shop?.store

  // No on-site store configured: keep the simple external-links shop.
  if (!baseStore || epk.shop?.redirectOnly) return <ShopGrid />

  const store = regionalStore(baseStore, region)

  const products = getProducts(epk)

  return (
    <div className="page-shell py-14 lg:py-20" data-section="merch">
      <header className="text-center">
        <SectionTitle as="h1" divider={epk.branding.dividerImage} title={store.title} />
        {store.intro && <p className="mx-auto mt-5 max-w-xl text-[17px]">{store.intro}</p>}
      </header>

      {store.banner && (
        <section aria-labelledby="merch-banner-title" className="mt-12 grid items-center gap-8 overflow-hidden rounded-3xl bg-brand-secondary px-7 py-10 text-brand-accent shadow-xl sm:px-12 md:grid-cols-[1fr_auto]">
          <div>
            {store.banner.eyebrow && <Eyebrow className="text-brand-secondary-light">{store.banner.eyebrow}</Eyebrow>}
            <h2 className="mt-3 font-script text-[46px] leading-none sm:text-[56px]" id="merch-banner-title">{store.banner.title}</h2>
            {store.banner.text && <p className="mt-4 max-w-lg text-brand-accent/85">{store.banner.text}</p>}
            <CtaButton cta={store.banner.cta} className="mt-7" surface="dark" />
          </div>
          <img alt="" className="mx-auto h-48 w-48 object-contain drop-shadow-2xl sm:h-60 sm:w-60" loading="lazy" src={store.banner.image} />
        </section>
      )}

      <section aria-label="Products" className="mt-12">
        {region.note && <p className="mb-8 text-center text-sm text-balance text-brand-primary-dark">{region.note}</p>}
        <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard addLabel={store.addToCartLabel} chooseSizeLabel={store.chooseSizeLabel} product={product} variant="full" />
            </li>
          ))}
        </ul>
      </section>

      {store.perks.length > 0 && (
        <ul className="mt-14 grid gap-4 rounded-3xl bg-brand-accent/70 px-6 py-7 sm:grid-cols-3 sm:px-8">
          {store.perks.map((perk) => {
            const Icon = perkIcons[perk.icon]
            return (
              <li className="flex items-center gap-4" key={perk.title}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-secondary text-brand-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{perk.title}</span>
                  <span className="block text-[13px] text-brand-primary-dark">{perk.text}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
