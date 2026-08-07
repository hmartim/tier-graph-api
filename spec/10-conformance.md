# 10 — Conformance

An implementation MAY claim one or more conformance classes. Classes are cumulative in
practice but declared independently. The normative conformance **case definitions**
(T01–T10) live in [`../conformance/`](../conformance/); executable fixtures and a runner
that satisfies them are provided by the reference implementation.

## 10.1 Core Model Conformance

Requires:

- the three core object types (`DerivedEntity`, `DerivedRelation`, `RelationEvidence`);
- opaque identifiers (no identity from labels);
- qualifier status semantics (`specified` / `absent` / `unknown`, with `unknown ≠ absent`);
- evidence-set semantics (conjunctive within a record; alternative across records);
- stance semantics (stance ≠ polarity);
- lifecycle and provenance separation (review status ≠ evidential state; confidence on
  activities).

## 10.2 Temporal Grounding Conformance

Requires:

- a declared `TemporalGroundingProfile`;
- deterministic or authoritative `owner` resolution;
- admissibility evaluation (with per-anchor detail for conjunctive bases);
- **no** copied authoritative relation intervals;
- computed evidential state.

## 10.3 Query API Conformance

Requires: entity lookup; relation lookup; relation evidence; reverse evidence lookup;
relation state at time; relation history; projected relations.

## 10.4 Path Conformance

Requires: paths generated over a time-indexed projection; step-level evidence grounding;
exclusion explanations; **no post-hoc-only temporal filtering**
([08 — Paths & temporal topology](./08-paths-and-temporal-topology.md)).

## 10.5 Authoring Conformance *(optional)*

Requires: creation of core objects; duplicate-evidence detection (by `EvidenceKey`);
conservative identity handling (no merge on `unknown`); auditable review transitions.

## 10.6 Analytical Extension Conformance *(optional)*

Requires temporal compatibility for communities, summaries, and gates
([11 — Extension points](./11-extension-points.md)).

## 10.7 Conformance fixtures (T01–T10)

| Case | Exercises |
| ---- | --------- |
| T01 | persistent relation across source states |
| T02 | later introduction of a relation |
| T03 | one evidence unit supporting several relations |
| T04 | withdrawn historical precondition |
| T05 | composite cross-item evidence |
| T06 | `unknown` vs. `absent` qualifier |
| T07 | positive vs. negative polarity |
| T08 | re-extraction without duplicate evidence |
| T09 | prospective applicability (deferred effect) |
| T10 | anachronistic path exclusion |

## 10.8 Definition vs. execution (two repositories)

**`tier-graph-api` defines conformance; a separate implementation repository
(`tier-graph-reference`) executes it.**

This repository contains only the **normative** definition of each case — its objective, the
ontological property tested, the operation under test, the required invariants, the expected
behavior, the CQ mapping, and a pointer to the executable fixture. See
[`../conformance/`](../conformance/): each case has a definition in `cases/T0N.md`, catalogued
in [`manifest.yaml`](../conformance/manifest.yaml) (schema:
[`manifest.schema.json`](../conformance/manifest.schema.json) /
[`case-definition.schema.json`](../conformance/case-definition.schema.json)).

The **executable** payloads (`input.json`, `profile-fixture.json`, `request.json`,
`expected.json`), the fixture runner, and any concrete grounding adapter live in
`tier-graph-reference` (see
[`../conformance/reference-implementation.md`](../conformance/reference-implementation.md)).
Fixtures there are **minimal and test-specific** — never a production substrate
([12 — Security & privacy](./12-security-and-privacy.md)).

> This repository **MUST NOT** contain concrete conformance payloads.
> The reference implementation lives in
> [`tier-graph-reference`](https://github.com/hmartim/tier-graph-reference).
