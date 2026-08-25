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

## Chat evaluation

The compact evaluation set is in `evals/chat-cases.json`. It is intentionally
not part of CI because it sends approved test prompts to a configured deployed
assistant. Run it only against a deployment that has its runtime configuration:

```bash
EVALUATION_URL=https://your-site.example/api/v1/chat npm run evaluate:chat
```

The evaluator reports response latency and the configured maximum output-token
ceiling. Review each answer against its expected boundary before publishing
results; it does not store answers or send them anywhere other than the target
endpoint.

## Project plan

See [docs/plan.md](docs/plan.md) for the staged implementation plan and
[AGENTS.md](AGENTS.md) for the operating, privacy, and security rules.

Release documentation: [architecture](docs/architecture.md),
[threat model](docs/threat-model.md), [operations](docs/operations.md), and
[evaluation guide](docs/evaluation.md).

## Reusable Codex safety-review skill

This repository includes explicit-only Codex skills for reviewing chatbot,
contact, analytics, and Telegram changes, and for preparing pull requests. They
are portfolio evidence of repeatable AI-assisted engineering controls, not part
of the deployed site.

Install it into your personal Codex skills directory:

```bash
cp -R skills/alterigor-ai-safety-review skills/alterigor-pr-ready ~/.codex/skills/
```

Then invoke it explicitly from Codex:

```text
$alterigor-ai-safety-review review the current branch before I commit
$alterigor-pr-ready review, commit, push, and open a PR for the current branch
```

The skill does not change files or deploy by itself. Never add API keys,
Telegram credentials, private facts, or `.env` values to the skill source.
