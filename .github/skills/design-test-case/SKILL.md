---
name: design-test-case
description: Design a reviewable DemoQA test case before implementing automation.
---

# Design a test case

Read the existing tests, page objects, fixtures, and test data relevant
to the requested behavior.

Do not change application or automation code.

Identify whether the requested scenario duplicates existing coverage.
If requirements are ambiguous, ask for clarification instead of inventing
expected behavior.

Produce:
- Test case ID and title
- Purpose and automation value
- Preconditions
- Test data
- Numbered actions with expected results
- Cleanup
- Related existing coverage and remaining gaps

Separate setup from the behavior under test.
Prefer API-assisted setup when supported by the project.
Keep the action being tested in the browser.

Do not include credentials or tokens in the output.