import type { TourDate } from '../content/schema'

/** Announced dates in date order. */
export const upcomingDates = (dates: TourDate[]) =>
  dates.filter((show) => show.isAnnounced).sort((a, b) => a.date.localeCompare(b.date))
