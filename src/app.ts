import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { Hono } from 'hono'
import { bookingColumns, type Booking, type Equipment } from './db.ts'
import { apiStatus } from './status.ts'
import { validateInput, type BookingInput } from './validation.ts'

export function createApp(db: DatabaseSync): Hono {
  const app = new Hono()

  app.onError((error, c) => {
    console.error(error)
    return c.json({ error: 'Internal server error' }, 500)
  })
  app.notFound((c) => c.json({ error: 'Resource not found' }, 404))

  app.get('/', (c) => c.json(apiStatus))
  app.get('/api', (c) => c.json(apiStatus))
  app.get('/api/', (c) => c.json(apiStatus))

  app.get('/api/equipment', (c) => {
    const rows = db.prepare('SELECT id, name, location FROM equipment ORDER BY id').all() as Equipment[]
    return c.json(rows)
  })

  app.get('/api/bookings', (c) => {
    const rows = db.prepare(`SELECT ${bookingColumns} FROM bookings ORDER BY start_at, id`).all() as Booking[]
    return c.json(rows)
  })

  app.get('/api/bookings/:id', (c) => {
    const row = db.prepare(`SELECT ${bookingColumns} FROM bookings WHERE id = ?`).get(c.req.param('id')) as Booking | undefined
    return row ? c.json(row) : c.json({ error: 'Booking not found' }, 404)
  })

  async function readBody(c: { req: { json: () => Promise<unknown> } }): Promise<unknown> {
    try {
      return await c.req.json()
    } catch {
      return null
    }
  }

  function equipmentExists(id: string): boolean {
    return !!db.prepare('SELECT 1 FROM equipment WHERE id = ?').get(id)
  }

  function hasConflict(data: BookingInput, excludeId?: string): boolean {
    return !!db.prepare(`
      SELECT 1 FROM bookings
      WHERE equipment_id = ? AND start_at < ? AND end_at > ? AND id != ?
      LIMIT 1
    `).get(data.equipmentId, data.endAt, data.startAt, excludeId ?? '')
  }

  app.post('/api/bookings', async (c) => {
    const checked = validateInput(await readBody(c))
    if (!checked.data) return c.json({ error: checked.error }, 400)
    const data = checked.data
    db.exec('BEGIN IMMEDIATE')
    try {
      if (!equipmentExists(data.equipmentId)) {
        db.exec('ROLLBACK')
        return c.json({ error: 'Equipment not found' }, 404)
      }
      if (hasConflict(data)) {
        db.exec('ROLLBACK')
        return c.json({ error: 'Booking time conflicts with an existing booking' }, 409)
      }
      const id = randomUUID()
      db.prepare(`
        INSERT INTO bookings (id, equipment_id, borrower_name, start_at, end_at, purpose)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose)
      db.exec('COMMIT')
      return c.json({ id, ...data }, 201)
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  })

  app.patch('/api/bookings/:id', async (c) => {
    const id = c.req.param('id')
    const body = await readBody(c)
    db.exec('BEGIN IMMEDIATE')
    try {
      const existing = db.prepare(`SELECT ${bookingColumns} FROM bookings WHERE id = ?`).get(id) as Booking | undefined
      if (!existing) {
        db.exec('ROLLBACK')
        return c.json({ error: 'Booking not found' }, 404)
      }
      const checked = validateInput(body, existing)
      if (!checked.data) {
        db.exec('ROLLBACK')
        return c.json({ error: checked.error }, 400)
      }
      const data = checked.data
      if (!equipmentExists(data.equipmentId)) {
        db.exec('ROLLBACK')
        return c.json({ error: 'Equipment not found' }, 404)
      }
      if (hasConflict(data, id)) {
        db.exec('ROLLBACK')
        return c.json({ error: 'Booking time conflicts with an existing booking' }, 409)
      }
      db.prepare(`
        UPDATE bookings SET equipment_id = ?, borrower_name = ?, start_at = ?, end_at = ?, purpose = ?
        WHERE id = ?
      `).run(data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose, id)
      db.exec('COMMIT')
      return c.json({ id, ...data })
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  })

  app.delete('/api/bookings/:id', (c) => {
    const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(c.req.param('id'))
    return result.changes ? c.body(null, 204) : c.json({ error: 'Booking not found' }, 404)
  })

  return app
}
