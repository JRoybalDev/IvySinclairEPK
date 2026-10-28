// Shared helper: portable between projects. See ./README.md for the rules.
// Requires: react (types only)

import type { CSSProperties } from 'react'

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonShape = 'rounded' | 'pill' | 'square'

export type ButtonStyleOptions = {
  /** Visual treatment. `solid` fills with `color`; `outline` and `ghost` use `color` for text. */
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  /**
   * Main color (any CSS color, including `var(--x)`). Falls back to the
   * `--button-color` custom property, so a project can theme every button at once.
   */
  color?: string
  /** Text color on top of `color` for `solid`, and hover text for `outline`. Falls back to `--button-contrast`. */
  contrastColor?: string
  /** Stretch to the width of the container. */
  fullWidth?: boolean
  /** Extra classes, appended last so they win over the defaults. */
  className?: string
  style?: CSSProperties
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none transition-colors duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

// Class strings stay literal so Tailwind's scanner can find them.
// --button-color defaults to #171717 and --button-contrast to #ffffff.
const variantClasses: Record<ButtonVariant, string> = {
  solid:
    'border border-transparent bg-[var(--button-color,#171717)] text-[var(--button-contrast,#ffffff)] hover:bg-[color-mix(in_srgb,var(--button-color,#171717)_85%,var(--button-contrast,#ffffff))]',
  outline:
    'border border-[var(--button-color,#171717)] bg-transparent text-[var(--button-color,#171717)] hover:bg-[var(--button-color,#171717)] hover:text-[var(--button-contrast,#ffffff)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--button-color,#171717)] hover:bg-[color-mix(in_srgb,var(--button-color,#171717)_12%,transparent)]',
  link: 'border-0 bg-transparent text-[var(--button-color,#171717)] underline underline-offset-4 hover:no-underline',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-6 text-base',
  lg: 'min-h-13 px-8 text-lg',
}

const shapeClasses: Record<ButtonShape, string> = {
  rounded: 'rounded-md',
  pill: 'rounded-full',
  square: 'rounded-none',
}

/**
 * Returns the `className` and `style` for a button look, so non-button elements
 * (e.g. a router `<Link>`) can match `<Button>` exactly: `<Link {...getButtonProps({ variant: 'outline' })} />`.
 */
export function getButtonProps({
  variant = 'solid',
  size = 'md',
  shape = 'rounded',
  color: colorValue,
  contrastColor,
  fullWidth = false,
  className,
  style,
}: ButtonStyleOptions = {}): { className: string; style: CSSProperties } {
  const classes = [
    baseClasses,
    variantClasses[variant],
    // The link variant reads as text, so it drops the padding and height.
    variant === 'link' ? 'p-0' : `${sizeClasses[size]} ${shapeClasses[shape]}`,
    fullWidth ? 'w-full' : '',
    className ?? '',
  ]

  return {
    className: classes.filter(Boolean).join(' '),
    style: {
      ...(colorValue && { '--button-color': colorValue }),
      ...(contrastColor && { '--button-contrast': contrastColor }),
      ...style,
    } as CSSProperties,
  }
}
