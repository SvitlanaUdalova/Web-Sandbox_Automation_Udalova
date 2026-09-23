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
