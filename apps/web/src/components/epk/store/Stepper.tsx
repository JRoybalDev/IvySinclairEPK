import { MAX_QTY } from '../../../store/cart'

type StepperProps = {
  value: number
  onChange: (value: number) => void
  size?: 'sm' | 'lg'
  label?: string
}

/** − qty + control. Never goes below 1; removing a line is a separate action. */
export function Stepper({ value, onChange, size = 'lg', label = 'Quantity' }: StepperProps) {
  const box = size === 'sm' ? 'h-9 w-[104px]' : 'h-13 w-[132px]'
  const button = `grid h-full aspect-square place-items-center rounded-full text-lg transition-colors hover:bg-brand-secondary/10 disabled:opacity-35`

  return (
    <div aria-label={label} className={`flex shrink-0 items-center justify-between rounded-full border border-brand-secondary/30 bg-white/60 ${box}`} role="group">
      <button aria-label="Decrease quantity" className={button} disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))} type="button">−</button>
      <span aria-live="polite" className={`tabular-nums ${size === 'sm' ? 'text-sm' : 'text-base'}`}>{value}</span>
      <button aria-label="Increase quantity" className={button} disabled={value >= MAX_QTY} onClick={() => onChange(Math.min(MAX_QTY, value + 1))} type="button">+</button>
    </div>
  )
}
