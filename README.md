# Web-Sandbox_Automation_Udalova

Web-Sandbox Automation API
Markdown

# My First Repository

This is my first change from my laptop.

## Local credentials

DemoQA credentials are loaded from a local `.env` file and are not committed to
the repository. Copy `.env.example` to `.env` and replace both placeholder
values with the credentials used by the tests:

```powershell
Copy-Item .env.example .env
```

The test data reads `DEMOQA_USERNAME` and `DEMOQA_PASSWORD`. Tests fail
explicitly when either variable is missing. Do not commit `.env`; if the
previous hard-coded password was used anywhere outside this local environment,
rotate it.

## Test selection and CI runs

All tests belong to `@regression`. The `@smoke` subset checks the home page,
successful login, and the Web Tables page. Smoke tests also belong to regression.
For example:

```powershell
npx playwright test --grep "@smoke"
npx playwright test tests\profile.spec.ts --grep "@regression"
$env:BASE_URL = 'https://demoqa.com'
npx playwright test --grep "@regression"
```

`BASE_URL` can also be set in `.env`; it defaults to `https://demoqa.com`.
Use a compatible application environment and matching DemoQA account credentials.

The GitHub Actions workflow runs regression tests for pull requests targeting
`main`, `master`, or `development`, and daily at **04:00 UTC** (23:00 fixed EST
on the previous day, not daylight-saving Eastern time). Scheduled runs use the
default branch; GitHub does not guarantee an exact start time.

For an on-demand run, open **Actions > Playwright Tests > Run workflow**.
Select the workflow branch, target URL, optional Git branch/tag/SHA to check out,
test batch, and tag filter. The batch and tag filters are combined: selecting
`profile` with `smoke`, for example, matches no tests and fails rather than
silently passing. Choose `regression` or `all` for that batch.
The workflow must exist on the default branch for manual and scheduled triggers
to be available. Manual runs use the existing repository credential secrets;
changing the URL does not switch credentials automatically.

Workflow runs are serialized because they mutate a shared account. GitHub
concurrency may replace an older pending run with a newer one; it does not
serialize local runs against that same account.

Failed test attempts retain screenshots, videos, and traces in `test-results`,
including failures that pass on retry. Successful attempts discard videos and
traces. CI uploads both the HTML report and failure diagnostics with 30-day
retention. These artifacts can contain account/session data; keep their access
restricted.

## API-assisted profile scenarios

The active [profile suite](./tests/profile.spec.ts) uses
[BookCollectionApi](./api/book-collection-api.ts) for API authentication,
book setup, and cleanup. The automatic, test-scoped
[profile fixture](./fixtures/profile-test.ts) logs in through the UI, creates
the API client, clears the collection, and opens the profile before each test.
It clears the collection again during teardown, including when a test fails. Other suites still
use the original page fixtures without API setup.

The API client checks HTTP statuses, validates the response fields it consumes,
and verifies persisted collection state. Browser login remains through the UI:
an API token does not automatically authenticate a browser context. API
authentication follows UI login because UI login generates the account token;
creating the API session earlier can leave it with an invalid token. The add-book
test still adds through the UI, and the deletion test still deletes through the
UI; search scenarios seed books through the API rather than retesting UI addition.

Run the default API-assisted suite with:

```powershell
npx playwright test profile.spec.ts --grep "@regression"
```

The [previous UI-only suite](./examples/profile-ui-only.example.ts) is preserved
as a historical comparison example. It lives outside `testDir` and is not
discovered by normal test runs; it is not a second active suite to maintain.
Its comments describe the old approach, not the current API-assisted behavior.

Use a dedicated test account: setup and teardown delete **all** books belonging
to that account. Do not run another local or CI session against the same account
at the same time. Both API requests and browser navigation use `BASE_URL`, which
must point to a compatible environment with matching credentials. Request traces
may contain authentication data; treat the CI diagnostics as sensitive.

## Web Tables worker scenarios

The Web Tables tests demonstrate three practical worker-management scenarios.
Each test starts on `/webtables` with the page fixture and its initial table
data; the tests use the worker email as the stable row identifier.

| Scenario and purpose                                                        | Preconditions                                                                                                        | Locators                                                                                                                                                              | Assertions and expected result                                                                                                                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add a worker** — check that a new worker can be entered and saved.        | The worker email from `test-data/workers.ts` is not already in the table.                                            | The **Add** and **Submit** buttons use accessible button roles and names. Form fields use their placeholders. The result row is located by its email text.            | Assert that no row has the email before adding, then assert that the worker row is visible after submitting. The new worker appears in the table.                                           |
| **Edit a worker** — check that an existing worker's details can be updated. | The table contains at least one worker; the test reads the first data row and confirms it is visible before editing. | The row is located by the worker's email; its **Edit** control uses the `title` attribute. The edit form uses field placeholders and the **Submit** button role/name. | Assert the original row exists before editing, the row with the updated email exists afterward, and the old email no longer identifies a row. The worker is updated rather than duplicated. |
| **Remove a worker** — check that an existing worker can be deleted.         | The table contains at least one worker; the test reads the first data row and confirms it is visible before removal. | The row is located by the worker's email; its **Delete** control uses the `title` attribute.                                                                          | Assert the row exists before removal and that no row with its email exists after deletion. The worker is removed from the table.                                                            |
