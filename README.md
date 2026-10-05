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

## Web Tables worker scenarios

The Web Tables tests demonstrate three practical worker-management scenarios.
Each test starts on `/webtables` with the page fixture and its initial table
data; the tests use the worker email as the stable row identifier.

| Scenario and purpose                                                        | Preconditions                                                                                                        | Locators                                                                                                                                                              | Assertions and expected result                                                                                                                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add a worker** — check that a new worker can be entered and saved.        | The worker email from `test-data/workers.ts` is not already in the table.                                            | The **Add** and **Submit** buttons use accessible button roles and names. Form fields use their placeholders. The result row is located by its email text.            | Assert that no row has the email before adding, then assert that the worker row is visible after submitting. The new worker appears in the table.                                           |
| **Edit a worker** — check that an existing worker's details can be updated. | The table contains at least one worker; the test reads the first data row and confirms it is visible before editing. | The row is located by the worker's email; its **Edit** control uses the `title` attribute. The edit form uses field placeholders and the **Submit** button role/name. | Assert the original row exists before editing, the row with the updated email exists afterward, and the old email no longer identifies a row. The worker is updated rather than duplicated. |
| **Remove a worker** — check that an existing worker can be deleted.         | The table contains at least one worker; the test reads the first data row and confirms it is visible before removal. | The row is located by the worker's email; its **Delete** control uses the `title` attribute.                                                                          | Assert the row exists before removal and that no row with its email exists after deletion. The worker is removed from the table.                                                            |
