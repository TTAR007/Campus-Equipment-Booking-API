import assert from 'node:assert/strict'

const base = process.env.BASE_URL ?? 'http://localhost:8787/api'
const start = new Date(Date.now() + 86_400_000 + Math.floor(Math.random() * 100_000_000))
const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
const overlapStart = new Date(start.getTime() + 60 * 60 * 1000)
const overlapEnd = new Date(end.getTime() + 60 * 60 * 1000)
const adjacentEnd = new Date(end.getTime() + 2 * 60 * 60 * 1000)
const booking = {
  equipmentId: 'eq-1',
  borrowerName: 'Smoke Test',
  startAt: start.toISOString(),
  endAt: end.toISOString(),
  purpose: 'HTTP verification',
}

async function check(label, method, path, expected, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  assert.equal(response.status, expected, `${label}: ${text}`)
  console.log(`${label}: ${method} ${path} -> ${response.status} ${text}`)
  return text ? JSON.parse(text) : null
}

console.log(`Base API URL: ${base}`)
await check('Equipment list', 'GET', '/equipment', 200)
const created = await check('Create', 'POST', '/bookings', 201, booking)
try {
  await check('Read one', 'GET', `/bookings/${created.id}`, 200)
  await check('Read list', 'GET', '/bookings', 200)
  await check('Update', 'PATCH', `/bookings/${created.id}`, 200, { purpose: 'Updated HTTP verification' })
  await check('Conflict', 'POST', '/bookings', 409, {
    ...booking, startAt: overlapStart.toISOString(), endAt: overlapEnd.toISOString(),
  })
  const adjacent = await check('Adjacent booking', 'POST', '/bookings', 201, {
    ...booking, startAt: end.toISOString(), endAt: adjacentEnd.toISOString(),
  })
  try {
    await check('Update conflict', 'PATCH', `/bookings/${adjacent.id}`, 409, {
      startAt: overlapStart.toISOString(),
    })
  } finally {
    await check('Delete adjacent booking', 'DELETE', `/bookings/${adjacent.id}`, 204)
  }
  await check('Invalid time', 'POST', '/bookings', 400, { ...booking, endAt: booking.startAt })
  await check('Missing equipment', 'POST', '/bookings', 404, { ...booking, equipmentId: 'does-not-exist' })
} finally {
  await check('Delete', 'DELETE', `/bookings/${created.id}`, 204)
  await check('Deleted booking', 'GET', `/bookings/${created.id}`, 404)
}
