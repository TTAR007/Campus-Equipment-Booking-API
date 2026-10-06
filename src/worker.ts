import { Hono } from 'hono'
import type { Booking, Equipment } from './db.ts'
import { apiStatus } from './status.ts'
import { validateInput } from './validation.ts'

interface Statement {
  bind(...values: (string | number | null)[]): Statement
  first<T>(): Promise<T | null>
  all<T>(): Promise<{ results: T[] }>
  run(): Promise<unknown>
}
interface D1Database {
  prepare(query: string): Statement
}
type Env = { Bindings: { DB: D1Database } }

const columns = `id, equipment_id AS equipmentId, borrower_name AS borrowerName,
  start_at AS startAt, end_at AS endAt, purpose`
const app = new Hono<Env>()

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal server error' }, 500)
})
app.notFound((c) => c.json({ error: 'Resource not found' }, 404))

app.get('/', (c) => c.json(apiStatus))
app.get('/api', (c) => c.json(apiStatus))
app.get('/api/', (c) => c.json(apiStatus))

async function readBody(c: { req: { json: () => Promise<unknown> } }): Promise<unknown> {
  try {
    return await c.req.json()
  } catch {
    return null
  }
}

async function equipmentExists(db: D1Database, id: string): Promise<boolean> {
  return !!(await db.prepare('SELECT 1 FROM equipment WHERE id = ?').bind(id).first())
}

function isOverlap(error: unknown): boolean {
  return String(error).includes('booking_overlap')
}

app.get('/api/equipment', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, name, location FROM equipment ORDER BY id').all<Equipment>()
  return c.json(results)
})

app.get('/api/bookings', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT ${columns} FROM bookings ORDER BY start_at, id`).all<Booking>()
  return c.json(results)
})

app.get('/api/bookings/:id', async (c) => {
  const row = await c.env.DB.prepare(`SELECT ${columns} FROM bookings WHERE id = ?`)
    .bind(c.req.param('id')).first<Booking>()
  return row ? c.json(row) : c.json({ error: 'Booking not found' }, 404)
})

app.post('/api/bookings', async (c) => {
  const checked = validateInput(await readBody(c))
  if (!checked.data) return c.json({ error: checked.error }, 400)
  const data = checked.data
  const db = c.env.DB
  if (!(await equipmentExists(db, data.equipmentId))) return c.json({ error: 'Equipment not found' }, 404)
  const id = crypto.randomUUID()
  try {
    await db.prepare(`INSERT INTO bookings
      (id, equipment_id, borrower_name, start_at, end_at, purpose)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(id, data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose).run()
  } catch (error) {
    if (isOverlap(error)) return c.json({ error: 'Booking time conflicts with an existing booking' }, 409)
    throw error
  }
  return c.json({ id, ...data }, 201)
})

app.patch('/api/bookings/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const existing = await db.prepare(`SELECT ${columns} FROM bookings WHERE id = ?`).bind(id).first<Booking>()
  if (!existing) return c.json({ error: 'Booking not found' }, 404)
  const checked = validateInput(await readBody(c), existing)
  if (!checked.data) return c.json({ error: checked.error }, 400)
  const data = checked.data
  if (!(await equipmentExists(db, data.equipmentId))) return c.json({ error: 'Equipment not found' }, 404)
  try {
    await db.prepare(`UPDATE bookings SET equipment_id = ?, borrower_name = ?,
      start_at = ?, end_at = ?, purpose = ? WHERE id = ?`)
      .bind(data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose, id).run()
  } catch (error) {
    if (isOverlap(error)) return c.json({ error: 'Booking time conflicts with an existing booking' }, 409)
    throw error
  }
  return c.json({ id, ...data })
})

app.delete('/api/bookings/:id', async (c) => {
  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT 1 FROM bookings WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Booking not found' }, 404)
  await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run()
  return c.body(null, 204)
})

export default app
