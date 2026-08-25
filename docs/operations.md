# Operations and release runbook

## Runtime configuration

Configure these values in Sites, not Git:

- `LLM_PROVIDERS` and only the provider keys it references
- `QUOTA_HMAC_SECRET`
- `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL`
- `ALTERIGOR_EXTENDED_PROFILE` only when it contains visitor-safe public facts
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` when alerts are enabled
- `SITE_URL` for canonical metadata after the deployed URL is known

The logical D1 binding is `DB`. No migration or deployment artifact may contain
a plaintext runtime value.

## Pre-release checklist

1. Confirm `main` is clean and CI passed.
2. Run format, lint, typecheck, tests, and production build locally.
3. Review the staged diff for secrets, private facts, contact content, and
   generated output.
4. Configure Sites runtime values and D1.
5. Publish the validated source through OpenAI Sites.

## Hosted smoke check

Verify the deployed URL on a fresh browser session:

- portfolio renders without a provider configured;
- chat name gate, remaining count, unsupported-question response, five-question
  limit, and generic unavailable state;
- contact validation, delivery, rate-limit response, and generic delivery
  failure;
- metrics decline leaves the site fully usable; accepting shows no private data
  in a Telegram alert;
- a successful contact produces a generic Telegram alert with no email or
  message content.

Do not enter real secrets, private facts, or contact messages into issue
comments, CI logs, or evaluation artifacts.

## Failure handling

- **Model unavailable:** leave portfolio and contact available; inspect the
  configured provider and fallback health without logging prompts or responses.
- **D1 unavailable:** chat fails closed before model usage; contact and insights
  use generic failure handling without exposing storage details.
- **Resend unavailable:** report the generic contact-delivery error; do not
  retry by saving a submission.
- **Telegram unavailable:** continue the visitor action and log only the safe
  event category.
- **Suspected secret exposure:** follow the security-response procedure in the
  threat model before redeploying.
