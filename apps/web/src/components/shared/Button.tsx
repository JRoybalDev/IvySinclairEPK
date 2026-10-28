// Shared component: portable between projects. See ./README.md for the rules.
// Requires: react, ./buttonStyles.ts

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { getButtonProps, type ButtonStyleOptions } from './buttonStyles'

type ButtonContentProps = Omit<ButtonStyleOptions, 'className' | 'style'> & {
  children: ReactNode
  /** Icon or element shown before the label. */
  leadingIcon?: ReactNode
  /** Icon or element shown after the label. */
  trailingIcon?: ReactNode
  /** Shows a spinner and blocks interaction. */
  loading?: boolean
}

type ButtonAsButtonProps = ButtonContentProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonContentProps> & {
    href?: undefined
  }

type ButtonAsLinkProps = ButtonContentProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof ButtonContentProps> & {
    href: string
    /** Opens in a new tab with `rel="noreferrer"`. */
    external?: boolean
  }

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-[1em] animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  )
}

/**
 * The site-wide button. Renders a `<button>`, or an `<a>` when `href` is set.
 * Look is controlled by `variant`, `size`, `shape`, `color` and `contrastColor`;
 * `className` is appended last for one-off tweaks. For router links, spread
 * `getButtonProps()` from ./buttonStyles onto the link component instead.
 */
export function Button(props: ButtonProps) {
  const {
    children,
    leadingIcon,
    trailingIcon,
    loading = false,
    variant,
    size,
    shape,
    color,
    contrastColor,
    fullWidth,
    className,
    style,
    ...elementProps
  } = props

  const look = getButtonProps({ variant, size, shape, color, contrastColor, fullWidth, className, style })
  const content = (
    <>
      {loading ? <Spinner /> : leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </>
  )

  if (elementProps.href !== undefined) {
    // Destructuring drops the union narrowing, so restore it for the anchor branch.
    const { external, ...anchorProps } = elementProps as Omit<ButtonAsLinkProps, keyof ButtonStyleOptions | keyof ButtonContentProps>

    return (
      <a
        {...anchorProps}
        {...look}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        rel={external ? 'noreferrer' : anchorProps.rel}
        target={external ? '_blank' : anchorProps.target}
      >
        {content}
      </a>
    )
  }

  const { type = 'button', disabled, ...buttonProps } = elementProps as Omit<
    ButtonAsButtonProps,
    keyof ButtonStyleOptions | keyof ButtonContentProps
  >

  return (
    <button {...buttonProps} {...look} aria-busy={loading || undefined} disabled={disabled || loading} type={type}>
      {content}
    </button>
  )
}
