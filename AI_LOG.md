# AI Use Log

AI assistance was permitted by the exam brief. This log records the significant requests, what Codex produced, and what was checked. It does not claim that the student independently wrote or verified Codex's work.

| Request or task | What Codex contributed | Verification recorded |
| --- | --- | --- |
| Build the Campus Equipment Booking API from the exam brief and rubric. | Created the local TypeScript/Hono API, SQLite schema, validation, tests, and initial submission documents. | Six automated test groups, TypeScript checking, and a live local HTTP run passed. |
| Use the four starter files and deploy to Cloudflare. | Kept the instructor files unchanged; added the Cloudflare Worker, D1 migration, overlap triggers, configuration, and deployment instructions. | Applied the migration locally and remotely, deployed the Worker, and passed a 13-case live HTTP run against the deployed URL. |
| Fix the Base URL response, then remove route lists. | Changed `/` and `/api` to return a short JSON status. | Automated tests and live HTTPS requests returned `200` with the status response; equipment remained available at `/api/equipment`. |
| Audit the submission against the starter files and provide real test evidence. | Reviewed the code and documents; added a reproducible `curl.exe` test script and recorded the deployed responses. | The latest 11-case cURL run passed; [CURL_TEST_EVIDENCE.md](CURL_TEST_EVIDENCE.md) contains the raw HTTP transcript. The test booking was deleted. |
| Provide a results image and rewrite the submission-required files. | Rendered [CURL_RESULTS_IMAGE.png](CURL_RESULTS_IMAGE.png) from the real transcript and rewrote the README, contract, schema, Quality Gate review, AI log, and test summary for clarity. | The image was visually checked against the transcript; document links and commands were checked. The image is not a direct desktop screenshot. |

## Student verification and ownership

Codex performed the checks above. The student's own rerun and explanation are not recorded here. Before submitting, the student should run or inspect the tests, confirm the results, and be ready to explain the routes, SQL parameter binding, the overlap rule, and the `400`/`404`/`409` status choices in their own words. Add the date and details of any personal verification to this log; do not claim it happened unless it did.
