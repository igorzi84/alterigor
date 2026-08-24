# AlterIgor: Sites Portfolio and AI Chatbot Plan

This plan is split into small, reviewable pull requests. Local credentials stay
in the ignored `.env` file. `.env.example` contains variable names only; live
deployment uses the equivalent Sites runtime secrets.

## PR 1 — Replatform for OpenAI Sites

- Reformat the repository into a root-level, Sites-compatible TypeScript
  application with `.openai/hosting.json`.
- Remove the obsolete FastAPI runtime and Python dependencies; never copy,
  commit, or print `.env` values.
- Add project scripts for formatting, linting, strict TypeScript checks, tests,
  and the production build; include an initial Vitest smoke test.
- Add Prettier and ESLint, plus a GitHub Actions workflow that runs
  `format:check`, `lint`, `typecheck`, `test`, and `build` for every push and
  pull request.
- Add an environment-variable template and a README describing the project.
  CI must use no real API keys and must never deploy.

**Acceptance:** The branded Sites application builds successfully, and the CI
workflow completes the quality sequence without real credentials. Deployment
remains a separate manual OpenAI Sites action.

## PR 2 — Engineering portfolio and public knowledge

- Build an accessible, responsive portfolio for engineering peers with
  experience, platform skills, selected projects, GitHub/LinkedIn links, and a
  contact section.
- Create a curated, version-controlled public knowledge source from `cv.md` for
  portfolio copy and chatbot grounding.
- Add accurate metadata and a branded social-preview image.

**Acceptance:** The portfolio is useful without chat, and all visible claims
come from approved public content.

## PR 3 — Provider-neutral chatbot

- Add a server-side chat endpoint using an OpenAI-compatible model adapter.
- Read `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` only from `.env` locally
  or Sites runtime secrets in production.
- Load `ALTERIGOR_EXTENDED_PROFILE` only on the server. It may contain
  public-on-request facts such as location and hobbies, but nothing
  confidential.
- Add grounded-answer behavior, unsupported-question handling, generic provider
  failures, and safe logging.

**Acceptance:** Mocked tests cover grounded answers, provider failure, and
attempts to obtain secrets or hidden instructions.

## PR 4 — Session experience and abuse protection

- Add the visitor-name gate and bounded recent conversation context for the
  current browser session only.
- Add D1-backed, short-lived hashed quota counters for chat requests; do not
  persist names, transcripts, or profile facts.
- Enforce request, history, output, quota, and model-usage limits with clear
  unavailable and rate-limited states.

**Acceptance:** Tests prove session isolation, context bounds, quota behavior,
and the absence of server-side conversation retention.

## PR 5 — Contact form

- Add accessible name, email, and message fields with client- and server-side
  validation.
- Send messages through Resend using `RESEND_API_KEY` and configured sender and
  recipient settings; do not store submissions.
- Reuse abuse protection and show a concise contact-data privacy notice.

**Acceptance:** Mocked tests cover delivery, invalid input, quota rejection, and
provider failure.

## PR 6 — GitHub showcase, verification, and deployment

- Add architecture, threat-model, operations, and AI-evaluation documentation
  showing the knowledge boundary, prompt-injection defenses, provider adapter,
  and cost controls.
- Add a compact evaluation set for groundedness, safety, latency, and token or
  cost reporting.
- Run production checks, configure Sites secrets from local `.env` without
  committing them, and deploy through OpenAI Sites.

**Acceptance:** Checks pass, Git contains no secrets or extended-profile facts,
and the public site has verified graceful failure states.

## Configuration decisions

- The LLM provider is configured through an OpenAI-compatible interface so a
  free-tier provider can change without product rewrites.
- Resend is the initial contact-form provider.
- Redis and SOPS are not part of the first release. D1 holds only short-lived
  quota counters, and public-on-request facts are a Sites runtime secret.
