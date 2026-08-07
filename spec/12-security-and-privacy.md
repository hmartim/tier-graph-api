# 12 — Security & Privacy

This document covers two concerns: the **data-separation strategy** that keeps this
specification repository free of private data, and the **security guidance** an implementer
must satisfy.

## 12.1 The private substrate does not need to be published

The TIER-Graph API specification can be **fully public** while a source substrate (any
private versioned database) remains private. This specification repository contains only
interface definitions, schemas, generic profile guidance, synthetic examples, and the
**normative** conformance definitions. It **MUST NOT** contain a production substrate.
Executable conformance fixtures and any concrete profile adapter live in a separate
implementation repository (see [10 — Conformance](./10-conformance.md)).

## 12.2 A derived TIER database may be published separately

A separate TIER-Graph database may contain only the derived layer:

```text
DerivedEntity · DerivedRelation · RelationEvidence · EvidenceAnchor ·
ProvenanceActivity · ReviewEvent
```

Its evidence anchors store **external references** (`profileId`, opaque `evidenceUnitId`,
optional selector) — **not** the substrate's internal objects, intervals, or hierarchy.

**Limitation.** A TIER database alone lets you inspect identity, qualifiers, evidence
grouping, stance, provenance, and review — but it is **not** sufficient to reproduce
`owner(evidenceUnit)`, temporal admissibility, relation state at a time, historical paths,
or temporal-topology exclusion. Those require a **grounding profile**.

## 12.3 Reproducibility via minimal grounding fixtures

For reproducibility, publish a **minimal, test-specific grounding fixture** — not the
private substrate. Such a fixture contains only the small amount of source-state
information the selected tests need, e.g.:

```json
{
  "profileId": "example-public-conformance-fixture",
  "evidenceUnits": [{ "id": "EU-001", "ownerSourceStateId": "SS-001" }],
  "sourceStates": [{ "id": "SS-001", "admissibleFrom": "1988-10-05", "admissibleTo": "2000-02-14" }]
}
```

This fixture is **not** presented as the production database; it is a small, manually
reviewed testing profile derived from public sources. Alternatives: a mock grounding
service; a small read-only endpoint exposing only test objects; static expected-result
fixtures; a synthetic profile for non-legal cases.

## 12.4 Repository safeguards

`.gitignore` excludes private database and secret patterns
(`*.db`, `*.sqlite`, `*.parquet`, `.env`, `secrets/`, `credentials/`, `data/private/`, …).
A CI guard ([`../scripts/reject_private_artifacts.mjs`](../scripts/reject_private_artifacts.mjs),
workflow [`reject-private-artifacts.yml`](../.github/workflows/reject-private-artifacts.yml))
fails the build if any tracked file matches a private-artifact pattern or looks like a
leaked secret. See [`../SECURITY.md`](../SECURITY.md) for reporting.

## 12.5 Implementer security guidance

This section states baseline expectations only. Authentication, authorization,
data-scoping, and rate-limiting mechanisms are deliberately left to the implementation and
are outside the scope of this specification.

Baseline expectations for a hosted implementation:

- protect all endpoints; scope data to the caller's authorized profiles/sources;
- never leak inadmissible evidence into a projection through an under-specified admission
  policy;
- treat derived relations as non-authoritative in any downstream decision;
- surface structured audit trails so that automated decisions remain explainable.
