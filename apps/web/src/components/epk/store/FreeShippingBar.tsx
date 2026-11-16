import { FiTruck } from 'react-icons/fi'
import { formatMoney } from '../../../utils/format'

export function FreeShippingBar({ subtotal, threshold, currency }: { subtotal: number; threshold: number; currency: string }) {
  if (threshold <= 0) return null
  const left = Math.max(0, threshold - subtotal)
  const percent = Math.min(100, (subtotal / threshold) * 100)
  const text = subtotal === 0
    ? `Free shipping on orders over ${formatMoney(threshold, currency)}`
    : left > 0
      ? `You’re ${formatMoney(left, currency)} away from free shipping`
      : 'You’ve unlocked free shipping!'

  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-2 text-[15px] font-semibold" aria-live="polite">
        <FiTruck aria-hidden className="h-4.5 w-4.5" />
        {text}
      </p>
      <div
        aria-label="Progress toward free shipping"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(percent)}
        className="h-1.5 overflow-hidden rounded-full bg-brand-secondary/12"
        role="progressbar"
      >
        <div className="h-full rounded-full bg-brand-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
