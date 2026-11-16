import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { isInternalUrl } from '../../../utils/format'

type SmartLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

/** Router link for on-site paths; a plain anchor (new tab for http links) for everything else. */
export function SmartLink({ to, children, ...props }: SmartLinkProps) {
  if (isInternalUrl(to)) {
    return <Link to={to} {...props}>{children}</Link>
  }
  const external = /^https?:/.test(to)
  return (
    <a href={to} {...(external && { rel: 'noreferrer', target: '_blank' })} {...props}>
      {children}
    </a>
  )
}
