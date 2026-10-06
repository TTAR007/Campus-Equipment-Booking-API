import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import { createApp } from '../src/app.ts'
import { openDatabase } from '../src/db.ts'

const databases: ReturnType<typeof openDatabase>[] = []
afterEach(() => {
  for (const db of databases.splice(0)) db.close()
})

function setup() {
  const db = openDatabase(':memory:')
  databases.push(db)
  const app = createApp(db)
  const request = (method: string, path: string, body?: unknown) => app.request(path, {
    method,
    headers: { 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  return { db, request }
}

const sample = {
  equipmentId: 'eq-1',
  borrowerName: 'Somchai Jaidee',
  startAt: '2026-10-20T09:00:00.000Z',
  endAt: '2026-10-20T11:00:00.000Z',
  purpose: 'Class presentation',
}

test('equipment is seeded and booking CRUD returns the contract statuses', async () => {
  const { request } = setup()
  for (const path of ['/', '/api', '/api/']) {
    const landing = await request('GET', path)
    assert.equal(landing.status, 200)
    assert.deepEqual(await landing.json(), {
      name: 'Campus Equipment Booking API', status: 'ok',
    })
  }
  const equipment = await request('GET', '/api/equipment')
  assert.equal(equipment.status, 200)
  assert.equal((await equipment.json()).length, 2)

  const created = await request('POST', '/api/bookings', sample)
  assert.equal(created.status, 201)
  const booking = await created.json() as { id: string; equipmentId: string }
  assert.ok(booking.id)
  assert.equal(booking.equipmentId, 'eq-1')

  const listed = await request('GET', '/api/bookings')
  assert.equal(listed.status, 200)
  assert.equal((await listed.json()).length, 1)

  const fetched = await request('GET', `/api/bookings/${booking.id}`)
  assert.equal(fetched.status, 200)
  assert.equal((await fetched.json()).id, booking.id)

  const updated = await request('PATCH', `/api/bookings/${booking.id}`, { purpose: 'Lab exercise' })
  assert.equal(updated.status, 200)
  assert.equal((await updated.json()).purpose, 'Lab exercise')

  const deleted = await request('DELETE', `/api/bookings/${booking.id}`)
  assert.equal(deleted.status, 204)
  assert.equal(await deleted.text(), '')
  assert.equal((await request('GET', `/api/bookings/${booking.id}`)).status, 404)
})

test('overlap is rejected on create and update, while touching times and other equipment work', async () => {
  const { request } = setup()
  const first = await (await request('POST', '/api/bookings', sample)).json() as { id: string }
  const overlapping = await request('POST', '/api/bookings', {
    ...sample, startAt: '2026-10-20T10:00:00.000Z', endAt: '2026-10-20T12:00:00.000Z',
  })
  assert.equal(overlapping.status, 409)
  assert.equal(typeof (await overlapping.json()).error, 'string')

  const adjacent = await request('POST', '/api/bookings', {
    ...sample, startAt: sample.endAt, endAt: '2026-10-20T12:00:00.000Z',
  })
  assert.equal(adjacent.status, 201)
  const second = await adjacent.json() as { id: string }

  const otherEquipment = await request('POST', '/api/bookings', { ...sample, equipmentId: 'eq-2' })
  assert.equal(otherEquipment.status, 201)

  const updateConflict = await request('PATCH', `/api/bookings/${second.id}`, { startAt: '2026-10-20T10:30:00.000Z' })
  assert.equal(updateConflict.status, 409)
  const stillAdjacent = await (await request('GET', `/api/bookings/${second.id}`)).json()
  assert.equal(stillAdjacent.startAt, sample.endAt)

  const selfUpdate = await request('PATCH', `/api/bookings/${first.id}`, { purpose: 'Still valid' })
  assert.equal(selfUpdate.status, 200)
})

test('bad input, missing resources and malformed JSON return JSON errors', async () => {
  const { request } = setup()
  const cases: Array<[string, string, unknown, number]> = [
    ['POST', '/api/bookings', { ...sample, endAt: sample.startAt }, 400],
    ['POST', '/api/bookings', { ...sample, startAt: '2026-02-30T09:00:00Z' }, 400],
    ['POST', '/api/bookings', { ...sample, equipmentId: 'missing' }, 404],
    ['POST', '/api/bookings', { ...sample, borrowerName: '' }, 400],
    ['GET', '/api/bookings/missing', undefined, 404],
    ['PATCH', '/api/bookings/missing', { purpose: 'Test' }, 404],
    ['DELETE', '/api/bookings/missing', undefined, 404],
    ['GET', '/api/unknown', undefined, 404],
  ]
  for (const [method, path, body, status] of cases) {
    const response = await request(method, path, body)
    assert.equal(response.status, status, `${method} ${path}`)
    assert.equal(typeof (await response.json()).error, 'string')
  }
  const malformed = await request('POST', '/api/bookings', undefined)
  assert.equal(malformed.status, 400)
  assert.equal(typeof (await malformed.json()).error, 'string')
})

test('partial update rejects null and impossible time changes', async () => {
  const { request } = setup()
  const booking = await (await request('POST', '/api/bookings', sample)).json() as { id: string }
  const nullField = await request('PATCH', `/api/bookings/${booking.id}`, { purpose: null })
  assert.equal(nullField.status, 400)
  const badTime = await request('PATCH', `/api/bookings/${booking.id}`, { startAt: sample.endAt })
  assert.equal(badTime.status, 400)
  const empty = await request('PATCH', `/api/bookings/${booking.id}`, {})
  assert.equal(empty.status, 400)
})

test('request text resembling SQL stays data and does not alter the schema', async () => {
  const { request } = setup()
  const hostile = "'; DROP TABLE equipment; --"
  const created = await request('POST', '/api/bookings', { ...sample, borrowerName: hostile })
  assert.equal(created.status, 201)
  assert.equal((await created.json()).borrowerName, hostile)
  const equipment = await request('GET', '/api/equipment')
  assert.equal(equipment.status, 200)
  assert.equal((await equipment.json()).length, 2)
})

test('bookings survive closing and reopening the SQLite file', async () => {
  const filename = join(tmpdir(), `campus-bookings-${randomUUID()}.sqlite`)
  let db = openDatabase(filename)
  try {
    const created = await createApp(db).request('/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(sample),
    })
    assert.equal(created.status, 201)
    const { id } = await created.json() as { id: string }
    db.close()
    db = openDatabase(filename)
    const fetched = await createApp(db).request(`/api/bookings/${id}`)
    assert.equal(fetched.status, 200)
    assert.equal((await fetched.json()).id, id)
  } finally {
    db.close()
    unlinkSync(filename)
  }
})
