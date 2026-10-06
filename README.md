# Campus Equipment Booking API

A TypeScript/Hono API backed by local SQLite or Cloudflare Workers with D1. Both versions seed two equipment records and prevent overlapping bookings for the same item.

## Run

Requires Node.js 24 or newer. From this directory:

```powershell
npm install
npm start
```

The API listens at `http://localhost:8787/api`. Set `PORT` and `DB_FILE` to change the port and SQLite file. The default database file is `bookings.sqlite` in the current directory. It is created on first run and is excluded from Git.

Run the automated checks with:

```powershell
npm test
npm run typecheck
```

For real HTTP evidence from the deployed API on Windows, run:

```powershell
pwsh -NoProfile -File scripts/curl-evidence.ps1
```

This uses `curl.exe`, checks the expected HTTP status for each case, saves the request and response transcript to `CURL_TEST_EVIDENCE.md`, and deletes its test booking. Run `pwsh -NoProfile -File scripts/render-curl-evidence.ps1` to create `CURL_RESULTS_IMAGE.png` from the saved transcript. The image is a rendering of actual HTTP results, not a direct desktop screenshot.

See [API_CONTRACT.md](API_CONTRACT.md) for endpoints and [SCHEMA.md](SCHEMA.md) for the data model. [curl_test_guide.md](curl_test_guide.md) contains copyable HTTP commands; [CURL_TEST_EVIDENCE.md](CURL_TEST_EVIDENCE.md) contains actual results from the deployed API.

## Cloudflare Workers deployment

Requires a Cloudflare account. The Worker code is in `src/worker.ts`; D1 schema and seed data are in `migrations/0001_initial.sql`.

Deployed Base API URL: `https://campus-equipment-booking-api.tar127290.workers.dev/api`.
Opening the Worker root or `/api` in a browser returns a short JSON status. To see the equipment data directly, open `https://campus-equipment-booking-api.tar127290.workers.dev/api/equipment`.

The D1 database ID in `wrangler.jsonc` belongs to this deployment. For this same Cloudflare account, install dependencies and redeploy with:

```powershell
npm install
npm run db:migrate:remote
npm run deploy
```

To deploy in a different Cloudflare account, first authenticate and create a new D1 database:

```powershell
npm install
npx wrangler login
npx wrangler d1 create campus-equipment-booking-db
```

Copy the returned `database_id` into `wrangler.jsonc`, replacing the existing ID. Then run:

```powershell
npm run db:migrate:remote
npm run deploy
```

Wrangler prints the Worker URL. Use that URL plus `/api` as `BASE_URL` for `scripts/smoke.mjs` or the provided cURL guide. For example, in PowerShell:

```powershell
$env:BASE_URL = 'https://your-worker.your-subdomain.workers.dev/api'
node scripts/smoke.mjs
```

To verify the Worker locally before deploying, run `npm run db:migrate:local`, then `npm run dev:cloudflare` in one terminal and set `BASE_URL` to `http://localhost:8787/api` in another. Local Wrangler D1 state is in `.wrangler/` and is excluded from Git. The local SQLite file is separate from the D1 database; existing local bookings are not copied to Cloudflare.

If PowerShell blocks `npm` because of its script execution policy, select **Command Prompt** as the VS Code terminal profile and run the same commands there.

## Design choices

- Times are accepted as UTC ISO 8601 strings ending in `Z`; responses use millisecond precision. Start is inclusive and end is exclusive, so one booking can start exactly when another ends.
- `PATCH` accepts any non-empty subset of booking fields. The combined booking is validated again, including overlap checks. An omitted field keeps its old value; an explicit `null` is invalid.
- Unknown input fields return `400`, and every error response has an `error` string.
- Booking writes use SQLite `BEGIN IMMEDIATE` transactions. The conflict query and write execute within the same transaction, so another writer cannot insert a conflicting row between them.
- D1 uses insert and update triggers to reject overlaps during the write. This keeps the same rule safe when requests reach separate Worker instances at the same time.
