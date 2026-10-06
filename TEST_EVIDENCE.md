# Test Evidence

## Current deployed API test

Base API URL: `https://campus-equipment-booking-api.tar127290.workers.dev/api`.

On 2026-10-06, `curl.exe` ran 11 live HTTP cases against the deployed Cloudflare API. Create, read, update, and delete succeeded. Invalid time returned `400`, missing resources returned `404`, and an overlapping booking returned `409`. The test booking was deleted afterward. The [full cURL transcript](CURL_TEST_EVIDENCE.md) contains the actual commands, headers, status codes, and response bodies.

The image below is rendered from that real cURL transcript so the results are easy to view together. It is not a direct desktop screenshot.

![Live cURL test results for the deployed API](CURL_RESULTS_IMAGE.png)

## Earlier local and deployment checks

Base API URL: `http://localhost:8787/api`.

The following results came from a live server started with `npm.cmd start` and requests sent with `node scripts/smoke.mjs` on 2026-10-06. The script uses the standard `fetch` HTTP client, asserts each status, and deletes its test booking afterward. The booking ID in this run was `f853d18a-b91a-4719-ba42-2f8a14edf47d`.

| Case | Request | Expected / actual | Response evidence |
| --- | --- | --- | --- |
| Equipment | `GET /equipment` | `200 / 200` | Two records: `eq-1` and `eq-2` |
| Create | `POST /bookings` with valid booking | `201 / 201` | Returned generated ID and all booking fields |
| Read one | `GET /bookings/f853d18a-b91a-4719-ba42-2f8a14edf47d` | `200 / 200` | Returned matching ID and booking |
| Read list | `GET /bookings` | `200 / 200` | Array included the created booking |
| Update | `PATCH /bookings/f853d18a-b91a-4719-ba42-2f8a14edf47d` with `{"purpose":"Updated HTTP verification"}` | `200 / 200` | Response contained updated purpose |
| Conflict | `POST /bookings` for `eq-1`, overlapping existing time | `409 / 409` | `{"error":"Booking time conflicts with an existing booking"}` |
| Invalid time | `POST /bookings` with equal start and end | `400 / 400` | `{"error":"startAt must be before endAt"}` |
| Missing equipment | `POST /bookings` with `equipmentId: "does-not-exist"` | `404 / 404` | `{"error":"Equipment not found"}` |
| Delete | `DELETE /bookings/f853d18a-b91a-4719-ba42-2f8a14edf47d` | `204 / 204` | Empty body |
| Verify deletion | `GET /bookings/f853d18a-b91a-4719-ba42-2f8a14edf47d` | `404 / 404` | `{"error":"Booking not found"}` |

The successful create request used `startAt: "2026-10-07T11:19:49.699Z"` and `endAt: "2026-10-07T13:19:49.699Z"`. The conflict request used a time range starting one hour later and ending one hour later. The full request sequence is reproducible by running `node scripts/smoke.mjs`; it generates a new time slot each run.

Automated verification: `npm.cmd test` passed 6 tests, including adjacent times, update conflicts, malformed requests, SQL-like input, and persistence after reopening SQLite. `npm.cmd run typecheck` completed with no errors.

## Cloudflare Worker with local D1

Base API URL: `http://127.0.0.1:8788/api`. On 2026-10-06, `npm.cmd run db:migrate:local` applied `0001_initial.sql`, `npm.cmd run dev:cloudflare -- --ip 127.0.0.1 --port 8788` started the Worker, and `node scripts/smoke.mjs` passed all 10 live HTTP cases: equipment `200`, create `201`, read one `200`, read list `200`, update `200`, overlap `409`, invalid time `400`, missing equipment `404`, delete `204`, and verify deletion `404`. The run created and deleted booking `d1f23696-e93a-4653-9192-90060da47ab6`. The overlap response was `{"error":"Booking time conflicts with an existing booking"}`. These results are local Wrangler/D1 evidence, not evidence of a production deployment.

