# Threat model

## Assets

- Runtime secrets: provider, quota, Resend, Telegram, and contact settings.
- Approved public knowledge and public-on-request facts.
- Voluntary contact messages, which are delivered but not retained by the site.
- Availability and model-request budget.

## Primary threats and controls

| Threat                                          | Control                                                                                                              | Residual risk                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Prompt injection or hidden-instruction requests | A fixed system boundary permits only approved knowledge and rejects requests for prompts, secrets, and private data. | A model can still produce an imperfect answer; evaluation and review remain necessary. |
| Unsupported or exaggerated claims               | Public profile is the source of truth; prompt requires uncertainty rather than inference.                            | Source content must be kept current and approved.                                      |
| Secret exposure                                 | Secrets are runtime-only, omitted from browser responses, logs, tests, and repository files.                         | Hosting configuration must be reviewed before deployment.                              |
| Chat cost or availability abuse                 | Server-side five-question session quota, HMAC hashing, output limit, timeout, and bounded fallback.                  | Attackers may start new sessions; provider account limits remain a separate safeguard. |
| Contact abuse                                   | Server-side validation and HMAC-hashed daily network quota before Resend delivery.                                   | Legitimate shared-network users can share a quota.                                     |
| Visitor tracking or data leakage                | Opt-in allowlist, ephemeral session IDs, HMAC hashes, 30-day deletion, no raw IP or content in event data.           | A browser can clear local consent/session storage and be counted again.                |
| Telegram disclosure                             | Fixed generic alert text and no request-content forwarding.                                                          | Telegram account and chat access must be protected by Igor.                            |
| Dependency or deployment regression             | Locked dependencies, CI quality checks, production build, and manual release verification.                           | A live provider, D1, or email failure needs the operations response below.             |

## Security response

If a private fact, secret, or unexpected content path is discovered: stop the
affected deployment, rotate the relevant runtime secret, remove the exposure,
review logs without collecting new sensitive data, and add a regression test
before redeploying. Treat confirmed secret disclosure as high severity.
