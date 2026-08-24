# AlterIgor

AlterIgor is a grounded AI portfolio assistant for Igor Zilberman’s platform
and infrastructure engineering work. The site is being built in small,
reviewable pull requests with OpenAI Sites.

## Development

Use Node.js 22 or later. Copy `.env.example` to `.env` only when a later pull
request needs local runtime configuration; never commit that file or any API
key.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs the same checks without credentials or deployment. OpenAI
Sites deployment remains a separate manual action after the project is ready.

## Project plan

See [docs/plan.md](docs/plan.md) for the staged implementation plan and
[AGENTS.md](AGENTS.md) for the operating, privacy, and security rules.
