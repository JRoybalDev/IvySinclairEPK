import { handle } from 'hono/vercel'
import { app } from '../apps/api/src/index.js'

// Vercel treats any file under api/ as a serverless function. This catch-all route
// forwards every /api/* request to the same Hono app used for local dev (apps/api),
// so the request-handling logic only lives in one place.
//
// Export one handler per HTTP method: Vercel runs these with the web-standard
// Request/Response signature that handle() expects. A bare default-export function
// is invoked Node-style as (req, res) instead, so its returned Response is never sent.
const handler = handle(app)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
export const HEAD = handler
