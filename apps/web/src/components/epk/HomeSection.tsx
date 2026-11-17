import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { upcomingDates } from '../../utils/tour'
import { getProducts } from '../../utils/products'
import { Countdown } from '../shared/Countdown'
import { ProductCard } from './store/ProductCard'
import { CtaButton } from './ui/CtaButton'
import { Eyebrow } from './ui/Eyebrow'
import { platformInfo } from './ui/platforms'
import { PhotoHero } from './ui/PhotoHero'
import { PlatformPill } from './ui/PlatformPill'
import { SectionTitle } from './ui/SectionTitle'
import { SignupCard } from './ui/SignupCard'
import { SmartLink } from './ui/SmartLink'
import { TourDates } from './ui/TourDates'

export function HomeSection() {
  const { epk } = useEPKOutlet()
  const { home, branding } = epk
  const release = home.featuredRelease
  const products = getProducts(epk).slice(0, home.merch?.count ?? 4)
  const tourDates = upcomingDates(epk.tour.dates).slice(0, home.tourSection?.limit)
  const quotes = epk.about.pressQuotes

  return (
    <div data-section="home">
      {/* data-transition-hold: stays in place and fades with the hero during page transitions. */}
      {home.announcement && (
        <p className="bg-brand-secondary px-4 py-2.5 text-center text-[13px] font-semibold tracking-wide text-brand-accent" data-transition-hold>
          {home.announcement.linkUrl ? (
            <SmartLink className="hover:underline" to={home.announcement.linkUrl}>
              {home.announcement.text} <span aria-hidden>→</span>
              {home.announcement.linkLabel && <span className="ml-1">{home.announcement.linkLabel}</span>}
            </SmartLink>
          ) : (
            home.announcement.text
          )}
        </p>
      )}

      <PhotoHero content={home.bannerContent} image={home.bannerImage} />

      {/* Featured release */}
      <section aria-labelledby="featured-release-title" className="page-shell grid items-center gap-10 py-20 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <img
          alt={`${release.title} cover`}
          className="aspect-square w-full max-w-md rounded-2xl object-cover shadow-2xl md:max-w-none"
          loading="lazy"
          src={release.coverImage}
        />
        <div>
          <Eyebrow>{release.subtitle}</Eyebrow>
          <h2 className="mt-3 font-script text-[60px] leading-none sm:text-[76px]" id="featured-release-title">{release.title}</h2>
          {release.description && <p className="mt-4 max-w-lg text-[17px]">{release.description}</p>}
          {release.countdown && (
            <div className="mt-7 rounded-2xl border border-brand-secondary/10 bg-brand-accent/75 px-5 py-5 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary-dark">{release.countdown.label}</p>
              <Countdown className="mt-2 text-[36px] sm:text-[44px]" labelClassName="text-xs text-brand-secondary/75" target={release.countdown.target} />
            </div>
          )}
          {release.links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {release.links.map((link) => <PlatformPill key={link.platform} link={link} />)}
            </div>
          )}
        </div>
      </section>

      {/* Merch */}
      {home.merch && products.length > 0 && (
        <section aria-labelledby="home-merch-title" className="page-shell pb-20 lg:pb-24">
          <SectionTitle divider={branding.dividerImage} id="home-merch-title" title={home.merch.title} />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {home.merch.cta && (
            <div className="mt-10 flex justify-center">
              <CtaButton cta={home.merch.cta} />
            </div>
          )}
        </section>
      )}

      {/* Press quotes */}
      {home.press && quotes.length > 0 && (
        <section aria-label={home.press.eyebrow} className="bg-brand-accent py-20" data-bleed>
          <div className="page-shell text-center">
            <Eyebrow>{home.press.eyebrow}</Eyebrow>
            <ul className="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
              {quotes.map((quote) => (
                <li key={quote.id}>
                  <figure>
                    <blockquote className="mx-auto max-w-[16ch] font-script text-[34px] leading-tight">“{quote.quote}”</blockquote>
                    <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-dark">
                      — {quote.url ? <a className="hover:underline" href={quote.url} rel="noreferrer" target="_blank">{quote.publication}</a> : quote.publication}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Tour dates */}
      {home.tourSection && home.showTourDatesOnHome && (
        <section aria-labelledby="tour" className="page-shell scroll-mt-28 py-20 lg:py-24">
          <SectionTitle divider={branding.dividerImage} id="tour" title={home.tourSection.title} />
          <div className="mt-10">
            <TourDates dates={tourDates} soldOutLabel={home.tourSection.soldOutLabel} ticketsLabel={home.tourSection.ticketsLabel} />
          </div>
          {home.tourSection.note && <p className="mt-6 text-center text-sm text-brand-primary-dark">{home.tourSection.note}</p>}
          {home.tourSection.cta && (
            <div className="mt-6 flex justify-center">
              <CtaButton cta={home.tourSection.cta} />
            </div>
          )}
        </section>
      )}

      {home.signup && (
        <div className="page-shell pb-16">
          <SignupCard signup={home.signup} />
        </div>
      )}

      {home.listenOn && (
        <section aria-label={home.listenOn.label} className="page-shell flex items-center justify-center gap-6 pb-20">
          <Eyebrow className="text-brand-secondary/75">{home.listenOn.label}</Eyebrow>
          <ul className="flex gap-4">
            {home.listenOn.links.map((link) => {
              const { label, Icon } = platformInfo[link.platform]
              return (
                <li key={link.platform}>
                  <a aria-label={label} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-brand-secondary/10" href={link.url} rel="noreferrer" target="_blank">
                    <Icon aria-hidden className="h-7 w-7" />
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
