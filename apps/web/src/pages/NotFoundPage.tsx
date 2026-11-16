import { Link } from 'react-router-dom'

/** Rendered inside the site layout for unknown routes; useEPKMeta marks it noindex. */
export function NotFoundPage() {
  return (
    <section className="page-shell py-28 text-center" data-template="not-found">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary-dark">404</p>
      <h1 className="mt-3 font-script text-[56px] leading-none sm:text-[72px]">Page not found</h1>
      <p className="mt-4">That page doesn’t exist, or it has moved.</p>
      <Link className="mt-8 inline-block rounded-full bg-brand-secondary px-7 py-3 font-semibold text-brand-accent" to="/">Back home</Link>
    </section>
  )
}
