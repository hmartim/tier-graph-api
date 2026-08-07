# Conformance

This directory holds the **normative definition** of TIER-Graph conformance. It defines
*what* conforming behavior is; it does **not** contain executable fixtures.

> **`tier-graph-api` defines conformance. A separate implementation repository
> (`tier-graph-reference`) executes it.** See [`reference-implementation.md`](./reference-implementation.md).

## Contents

```text
conformance/
├── README.md                    this file
├── manifest.yaml                normative catalog of cases T01–T10 (+ CQs, invariants, fixture pointers)
├── manifest.schema.json         schema for manifest.yaml
├── case-definition.schema.json  schema for a single case definition (and for fixture manifests)
├── reference-implementation.md  how conformance is executed, and the fixture contract
└── cases/
    ├── T01.md … T10.md          normative prose for each case
```

## What is here vs. what is elsewhere

| Here (`tier-graph-api`) — normative definition | Elsewhere (`tier-graph-reference`) — executable |
| ---------------------------------------------- | ----------------------------------------------- |
| Catalog and semantic description of T01–T10 | `input.json`, `profile-fixture.json`, `request.json`, `expected.json` |
| Competency questions exercised (CQ1–CQ8) | The fixture runner / test harness |
| Required preconditions and invariants | Concrete grounding adapter (`TemporalGroundingProvider`) |
| The operation under test | The obtained results |
| The normative expected behavior | Any produced TIER-only database and reference service |
| The schema/contract fixtures must follow | — |
| References to fixture paths in `tier-graph-reference` | — |

This repository **MUST NOT** contain concrete `input.json`, `profile-fixture.json`,
`request.json`, or `expected.json` payloads.

## Conformance classes

See [`../spec/10-conformance.md`](../spec/10-conformance.md): Core Model, Temporal Grounding,
Query API, Path, and optional Authoring and Analytical Extension.

## Cases

| Case | Title | Operation | CQs |
| ---- | ----- | --------- | --- |
| [T01](./cases/T01.md) | Persistent relation across source states | `getRelationStateAtTime` | CQ3, CQ5 |
| [T02](./cases/T02.md) | Later introduction of a relation | `getRelationStateAtTime` | CQ3, CQ6 |
| [T03](./cases/T03.md) | One evidence unit supporting several relations | `getRelationsByEvidenceUnit` | CQ4 |
| [T04](./cases/T04.md) | Withdrawn historical precondition | `getRelationStateAtTime` | CQ3, CQ6 |
| [T05](./cases/T05.md) | Composite cross-item evidence | `evaluateEvidenceAdmissibility` | CQ2, CQ3 |
| [T06](./cases/T06.md) | `unknown` vs. `absent` qualifier | `compareRelationIdentity` | CQ1 |
| [T07](./cases/T07.md) | Positive vs. negative polarity | `compareRelationIdentity` | CQ1 |
| [T08](./cases/T08.md) | Re-extraction without duplicate evidence | `createEvidence` | CQ2 |
| [T09](./cases/T09.md) | Prospective applicability (deferred effect) | `evaluateSourceStateAdmissibility` | CQ3 |
| [T10](./cases/T10.md) | Anachronistic path exclusion | `findAdmissiblePaths` | CQ7, CQ8 |
