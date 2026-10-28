# Web-Sandbox_Automation_Udalova

The DemoQA Playwright project lives in
[WEB-UI-Automation](./WEB-UI-Automation/README.md).

## Run Web UI tests

Run package-manager and Playwright commands from the project directory:

```powershell
Set-Location WEB-UI-Automation
npm ci
npx playwright install chromium
Copy-Item .env.example .env
npx playwright test --grep "@regression"
```

Create `.env` only if it does not already exist, then configure the dedicated
account locally. Never commit credentials. See the
[project guide](./WEB-UI-Automation/README.md) for setup, test selection, and CI,
and the [approved test case and AI evidence](./WEB-UI-Automation/specs/README.md).

GitHub workflows, agent definitions, skills, and VS Code MCP configuration stay
at the repository root for discovery. Their commands target the nested project.
Open this repository root in VS Code to use the shared MCP configuration.
