import { DatabaseSync } from 'node:sqlite'

export type Booking = {
  id: string
  equipmentId: string
  borrowerName: string
  startAt: string
  endAt: string
  purpose: string
}

export type Equipment = { id: string; name: string; location: string }

export function openDatabase(filename = process.env.DB_FILE ?? 'bookings.sqlite'): DatabaseSync {
  const db = new DatabaseSync(filename)
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      equipment_id TEXT NOT NULL REFERENCES equipment(id),
      borrower_name TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      purpose TEXT NOT NULL,
      CHECK (start_at < end_at)
    );
    CREATE INDEX IF NOT EXISTS bookings_equipment_time
      ON bookings(equipment_id, start_at, end_at);
  `)
  const insertEquipment = db.prepare(
    'INSERT OR IGNORE INTO equipment (id, name, location) VALUES (?, ?, ?)'
  )
  insertEquipment.run('eq-1', 'Projector A', 'Building 1')
  insertEquipment.run('eq-2', 'Camera B', 'Media Lab')
  return db
}

export const bookingColumns = `
  id, equipment_id AS equipmentId, borrower_name AS borrowerName,
  start_at AS startAt, end_at AS endAt, purpose
`
