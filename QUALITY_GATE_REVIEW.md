# Quality Gate Review

The first source version was preserved in `initial_version.zip` before the final verification additions. This records a source snapshot; it does not prove that the exam's minute-30 checkpoint occurred. A student taking the timed exam should record that checkpoint separately at the required time.

| Area | What I found | How I fixed it | Evidence |
| --- | --- | --- | --- |
| Reliability / Accuracy | The first test set used only in-memory SQLite, so it did not verify that bookings survive a server restart. | Added a test that creates a booking in a file database, closes it, reopens it, and reads the same booking. | `bookings survive closing and reopening the SQLite file` passes in `npm.cmd test`. |
| Implementation / Security | Parameter binding was used, but no test checked a value resembling SQL. | Added a test with `"'; DROP TABLE equipment; --"` as a borrower name and checked that it remains data and equipment still exists. | `request text resembling SQL stays data and does not alter the schema` passes. |
| Reasoning / You Own It | The overlap rule was in code but needed a clear explanation of why bookings that touch at their endpoints are allowed. | Documented the half-open interval rule in `API_CONTRACT.md` and `SCHEMA.md`; tested both adjacent times and conflicts on update. | `overlap is rejected on create and update, while touching times and other equipment work` passes. The author should explain the rule independently. |
| Testing | The first checks exercised Hono in process but did not show results over a running HTTP server. | Added `scripts/smoke.mjs`, ran it against `http://localhost:8787/api`, and recorded status and response evidence. | `TEST_EVIDENCE.md` records 10 live HTTP cases, including `400`, `404`, and `409`. |
| Reliability / Cloudflare | A separate D1 conflict lookup could race with another Worker request. | Added D1 triggers that reject overlapping insert and update statements inside SQLite. The Worker converts the trigger error to `409`. | The migration succeeded locally and remotely. A 13-case run against the deployed Worker returned `409` on both create and update conflicts, while an adjacent booking returned `201`. |

The student should review the code and evidence personally, document any further changes, and answer ownership questions from their own understanding.

## Final audit against the four starter files

On 2026-10-06, the current local API passed all 6 automated test groups and TypeScript checking. The deployed Cloudflare API passed 13 live HTTP cases covering equipment, booking CRUD, invalid input, missing equipment, create and update conflicts, adjacent bookings, and deletion. Its `/api` entry point returned a short status without route lists. The four starter files were read for this audit and were not edited.

The `initial_version.zip` archive contains the first source files, but an archive alone cannot establish the exact minute-30 checkpoint during a timed exam. The student's own verification and ability to explain the work also cannot be certified by Codex; these remain for the student to complete before submission.