## Deployed Cloudflare Worker with remote D1

Base API URL: `https://campus-equipment-booking-api.tar127290.workers.dev/api`. On 2026-10-06, Wrangler applied `0001_initial.sql` to the remote D1 database and deployed Worker version `ed0d6116-1c2e-4adf-b561-413d31876270`. `node scripts/smoke.mjs` passed all 10 live HTTP cases against that URL: equipment `200`, create `201`, read one `200`, read list `200`, update `200`, overlap `409`, invalid time `400`, missing equipment `404`, delete `204`, and verify deletion `404`. The run created and deleted booking `4c39cae2-920c-44fc-a7ea-7174eef633dc`. The conflict response was `{"error":"Booking time conflicts with an existing booking"}`; the invalid-time response was `{"error":"startAt must be before endAt"}`. The remote test booking was removed.

After adding update-conflict coverage to `scripts/smoke.mjs`, a second run against the same deployed URL passed 13 cases. An adjacent booking returned `201`; changing its start time to overlap the first booking returned `409` with the expected JSON error. Both test bookings (`4b71a89e-485b-444c-a796-b6e39ebda358` and `015e4874-e0d2-4243-898c-2e1f021b9522`) were deleted with `204`. The other 10 statuses remained as recorded above.

## Browser entry point fix

After a user reported `{"error":"Resource not found"}` when opening the Base API URL, Worker version `d9fceb01-b618-4510-afb9-d87306ddb31c` added route discovery at `/` and `/api`. A live HTTPS check of the deployed Worker returned `200` with the route list at `/`, `/api`, and `/api/`. `GET /api/equipment` returned `200` with both seeded equipment records. Local automated tests also passed all 6 test groups, and TypeScript reported no errors.

The user later requested removal of route lists. Worker version `ae06f593-f046-4f8e-ad38-9dfefb8e7594` replaced them with `{"name":"Campus Equipment Booking API","status":"ok"}`. Live HTTPS checks returned `200` with exactly that JSON at `/`, `/api`, and `/api/`; `GET /api/equipment` still returned `200` with both equipment records. The previous route-list result above is historical evidence and no longer describes the deployed response. Local tests and type checking passed before this deployment.

## Final audit run

On 2026-10-06, the current deployed Base API URL `https://campus-equipment-booking-api.tar127290.workers.dev/api` passed a fresh 13-case `node scripts/smoke.mjs` run: equipment `200`, create `201`, read one `200`, read list `200`, update `200`, create conflict `409`, adjacent booking `201`, update conflict `409`, delete adjacent `204`, invalid time `400`, missing equipment `404`, delete `204`, and deleted booking `404`. Test bookings `4be65540-8cdf-4e9a-95a2-844769bb0b6c` and `85c54f60-f4a5-4647-84db-78268736f02a` were removed. Separate deployed checks returned `200` with the short status at `/` and `/api`, and `404` with JSON errors for `/api/bookings/not-found` and `/api/no-such-route`. The 6 local automated test groups and TypeScript check also passed.

## Actual cURL transcript

`CURL_TEST_EVIDENCE.md` records a separate 2026-10-06 run of `curl.exe` against the deployed Base API URL. It contains the command, HTTP headers, status, and response body for 11 cases: equipment list `200`, bookings list `200`, create `201`, read `200`, update `200`, invalid time `400`, overlap `409`, missing equipment `404`, missing booking `404`, delete `204`, and confirm deletion `404`. The test booking was removed. Reproduce it with `pwsh -NoProfile -File scripts/curl-evidence.ps1`.

`CURL_RESULTS_IMAGE.png` is a readable PNG rendering of a later real `curl.exe` transcript from the same script. It shows all 11 commands, status lines, and bodies. The full raw transcript remains in `CURL_TEST_EVIDENCE.md`. The image is not a direct Windows desktop screenshot.
