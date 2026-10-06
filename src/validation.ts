import type { Booking } from './db.ts'

export type BookingInput = Omit<Booking, 'id'>
type InputKey = keyof BookingInput
const inputKeys: InputKey[] = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose']

function parseTime(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 19) !== value.slice(0, 19)) return null
  return parsed.toISOString()
}

export function validateInput(value: unknown, existing?: Booking): { data?: BookingInput; error?: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { error: 'A JSON object is required' }
  }
  const fields = value as Record<string, unknown>
  const unknown = Object.keys(fields).find((key) => !inputKeys.includes(key as InputKey))
  if (unknown) return { error: `Unknown field: ${unknown}` }
  if (existing && Object.keys(fields).length === 0) return { error: 'At least one field is required' }

  const data = {} as BookingInput
  for (const key of inputKeys) {
    const field = Object.hasOwn(fields, key) ? fields[key] : existing?.[key]
    if (typeof field !== 'string' || field.trim() === '') {
      return { error: `${key} is required and must be a non-empty string` }
    }
    data[key] = field.trim()
  }
  const startAt = parseTime(data.startAt)
  const endAt = parseTime(data.endAt)
  if (!startAt || !endAt) return { error: 'startAt and endAt must be valid UTC ISO 8601 timestamps' }
  if (startAt >= endAt) return { error: 'startAt must be before endAt' }
  data.startAt = startAt
  data.endAt = endAt
  return { data }
}
