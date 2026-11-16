import { FiCheck } from 'react-icons/fi'

/** Cart → Checkout → Confirmation progress indicator. */
export function CheckoutSteps({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol aria-label="Checkout progress" className="flex items-center justify-center gap-2 text-sm sm:gap-3">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li className="flex items-center gap-2 sm:gap-3" key={step} {...(active && { 'aria-current': 'step' as const })}>
            {index > 0 && <span aria-hidden className={`h-px w-6 sm:w-12 ${done || active ? 'bg-brand-secondary' : 'bg-brand-secondary/25'}`} />}
            <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold ${done || active ? 'bg-brand-secondary text-brand-accent' : 'border border-brand-secondary/30 text-brand-secondary/60'}`}>
              {done ? <FiCheck aria-hidden /> : index + 1}
            </span>
            <span className={active ? 'font-semibold' : 'text-brand-secondary/70'}>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
