import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { epk } from './src/content'
import { absoluteUrl, buildJsonLd, resolvePageMeta, sitemapPaths } from './src/seo/meta'

/**
 * Writes SEO from src/content/epk.ts into the build:
 * - index.html head: title, description, share tags, favicon, manifest link, JSON-LD
 *   (the home page's tags; the app updates them per route in the browser)
 * - robots.txt, sitemap.xml (when the site URL is known) and site.webmanifest
 */
function epkSeo(): Plugin {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const origin = (epk.metadata?.siteUrl ?? (vercelUrl ? `https://${vercelUrl}` : undefined))?.replace(/\/+$/, '')
  const metadata = epk.metadata
  const home = resolvePageMeta(epk, '/')
  const image = absoluteUrl(origin, home.image)

  const meta = (attrs: Record<string, string | undefined>): HtmlTagDescriptor[] =>
    Object.values(attrs).some((value) => value === undefined) ? [] : [{ tag: 'meta', attrs: attrs as Record<string, string>, injectTo: 'head' }]
  const link = (attrs: Record<string, string | undefined>): HtmlTagDescriptor[] =>
    Object.values(attrs).some((value) => value === undefined) ? [] : [{ tag: 'link', attrs: attrs as Record<string, string>, injectTo: 'head' }]

  return {
    name: 'epk-seo',
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = [
        { tag: 'title', children: home.title, injectTo: 'head' },
        ...meta({ name: 'description', content: home.description }),
        ...meta({ name: 'keywords', content: metadata?.keywords?.join(', ') }),
        ...meta({ name: 'theme-color', content: metadata?.themeColor }),
        ...link({ rel: 'canonical', href: origin ? `${origin}/` : undefined }),
        ...link({ rel: 'icon', href: metadata?.faviconPath, sizes: 'any' }),
        ...link({ rel: 'apple-touch-icon', href: metadata?.appleTouchIcon }),
        ...link({ rel: 'manifest', href: '/site.webmanifest' }),
        ...meta({ property: 'og:type', content: 'website' }),
        ...meta({ property: 'og:site_name', content: epk.artistName }),
        ...meta({ property: 'og:locale', content: metadata?.locale }),
        ...meta({ property: 'og:title', content: home.title }),
        ...meta({ property: 'og:description', content: home.description }),
        ...meta({ property: 'og:url', content: origin ? `${origin}/` : undefined }),
        ...meta({ property: 'og:image', content: image }),
        ...meta({ property: 'og:image:alt', content: home.imageAlt }),
        ...meta({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' }),
        ...meta({ name: 'twitter:title', content: home.title }),
        ...meta({ name: 'twitter:description', content: home.description }),
        ...meta({ name: 'twitter:image', content: image }),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // Escape "<" so content can never close the script tag.
          children: JSON.stringify(buildJsonLd(epk, origin)).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ]
      return { html: html.replace(/\s*<title>[\s\S]*?<\/title>/, ''), tags }
    },
    generateBundle() {
      const noIndexPaths = ['/cart', '/checkout', '/confirmation'].filter((path) => resolvePageMeta(epk, path).noIndex)
      const robots = [
        'User-agent: *',
        ...noIndexPaths.map((path) => `Disallow: ${path}`),
        ...(origin ? ['', `Sitemap: ${origin}/sitemap.xml`] : []),
      ].join('\n')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` })

      if (origin) {
        const urls = sitemapPaths(epk)
          .map((path) => `  <url><loc>${origin}${path === '/' ? '/' : path}</loc></url>`)
          .join('\n')
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        })
      } else {
        this.warn('No metadata.siteUrl (or Vercel production URL): skipped sitemap.xml and canonical links.')
      }

      this.emitFile({
        type: 'asset',
        fileName: 'site.webmanifest',
        source: JSON.stringify({
          name: epk.artistName,
          short_name: epk.artistName,
          description: home.description,
          start_url: '/',
          display: 'standalone',
          theme_color: metadata?.themeColor,
          background_color: epk.branding.theme?.bg ?? '#ededd2',
          icons: (metadata?.manifestIcons ?? []).map((icon) => ({ ...icon, type: 'image/png' })),
        }, null, 2),
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), epkSeo()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
