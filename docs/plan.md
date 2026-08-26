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
- Read `LLM_PROVIDERS` and only the provider-key secrets it references from
  `.env` locally or Sites runtime secrets in production. The ordered list uses
  OpenAI-compatible endpoints and model IDs, so no provider is built into the
  application.
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

## PR 7 — Five-question chat limits and visible model fallback

- Enforce a server-authoritative limit of five new model requests per browser
  session. The browser-session UUID is HMAC-hashed before D1 storage; clearing
  or changing a client-side counter must not bypass the server limit.
- Add a non-consuming chat-status response so the UI can show the exact
  `N of 5 questions left` value at session start, after a new request, and
  after a page reload. Reused exact-question answers do not consume a request.
- Configure a public display label per `LLM_PROVIDERS` entry. Return only this
  explicitly approved label to the browser; never expose model IDs, provider
  URLs, API keys, or other provider configuration. While a request is in
  progress, show `Trying {display name}…`.
- Configure an ordered, server-only fallback list with an explicitly approved
  public display label for each model. When the active provider returns an
  eligible limit or capacity response, stream a server-confirmed status event
  so the UI says `Model limit reached. Trying {next display name}…` before the
  fallback attempt. Do not infer a switch from a client-side timer or expose a
  raw provider error.
- A request that falls back still consumes only one of the five session
  questions. Retry only configured, bounded, eligible limit/capacity failures;
  do not fall back on validation, safety, or malformed-response failures. If
  all configured models are unavailable, show the existing generic unavailable
  state without naming private provider configuration.
- Disable new-question submission at zero remaining requests and show a clear
  session-limit message. Continue to handle unavailable and rate-limited
  states without exposing operational details.

**Acceptance:** Tests prove the visible remaining-count contract, model-label
redaction, exact-repeat cache behavior, visible fallback transitions,
one-question fallback accounting, and no provider call after the session limit.

## PR 8 — Privacy-first visitor insights and Telegram alerts

- Add a server-side, allowlisted visitor-event endpoint for a small set of
  useful events: first visit in a browser session, chat start, GitHub click,
  LinkedIn click, contact start, and contact submission.
- Use only a short-lived random browser-session identifier for event
  deduplication. Do not collect raw IP addresses, browser fingerprints, full
  referrers, chat content, visitor names, or contact email addresses as
  analytics data.
- Store privacy-preserving aggregate metrics and short-retention event records
  in D1. Define and test a deletion schedule; do not create visitor profiles or
  correlate sessions across visits.
- Add a plain-language privacy notice and a real opt-in choice before optional
  measurement. The portfolio and contact path must still work if visitors
  decline.
- Add a server-side Telegram notifier using `TELEGRAM_BOT_TOKEN` and
  `TELEGRAM_CHAT_ID` runtime secrets. Notify for qualified events, with a
  deduplicated first-visit alert for every browser session and generic alerts
  for accepted interactions; do not forward contact email addresses or message
  content to Telegram.
- Make notification delivery non-blocking: a Telegram or D1 failure must not
  affect the portfolio, chat, or contact submission. Record only safe,
  structured operational failure data.

**Acceptance:** Tests prove event allowlisting, consent enforcement, session
deduplication, redaction of personal data, retention cleanup, and graceful D1
and Telegram failures. The UI explains what is measured, why, how long it is
kept, and how visitors can decline optional measurement.

## PR 9 — Friendly chat voice and example questions

- Update the server-side assistant instruction so answers are clear,
  professional, and lightly humorous when it genuinely fits the visitor's
  question. Use occasional dry, kind humor rather than jokes in every answer;
  the humor must not obscure an answer, make claims, or target a person or
  group.
- Keep unsupported, privacy, prompt-injection, rate-limit, and unavailable
  responses direct, calm, and unambiguous. These boundary responses may be warm
  but must not be jokey.
- Add accessible example-question buttons below the chat greeting. Selecting a
  question places its exact text in the composer; it does not send a request or
  consume one of the five session questions. The examples are:
  - `What kind of platform engineering work does Igor do?`
  - `How has Igor used Kubernetes in his work?`
  - `Can you explain Igor's GitOps project?`
  - `What does the certificate orchestration service do?`
  - `Which technologies does Igor use for observability?`
- Keep the question set version-controlled alongside the approved portfolio
  knowledge. Review it whenever that knowledge changes, so an example cannot
  invite an answer beyond the published facts.

**Intended outcome:** Visitors immediately see useful, grounded ways to start
a conversation and receive answers that sound like a helpful human, not a
manual.

**Non-goals:** A comedy persona, personalized humor based on visitor data,
semantic question suggestions, additional model requests, or any new data
collection.

**Failure behavior and privacy:** If chat is unavailable, examples remain
visible but show the existing generic unavailable state when submitted. Example
selection stays entirely in the browser session and is neither logged nor
stored server-side.

**Acceptance:** Focused tests prove examples are grounded in approved content,
do not auto-submit or change the quota, and remain keyboard accessible. Prompt
tests prove the requested tone is present while unsupported and safety-boundary
answers remain explicit and factual.

## Configuration decisions

- The LLM provider is configured through an OpenAI-compatible interface so a
  free-tier provider can change without product rewrites.
- Each `LLM_PROVIDERS` entry includes a deliberately public, human-readable
  `displayName` used by the chat UI. It may name the selected model, but is
  independent from the server-only provider configuration and contains no
  credential or endpoint.
- Resend is the initial contact-form provider.
- Telegram is the initial private notification channel for qualified visitor
  engagement events. It receives no contact email address or message content.
- Redis and SOPS are not part of the first release. D1 holds only short-lived
  quota counters and privacy-preserving visitor metrics; public-on-request
  facts are a Sites runtime secret.
