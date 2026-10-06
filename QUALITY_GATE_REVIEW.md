# Quality Gate Review

This review follows the instructor's `quality_gate.md`. `initial_version.zip` preserves a first source version for comparison with the later work. The archive does not, by itself, prove that the timed minute-30 checkpoint occurred.

| Quality Gate area | Finding | Action taken | Evidence |
| --- | --- | --- | --- |
| Reliability / Accuracy | The first tests used only in-memory SQLite, so they did not show that a booking survives closing the database. | Added a file-based test that creates a booking, closes SQLite, reopens it, and reads the same booking. | `npm test` passes **bookings survive closing and reopening the SQLite file**. |
| Reliability | A separate Cloudflare D1 conflict query could race with another Worker request. | Added `BEFORE INSERT` and `BEFORE UPDATE` D1 triggers that reject an overlap as part of the write. | The deployed HTTP run returned `409` for a conflicting create and update; an adjacent booking returned `201`. See the [raw run output](SMOKE_TEST_EVIDENCE.txt). |
| Implementation / Security | Bound SQL parameters were used, but the first tests did not check text that looked like SQL. | Added a test that stores `"'; DROP TABLE equipment; --"` as a borrower name. | `npm test` passes **request text resembling SQL stays data and does not alter the schema**; equipment remains available. |
| Reasoning / You Own It | The booking boundary rule needed an explanation that could be checked against the code. | Documented the half-open time rule and why equal endpoints are allowed in [API_CONTRACT.md](API_CONTRACT.md) and [SCHEMA.md](SCHEMA.md). | Automated tests cover adjacent times, a self-update, and update conflicts. The deployed HTTP run covers adjacent times and update conflict. The student must be able to explain the rule personally. |
| Execution Value / Testing | In-process tests alone did not provide real HTTP response evidence. | Ran live local and deployed HTTP checks, then saved actual `curl.exe` commands, status lines, and JSON bodies. | [CURL_TEST_EVIDENCE.md](CURL_TEST_EVIDENCE.md) records 11 deployed cases, including `201`, `204`, `400`, `404`, and `409`. |

## Final check

On 2026-10-06, all six automated test groups and TypeScript checking passed. The deployed API passed the recorded live HTTP checks. The four instructor starter files were used as references and were not edited during this work.

The student's own verification and ability to explain the implementation cannot be certified by Codex. The student should check the results and complete that part of the Quality Gate before submission.
