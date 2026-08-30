# Architecture decisions

## 2026-08-30 — Approximate country in Telegram visitor alerts

**Decision:** Include the hosting platform's approximate country in generic
Telegram visitor alerts when it is available. Do not store it, use a region,
city, postal code, coordinates, or raw IP address.

**Rationale:** Country provides a small, useful indication of where portfolio
interest originates without creating a visitor profile. It is less precise than
a province or city and is clearly disclosed in the optional-metrics notice.

**Privacy and failure behavior:** The value is derived server-side and sent
only to Telegram. It may be absent or inaccurate because VPNs, mobile
networks, corporate proxies, and Tor can obscure location. Missing or invalid
values leave the alert location-free.

**Non-goals:** Location analytics, country storage, regional reporting,
identity verification, or tracking a visitor across sessions or sites.

## 2026-08-27 — Named Telegram chat alerts with clear disclosure

**Decision:** State at chat start that using chat sends the entered name and
each submitted chat question to Igor in a Telegram alert. The site does not
store this content in D1 or application logs.

**Rationale:** Igor wants to know when a visitor actively uses the assistant.
A short, visible disclosure makes the external transfer clear before chat
begins rather than hiding it behind ordinary usage.

**Privacy and failure behavior:** Telegram is an external service and may
retain the alert. The notice says this plainly. The request is bounded by the
existing HMAC-based network quota and notification failures do not affect chat.

**Non-goals:** Identity verification, visitor profiles, analytics containing
names or questions, forwarding model answers, or sending content without the
the visible chat disclosure.

## 2026-08-26 — Curate public chat knowledge separately from repository analysis

**Decision:** Load only a short, version-controlled module of reviewed public
professional facts in addition to the portfolio profile. Do not load the
repository-derived professional-skill report or the CV automatically.

**Rationale:** Repository analysis is useful source material, but it can expose
internal system names, vendor integrations, incident details, authorship
metadata, or unsupported inferences when treated as public chatbot context.
The curated module improves technical answers while keeping every disclosed
fact easy to review.

**Non-goals:** Publishing source-repository evidence, adding provider or
internal architecture details, using the assistant to reveal interview notes,
or turning the CV into unrestricted chatbot context.

## 2026-08-26 — Light humor is a constrained presentation layer

**Decision:** Give ordinary, supported portfolio answers a warm, concise voice
with occasional dry, kind humor when it fits. Keep refusals, safety boundaries,
privacy boundaries, rate limits, and unavailable states clear and non-jokey.
Show five fixed example questions derived from approved portfolio content;
selecting one fills the composer but does not submit it.

**Rationale:** A little personality makes the assistant more inviting without
weakening its credibility, truthfulness, or safety messaging. Fixed questions
provide a useful starting point without collecting extra data or using a model
to generate suggestions.

**Non-goals:** A comedy character, humor based on visitor identity or message
content, automatic sending, personalized recommendations, or a new analytics
event.

## 2026-08-25 — Anonymous unique-visit alerts are essential notifications

**Decision:** Send one generic Telegram notification for each new browser
session, even when a visitor declines optional interaction metrics. Use the
same short-lived HMAC-hashed session identifier to deduplicate the alert and
delete its record after 30 days. Keep chat, link, and contact-start metrics
behind the opt-in choice, and send a generic Telegram alert for each accepted
interaction.

**Rationale:** Igor needs a minimal signal that the portfolio is being visited;
the alert contains no identity, content, IP address, or browsing profile.

**Non-goals:** Identifying people, tracking across sessions or sites, measuring
declined interactions, or adding visitor profiles.

## 2026-08-25 — Manual deployed-chat evaluation, not credentialed CI

**Decision:** Keep the compact chat evaluation set version-controlled, but run
it only as an explicit command against a configured deployment. CI validates the
case-set structure without calling a provider.

