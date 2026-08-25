# Architecture

## Purpose and boundary

AlterIgor is a portfolio site with a limited-knowledge assistant. Its approved
knowledge is the version-controlled public profile and CV. The optional
`ALTERIGOR_EXTENDED_PROFILE` runtime value may contain only public-on-request
facts. Unsupported questions receive a concise uncertainty response and a
contact path; the assistant does not browse, act on systems, or claim to be
Igor.

## Request flows

```text
Browser
  |-- Portfolio page ----------------------------> public profile content
  |-- Chat POST -> chat route -> quota D1 -> configured model provider
  |-- Contact POST -> contact quota D1 -> Resend
  '-- Opt-in event POST -> insight quota D1 -> event D1 -> Telegram (optional)
```

The browser sees only approved provider display names. Provider base URLs,
model IDs, API keys, extended-profile content, Resend settings, and Telegram
credentials stay in Sites runtime configuration.

## Chat

The chat route validates a 1–1200 character question, creates an opaque,
HttpOnly session cookie, HMAC-hashes it before D1 access, and consumes one of
five model requests before calling a provider. It has a 15-second provider
timeout, a 400-token completion ceiling, and a 1,600-character answer cap.
Only verified provider limit or capacity failures may move to the next
configured provider. Errors returned to visitors are generic.

The browser displays the current chat exchange and may reuse exact answers in
browser-session storage. The server stores neither visitor names nor chat
transcripts.

## Contact and insights

Contact delivery validates voluntary name, email, and message fields, applies a
short-lived HMAC-hashed network quota, and sends the message directly through
Resend without persisting it. Optional analytics use a separate browser-session
UUID, hashed before D1 storage. A first-visit event is essential to the generic
unique-visit alert; the other five allowlisted engagement events require opt-in.
Event records are deleted after 30 days.

Telegram receives a generic first-visit alert for every browser session. When a
visitor opts in, it also receives generic chat, link-click, and contact-activity
alerts. It never receives a visitor name, email address, message, chat content,
or session identifier. Resend, D1, and Telegram failures are isolated from
unrelated site functions.

## Non-goals

There are no accounts, visitor profiles, server-side conversation history,
uploads, analytics SDKs, autonomous actions, or cross-site tracking.
