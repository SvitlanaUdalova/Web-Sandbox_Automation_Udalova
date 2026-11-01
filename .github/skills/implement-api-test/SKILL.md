---
name: implement-api-test
description: Implement approved API cases using the Restful Booker client, services, schemas and fixtures.
---

# Implement API tests

Work in `WEB-API-Automation`. Read the approved cases and current implementation.
Keep HTTP mechanics in `api client`, endpoint methods in `Services`, types in
`Models`, contracts in `Schema`, reusable payloads in `test data`, and fixtures
and assertions in `utils`. Specs must use services, not raw HTTP calls.

Reuse owned-booking cleanup; never delete shared or pre-existing bookings.
Validate status, representation and business values in addition to schemas.
Use exact contract expectations, no status ranges or silent fallbacks.
Do not retry mutations, add hard waits, log authentication payloads, or enable
token-bearing request traces. Use bounded polling only for persistence checks.

Run type checks, the targeted scenario independently, then the relevant suite.
Report actual outcomes and limitations. Reproduce API/documentation differences;
do not weaken assertions to make a run green. Expected failures require learner
approval and a documented defect; an unexpected pass must fail.
Never claim unexecuted CI, unsupported features, or independent learner authorship.
