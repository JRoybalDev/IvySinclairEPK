// Shared component: portable between projects. See ./README.md for the rules.
// Requires: react, ./useNow.ts

import { Fragment } from 'react'
import { useNow } from './useNow'

const UNITS = ['Weeks', 'Days', 'Hours', 'Minutes'] as const
const pad = (value: number) => String(value).padStart(2, '0')

type CountdownProps = {
  /** ISO date-time to count down to. */
  target: string
  className?: string
  /** Classes for the small unit labels under each number. */
  labelClassName?: string
}

/** Live countdown shown as weeks : days : hours : minutes. Stops at zero. */
export function Countdown({ target, className, labelClassName = 'text-xs opacity-75' }: CountdownProps) {
  const now = useNow(1000)
  const targetMs = Date.parse(target)
  const remaining = now === null || Number.isNaN(targetMs) ? 0 : Math.max(0, targetMs - now)
  const totalMinutes = Math.floor(remaining / 60000)
  const values = [
    Math.floor(totalMinutes / (7 * 24 * 60)),
    Math.floor(totalMinutes / (24 * 60)) % 7,
    Math.floor(totalMinutes / 60) % 24,
    totalMinutes % 60,
  ]
  const summary = values.map((value, index) => `${value} ${UNITS[index].toLowerCase()}`).join(', ')

  return (
    <div aria-label={`Time remaining: ${summary}`} className={`flex items-start justify-center gap-2 sm:gap-3 ${className ?? ''}`} role="timer">
      {values.map((value, index) => (
        <Fragment key={UNITS[index]}>
          <div aria-hidden className="flex min-w-[2.2em] flex-col items-center">
            <span className="leading-tight tabular-nums">{pad(value)}</span>
            <span className={labelClassName}>{UNITS[index]}</span>
          </div>
          {index < values.length - 1 && <span aria-hidden className="leading-tight">:</span>}
        </Fragment>
      ))}
    </div>
  )
}
