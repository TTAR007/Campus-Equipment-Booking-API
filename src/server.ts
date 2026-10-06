import { serve } from '@hono/node-server'
import { createApp } from './app.ts'
import { openDatabase } from './db.ts'

const port = Number(process.env.PORT ?? 8787)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer from 1 to 65535')
}

const db = openDatabase()
serve({ fetch: createApp(db).fetch, port }, () => {
  console.log(`API running at http://localhost:${port}/api`)
})
