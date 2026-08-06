# Alter Ego — Product and Learning Ideas

## Vision

Build a portfolio chatbot that can answer potential recruiters' questions using a small, explicitly approved knowledge base about Igor. The project should demonstrate practical Python and LLM skills together with senior-level architecture, security, privacy, observability, availability, and cost control.

The chatbot must make it clear that it is an AI assistant, not Igor. It should say when it does not know something and provide a safe way for a visitor to contact Igor instead of inventing an answer.

## Learning goals

- Build and operate a modern Python web service.
- Learn how LLM prompts, context, retrieval, structured output, evaluations, and safety controls work.
- Design a production-shaped system without overengineering it.
- Practice authentication, data modelling, testing, delivery, observability, incident response, and cost management.
- Document decisions and trade-offs clearly enough for a technical interviewer to explore them.

## Visitor verification

Initial idea: before chatting, a visitor provides an email address and enters a one-time code sent to that address. A new visit requires verification again to discourage abuse.

Design notes:

- Email verification proves control of an inbox; it does not prove identity and is not sufficient abuse prevention by itself.
- Use short-lived, single-use codes with attempt limits. Store only a cryptographic hash of a code, never the code itself, and never log it.
- Add layered controls: per-IP and per-email rate limits, resend cooldowns, conversation/message quotas, bot detection when risk justifies it, and a global kill switch.
- Return neutral responses so attackers cannot easily discover whether an email is already stored.
- Use a signed, secure, short-lived session after verification. Requiring a code on every page refresh would damage usability; define "new visit" as a new or expired session.
- Protect the email-sending endpoint itself from abuse, or an attacker could use it to create cost and spam complaints.
- Keep email-service and LLM credentials on the server, with least privilege and rotation support.

Open question: decide the session lifetime and whether trusted visitors may opt into a longer-lived session.

## Remembering visitors and email privacy

It can generally be lawful to store email addresses, but an email address is personal information. The exact obligations depend on where the operator and visitors are located; this project is not a substitute for legal advice.

Privacy-by-design proposal:

- Explain, before collection, why the email is needed, what conversation data will be kept, which service providers receive data, how long it is retained, and how deletion can be requested.
- Obtain meaningful consent for the stated purposes. Verification does not create consent to send recruiting updates, newsletters, or other marketing.
- Collect only what is required. Use a random internal visitor ID for application relationships; encrypt or otherwise strongly protect the email and restrict access to it.
- Do not automatically feed an email address or old conversation into an LLM. Retrieve only the minimum approved context needed for the current response.
- Let a returning visitor see whether memory is enabled, review what is remembered, opt out, and request deletion.
- Define a short retention period for unverified addresses, verification attempts, raw conversations, logs, and inactive accounts. Automatically delete expired records.
- Publish a plain-language privacy notice and a contact method for privacy requests.
- Record consent version and time, without collecting unnecessary evidence.
- Have a breach-response plan and avoid putting personal data in telemetry.

Before public launch, review the design against the laws that actually apply, such as Canadian federal or provincial privacy law and, if serving people elsewhere, laws such as GDPR or state privacy laws.

## Knowledge about Igor

- Use a small, curated, version-controlled set of approved professional facts.
- Separate public facts from private facts. Only public facts may enter prompts or retrieval results.
- Attach a source and last-reviewed date to each fact.
- Make answers cite or internally trace back to approved facts.
- Refuse questions seeking private contact details, confidential employer information, references, compensation details, or unsupported claims.
- Provide a correction workflow when an answer is wrong or outdated.

Start with direct retrieval from a small structured document. Add embeddings or a vector database only when the corpus and evaluation results justify them.

## Model providers: OpenAI and Gemini

Multiple providers are a useful later milestone, but they should not become multiple autonomous agents without a clear need.

Recommended progression:

1. Implement one provider behind a small provider-neutral interface.
2. Build a fixed evaluation set containing realistic recruiter questions, adversarial prompts, and out-of-scope questions.
3. Add a second provider and compare quality, safety, latency, availability, and cost with the same evaluation set.
4. Add explicit routing or fallback only if the measurements justify the extra operational complexity.

Current low-cost candidates to evaluate include OpenAI's nano tier and Gemini's Flash-Lite tier. Model names and prices change, so verify the current official pricing and data terms when making the architecture decision. Do not send personal visitor data to a provider until its retention and training terms have been reviewed.

## Monthly LLM budget: USD 10

Treat USD 10 as a hard total project limit, not merely an alert and not a separate allowance for each provider.

Use several controls together:

- a provider/project hard spending limit when available, plus alerts below the limit;
- an application-side monthly usage ledger and circuit breaker that stops model calls before the budget is exhausted;
- per-visitor, per-session, and global request quotas;
- maximum input, context, and output token limits;
- short answers and a small curated context;
- timeouts, bounded retries, and no automatic cross-provider retry when it could double the cost;
- cached answers for safe, common questions where appropriate;
- separate budgets for development/evaluation and the public site; and
- a no-LLM fallback response when the budget or provider is unavailable.

Track request count, token usage, estimated cost, latency, errors, rate-limit events, and remaining monthly budget by provider and model. Never rely on a billing alert as the only protection against cost-exhaustion attacks.

## Security questions to answer before launch

- What public facts is the assistant allowed to reveal?
- Can user input cause private instructions, other visitors' data, or secrets to appear in output?
- How are prompts and retrieved facts separated from untrusted visitor text?
- What happens after repeated verification failures or abusive model prompts?
- Can an attacker exhaust the email or LLM budget despite rate limits?
- Which personal data appears in logs, traces, backups, provider requests, and support tools?
- How are deletion requests propagated to databases, backups, logs, and third parties?
- What is the safe behavior when any dependency fails?

## Suggested milestones

### Milestone 0 — Product boundaries and threat model

Write the allowed knowledge, non-goals, data-flow diagram, threat model, privacy notice draft, success metrics, and a small recruiter-question evaluation set. No LLM integration yet.

### Milestone 1 — Local learning prototype

Build a local Python chatbot over the curated facts. Focus on grounded answers, refusals, tests, token accounting, and evaluation results. Do not collect email addresses yet.

### Milestone 2 — Small web service

Expose the chat workflow through a simple server and UI. Add structured logs, metrics, traces, health checks, timeouts, and graceful errors. Keep it private during development.

### Milestone 3 — Verification and privacy

Add the one-time-code flow, short-lived sessions, abuse controls, retention jobs, deletion flow, and privacy notice. Threat-model and test this milestone before making it public.

### Milestone 4 — Public launch with budget controls

Deploy with least-privilege secrets, a hard application budget circuit breaker, dashboards, alerts, backups, rollback, and a runbook. Run load, failure, prompt-injection, and cost-exhaustion tests.

### Milestone 5 — Provider comparison

Evaluate OpenAI and Gemini using the same dataset. Publish the measurements and an architecture decision record. Add routing or failover only if there is a measurable benefit.

## Portfolio evidence

The strongest GitHub story will be the evidence of engineering judgment:

- a concise architecture diagram and threat model;
- architecture decision records showing considered trade-offs;
- repeatable LLM quality and safety evaluations;
- service-level objectives and observable dashboards;
- cost estimates versus actual usage;
- failure-injection and recovery results;
- privacy and data-retention design; and
- an honest roadmap that distinguishes implemented, tested, and planned work.

