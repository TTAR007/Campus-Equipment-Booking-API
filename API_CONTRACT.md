# API Contract

## Base URL

- Local: `http://localhost:8787/api`
- Deployed: `https://campus-equipment-booking-api.tar127290.workers.dev/api`

Send and receive JSON. A successful `DELETE` has no response body. `GET /` and `GET /api` return `200` with `{"name":"Campus Equipment Booking API","status":"ok"}`.

## Endpoints

| Method | Path after Base URL | Success | Result |
| --- | --- | ---: | --- |
| `GET` | `/equipment` | `200` | Array of equipment records |
| `GET` | `/bookings` | `200` | Array of bookings sorted by `startAt`, then `id` |
| `GET` | `/bookings/:id` | `200` | One booking |
| `POST` | `/bookings` | `201` | Created booking |
| `PATCH` | `/bookings/:id` | `200` | Updated booking |
| `DELETE` | `/bookings/:id` | `204` | Empty body |

Equipment records contain `id`, `name`, and `location`. The seeded records are `eq-1` (Projector A, Building 1) and `eq-2` (Camera B, Media Lab).

## Booking data

Send all five fields when creating a booking:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

The response contains those fields plus a generated UUID `id`. `PATCH` accepts a non-empty subset of the same five fields; omitted fields keep their current values. An explicit `null` is invalid.

All fields must be non-empty strings after trimming. `equipmentId` must refer to an existing equipment record. Times must be valid UTC ISO 8601 strings with seconds, optional 1–3 digit milliseconds, and a final `Z`. The API returns times with three-digit milliseconds. `startAt` must be earlier than `endAt`. Unknown request fields are rejected.

## Overlap rule

For the same equipment, a proposed booking conflicts when:

```text
existing.startAt < proposed.endAt
AND existing.endAt > proposed.startAt
```

The start is included and the end is excluded. A booking may start exactly when another ends. Updates exclude the booking being changed from the conflict check.

## Errors

Every error response is JSON with one `error` string, for example `{"error":"Booking not found"}`.

| Status | Meaning |
| ---: | --- |
| `400` | Missing or invalid fields, invalid JSON or time range, or an unknown field |
| `404` | Requested booking, referenced equipment, or route does not exist |
| `409` | Booking time overlaps another booking for the same equipment |
| `500` | Unexpected server error |
