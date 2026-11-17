import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { CtaButton } from './ui/CtaButton'
import { Eyebrow } from './ui/Eyebrow'
import { socialIcons } from './ui/platforms'
import { SectionTitle } from './ui/SectionTitle'

export function AboutSection() {
  const { epk } = useEPKOutlet()
  const { about, branding } = epk
  const page = about.page

  // Without page content, fall back to a simple bio.
  if (!page) {
    return (
      <section className="page-shell py-20" data-section="about">
        <h1 className="font-script text-[64px] leading-none">About</h1>
        <p className="mt-6 max-w-2xl text-lg">{about.longBio}</p>
      </section>
    )
  }

  return (
    <div data-section="about">
      {/* Hero */}
      <section className="page-shell grid items-center gap-10 py-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16 lg:py-20">
        <img
          alt={page.portraitAlt}
          className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
          fetchPriority="high"
          src={page.portrait}
        />
        <div>
          {page.eyebrow && <Eyebrow>{page.eyebrow}</Eyebrow>}
          <h1 className="mt-4 font-script text-[72px] leading-none sm:text-[88px]">{page.title}</h1>
          {branding.dividerImage && <img alt="" aria-hidden className="mt-4 h-auto w-44" src={branding.dividerImage} />}
          {page.quote && <p className="mt-6 font-script text-[26px] leading-snug sm:text-[30px]">{page.quote}</p>}
          <p className="mt-4 text-[17px]">{about.shortBio}</p>
          {page.cta && <CtaButton cta={page.cta} className="mt-7" size="lg" />}
        </div>
      </section>

      {page.pullQuote && (
        <section aria-label="Quote" className="bg-brand-accent py-20" data-bleed>
          <figure className="page-shell text-center">
            <blockquote className="mx-auto max-w-4xl font-script text-[38px] leading-tight sm:text-[48px]">{page.pullQuote.quote}</blockquote>
            <figcaption className="mt-4 text-sm font-semibold tracking-wide text-brand-primary-dark">{page.pullQuote.attribution}</figcaption>
          </figure>
        </section>
      )}

      {page.story && (
        <section aria-labelledby="about-story-title" className="page-shell py-20 lg:py-24">
          <div className="mx-auto max-w-2xl">
            {page.story.eyebrow && <Eyebrow>{page.story.eyebrow}</Eyebrow>}
            <h2 className="mt-4 font-script text-[44px] leading-tight sm:text-[52px]" id="about-story-title">{page.story.title}</h2>
            {page.story.paragraphs.map((paragraph, index) => (
              <p className={index === 0 ? 'mt-5 text-[19px] leading-relaxed' : 'mt-5 text-[16px] leading-relaxed'} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {page.socials && (
        <section aria-labelledby="about-socials-title" className="page-shell pb-20 lg:pb-24">
          <SectionTitle divider={branding.dividerImage} id="about-socials-title" title={page.socials.title} />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {page.socials.items.map((social) => {
              const { label, Icon } = socialIcons[social.platform]
              return (
                <li key={social.platform}>
                  <a
                    aria-label={`${page.socials?.followLabel.replace('→', '').trim()} ${social.handle} on ${label}`}
                    className="group flex items-center gap-4 rounded-2xl bg-brand-accent/70 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
                    href={social.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-secondary text-brand-accent">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{social.handle}</span>
                      <span className="block text-[13px] text-brand-primary-dark">{social.detail}</span>
                    </span>
                    <span aria-hidden className="text-sm font-semibold text-brand-primary-dark group-hover:text-brand-secondary">{page.socials?.followLabel}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {page.closing && (
        <section aria-labelledby="about-closing-title" className="bg-brand-accent py-20 text-center" data-bleed>
          <div className="page-shell">
            <h2 className="font-script text-[48px] leading-none sm:text-[56px]" id="about-closing-title">{page.closing.title}</h2>
            {page.closing.text && <p className="mt-4 text-brand-primary-dark">{page.closing.text}</p>}
            {page.closing.cta && <CtaButton cta={page.closing.cta} className="mt-7" size="lg" />}
          </div>
        </section>
      )}
    </div>
  )
}
