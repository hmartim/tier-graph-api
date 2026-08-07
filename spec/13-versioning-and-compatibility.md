# 13 — Versioning & Compatibility

## 13.1 Semantic versioning of the specification

The specification uses semantic versioning:

```text
0.1.0-draft → 0.2.0-draft → … → 1.0.0
```

Compatibility rules:

- **patch** — clarifications and non-breaking corrections;
- **minor** — backward-compatible schemas or optional functions;
- **major** — breaking changes to core identity, evidence, temporal semantics, or operation
  signatures.

## 13.2 Every artifact is versioned

Each of the following **MUST** expose an explicit version:

- the OpenAPI document (`info.version`);
- every `TemporalGroundingProfile` (`version`);
- every `AdmissionPolicy` (`version`);
- the conformance manifest.

This lets a projection be audited against the exact profile and policy versions that
produced it (`getProjectionMetadata`).

## 13.3 What counts as breaking

Breaking (major) changes include, non-exhaustively:

- changing the relation identity key or merge rules;
- changing evidence-set semantics or `EvidenceKey`;
- changing the temporal grounding contract (`owner` / `admissible`) or admissibility
  semantics;
- changing evidential-state definitions;
- removing or changing the signature/guaranteed semantics of a required operation.

Adding an optional operation, an optional field, or a new profile is **not** breaking.

## 13.4 Deprecation

Operations and fields are deprecated for at least one minor version before removal, marked
`deprecated: true` in the OpenAPI document with a migration note. Removal is a major-version
change.

## 13.5 Governance

Version decisions follow [`../GOVERNANCE.md`](../GOVERNANCE.md). Each release fixes all
artifact versions and is archived with citation information in
[`../CITATION.cff`](../CITATION.cff).
