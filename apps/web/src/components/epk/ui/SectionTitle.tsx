import type { ElementType } from 'react'

type SectionTitleProps = {
  title: string
  /** Ornament shown on both sides (mirrored on the right). */
  divider?: string
  as?: ElementType
  id?: string
  className?: string
}

/** Script section title flanked by the brand's vine ornaments. */
export function SectionTitle({ title, divider, as: Heading = 'h2', id, className }: SectionTitleProps) {
  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-7 ${className ?? ''}`}>
      {divider && <img alt="" aria-hidden className="h-auto w-12 shrink-0 sm:w-36" src={divider} />}
      <Heading className="whitespace-nowrap font-script text-[36px] leading-none sm:text-[52px]" id={id}>
        {title}
      </Heading>
      {divider && <img alt="" aria-hidden className="h-auto w-12 shrink-0 -scale-x-100 sm:w-36" src={divider} />}
    </div>
  )
}
