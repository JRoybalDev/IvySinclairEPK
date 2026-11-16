type ProductThumbProps = {
  src?: string
  alt: string
  className?: string
}

/** Product image centered on a soft cream tile. */
export function ProductThumb({ src, alt, className = 'h-24 w-24 rounded-2xl' }: ProductThumbProps) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden bg-white/60 ${className}`}>
      {src ? (
        <img alt={alt} className="h-[82%] w-[82%] object-contain" loading="lazy" src={src} />
      ) : (
        <span aria-hidden className="font-script text-3xl text-brand-primary-dark">{alt.slice(0, 1)}</span>
      )}
    </div>
  )
}
