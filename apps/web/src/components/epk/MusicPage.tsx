import { FiPlay } from 'react-icons/fi'
import type { MusicSpotlight, Video } from '../../content/schema'
import { useEPKOutlet } from '../../hooks/useEPKOutlet'
import { releaseTypeLabels, releaseYear } from '../../utils/format'
import { Countdown } from '../shared/Countdown'
import { useNow } from '../shared/useNow'
import { CtaButton } from './ui/CtaButton'
import { Eyebrow } from './ui/Eyebrow'
import { platformInfo } from './ui/platforms'
import { PlatformPill } from './ui/PlatformPill'
import { SectionTitle } from './ui/SectionTitle'
import { SignupCard } from './ui/SignupCard'

/** Coming Soon until the premiere passes (when status is "auto"), then Out Now. */
function Spotlight({ spotlight }: { spotlight: MusicSpotlight }) {
  const now = useNow(60_000)
  const premiered = now !== null && now >= Date.parse(spotlight.premiereAt)
  const outNow = spotlight.status === 'out_now' || (spotlight.status === 'auto' && premiered)
  const copy = outNow ? spotlight.outNow : spotlight.comingSoon

  return (
    <section
      aria-labelledby="spotlight-title"
      className="relative isolate bg-brand-secondary bg-cover bg-center text-brand-accent"
      style={spotlight.backgroundImage ? { backgroundImage: `url("${spotlight.backgroundImage}")` } : undefined}
    >
      {spotlight.backgroundImage && (
        <div aria-hidden className="absolute inset-0 -z-10 bg-brand-secondary" style={{ opacity: spotlight.backgroundTint }} />
      )}
      <div className="page-shell grid items-center gap-10 py-14 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-14 lg:py-20">
        <img alt={spotlight.coverAlt} className="aspect-square w-full rounded-2xl object-cover shadow-2xl" fetchPriority="high" src={spotlight.coverImage} />
        <div>
          {/* Out Now gets a plain eyebrow; before the premiere the label heads the countdown box instead. */}
          {outNow && (
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[#1DB954]" />
              {copy.badge}
            </p>
          )}
          <h1 className="font-script text-[68px] leading-none sm:text-[88px]" id="spotlight-title">{spotlight.title}</h1>
          <p className="mt-4 max-w-xl text-[17px] text-brand-accent/85">{copy.text}</p>
          {!outNow && (
            <div className="mt-7 rounded-2xl border border-brand-accent/20 bg-brand-accent/5 px-5 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent/70">{copy.badge}</p>
              <Countdown className="mt-2 text-[40px] sm:text-[52px]" labelClassName="text-xs text-brand-accent/70" target={spotlight.premiereAt} />
            </div>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {outNow && spotlight.outNow.watch && (
              <CtaButton cta={spotlight.outNow.watch} icon={<FiPlay aria-hidden />} size="lg" surface="dark" />
            )}
            {copy.links.map((link) => <PlatformPill key={link.platform + link.url} link={link} surface="dark" />)}
          </div>
        </div>
      </div>
    </section>
  )
}

function VideoCard({ video, featured = false }: { video: Video; featured?: boolean }) {
  const thumbnail = (
    <div className={`relative overflow-hidden bg-brand-secondary shadow-lg ${featured ? 'aspect-video rounded-3xl' : 'aspect-video rounded-2xl'}`}>
      {video.thumbnail && (
        <img alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" loading="lazy" src={video.thumbnail} />
      )}
      <span aria-hidden className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors group-hover:bg-black/75 ${featured ? 'h-18 w-18' : 'h-13 w-13'}`}>
        <FiPlay className={featured ? 'ml-1 h-7 w-7' : 'ml-0.5 h-5 w-5'} />
      </span>
    </div>
  )
  // Title with the video type as a plain meta line below, like the Discography cards.
  const label = (
    <div className="mt-3">
      <h3 className={featured ? 'text-xl font-semibold' : 'text-[15px] font-semibold'}>{video.title}</h3>
      {video.tag && <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary-dark">{video.tag}</p>}
    </div>
  )

  return video.url ? (
    <a aria-label={`Watch ${video.caption ?? video.title}`} className="group block" href={video.url} rel="noreferrer" target="_blank">
      {thumbnail}
      {label}
    </a>
  ) : (
    <div className="group">
      {thumbnail}
      {label}
    </div>
  )
}

export function MusicPage() {
  const { epk } = useEPKOutlet()
  const { music, branding } = epk
  const releases = [...music.releases].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  const videos = [...epk.videos].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  )
  const [featuredVideo, ...otherVideos] = videos
  const listen = music.listen
  const player = listen?.player

  return (
    <div data-section="music">
      {music.spotlight && <Spotlight spotlight={music.spotlight} />}

      {listen && (
        <section aria-labelledby="listen-title" className="page-shell grid items-center gap-10 py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16 lg:py-24">
          <div>
            {listen.eyebrow && <Eyebrow>{listen.eyebrow}</Eyebrow>}
            <h2 className="mt-3 font-script text-[52px] leading-none sm:text-[60px]" id="listen-title">{listen.title}</h2>
            {listen.text && <p className="mt-4 max-w-md text-[17px]">{listen.text}</p>}
            <ul className="mt-7 flex flex-wrap gap-3">
              {listen.platforms.map((link) => {
                const { label, Icon } = platformInfo[link.platform]
                return (
                  <li key={link.platform}>
                    <a aria-label={label} className="grid h-12 w-12 place-items-center rounded-full bg-brand-accent shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" href={link.url} rel="noreferrer" target="_blank" title={label}>
                      <Icon aria-hidden className="h-5.5 w-5.5" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
          {player && (
            <div className="rounded-3xl bg-brand-secondary p-6 text-brand-accent shadow-2xl sm:p-7">
              <div className="flex items-center gap-4">
                <img alt="" className="h-18 w-18 rounded-xl object-cover" loading="lazy" src={player.coverImage} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent/65">{player.nowPlayingLabel}</p>
                  <p className="truncate text-lg font-semibold">{player.title}</p>
                  <p className="text-sm text-brand-accent/70">{player.artist}</p>
                </div>
                {player.playUrl && (
                  <a aria-label={`Play ${player.title}`} className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-[#1DB954] text-brand-secondary transition-transform hover:scale-105" href={player.playUrl} rel="noreferrer" target="_blank">
                    <FiPlay aria-hidden className="ml-0.5 h-5.5 w-5.5 fill-current" />
                  </a>
                )}
              </div>
              <div aria-hidden className="mt-6">
                <div className="h-1 overflow-hidden rounded-full bg-brand-accent/20">
                  <div className="h-full rounded-full bg-brand-accent" style={{ width: `${player.progress * 100}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-brand-accent/60">
                  <span>{player.elapsed}</span>
                  <span>{player.tracks[0]?.duration}</span>
                </div>
              </div>
              <ol className="mt-4 flex flex-col gap-1">
                {player.tracks.map((track, index) => (
                  <li
                    className={`flex items-center gap-4 rounded-xl px-3 py-2.5 text-sm ${index === 0 ? 'bg-brand-accent/10 font-semibold text-[#1DB954]' : ''}`}
                    key={track.title}
                  >
                    <span className="w-4 text-xs tabular-nums text-brand-accent/55">{index + 1}</span>
                    <span className="flex-1 truncate">{track.title}</span>
                    <span className="text-xs tabular-nums text-brand-accent/60">{track.duration}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {releases.length > 0 && (
        <section aria-labelledby="discography-title" className="page-shell pb-20 lg:pb-24">
          <SectionTitle divider={branding.dividerImage} id="discography-title" title={music.discographyTitle} />
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {releases.map((release) => (
              <li key={release.id}>
                <img alt={`${release.title} cover`} className="aspect-square w-full rounded-2xl object-cover shadow-lg" loading="lazy" src={release.heroImage} />
                <h3 className="mt-3 font-semibold">{release.title}</h3>
                <p className="text-[13px] text-brand-primary-dark">
                  {[releaseTypeLabels[release.type], releaseYear(release)].filter(Boolean).join(' · ')}
                </p>
                {release.smartLinkUrl && (
                  <a aria-label={`Listen to ${release.title}`} className="mt-2 inline-block text-[13px] font-semibold hover:underline" href={release.smartLinkUrl} rel="noreferrer" target="_blank">
                    {music.discographyLinkLabel}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {featuredVideo && (
        <section aria-labelledby="videos-title" className="bg-brand-accent/45 py-20 lg:py-24">
          <div className="page-shell">
            <SectionTitle divider={branding.dividerImage} id="videos-title" title={music.videosTitle} />
            <div className="mt-10">
              <VideoCard featured video={featuredVideo} />
            </div>
            {otherVideos.length > 0 && (
              <ul className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {otherVideos.map((video) => (
                  <li key={video.id}><VideoCard video={video} /></li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {music.signup && (
        <div className="page-shell py-20">
          <SignupCard signup={music.signup} />
        </div>
      )}
    </div>
  )
}
