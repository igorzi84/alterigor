---
name: alterigor-ai-safety-review
description: Review AlterIgor chatbot, contact, analytics, and notification changes for privacy, LLM safety, and release risks. Use when explicitly requested before implementation, review, or merge.
---

# AlterIgor AI Safety Review

Review the requested or proposed change. Do not modify files, create accounts,
send notifications, commit, push, or deploy unless the user explicitly asks.

Start with the most important finding. Classify findings as **blocking** or
**improvement**, cite the relevant file and line when available, and give a
short verification step for each blocking finding.

## Required checks

- Knowledge boundary: chatbot answers use only approved public CV/portfolio
  content and the server-only public-on-request profile. Flag facts that are
  confidential, employer-sensitive, unsupported, or likely to misrepresent
  Igor's experience.
- Secrets and data flow: provider, Resend, Telegram, and Site credentials must
  stay in `.env` or runtime secrets. They must not enter browser code, Git,
  logs, errors, prompts, tests, examples, or notifications.
- Visitor privacy: names are a claimed browser-session label only; do not
  persist names, chat transcripts, email addresses, message contents, raw IP
  addresses, fingerprints, or full referrers. Email is voluntary contact data,
  not analytics identity.
- Analytics and Telegram: accept only explicit allowlisted events after the
  visitor's optional-measurement choice. Verify retention, deletion, and that
  Telegram receives no contact email address or message content.
- LLM safety: treat model output and visitor input as untrusted. Check prompt
  injection resistance, unsupported-question handling, generic client errors,
  input/output limits, timeouts, provider failure, and no privileged model
  actions.
- Availability and cost: confirm rate/quota controls fail closed where needed,
  and a provider, D1, Resend, or Telegram failure does not break unrelated site
  functions.
- Release readiness: identify the focused tests and checks needed. Do not claim
  a feature is production-ready without evidence from the current change.

## Report format

1. Assessment: one sentence.
2. Blocking findings, if any: risk, harm, severity, safest mitigation, and
   whether work must stop.
3. Improvements: the few highest-value items only.
4. Verification: exact checks or test cases to run.

If no issue is found, state the scope reviewed and residual risks. Do not infer
that a privacy notice or consent implementation is legally sufficient; call
out when legal review is needed.
