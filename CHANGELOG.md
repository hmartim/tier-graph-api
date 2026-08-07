# Changelog

All notable changes to the TIER-Graph API specification are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project uses [Semantic Versioning](https://semver.org/) for the *specification* (see
[`spec/13-versioning-and-compatibility.md`](./spec/13-versioning-and-compatibility.md)):

- **patch** — clarifications and non-breaking corrections;
- **minor** — backward-compatible schemas or optional functions;
- **major** — breaking changes to core identity, evidence, temporal semantics, or
  operation signatures.

## [Unreleased]

## [0.1.0-draft] - 2026-08-07

First public draft of the specification.

### Added

#### Normative prose

- `spec/00`–`spec/13`: overview and precedence between artifacts, architecture, the core
  ontology, relation identity and merge rules, evidence semantics, the temporal grounding
  contract, evidential state and admission policies, API primitives, paths and temporal
  topology, provenance and review, conformance, extension points, security and privacy,
  and versioning.

#### Data models (JSON Schema 2020-12)

- Core ontology: `DerivedEntity`, `RelationQualifier`, `DerivedRelation`,
  `EvidenceUnitRef`, `EvidenceSelector`, `EvidenceAnchor`, `RelationEvidence`,
  `ProvenanceActivity`, `ReviewEvent`.
- Temporal grounding and query: `TemporalGroundingProfile`, `SourceStateRef`,
  `AdmissionPolicy`, `AdmissibilityResult`, `EvidentialStateSnapshot`,
  `RelationHistoryEntry`, `ProjectedRelation`, `PathStep`, `GroundedPath`,
  `ExclusionExplanation`.

#### Ontology

- `tier-graph.ttl`, SHACL shapes, and a JSON-LD context.

#### API contract

- A full OpenAPI 3.1.0 contract (47 operations) across Profiles, Entities, Relations,
  Evidence, Policies, Introspection, Temporal Projection, Paths, Audit, optional
  Authoring, and experimental Analytical Extensions — one path file per operation, plus
  request and response schemas, bundled via `swagger-cli`. The HTTP bindings are
  RECOMMENDED; an implementation MAY re-bind them while preserving operation semantics.

#### Temporal grounding profile

- `spec/05` defines a domain-independent, normative profile contract: external-type
  declaration, owner and admissibility semantics, observer time and corrections, authority
  and fallback declarations, versioning, and conformance, with an abstract example and an
  authoring guide under `profiles/generic/`.

#### Conformance

- `conformance/` holds the normative catalogue only: `manifest.yaml` (with
  `manifest.schema.json` and `case-definition.schema.json`), one `cases/T0N.md` per case,
  and `reference-implementation.md`. Each case names its operation, competency questions,
  invariants, expected behaviour, and a pointer to an executable fixture. This repository
  *defines* conformance; [`tier-graph-reference`](https://github.com/hmartim/tier-graph-reference)
  *executes* it.

### Normative decisions worth calling out

- **Precedence between artifacts** (`spec/00`). Conceptual semantics (prose and ontology)
  come first; the versioned machine-readable specification is normative for interchange
  and conformance; a reference implementation is non-normative and must conform to both. A
  divergence between the first two levels is a defect to fix here, not downstream.
- **`Π_review` splits into a core invariant and a policy choice** (`spec/06.1`,
  `admission-policy`). `rejected` and `superseded` never ground a relation under any
  policy — that is not a dial, and `minimumReviewStatus` accepts only `proposed` or
  `accepted`, so a policy naming a terminal outcome is inexpressible rather than merely
  empty. Whether *unreviewed* (`proposed`) extraction may ground an answer is a deployment
  decision that MUST be declared, because `supported` by a proposed record is not the same
  claim as `supported` by an accepted one. An exploratory policy MUST make the review
  status of grounding evidence retrievable.
- **Admission is not evidential support.** `GroundedPath.admissible` means every step was
  admitted by the policy, nothing more. A recall-oriented policy may admit `refuted` or
  `contested` relations, so an admissible path may contain unsupported steps. Every
  `PathStep` preserves its own `evidentialState` and an implementation MUST NOT drop it;
  `SupportedPath(p, t)` is a derived predicate over the steps, never a stored field, and
  `additionalProperties: false` forbids adding one.
- **Grounded paths are non-empty** (`steps.minItems = 1`). This operation returns
  *relational* paths, so a query whose source and target entities are identical does not
  yield a zero-length path, even though graph theory admits the trivial path. A zero-step
  answer carries no evidence and no admissibility to report.
- **Evaluation context** (`spec/06.0`). `queryTime` is legal reference time, evaluated
  against an explicit versioned snapshot of the derived layer and profile. `review(e)` is
  read from that snapshot, not reconstructed as of `queryTime`; observer-time
  reconstruction of prior review or knowledge states is outside this contract.
- **When `absent` may be asserted** (`spec/03.3`). `unknown` is the default for any
  unresolved dimension; `absent` requires a positive, auditable determination that no
  value qualifies the proposition. A failed extraction is `unknown`, never `absent`.
- **Substrate independence.** The normative core does not reference any concrete
  substrate. SAT-Graph is one possible grounding adapter, specified downstream.

[Unreleased]: https://github.com/hmartim/tier-graph-api/compare/v0.1.0-draft...HEAD
[0.1.0-draft]: https://github.com/hmartim/tier-graph-api/releases/tag/v0.1.0-draft
