import { Link } from 'react-router-dom'

export function StoreUnavailable() {
  return (
    <section className="page-shell py-24 text-center">
      <h1 className="font-script text-[56px]">Store unavailable</h1>
      <p className="mt-3">The on-site store isn’t set up yet.</p>
      <Link className="mt-6 inline-block rounded-full bg-brand-secondary px-6 py-3 font-semibold text-brand-accent" to="/">Back home</Link>
    </section>
  )
}
