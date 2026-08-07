# Governance

## Purpose

This document describes how decisions are made about the TIER-Graph API specification. The
goal is a stable, implementation-neutral contract that multiple parties can implement over
their own storage engines, source systems, and temporal grounding profiles.

## Roles

- **Maintainer** — currently Hudson de Martim. Responsible for the roadmap, final
  decisions on normative changes, releases, and enforcement of the architectural
  invariants.
- **Contributors** — anyone who opens issues or pull requests (see
  [`CONTRIBUTING.md`](./CONTRIBUTING.md)).
- **Implementers** — parties building systems that claim one or more conformance classes.
  Their feedback carries particular weight for compatibility decisions.

## What counts as a normative change

A change is **normative** if it affects any of:

- the three-object ontological core or their identity rules;
- evidence semantics (conjunctive/alternative, stance, `EvidenceKey`);
- the temporal grounding contract or admissibility semantics;
- evidential state definitions or admission policies;
- conformance class requirements;
- the signature or guaranteed semantics of a required API operation.

Normative changes require an issue, a design rationale, and explicit versioning treatment
(see [`spec/13-versioning-and-compatibility.md`](./spec/13-versioning-and-compatibility.md)).
Non-normative changes (clarifications, typos, examples, tooling) follow the lightweight
pull-request flow.

## Decision process

1. Proposals are raised as issues and discussed openly.
2. The maintainer seeks consensus, giving weight to implementer feedback and to the
   architectural invariants.
3. Where the design is unsettled, the relevant section is marked
   `Status: Draft — open design question` and the unresolved issue is listed explicitly,
   rather than forcing a premature decision.
4. The maintainer records the outcome in the pull request and the changelog.

## Releases

Releases follow semantic versioning of the specification. Each release fixes the version of
every OpenAPI document, grounding profile, admission policy, and conformance manifest, and
is archived with citation information in [`CITATION.cff`](./CITATION.cff).

## Amending this document

Changes to governance are themselves normative and follow the process above.
