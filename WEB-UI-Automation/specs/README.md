# Approved test plans and AI-assisted evidence

Run terminal commands in this guide from `WEB-UI-Automation`. The configured
MCP workspace is the repository root: pass `WEB-UI-Automation/tests/seed.spec.ts`
as the seed and prefix plan/test output paths with `WEB-UI-Automation/`.

## BOOKS-001: Open book details and return to the catalog

**Status:** Approved by the learner and automated in
[books.spec.ts](../tests/books.spec.ts).

**Purpose:** Verify that a public catalog entry opens the correct book details
and that the return button leads back to the catalog. Existing profile addition
coverage visits the details page but does not explicitly check its metadata.

### Preconditions and setup

- DemoQA is available at the configured `BASE_URL` (defaults to `https://demoqa.com`).
- Use a fresh, unauthenticated browser context.
- Git Pocket Guide exists in the public catalog.
- No account, API seeding, or collection cleanup is required.
- Reuse the `booksPage` fixture from [test.ts](../fixtures/test.ts).

### Test data

Expected values live in [books.ts](../test-data/books.ts), not in the spec.

| Field     | Expected value       |
| --------- | -------------------- |
| Title     | Git Pocket Guide     |
| ISBN      | 9781449325862        |
| Author    | Richard E. Silverman |
| Publisher | O'Reilly Media       |

### Actions and expected results

| Step | Browser action                | Expected result                                                             |
| ---- | ----------------------------- | --------------------------------------------------------------------------- |
| 1    | Open `/books`.                | The Git Pocket Guide link is visible.                                       |
| 2    | Click that book link.         | The URL is `/books?search=9781449325862` and the details page is displayed. |
| 3    | Inspect the book details.     | ISBN, title, author, and publisher match the expected data.                 |
| 4    | Click **Back To Book Store**. | The URL returns to `/books` and the book link is visible again.             |

**Cleanup:** The test runner closes the isolated browser context. No account
data is modified.

**Remaining gaps:** Catalog search and invalid ISBN handling are separate
candidates; this case does not claim coverage of authenticated collection actions.

## Agent seed

[seed.spec.ts](../tests/seed.spec.ts) opens the public catalog using the existing
fixture and asserts that the expected book is visible at the catalog URL.
It is a real readiness check, not an empty passing placeholder or another
implementation of BOOKS-001. It belongs to `@regression`, not `@smoke`.

When using the Playwright planner or generator setup tools for public Book Store
work, select `WEB-UI-Automation/tests/seed.spec.ts` as the seed file. Profile scenarios must instead
use the existing profile fixture and API client; this public seed does not log in
or prepare an account collection.

## AI-assisted workflow evidence

The learner first requested an inspection and design-only proposal: use Playwright
CLI to inspect the catalog and details, confirm locators from actual snapshots,
and do not implement before approval. After approval, the learner refined the
implementation request to reuse fixtures, page objects, API clients where needed,
and shared data, keep selectors inside page objects, and run independent and
related-suite validation.

### Browser observations

The following public, unauthenticated Playwright CLI sequence was actually used:

```powershell
npx playwright cli -s=book-design open https://demoqa.com/books
npx playwright cli -s=book-design snapshot
npx playwright cli -s=book-design click e146
npx playwright cli -s=book-design click e269
npx playwright cli -s=book-design find "Git Pocket Guide"
npx playwright cli -s=book-design close
```

`e146` and `e269` were references from that session's snapshots, not reusable
selectors. A new inspection must use references from its own current snapshot.
The observations confirmed the book link's exact accessible name, its ISBN URL,
the Book Store heading, the Back To Book Store button, and the expected metadata.
Subsequent browser DOM inspection confirmed the metadata wrapper IDs.
Raw advertisement-heavy snapshots are not required as committed evidence.

### Output review and architecture adaptation

- The `design-test-case` skill produced the case before implementation.
- After approval, the `implement-playwright-test` skill was used to implement it.
- The implementation reused the existing fixture and book identity, added typed
  author/publisher data, and placed selectors and retrying assertions in
  [BooksPage](../pages/books-page.ts).
- Shared open/return methods were also reused by the existing add-book flow.
- API setup was intentionally omitted because this case is public and read-only.
- AI performed the code edits. The learner refined and approved the requests;
  no independently hand-written code changes are claimed here.

### Validation

During implementation, the VS Code test runner reported:

- BOOKS-001 independently: **1 passed**.
- Book Store and profile suites together: **9 passed**.
- Editor diagnostics for changed TypeScript files: **no errors**.
- `git diff --check`: **passed**.

After replacing the seed placeholder, the VS Code test runner reported **1 passed**
for the seed independently and **10 passed** for the seed, Book Store, and profile
suites together.

To reproduce the seed check and then the related suites locally:

```powershell
npx playwright test tests\seed.spec.ts
npx playwright test tests\seed.spec.ts tests\books.spec.ts tests\profile.spec.ts
```

These are reproduction commands, not a claim that those CLI test commands were
used for the earlier VS Code runs. The combined run includes profile tests and
requires the dedicated account's local environment configuration. Never include
credentials or tokens in commands or this evidence.

The checked-in agent definitions and MCP configuration provide setup for future
agent use. Their presence alone does not demonstrate execution of the planner,
generator, or healer; the actual browser-assisted workflow above used the CLI
and custom skills.

## Copilot environment setup

The [Copilot setup workflow](../../.github/workflows/copilot-setup-steps.yml)
installs npm dependencies and Playwright browsers. No application build or local
server is needed: the tests target an external DemoQA environment. This setup
workflow does not run the test suites or prove that the agent tools were used.
