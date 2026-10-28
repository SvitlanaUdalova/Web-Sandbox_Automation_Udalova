---
name: implement-playwright-test
description: Implement an approved test case using this project's Playwright architecture.
---

# Implement an approved Playwright test case

The project root is `WEB-UI-Automation`. Run npm and Playwright commands from
that directory and keep test code there; repository integrations remain at root.

Read the approved case and inspect the current implementation before editing.

Follow the existing layers:

- Specs orchestrate scenarios and assert expected behavior.
- Page objects own DOM locators and UI interactions.
- API clients own API requests and response validation.
- Fixtures own shared setup and teardown.
- Test-data modules own reusable input values.

For profile scenarios, use the existing profile fixture and API client.
Keep the behavior under test in the UI.

Reuse existing methods before adding new ones.
Add only the smallest useful abstraction.
Do not create a second authentication or cleanup mechanism.
Do not add hard waits or broad catches that hide failures.
Use Playwright's retrying assertions for expected UI state.

Preserve existing tests and tags.
Never embed credentials or tokens in code.

Run the new test independently, then run the relevant suite.
Report:

- Files changed and why
- Reused or added abstractions
- Validation commands and actual results
- Any unresolved limitations
