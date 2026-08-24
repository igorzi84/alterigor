# AlterIgor — Codex Project Instructions

## Mission

Build and deploy AlterIgor as a small, credible portfolio website and AI assistant for engineering peers, recruiters, and other portfolio visitors. It represents Igor using only approved, public professional information. It must be useful, fast, private, and honest; it must never inflate experience or invent facts.

Codex is authorized to implement, test, and improve this project directly. Do not remain in mentor-only mode or ask for a separate code-writing override. Explain important product and architecture decisions briefly before making them.

## Deployment platform

Deploy this project with OpenAI Sites. Treat it as a Sites web application, not as a FastAPI application to publish unchanged.

- Use the Sites skill and its generated structure, `.openai/hosting.json`, and supported deployment workflow.
- Reformat the existing prototype into a Sites-compatible TypeScript application with worker-compatible server endpoints. Do not add a separately hosted Python service just to preserve the current structure.
- Keep provider API calls server-side. Configure runtime secrets through Sites; never expose them in browser code, committed files, build output, logs, or error messages.
- Keep the site functional when the AI service is unavailable: show the portfolio content and a clear, friendly unavailable state for chat.
- Before publishing, run the production build and fix real failures. Publish when the user asks to deploy or publish, then return the deployed URL.

## Product scope

The first release should include:

- a clear portfolio landing page with Igor's approved experience, skills, selected work, and contact path;
- a limited-knowledge chat experience that answers only from approved public portfolio/CV content;
- a simple visitor-name gate before chat, with the name used only for the current browser session; and
- a contact form that sends messages through a server-side email provider without storing submissions; and
- an accessible, responsive experience that works with keyboard and touch.

Do not add accounts, persistent visitor profiles, document uploads, payments, autonomous actions, analytics, or social integrations unless the user specifically requests them. The user has requested limited, privacy-first visitor metrics and Telegram alerts as defined in `docs/plan.md`; do not expand this into identity tracking or cross-site profiling.

## Source of truth and honesty

- Treat the public CV and explicitly approved project materials as the version-controlled factual knowledge sources.
- `ALTERIGOR_EXTENDED_PROFILE` is a Sites runtime secret for public-on-request facts that should not appear in Git or page copy, such as location and hobbies. Every visitor may receive these facts from chat, so it must contain nothing confidential.
- Never put truly private, employer-confidential, recruiter-conversation, compensation, or personal-sensitive information in any chatbot knowledge source. SOPS encryption or a database does not make a fact safe to disclose from a public chatbot.
- Never present private information, recruiter conversations, personal contact details beyond what Igor has approved publicly, or unpublished work.
- If the answer is not supported by an approved source, say so plainly and offer a contact path rather than guessing.
- Do not claim production scale, results, certifications, roles, or technical experience that the source material does not support.

## Security, privacy, and cost controls

Treat all visitor input and model output as untrusted.

- Defend against prompt injection and requests for private instructions or hidden data. The assistant cannot execute actions, access secrets, browse private systems, or change content on behalf of a visitor.
- Minimize data collection. Keep names and recent conversation context in the current browser session only; do not persist chat transcripts or visitor names server-side. Do not put personal message content in logs. A name is a claimed session label, not verified identity.
- D1 may hold short-lived, privacy-preserving quota counters and visitor metrics only. Do not use it for chat history, visitor profiles, extended-profile facts, contact submissions, contact email addresses, raw IP addresses, browser fingerprints, full referrers, or message content.
- Measure only an explicit allowlist of useful engagement events. Offer a clear opt-in before optional measurement, document the purpose and retention period, and ensure declining does not block portfolio, chat, or contact functionality.
- Add server-side input limits, request validation, rate limiting, a per-request/model usage limit, and a fail-closed budget or quota control.
- Use generic client-facing errors; keep structured operational logs free of secrets, prompts, CV text, full messages, and full model responses.
- Keep `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, `ALTERIGOR_EXTENDED_PROFILE`, `RESEND_API_KEY`, Telegram credentials, and contact email settings in local `.env` during development and Sites runtime secrets in production. Never commit `.env`, its values, or secret-derived output.
- If a security or privacy issue is found, state the risk, likely harm, severity, mitigation, and whether implementation must stop before continuing.

## Engineering expectations

- Prefer one modular application over microservices. Keep UI, approved knowledge, chat/product logic, and provider integration clearly separated.
- Use TypeScript and the Sites-supported runtime for new web code unless a specific requirement makes another supported choice necessary.
- Keep the model provider behind a small OpenAI-compatible server-side adapter so a free-tier provider can be changed through configuration rather than product rewrites.
- Use Resend behind a small server-side contact-delivery adapter. Validate and rate-limit every submission, send it without persistence, and disclose the contact-data use in the UI.
- Preserve user changes and inspect the current working tree before editing. Do not overwrite, delete, reset, or commit unrelated work.
- Make small, coherent changes. For meaningful decisions, record the decision and rationale in `docs/decisions.md`.
- Use accessible semantic HTML, visible focus states, labelled controls, readable contrast, and responsive layouts.
- Avoid unnecessary dependencies, background jobs, databases, and third-party scripts.

## Quality and operations

For each meaningful feature, define the intended outcome, non-goals, failure behavior, privacy implications, and how it will be verified. Use small, coherent pull requests as defined in `docs/plan.md`. Maintain GitHub Actions CI that runs formatting, linting, strict type checks, tests, and the production build without real credentials or deployment. Add focused tests for validation, grounded-answer boundaries, injection resistance, unavailable providers, contact delivery, and rate/budget limits. Maintain a small repeatable chat evaluation set that checks groundedness, safety, latency, and cost.

Before declaring work complete, run the applicable checks (including the production build) and report what changed, what was verified, any remaining risks, and the deployed Sites URL when publishing occurred.
