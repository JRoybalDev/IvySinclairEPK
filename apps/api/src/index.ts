import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { integrations } from './integrations/index.js'

export const app = new Hono()

// Comma-separated list of frontend origins allowed by CORS. Unset allows any origin,
// which is fine locally and for same-origin Vercel deploys.
const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})

app.use('*', cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : '*' }))

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// The visitor's country, used to pick their merch store region. Vercel sets this header from
// the request IP; it's absent locally, where the web app falls back to the browser language.
// Only the two-letter code is returned and nothing is stored.
app.get('/api/geo', (c) => {
  const header = c.req.header('x-vercel-ip-country')?.toUpperCase()
  const country = header && /^[A-Z]{2}$/.test(header) ? header : null
  c.header('Cache-Control', 'private, no-store')
  c.header('Vary', 'x-vercel-ip-country')
  return c.json({ country })
})

app.route('/api/integrations', integrations)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal server error' }, 500)
})

export default { port: Number(process.env.PORT ?? 3001), fetch: app.fetch }
