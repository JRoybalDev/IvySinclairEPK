/**
 * Dismisses the full-screen loader from index.html.
 *
 * index.html turns the loader on (html[data-loader]) for reloads of any page and for fresh loads of the
 * home page. It stays up until the page, its images and fonts have loaded (at least MIN_MS so the
 * animation can play, at most MAX_MS so a slow embed never traps the visitor), then slides up and is removed.
 */
const MIN_MS = 1400
const MAX_MS = 5000
const EXIT_FALLBACK_MS = 2000

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)))

export function dismissInitialLoader() {
  const root = document.documentElement
  const loader = document.getElementById('epk-loader')
  if (!loader) return
  if (!root.hasAttribute('data-loader')) {
    loader.remove()
    return
  }

  const pageLoaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))

  // performance.now() counts from navigation start, so time spent downloading the bundle counts toward MIN_MS.
  const ready = Promise.all([delay(MIN_MS - performance.now()), pageLoaded, document.fonts?.ready])

  void Promise.race([ready, delay(MAX_MS - performance.now())]).then(() => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      loader.remove()
      root.removeAttribute('data-loader')
    }
    loader.addEventListener('transitionend', (event) => {
      if (event.target === loader && event.propertyName === 'transform') finish()
    })
    setTimeout(finish, EXIT_FALLBACK_MS)
    root.setAttribute('data-loader', 'done')
  })
}
