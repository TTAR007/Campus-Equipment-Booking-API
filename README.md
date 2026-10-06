# Campus Equipment Booking API

A TypeScript/Hono API backed by local SQLite or Cloudflare Workers with D1. Both versions seed two equipment records and prevent overlapping bookings for the same item.

## Run locally

Requires Node.js 24 or newer. From this directory:

```powershell
npm install
npm start
```

The Base API URL is `http://localhost:8787/api`. Set `PORT` and `DB_FILE` to change the port and SQLite file. The default database file is `bookings.sqlite` in the current directory. It is created on first run and is excluded from Git.

## Run tests

From the project directory, run:

```powershell
npm test
npm run typecheck
```

To rerun the real HTTP tests against the deployed API on Windows, run:

```powershell
pwsh -NoProfile -File scripts/curl-evidence.ps1
```

This uses `curl.exe`, checks the HTTP statuses, saves the responses to `CURL_TEST_EVIDENCE.md`, and deletes its test booking. To regenerate the results image, run:

```powershell
pwsh -NoProfile -File scripts/render-curl-evidence.ps1
```

The provided [curl_test_guide.md](curl_test_guide.md) has individual HTTP commands. The recorded results are in [TEST_EVIDENCE.md](TEST_EVIDENCE.md).

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

To verify the Worker locally before deploying, stop `npm start` if it is running, then run `npm run db:migrate:local` and `npm run dev:cloudflare`. In another terminal, set `BASE_URL` to `http://localhost:8787/api` and run `node scripts/smoke.mjs`. Local Wrangler D1 state is in `.wrangler/` and is excluded from Git. The local SQLite file is separate from the D1 database; existing local bookings are not copied to Cloudflare.

If PowerShell blocks `npm` because of its script execution policy, select **Command Prompt** as the VS Code terminal profile and run the same commands there.
