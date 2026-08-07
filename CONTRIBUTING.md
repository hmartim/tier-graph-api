# Contributing to the TIER-Graph API Specification

Thank you for your interest in improving the TIER-Graph API. This repository is a
**specification project**, not a service implementation. Contributions therefore concern
the *contract*: prose, data models, the OpenAPI document, the ontology, profiles, and
conformance materials.

## Ground rules (non-negotiable)

These mirror the architectural invariants in [`spec/`](./spec/). A change that violates any
of them will not be accepted:

1. **Do not couple the core to any concrete substrate.** A substrate meets the core only
   through a `TemporalGroundingProfile`. Concrete profiles/adapters (including the legal
   SAT-Graph one) live in the separate `tier-graph-reference` repository, never here.
2. **Do not copy authoritative source-state intervals into `DerivedRelation`.** Temporal
   state is *computed* from evidence admissibility.
3. **Preserve the conjunctive-vs-alternative evidence distinction** (anchors within a
   record are conjoined; separate records are alternatives).
4. **Preserve proposition polarity vs. evidence stance** — they are different things.
5. **Treat `unknown` qualifiers as different from `absent`.**
6. **Block automatic relation merging when any identity-relevant qualifier is unresolved.**
7. **Keep derived propositions non-authoritative and auditable.**
8. **Generate temporal projections from profile-evaluated admissibility**, never from an
   all-time graph filtered after the fact.
9. **Never commit** a database, private source data, credentials, secrets, or production
   configuration. The CI guard will reject it, and so will we.
10. **No backend server or reference implementation** in this repository.

## Normative language

Use RFC 2119 / RFC 8174 keywords (**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**,
**MAY**) in normative prose, and only there. Where the design is unsettled, mark the
section:

```text
Status: Draft — open design question
```

and state the unresolved issue explicitly.

## Workflow

1. Open an issue describing the change and which conformance class(es) it touches.
2. Branch from `main`. Keep changes scoped.
3. Run the validators locally (see below). CI must pass.
4. Update [`CHANGELOG.md`](./CHANGELOG.md) under `[Unreleased]`.
5. Open a pull request. Explain the semantic impact and any compatibility implications.

## Local validation

```bash
# OpenAPI contract
cd openapi && npm install && npm run validate

# JSON Schemas + examples + conformance definitions
npm --prefix scripts install
npm --prefix scripts run validate:schemas
npm --prefix scripts run validate:examples
npm --prefix scripts run validate:conformance

# Ontology (Turtle parse + SHACL)  — see scripts/README
npm --prefix scripts run validate:rdf

# Private-artifact guard
npm --prefix scripts run guard:private
```

## Style

- Clear academic and engineering English. No marketing claims.
- Carefully distinguish: ontology · API · profile · implementation · source substrate ·
  derived graph · conformance fixture · production dataset.
- Opaque string identifiers only. Never derive identity from mutable labels.
- Examples must be internally consistent and validate against the JSON Schemas.

By contributing you agree that your contributions are licensed under the repository's
[MIT License](./LICENSE).
