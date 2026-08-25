# Architecture decisions

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
