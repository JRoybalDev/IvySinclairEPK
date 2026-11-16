import { FiCheck, FiCpu, FiPenTool } from 'react-icons/fi'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { NotFoundPage } from '../../pages/NotFoundPage'
import { SectionTitle } from './ui/SectionTitle'

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export function AIDisclaimerPage() {
  const { epk } = useEPKOutlet()
  const page = epk.aiDisclaimer
  if (!page) return <NotFoundPage />

  const lists = [
    { ...page.madeWithAI, Icon: FiCpu },
    { ...page.madeWithoutAI, Icon: FiPenTool },
  ]

  return (
    <article className="page-shell py-14 lg:py-20" data-section="ai-disclaimer">
      <header className="text-center">
        <SectionTitle as="h1" divider={epk.branding.dividerImage} title={page.title} />
        <div className="mx-auto mt-6 max-w-2xl space-y-4 text-[17px] leading-relaxed">
          {page.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </header>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        {lists.map(({ title, items, Icon }) => (
          <section aria-labelledby={`ai-${title}`} className="rounded-3xl bg-brand-accent/75 px-6 py-7 shadow-sm sm:px-8" key={title}>
            <h2 className="flex items-center gap-3 text-xl font-semibold" id={`ai-${title}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-secondary text-brand-accent">
                <Icon aria-hidden className="h-4.5 w-4.5" />
              </span>
              {title}
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-[15px] leading-relaxed">
              {items.map((item) => (
                <li className="flex gap-3" key={item}>
                  <FiCheck aria-hidden className="mt-1 h-4 w-4 shrink-0 text-brand-primary-dark" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mx-auto mt-12 max-w-2xl space-y-4 text-center text-[15px] leading-relaxed text-brand-secondary/85">
        {page.closing.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {page.contactLabel && (
          <p>
            {page.contactLabel}{' '}
            <a className="type-link" href={`mailto:${epk.contact.bookingEmail}`}>{epk.contact.bookingEmail}</a>
          </p>
        )}
        {page.lastUpdated && (
          <p className="text-xs uppercase tracking-[0.16em] text-brand-primary-dark">
            Last updated <time dateTime={page.lastUpdated}>{dateFormat.format(new Date(`${page.lastUpdated}T00:00:00Z`))}</time>
          </p>
        )}
      </footer>
    </article>
  )
}
