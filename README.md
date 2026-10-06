# Campus Equipment Booking API

This is a TypeScript/Hono API for reserving shared equipment. It runs locally with SQLite and on Cloudflare Workers with D1.

## Requirements

- Node.js 24 or newer
- npm
- PowerShell 7 and `curl.exe` to rerun the recorded HTTP tests on Windows

Open this project folder in VS Code, then open **Terminal → New Terminal**. Run the commands below from the project folder.

## Run locally

```powershell
npm install
npm start
```

The local Base API URL is `http://localhost:8787/api`. The server creates `bookings.sqlite` and seeds two equipment records on first run. Press **Ctrl+C** to stop it.

To change the port or database file in PowerShell, set `PORT` or `DB_FILE` before `npm start`.

## Check the API

In a second terminal, run the automated checks:

```powershell
npm test
npm run typecheck
```

The deployed Base API URL is:

```text
https://campus-equipment-booking-api.tar127290.workers.dev/api
```

The Base URL returns a short status response. Use these URLs to see API data:

- [Equipment](https://campus-equipment-booking-api.tar127290.workers.dev/api/equipment)
- [Bookings](https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings)

To rerun the live HTTP test cases with `curl.exe` and save their responses:

```powershell
pwsh -NoProfile -File scripts/curl-evidence.ps1
```

The script tests successful requests and `400`, `404`, and `409` errors. It deletes its test booking at the end and writes [CURL_TEST_EVIDENCE.md](CURL_TEST_EVIDENCE.md). The test summary and results image are in [TEST_EVIDENCE.md](TEST_EVIDENCE.md). To regenerate the image from the transcript, run:

```powershell
pwsh -NoProfile -File scripts/render-curl-evidence.ps1
```

The image is a rendering of real cURL output, not a direct desktop screenshot. The instructor's [cURL guide](curl_test_guide.md) has individual requests you can run manually.

## Run the Cloudflare Worker locally

Stop `npm start` first because both servers use port 8787 by default. Then run:

```powershell
npm run db:migrate:local
npm run dev:cloudflare
```

In another terminal, set the Base URL and run the HTTP smoke test:

```powershell
$env:BASE_URL = 'http://localhost:8787/api'
node scripts/smoke.mjs
```

Wrangler stores its local D1 data in `.wrangler/`. This is separate from `bookings.sqlite`.

## Deploy to Cloudflare

The Worker is already deployed. Its configuration and D1 database ID are in `wrangler.jsonc`. To redeploy to the same Cloudflare account:

```powershell
npm install
npx wrangler login
npm run db:migrate:remote
npm run deploy
```

To deploy to a different Cloudflare account, run `npx wrangler d1 create campus-equipment-booking-db` after logging in. Replace `database_id` in `wrangler.jsonc` with the ID returned by that command, then run `npm run db:migrate:remote` and `npm run deploy`. Wrangler prints the new Worker URL. The Cloudflare entry point is `src/worker.ts`; the D1 schema and seed data are in `migrations/0001_initial.sql`.

## Project documents

- [API_CONTRACT.md](API_CONTRACT.md): endpoints, payloads, status codes, and validation rules
- [SCHEMA.md](SCHEMA.md): database relationship and overlap rule
- [TEST_EVIDENCE.md](TEST_EVIDENCE.md): test summary, results image, and links to raw HTTP output
- [QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md): findings, fixes, and evidence
- [AI_LOG.md](AI_LOG.md): AI assistance and verification record

If PowerShell blocks `npm` because of its script execution policy, select **Command Prompt** as the VS Code terminal profile and run the same `npm` commands there.
