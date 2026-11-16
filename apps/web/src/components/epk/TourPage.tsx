import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { upcomingDates } from '../../utils/tour'
import { TourList } from './TourList'
import { PhotoHero } from './ui/PhotoHero'
import { SectionTitle } from './ui/SectionTitle'
import { SignupCard } from './ui/SignupCard'
import { TourDates } from './ui/TourDates'

export function TourPage() {
  const { epk } = useEPKOutlet()
  const { tour } = epk
  const page = tour.page

  // No designed page, or listings come from a Seated widget: keep the basic tour list.
  if (!page || tour.listingMode === 'seated') return <TourList />

  const dates = upcomingDates(tour.dates)

  return (
    <div data-section="tour">
      <PhotoHero content={page.hero.content} image={page.hero.image} label={tour.tourName ?? 'Tour'} />

      <section aria-labelledby="dates-title" className="page-shell py-20 lg:py-24" id="dates">
        <SectionTitle as="h2" divider={epk.branding.dividerImage} id="dates-title" title={page.title} />
        <div className="mt-10">
          {dates.length > 0 ? (
            <TourDates dates={dates} soldOutLabel={page.soldOutLabel} ticketsLabel={page.ticketsLabel} variant="cards" />
          ) : (
            <p className="text-center text-lg">No dates announced yet.</p>
          )}
        </div>
        {page.note && <p className="mt-8 text-center text-[15px] text-brand-primary-dark">{page.note}</p>}
      </section>

      {page.signup && (
        <div className="page-shell scroll-mt-28 pb-20" id="notify">
          <SignupCard signup={page.signup} />
        </div>
      )}
    </div>
  )
}
