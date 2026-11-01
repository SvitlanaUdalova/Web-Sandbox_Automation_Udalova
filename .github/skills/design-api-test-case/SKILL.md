---
name: design-api-test-case
description: Design Restful Booker API scenarios from its documented contract and existing coverage.
---

# Design API test cases

Work in `WEB-API-Automation`, not the UI project. Read its README, services,
schemas, factories, tests, and requirement coverage before proposing cases.

Inspect the public API documentation. Separate documented expectations from live
observations and product defects; do not copy status-code assumptions from other APIs.
Do not invent pagination, uniqueness rules, resource types, or a booking UI.

Produce a case ID, purpose, setup, payload, service actions, exact expected
statuses/headers/body fields/schema, cleanup, and contract reference.
Every mutable scenario must create its own data and delete only that data.
Identify ambiguity and unsupported requirements explicitly.

Do not implement cases before approval. Never output credentials or tokens,
including examples copied from the public authentication documentation.
