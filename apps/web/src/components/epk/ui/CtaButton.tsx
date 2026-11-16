import type { ReactNode } from 'react'
import type { Cta } from '../../../content/schema'
import { getButtonProps, type ButtonSize } from '../../shared/buttonStyles'
import { SmartLink } from './SmartLink'

const INK = 'var(--color-brand-secondary)'
const CREAM = 'var(--color-brand-accent)'

type CtaButtonProps = {
  cta: Pick<Cta, 'label' | 'url'> & { style?: Cta['style'] }
  /** Background the button sits on; flips the outline style to cream on dark sections. */
  surface?: 'light' | 'dark'
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  icon?: ReactNode
  onClick?: () => void
}

/** A content-driven button (label, url, style from epk.ts) using the shared Button look. */
export function CtaButton({ cta, surface = 'light', size = 'md', fullWidth, className, icon, onClick }: CtaButtonProps) {
  const style = cta.style ?? 'solid'
  const onDark = surface === 'dark'
  const buttonProps = getButtonProps({
    variant: style === 'outline' ? 'outline' : 'solid',
    shape: 'pill',
    size,
    fullWidth,
    color: style === 'light' || (style === 'outline' && onDark) ? CREAM : INK,
    contrastColor: style === 'light' || (style === 'outline' && onDark) ? INK : CREAM,
    className: `font-semibold ${className ?? ''}`,
  })

  return (
    <SmartLink onClick={onClick} to={cta.url} {...buttonProps}>
      {icon}
      {cta.label}
    </SmartLink>
  )
}
