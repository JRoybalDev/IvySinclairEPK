import type { TourDate } from '../../../content/schema'

const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })

type TourDatesProps = {
  dates: TourDate[]
  ticketsLabel: string
  soldOutLabel: string
  /** "list" = rows inside one card (Home), "cards" = a card per show (Tour page). */
  variant?: 'list' | 'cards'
}

function ShowRow({ show, ticketsLabel, soldOutLabel }: { show: TourDate; ticketsLabel: string; soldOutLabel: string }) {
  const date = new Date(`${show.date}T00:00:00Z`)
  return (
    <>
      <time className="w-11 shrink-0 text-center sm:w-14" dateTime={show.date}>
        <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-brand-primary-dark">{monthFormat.format(date)}</span>
        <span className="block text-[30px] leading-none font-semibold tabular-nums">{date.getUTCDate()}</span>
      </time>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold leading-snug">{show.venue}</p>
        <p className="text-sm text-brand-primary-dark">{[show.city, show.region].filter(Boolean).join(', ')}</p>
        {show.supportingActs && show.supportingActs.length > 0 && (
          <p className="text-[13px] text-brand-primary-dark">with {show.supportingActs.join(', ')}</p>
        )}
      </div>
      {show.isSoldOut ? (
        <span className="shrink-0 rounded-full border border-dashed border-brand-secondary/40 px-3 py-2 text-[13px] sm:px-4 sm:text-sm text-brand-secondary/70">
          {soldOutLabel}
        </span>
      ) : show.ticketUrl ? (
        <a
          aria-label={`${ticketsLabel} for ${show.venue}, ${show.city}`}
          className="shrink-0 rounded-full bg-brand-secondary px-4 py-2 text-[13px] sm:px-5 sm:text-sm font-semibold text-brand-accent transition-colors hover:bg-brand-secondary/85"
          href={show.ticketUrl}
          rel="noreferrer"
          target="_blank"
        >
          {ticketsLabel}
        </a>
      ) : null}
    </>
  )
}

export function TourDates({ dates, ticketsLabel, soldOutLabel, variant = 'list' }: TourDatesProps) {
  if (variant === 'cards') {
    return (
      <ul className="mx-auto flex max-w-4xl flex-col gap-3">
        {dates.map((show) => (
          <li className="flex items-center gap-4 rounded-2xl border border-brand-secondary/15 bg-brand-accent/60 px-4.5 py-5 sm:gap-7 sm:px-7" key={show.id}>
            <ShowRow show={show} soldOutLabel={soldOutLabel} ticketsLabel={ticketsLabel} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="mx-auto max-w-3xl rounded-3xl bg-brand-accent/70 px-5 shadow-sm sm:px-8">
      {dates.map((show) => (
        <li className="flex items-center gap-5 border-brand-secondary/12 py-5 not-first:border-t sm:gap-8" key={show.id}>
          <ShowRow show={show} soldOutLabel={soldOutLabel} ticketsLabel={ticketsLabel} />
        </li>
      ))}
    </ul>
  )
}