**Rationale:** This keeps model requests, answers, and provider cost out of CI
while leaving groundedness, safety, privacy, latency, and token-ceiling checks
repeatable before release.

**Non-goals:** Automated semantic grading, committing provider pricing, storing
evaluation answers, or using visitor data as evaluation input.

## 2026-08-25 — Consent-based aggregate visitor insights

**Decision:** Collect only six allowlisted engagement events after a visitor
explicitly opts in: first visit, chat start, GitHub click, LinkedIn click,
contact start, and contact submission. An ephemeral browser-session UUID is
HMAC-hashed before storage in D1. Event records retain no content or identity
fields and are deleted after 30 days.

**Rationale:** This provides a small signal of portfolio engagement without
visitor profiles, cross-site tracking, or a reason to retain sensitive data.

**Failure behavior:** Declining consent prevents all event requests. D1 and
Telegram failures are isolated from portfolio, chat, and contact behavior.

**Non-goals:** Analytics dashboards, individual visitor reporting, contact or
chat-content telemetry, and identity verification.

## 2026-08-25 — Five-question chat sessions and a public model label

**Decision:** Limit each browser session to five new model requests, enforced
server-side with the existing D1 HMAC-hashed session key. Return a
non-consuming remaining-count status so the UI can show the exact number of
questions left. Keep exact-repeat answer reuse in browser-session storage.

Expose only each configured provider's public `displayName` to the chat UI. The
UI shows `Trying {display name}…` while a new request is in progress. It does
not expose model IDs, provider URLs, or credentials.

**Rationale:** Five requests make expected usage and cost easy to understand
while preserving the existing fail-closed server boundary. A display label
provides transparency about the model experience without turning deployment
configuration or credentials into browser data.

**Non-goals:** Semantic duplicate detection, persistent visitor profiles,
server-side chat history, and exposing provider internals.

## 2026-08-25 — Visible model-limit fallback

**Decision:** The provider adapter may try the next configured model only for
a bounded set of verified provider-limit or capacity failures. It will emit a
server-confirmed progress event before each fallback attempt, allowing the UI
to state: `Model limit reached. Trying {next display name}…`.

Each fallback chain is one visitor question and consumes one session allowance,
not one allowance per attempted model. If all configured models fail, the UI
uses the same generic unavailable state and does not reveal raw errors or
server-only provider details.

**Rationale:** The status makes the model transition understandable without
misleading visitors about whether a fallback actually occurred. Bounded,
classified fallback preserves cost control and avoids retrying unsafe or invalid
requests.

**Non-goals:** Automatic fallback for every error, unbounded retries, exposing
provider errors or configuration, and recording fallback events with question
content.

**Implementation note:** The browser never owns or sends the quota identifier.
The chat route creates a session-only, HttpOnly cookie and HMAC-hashes that
opaque UUID before D1 use. `LLM_PROVIDERS` is a server-only ordered JSON array
of up to three `{ baseUrl, model, displayName, apiKeyEnv }` entries. The first
provider is primary; the rest are bounded fallbacks. `apiKeyEnv` identifies a
separate runtime secret, which keeps credentials out of JSON and makes the
adapter provider-agnostic across OpenAI-compatible APIs. Only configured public
display names are sent to the browser.

## 2026-08-26 — Public OpenRouter and selected-model status

**Decision:** When a provider returns a model identifier in its successful
OpenAI-compatible response, include that identifier with the chat answer and
show it beside the configured public provider label. The production label will
identify OpenRouter and its free-model router.

**Rationale:** OpenRouter's free router selects an available free model per
request. Showing the provider and the returned model makes that variability
clear without claiming that a configured router name is the model that
answered.

**Privacy and safety:** Only a short, slug-shaped model identifier returned in
a successful response is exposed. Provider URLs, API keys, request content,
raw provider errors, and any model identifier from a failed request remain
server-only.

**Non-goals:** Listing provider configuration, revealing routing rules, or
persisting model choices with visitor data.
