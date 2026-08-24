---
name: alterigor-pr-ready
description: Prepare AlterIgor changes for a pull request by running its safety review, quality checks, and Git review. Use only when explicitly requested for PR readiness or release preparation.
---

# AlterIgor PR Ready

Prepare the current AlterIgor branch for review. Do not change application files
while using this skill unless the user separately asks for a fix.

## Safety gate

Run `$alterigor-ai-safety-review` first against the current diff. If it reports
a blocking finding, stop before committing, pushing, opening, or merging a PR.
Report the blocker and the verification needed to clear it.

## Readiness checks

- Inspect `git status`, the current branch, the intended base branch, and the
  complete diff. Preserve unrelated user changes.
- Run `git diff --check`, then the repository's formatting, lint, type-check,
  test, and production-build commands when they apply.
- Confirm no `.env` file, runtime secret, private profile fact, contact data,
  generated cache, or build artifact is staged.
- Summarize what changed, the checks run, and any remaining deployment or
  configured-runtime verification.

## Git and GitHub actions

By default, stop after the readiness report.

Commit, push, or open a PR only when the current user request explicitly asks
for that exact action. Before a mutation, confirm the exact branch, base branch,
and staged files. Use a focused conventional commit message and a PR body with
Summary, Privacy or Security when relevant, Verification, and Remaining Risks.

Never merge a PR just because it is ready. Merge only when the user explicitly
asks and there are no unresolved blocking findings.
