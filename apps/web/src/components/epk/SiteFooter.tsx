import { useId, useState, type FormEvent } from 'react'
import { FiMail } from 'react-icons/fi'
import type { EPK } from '../../content/schema'
import { socialIcons } from './ui/platforms'
import { SmartLink } from './ui/SmartLink'

type FooterNavItem = { key: string; label: string; url: string }

const headingClass = 'mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-brand-secondary-light'
const linkClass = 'text-[15px] text-brand-accent/85 transition-colors hover:text-brand-accent'

/** Footer signup. Demo only: nothing is sent or stored. */
function FooterSignup({ signup }: { signup: NonNullable<EPK['footer']['signup']> }) {
  const inputId = useId()
  const [done, setDone] = useState(false)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDone(true)
  }

  return (
    <div>
      <h2 className={headingClass}>{signup.title}</h2>
      {signup.text && <p className="mb-4 text-[15px] text-brand-accent/85">{signup.text}</p>}
      {done ? (
        <p className="font-semibold text-brand-primary" role="status">{signup.successMessage}</p>
      ) : (
        <form className="flex flex-wrap gap-2.5" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor={inputId}>Email address</label>
          <input
            autoComplete="email"
            className="h-11 min-w-0 flex-1 basis-40 rounded-xl bg-white px-4 text-brand-secondary placeholder:text-brand-secondary/50 focus:outline-2 focus:outline-brand-primary"
            id={inputId}
            placeholder={signup.placeholder}
            required
            type="email"
          />
          <button className="h-11 rounded-full border border-brand-accent/60 px-7 font-semibold text-brand-accent transition-colors hover:bg-brand-accent hover:text-brand-secondary" type="submit">
            {signup.buttonLabel}
          </button>
        </form>
      )}
    </div>
  )
}

export function SiteFooter({ epk, navItems }: { epk: EPK; navItems: FooterNavItem[] }) {
  const { footer, contact } = epk
  const socials = Object.keys(socialIcons)
    .map((key) => [key, footer.socials[key as keyof typeof footer.socials]] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
  const year = footer.copyrightYear ?? new Date().getFullYear()

  return (
    <footer
      className="bg-brand-secondary bg-(image:--footer-texture) bg-cover bg-center text-brand-accent"
      data-bleed="texture"
      data-section="footer"
    >
      <div className="page-shell grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.5fr] lg:gap-12">
        <div>
          <p className="font-script text-[56px] leading-none">{epk.branding.logoText || epk.artistName}</p>
          {footer.tagline && <p className="mt-3 max-w-xs text-[15px] text-brand-accent/85">{footer.tagline}</p>}
          <ul className="mt-6 flex gap-4">
            {socials.map(([key, url]) => {
              const { label, Icon } = socialIcons[key]
              return (
                <li key={key}>
                  <a aria-label={label} className="block text-brand-accent/85 transition-colors hover:text-brand-accent" href={url} rel="noreferrer" target="_blank">
                    <Icon aria-hidden className="h-5.5 w-5.5" />
                  </a>
                </li>
              )
            })}
            <li>
              <a aria-label={`Email ${contact.bookingEmail}`} className="block text-brand-accent/85 transition-colors hover:text-brand-accent" href={`mailto:${contact.bookingEmail}`}>
                <FiMail aria-hidden className="h-5.5 w-5.5" />
              </a>
            </li>
          </ul>
        </div>
        <nav aria-label="Footer">
          <h2 className={headingClass}>{footer.exploreTitle}</h2>
          <ul className="flex flex-col gap-3">
            {navItems.map((item) => (
              <li key={item.key}>
                <SmartLink className={linkClass} to={item.url}>{item.label}</SmartLink>
              </li>
            ))}
          </ul>
        </nav>
        {footer.listen && (
          <div>
            <h2 className={headingClass}>{footer.listen.title}</h2>
            <ul className="flex flex-col gap-3">
              {footer.listen.links.map((link) => (
                <li key={link.label}>
                  <SmartLink className={linkClass} to={link.url}>{link.label}</SmartLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        {footer.signup && <FooterSignup signup={footer.signup} />}
      </div>
      <div className="page-shell">
        <div className="flex flex-col gap-3 border-t border-brand-accent/15 py-7 text-[13px] text-brand-accent/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {footer.copyrightName}. All rights reserved.</p>
          {footer.legalLinks && footer.legalLinks.length > 0 && (
            <ul className="flex gap-4">
              {footer.legalLinks.map((link) => (
                <li key={link.url}><SmartLink className="hover:text-brand-accent" to={link.url}>{link.label}</SmartLink></li>
              ))}
            </ul>
          )}
          <p>
            {footer.bookingLabel}{' '}
            <a className="hover:text-brand-accent" href={`mailto:${contact.bookingEmail}`}>{contact.bookingEmail}</a>
          </p>
        </div>
        {footer.poweredByLabel && (
          <p className="pb-6 text-center text-xs text-brand-accent/55">
            {footer.poweredByUrl ? <a href={footer.poweredByUrl} rel="noreferrer" target="_blank">{footer.poweredByLabel}</a> : footer.poweredByLabel}
          </p>
        )}
      </div>
    </footer>
  )
}
