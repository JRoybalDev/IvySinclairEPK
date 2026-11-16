import type { Home } from '../../../content/schema'
import { CtaButton } from './CtaButton'
import { Eyebrow } from './Eyebrow'

type PhotoHeroProps = {
  image?: NonNullable<Home['bannerImage']>
  content?: NonNullable<Home['bannerContent']>
  label?: string
}

/** Full-bleed photo with a dark gradient and script headline (Home and Tour heroes). */
export function PhotoHero({ image, content, label = 'Introduction' }: PhotoHeroProps) {
  return (
    <section aria-label={label} className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-brand-secondary lg:min-h-[600px] lg:items-center">
      {image && (
        <picture>
          {image.mobileSrc && <source media="(max-width: 767px)" srcSet={image.mobileSrc} />}
          <img
            alt={image.alt}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            fetchPriority="high"
            src={image.src}
            style={{ objectPosition: image.position }}
          />
        </picture>
      )}
      {/* Darkens the left (desktop) or bottom (mobile) so the copy reads on the photo. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/45 to-black/10 lg:bg-linear-to-r lg:from-black/80 lg:via-black/45 lg:to-transparent" />
      {content && (
        <div className="page-shell w-full py-14 text-brand-accent">
          <div className="max-w-xl">
            {content.eyebrow && <Eyebrow className="text-brand-accent/85">{content.eyebrow}</Eyebrow>}
            <h1 className="mt-4 font-script text-[76px] leading-[0.9] sm:text-[110px]">{content.title}</h1>
            {content.paragraphs.map((paragraph) => (
              <p className="mt-5 max-w-md text-lg text-brand-accent/90" key={paragraph}>{paragraph}</p>
            ))}
            {content.buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {content.buttons.map((button) => (
                  <CtaButton cta={button} key={button.label} size="lg" surface="dark" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
