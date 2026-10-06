# API Contract

Base URL: `http://localhost:8787/api` locally, or `https://campus-equipment-booking-api.tar127290.workers.dev/api` on Cloudflare. All responses are JSON except successful `DELETE`, which has no body.

`GET /` and `GET /api` return `200` with `{"name":"Campus Equipment Booking API","status":"ok"}`.

| Method | Path | Success | Response |
| --- | --- | ---: | --- |
| GET | `/equipment` | 200 | Array of `{ id, name, location }` |
| GET | `/bookings` | 200 | Array of bookings, sorted by start time |
| GET | `/bookings/:id` | 200 | One booking |
| POST | `/bookings` | 201 | Created booking |
| PATCH | `/bookings/:id` | 200 | Updated booking |
| DELETE | `/bookings/:id` | 204 | Empty body |

Create request:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

All five fields are required on `POST`. `PATCH` accepts a non-empty subset. The response adds a generated UUID `id`. Strings must be non-empty after trimming. Timestamps must be valid UTC ISO 8601 values with seconds and optional 1–3 digit milliseconds, ending in `Z`. The start must precede the end. Times are stored and returned in canonical millisecond precision.

Two bookings conflict when they use the same equipment and `existing.startAt < proposed.endAt` and `existing.endAt > proposed.startAt`. Adjacent bookings are allowed. On update, the booking being edited is excluded from the conflict search.

Errors have the form `{"error":"message"}`. `400` means malformed JSON, missing or invalid data, or an unknown field. `404` means a requested booking or referenced equipment does not exist. `409` means a booking time conflicts with an existing booking. Unexpected server errors return `500` in the same JSON shape.
