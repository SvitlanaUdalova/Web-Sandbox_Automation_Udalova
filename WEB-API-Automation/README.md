# Restful Booker API automation

Playwright Test + TypeScript + Zod, using `APIRequestContext` without a browser.
The target is the public [Restful Booker contract](https://restful-booker.herokuapp.com/apidoc/index.html).
This project is independent of the sibling UI project.

## Setup and execution

Run commands from this directory:

```powershell
Set-Location WEB-API-Automation
npm ci
Copy-Item .env.example .env
```

Only copy the example if `.env` does not already exist. Edit it locally with the
credentials published in the API documentation. Do not put credentials in terminal
commands, chat, source, reports, or screenshots. Tokens are obtained dynamically.
No browser installation is needed.

```powershell
npm run typecheck
npm run format:check
npm test -- bookings.spec.ts --grep "create and retrieve"
npm run test:smoke
npm run test:regression
npm run test:contracts
npx playwright show-report
```

Filename selectors avoid Windows backslash interpretation as regular-expression
escapes. Playwright test arguments are patterns, not plain filesystem paths.

### Environments

- `API_ENV=public`: defaults to the documented public sandbox.
- `API_ENV=custom`: requires `API_BASE_URL` pointing to a compatible deployment.
- `API_BASE_URL` can override either target; it must not contain credentials.
- Both require `API_USERNAME` and `API_PASSWORD` for authentication and cleanup.
- Configuration is loaded from this project's `.env`, not the UI project's file.

A second deployment is supported by configuration, not claimed as tested.
The public API is shared and may reset or be changed by other users. Tests use
unique names and owned IDs; they never delete all bookings.

## Architecture

| Directory                    | Responsibility                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [api client](./api%20client) | HTTP transport, per-client token cookie, timeouts, response disposal, schema-aware parsing, redacted request/response report attachments |
| [Services](./Services)       | Auth, booking and health endpoint operations; no test assertions                                                                         |
| [Schema](./Schema)           | Strict runtime response contracts; the single source of truth for response shapes                                                        |
| [Models](./Models)           | Types for request and response shapes used across the project                                                                            |
| [test data](./test%20data)   | Factories with defaults/overrides and named data-driven cases                                                                            |
| [tests](./tests)             | Scenario orchestration and exact business assertions                                                                                     |
| [fixtures](./fixtures)       | Shared Playwright test fixtures: token acquisition, service wiring, owned-booking cleanup                                                |
| [utils](./utils)             | Environment loading, JSON/text assertions                                                                                                |

`ApiClient -> Service -> Spec` separates transport from domain operations.
Specs do not make raw HTTP calls. `BookingService.create` records successfully
created IDs before full contract assertions, allowing cleanup even if a later
assertion fails. The ID itself must be returned correctly to clean it up.

### Models are derived from Schema, not duplicated

`Schema` is the single source of truth for every response shape. `Models`
re-exports those same shapes as `z.infer<typeof someSchema>` types instead of
hand-written interfaces that could drift from the Zod schema that actually
validates responses at runtime:

```typescript
// Models/booking.ts
export type Booking = z.infer<typeof bookingSchema>;
export type CreatedBooking = z.infer<typeof createdBookingSchema>;
```

This only applies to **response** shapes. `Credentials` (the `POST /auth` body)
and `BookingFilters` (the `GET /booking` query parameters) are **request**
shapes with no response schema to derive from, so they stay as hand-written
interfaces in `Models`; each has a short comment explaining why. `Schema` no
longer imports from `Models` at all — the dependency now flows one way,
`Models -> Schema`, which removed the previous `satisfies z.ZodType<...>`
checks on the response schemas, since a type derived from a schema trivially
satisfies it by construction.

### Request/response logging attached to the report

Every call made through `ApiClient.send()` attaches a JSON record of that
request and response as a named attachment on the currently running test, via
`test.info().attach()`. It is visible per-test in the Playwright HTML report
(`npx playwright show-report`) without re-running anything. `Authorization`
and `Cookie` header values are replaced with `<redacted>` before attaching,
since `Cookie` carries the bearer token obtained from `/auth`. This project's
Playwright trace is intentionally `off` elsewhere to avoid persisting tokens;
these redacted attachments are the durable request/response evidence instead.
Attachments are produced for every call, not only on failure, so a reviewer
can inspect the full request/response sequence of a passing test as well.

The test-scoped `bookings` fixture deletes only its created IDs in `finally`,
checks deletion and confirms absence. Tests which explicitly delete an entity
are accepted as already cleaned only after GET returns 404. Teardown errors fail
the test. A test-scoped token is obtained through a disposable request context;
authenticated, anonymous and invalid-token services share infrastructure, not
authentication behavior. No token is placed in a URL.

Transport errors propagate. HTTP errors remain available to negative scenarios.
There are no automatic request retries or mutation retries; Playwright retries
are also zero locally and in CI. The CRUD flow uses bounded `expect.poll` for
deletion visibility, not arbitrary sleeps. This API is synchronous; polling is
not evidence of an asynchronous job/webhook capability.

To add an endpoint: define its types and schema, add a service method using
`ApiClient`, expose shared setup through a fixture if needed, then write a spec
that validates status, representation, contract and persisted business values.
Do not add a generic helper with many optional flags for a single scenario.

## Coverage

There are **47 checks: 43 live API scenarios and 4 local schema guard tests**.
All have `@regression`; the ping, valid authentication and create/read path also
have `@smoke`. The three known defects still execute; they are not skipped.

| Suite                             | Count | Main assertions                                                                                                           |
| --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| Authentication                    | 5     | Successful token and four rejected credential shapes                                                                      |
| Booking workflows                 | 8     | Create/read, list IDs, PUT, PATCH, selective delete, omitted optional value, false flag, complete flow                    |
| Value preservation                | 6     | Zero/unit/large price, empty/encoded needs, same-day dates                                                                |
| Filters                           | 10    | Both name parameters, no-match combinations, date comparisons and equality                                                |
| Health                            | 1     | Exact readiness response and a generous 15-second availability budget                                                     |
| Negative access/representation    | 9     | Missing ID, three unauthenticated mutations, invalid-token PATCH/PUT/DELETE, deleted-resource absence, unsupported Accept |
| Booking creation input validation | 4     | Missing required field, wrong Content-Type, malformed JSON syntax, invalid check-in date                                  |
| Local contract guards             | 4     | Removed, mistyped, added and null fields rejected by schema                                                               |

Response codes follow this API, not generic REST assumptions:
creation and authentication return **200**, deletion and ping return **201**,
missing bookings return **404**, unauthenticated mutations return **403**,
bad credentials return **200** with a reason, and unsupported Accept returns
**418**. These unusual semantics must not be changed to 201/204/401 in the tests.

Business checks include persisted replacement, PATCH preserving unrelated
fields, a false deposit flag not being lost, deletion preserving another booking,
and filter results matching only the test's own identity.

Price values are preservation examples, not invented documented min/max limits.
Check-in/checkout filter cases exercise before/equal/after boundaries. There is
no documented maximum name length or price limit to assert as an acceptance rule.
Optional `additionalneeds` may be absent, but null dates are not a valid response.
`Array.every`, strict equality and schema parsing cover collection/type checks
without unsafe dereferencing.

### Known product/documentation differences

The first live run produced **38 passed, 2 failed**:

| Local defect ID | Documented expectation                                                     | Observed behavior                                           |
| --------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| RB-001          | Check-in filter includes dates equal to the provided check-in              | Equality excludes the booking                               |
| RB-002          | Checkout filter returns checkout dates greater than or equal to the filter | A filter after departure still includes the earlier booking |

A later live probe of booking creation uncovered a third defect, added with
learner approval in [input-validation.spec.ts](./tests/input-validation.spec.ts):

| Local defect ID | Expected behavior                                                       | Observed behavior                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-003          | An invalid check-in date is rejected, or persisted in CCYY-MM-DD format | A syntactically invalid date (e.g. `not-a-date`) is accepted with status 200 and persisted in a format that does not match the documented date shape |

These are local evidence IDs, not upstream issue numbers. With learner approval,
`test.fail` is activated immediately before the exact result assertion, after
successful setup, status and schema validation. An unexpected pass is a failure:
review the upstream fix and remove the marker rather than weakening the contract.
Do not claim these three cases passed normally. RB-003 deliberately avoids
asserting the literal corrupted string, since the exact malformed representation
is an unspecified implementation detail of the hosted server's date handling,
not a stable contract; it instead asserts that the persisted value fails to
match the documented `CCYY-MM-DD` format, then lets the strict schema parse
fail as the defect signal.

### Schema change policy

The schemas are strict, including nested dates: added fields, removed required
fields and wrong types are surfaced. This deliberately catches additions for
consumer review; an additive field is not inherently a breaking API change.
Review the API specification and consumer impact first, then update model,
schema, representative data and affected tests together. Never regenerate
expectations from the latest failing response without review.

## Requirements mapping and honest limits

The supplied learning plan includes Junior foundations and Middle deliverables.
This implementation covers what the selected API supports:

| Requirement                                                        | Evidence or limitation                                                                                                                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typed layered framework, factories, reusable setup/cleanup         | Client, services, interfaces, schemas and fixtures above                                                                                                                                                            |
| CRUD, chained flow and isolation                                   | Per-test IDs, independent create/read and multi-step booking flow                                                                                                                                                   |
| Data-driven suite with 8+ cases                                    | 10 named filter cases and 6 value cases                                                                                                                                                                             |
| Contracts on multiple endpoints                                    | Auth, create, read, update and booking-list schemas                                                                                                                                                                 |
| Headers/status/body/error assertions                               | JSON Content-Type, plain-text errors and exact API-specific codes                                                                                                                                                   |
| Three services                                                     | Auth, Booking and Health services exist, but **only booking is a CRUD resource**                                                                                                                                    |
| Three resource services / related-resource business flow           | Unsupported: no users, payments or other resource API; do not manufacture layers                                                                                                                                    |
| Missing/wrong Content-Type observation (Junior Stage 2)            | API-NEG-011 sends a valid payload with the wrong Content-Type and documents the observed 500 response                                                                                                               |
| Five negative categories for one endpoint                          | 3 of 5: unauthorized access, missing fields and invalid formats are covered with live-observed statuses; business-rule violations and duplicate/conflict data are not promised by this API and are not manufactured |
| Boundaries for three parameters                                    | Price preservation plus check-in/checkout filters; no invented numeric limits                                                                                                                                       |
| Pagination and metadata                                            | Unsupported by this contract                                                                                                                                                                                        |
| Unique constraint / duplicate rejection                            | Not promised; identical bookings are allowed                                                                                                                                                                        |
| Bulk partial failures and multipart                                | No documented bulk or upload endpoint                                                                                                                                                                               |
| Async jobs / expired-token lifecycle                               | No documented job API or controllable token expiry; invalid-token rejection is covered, not real expiry                                                                                                             |
| Consistent errors across 3+ endpoints                              | Unsupported as a single contract: auth uses JSON reason, booking operations plain text, ping has no documented error contract                                                                                       |
| API+UI                                                             | No booking UI; existing DemoQA API-assisted UI tests remain separate evidence, not a Restful Booker UI claim                                                                                                        |
| Multiple environments                                              | Public/custom configuration exists; only public verified                                                                                                                                                            |
| Response time                                                      | Availability observation only, not a load test or performance SLA                                                                                                                                                   |
| CI and reports                                                     | Workflow implemented; hosted execution/artifact publication requires push and secrets                                                                                                                               |
| Independent learner authorship, manual review and mentor readiness | Cannot be established by generated code or automated runs                                                                                                                                                           |

### Coverage gap analysis

Implemented candidates selected during this work:

1. PATCH a boolean to false: guards against truthiness-related data loss.
2. Omit an optional field: validates absence without silently defaulting it.
3. Delete one booking while retaining another: verifies targeted mutation.
4. Date equality filters: exposes actual documentation drift.
5. Combined exact-name filter after update: validates a business-visible result.
6. Missing required field and wrong Content-Type on creation: both documented
   as live-observed 500 responses, closing the Junior Stage 2 Content-Type
   requirement and part of the Middle Stage 4 negative-category requirement.
7. Malformed JSON syntax vs a missing field: shows the server distinguishes
   unparsable bodies (400) from structurally valid-but-incomplete ones (500).
8. Invalid check-in date acceptance: a second live defect (RB-003) found by
   probing creation input, not by varying existing happy-path data.

Next candidates, with explicit prerequisites:

1. Rejecting invalid required fields/types with a proper 4xx instead of a 500:
   needs the API owner to define rejection statuses and an error schema; this
   project documents the current 500/400 behavior rather than inventing one.
2. Token expiry/refresh: needs documented TTL and a controllable expiration setup.
3. Duplicate constraints: needs a domain requirement for uniqueness.
4. Pagination: needs a supported paginated endpoint with stable metadata.
5. Bulk/async/ownership: needs additional endpoints and role-aware accounts.
6. API+UI: agree on a supplementary application with a real booking UI, or use
   the existing DemoQA API-assisted UI suite as separate cross-project evidence.

## Refactoring and AI-assisted evidence

This is a new project, not a refactor of pre-existing learner API tests. During
implementation, an initial invalid-token scenario constructed its own HTTP client
in the spec. It was changed to request `invalidTokenBookings` from the shared
fixture, keeping transport and authentication out of the scenario:

```typescript
// Initial draft in the spec:
const invalid = new BookingService(new ApiClient(request, 'intentionally-invalid-token'));
await invalid.update(id, changes);

// Final scenario:
await invalidTokenBookings.update(id, changes);
```

Alternatives considered: raw per-test request setup versus service fixtures,
and a generic CRUD abstraction versus small explicit service methods. Fixtures
were selected for reliable cleanup and auth separation; explicit services keep
endpoint intent visible. Assertions stay in the specs/helpers rather than
turning the client into a test runner.

The learner requested a review of the supplied plan, selected Middle plus Junior
foundations, chose Restful Booker with unsupported requirements documented, and
configured credentials locally. The implementation was refined after a live run
found two contract mismatches: the learner approved explicit expected failures
instead of changing expectations to match observed bugs.

AI implemented the code. No independent learner authorship or manual code edits
are claimed. Public contract inspection used CLI-based HTTP requests without
printing tokens. The new API-specific design and implementation skills are
reusable workflow configuration; they were not invoked for the initial 40 checks.

### Skill-assisted negative coverage extension

After the learner requested more negative coverage, `design-api-test-case` was
actually invoked to inspect existing tests, services, schemas, factories,
fixtures, coverage and public endpoint documentation. It proposed the following
cases, which the learner explicitly approved before `implement-api-test` was
invoked to implement them.

| Case        | Setup and action                                                                                   | Exact expected results                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| API-NEG-007 | Create an owned booking, attempt PUT with a different valid payload and an invalid token           | 403, `Forbidden`, text/plain; GET returns 200, JSON, valid booking schema and all original fields unchanged                               |
| API-NEG-008 | Create an owned booking, attempt DELETE with an invalid token                                      | 403, `Forbidden`, text/plain; GET returns 200, JSON, valid booking schema and unchanged data                                              |
| API-NEG-009 | Create an owned booking, delete with valid authentication, then GET and filter by its unique names | DELETE: 201, `Created`, text/plain; GET: 404, `Not Found`, text/plain; filter: 200, JSON, valid reference-array schema and an empty array |

Contract references are UpdateBooking, DeleteBooking, GetBooking and GetBookings
in the public API documentation. Authentication is documented; exact negative
status/body shapes remain live-observed reference expectations, not explicitly
specified error contracts. No missing-field rejection status was invented.

All cases reuse the factory, existing service fixtures and owned-booking cleanup.
The absence case is already deleted during the scenario; teardown confirms 404.
The shared text assertion now also validates Content-Type, so existing text
response checks are included in regression validation. No raw requests, new
authentication mechanisms, mutation retries or token-bearing traces were added.
AI made these edits following learner approval; manual learner edits are not claimed.

Validation of this skill-assisted extension:

- `npm run typecheck`: passed.
- `npx playwright test negative.spec.ts --grep "API-NEG-00[789]"`: **3 passed**.
- `npx playwright test negative.spec.ts`: **9 passed**.
- `npm run test:regression`: **41 normal passes, 2 expected date-filter failures,
  0 unexpected failures** (43 checks; 55.3 seconds).
- Editor diagnostics for the modified TypeScript files: no errors.

These results extend the initial suite; the three consecutive 40-check runs
below are historical results from before this extension, not three runs of the
new 43-check suite.

### Second skill-assisted extension: creation input validation

The learner asked for more negative tests. `design-api-test-case` was invoked
again and, before proposing cases, live-probed `POST /booking` with a disposable
Node script (missing fields, wrong types, bad date formats, wrong/missing
Content-Type, empty body, malformed JSON) and cleaned up anything the probes
created. The probe found two distinct statuses for different malformed inputs
(500 for structurally-valid-but-incomplete payloads, 400 for unparsable JSON
syntax) and a case where an invalid date was silently accepted and corrupted,
none of which were invented in advance of the observation.

The learner approved four proposed cases, then `implement-api-test` was invoked
to implement them in [input-validation.spec.ts](./tests/input-validation.spec.ts):

| Case           | Setup and action                                                       | Exact expected results                                                                                                  |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| API-NEG-010    | POST a booking payload missing `totalprice`                            | 500, `Internal Server Error`, text/plain                                                                                |
| API-NEG-011    | POST a complete, valid booking payload with `Content-Type: text/plain` | 500, `Internal Server Error`, text/plain                                                                                |
| API-NEG-012    | POST literally malformed JSON syntax with a correct Content-Type       | 400, `Bad Request`, text/plain (documents that this differs from the 500 above)                                         |
| API-SCHEMA-003 | POST a booking with `checkin: 'not-a-date'`                            | 200, JSON, bookingid tracked for cleanup; persisted `checkin` does not match `CCYY-MM-DD`; marked `test.fail` as RB-003 |

`BookingService.createUnvalidated` was added to send payloads that do not
satisfy the `Booking` type, since the existing `create` method's parameter type
intentionally prevents building invalid request bodies by construction; it still
defensively tracks a booking id for cleanup in case a malformed payload is
unexpectedly accepted. No new authentication mechanism, raw per-test request
calls, or retry logic was introduced; `createUnvalidated` lives in the existing
`Services` layer like every other request method.

Validation of this second extension:

- `npm run typecheck`: passed.
- `npx playwright test input-validation.spec.ts` (independent run): **4 passed**
  (API-SCHEMA-003 reports as an expected failure, matching its `test.fail` marker).
- `npm run test:regression`: **44 normal passes, 3 expected failures (RB-001,
  RB-002, RB-003), 0 unexpected failures** (47 checks; 59.1 seconds).
- `npm run format`: applied, only the new test file changed.

### Reviewer-requested changes: derived models and report logging

A reviewer asked for two changes: derive `Models` from `Schema` where possible,
and attach request/response logging to the test report.

For the first, `Schema/booking.ts` and `Schema/auth.ts` no longer import from
`Models`; instead `Models/booking.ts` and `Models/auth.ts` export
`z.infer<typeof someSchema>` types for every shape that has a corresponding
response schema (`Booking`, `BookingDates`, `CreatedBooking`, `BookingReference`,
`AuthToken`, `AuthFailure`). `Credentials` and `BookingFilters` are request
shapes with no response schema to derive from, so they remain hand-written,
each with a short comment stating why. This removed the previous
`satisfies z.ZodType<...>` checks on those schemas, since a type derived from a
schema trivially satisfies it.

For the second, `ApiClient.send()` now attaches a redacted JSON record of every
request and response to the running test via `test.info().attach()`, visible in
the HTML report. `Authorization` and `Cookie` values are replaced with
`<redacted>` before attaching. This was verified by running a test with the
JSON reporter and decoding the base64 attachment bodies directly: the `Cookie`
header on an authenticated `DELETE` request showed `<redacted>`, while
unauthenticated requests showed only the non-sensitive `Accept` header, and
response bodies matched what the assertions in the test itself observed.

Validation:

- `npm run typecheck`: passed.
- `npx playwright test bookings.spec.ts --grep "create and retrieve"`
  (independent run, JSON reporter): **1 passed**; decoded attachments confirmed
  redaction and correct request/response content for auth, create, read and
  cleanup-delete calls.
- `npx playwright test input-validation.spec.ts negative.spec.ts`: **13 passed**
  (API-SCHEMA-003 as its existing expected failure), confirming logging does not
  break requests with malformed bodies (e.g. the deliberately invalid JSON
  string used by API-NEG-012).
- `npm run test:regression`: **44 normal passes, 3 expected failures (RB-001,
  RB-002, RB-003), 0 unexpected failures** (47 checks; 57.4 seconds) — identical
  outcome to before these changes, confirming no test behavior changed.
- `npm run format` / `npm run format:check`: passed.

### Validation and instability investigation

- `npm run typecheck`: passed.
- Independent create/read scenario: **1 passed**.
- First complete run: **38 passed, 2 failed**, revealing the date-filter defects.
- An initial filename selector with backslashes matched no tests on Windows.
  The root cause was regex interpretation of CLI selectors; selecting
  `bookings.spec.ts` fixed discovery without changing test code.
- A stability attempt passed its first run but the second had a teardown
  DELETE return 403 with the worker-cached token. Cleanup reported the failure
  rather than silently accepting it. Authentication was changed to test scope,
  reducing the lifetime of cached credentials in this shared sandbox. The exact
  upstream cause (reset, restart or token invalidation) was not established.
  This is a mitigation, not proof that all external instability is eliminated.
- After switching to test-scoped authentication, three consecutive full CLI
  regression runs completed with these verified JSON-reporter results:

| Run | Normal passes | Expected contract failures | Unexpected failures | Duration     |
| --- | ------------- | -------------------------- | ------------------- | ------------ |
| 1   | 38            | 2                          | 0                   | 49.4 seconds |
| 2   | 38            | 2                          | 0                   | 49.5 seconds |
| 3   | 38            | 2                          | 0                   | 49.5 seconds |

Playwright's console summarizes these as "40 passed" because expected failures
satisfy the declared outcome; the table deliberately separates them.
Type checks, project/integration formatting checks, editor diagnostics and
`git diff --check` also passed. Smoke discovery found exactly three tests.
The previously failing unauthenticated PUT cleanup scenario passed independently
after the fixture change.

To reproduce full consecutive runs (stop on any unexpected outcome):

```powershell
for ($run = 1; $run -le 3; $run++) {
    npm run test:regression
    if ($LASTEXITCODE -ne 0) { throw "Regression run $run failed." }
}
```

`npm run test:stability` is a convenient alternative that repeats each file
three times using Playwright's `--repeat-each`, not three complete suite runs.

The deterministic date differences are contract defects, not evidence of timing
flakiness. There are no historical pipeline failures to analyze yet, and no
fabricated CI investigation is included.

## CI strategy

[Playwright API Tests](../.github/workflows/api-tests.yaml) runs:

- PRs affecting this project/workflow/skills: regression (all checks).
- Pushes affecting this project/workflow on main/master/development: smoke.
- Nightly at 04:00 UTC: regression on the default branch.
- Manual dispatch: smoke/regression and public/custom environment selection.

Set repository secrets `BOOKER_USERNAME` and `BOOKER_PASSWORD`. Set repository
variable `BOOKER_BASE_URL` for manual custom-environment runs. No credentials
are supplied as workflow inputs. A custom target requires matching secrets.
Scheduled/manual triggers require the workflow on the default branch.

CI installs dependencies, type-checks, checks formatting and runs API tests.
There is no browser installation, xvfb, UI fixture dependency, or application
build step. Tests run with one worker to be considerate to the shared sandbox;
unique identities isolate separate runs. HTML and JUnit reports are retained
for 14 days. Request traces are disabled to avoid persisting auth payloads and
tokens; reports should still be treated as restricted diagnostics.

Classify a failed run using its failed step: dependency/runtime/runner failures
are infrastructure; network or target availability failures are environment;
status/body/schema differences require checking the contract and target before
classifying an application defect or test issue. Never add retries or weaken
schemas merely to make CI green. JUnit/report history can support pass-rate
analysis once real hosted executions exist.
