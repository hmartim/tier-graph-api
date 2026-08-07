# Security Policy

## Scope

This repository is an **implementation-neutral specification**. It contains no running
service, no production data, and no credentials. "Security" here therefore has two
distinct meanings, both of which matter:

1. **Repository data hygiene** — ensuring that no private database, secret, credential, or
   production dataset is ever committed.
2. **Specification-level security guidance** — the requirements an *implementer* must
   satisfy, documented in [`spec/12-security-and-privacy.md`](./spec/12-security-and-privacy.md).

## Reporting a data-exposure or specification vulnerability

If you discover that a commit contains private data, a secret, or a credential, **do not
open a public issue**. Instead, report it privately to the maintainer at
`hudson.martim@gmail.com` with the subject line `TIER-Graph SECURITY`. Include:

- the file(s) and commit(s) involved;
- the nature of the exposure;
- whether the data is already public elsewhere.

The maintainer will acknowledge within a reasonable time, remove the artifact, and, where
warranted, rewrite history and rotate any exposed credential.

If you find a **specification flaw** with security implications (for example, a temporal
grounding requirement that could be satisfied while leaking inadmissible evidence into a
projection), please report it the same way or open a normal issue if it carries no
disclosure risk.

## Private-artifact guard

A CI workflow ([`reject-private-artifacts.yml`](./.github/workflows/reject-private-artifacts.yml))
fails the build if any tracked file matches a private-artifact pattern (`*.db`, `*.sqlite`,
`.env`, `credentials/`, and others; see [`.gitignore`](./.gitignore) and
[`scripts/reject_private_artifacts.mjs`](./scripts/reject_private_artifacts.mjs)). This is a
safety net, not a substitute for care when authoring examples and fixtures.
