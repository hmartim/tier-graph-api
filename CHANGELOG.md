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

### Fixed (identity operations)

- **`compareRelationIdentity` and `mergeRelationCandidates` now take a `vocabularyRef`, and
  `IdentityComparison` reports one** (breaking, pre-1.0). Removing `identityRelevant` from
  `RelationQualifier` left these operations undecidable: two candidates alone no longer say
  which dimensions must agree, and neither the request nor the endpoint named a vocabulary.
  Identity comparison is `Compare(A, B, V)`, so the vocabulary reference is required on both
  the request and the result — the same pair may compare differently once a dimension's
  identity relevance changes.

### Added (replayability)

- **Optional `profileVersion` / `policyVersion` on operations that compute a result**, and a
  version parameter on `getGroundingProfile` and `getAdmissionPolicy`. Recording versions on
  results made them *attributable*; without a way to request those versions again they were
  not *replayable*, which is what `spec/09.4` claims. Supplied, an implementation MUST
  execute that version or fail rather than substitute; omitted, it resolves its current
  binding and reports it.
- **`scripts/validate_profiles.mjs`** (`npm run validate:profiles`) — validates the
  vocabulary and grounding-profile documents, which no CI step had covered, and enforces the
  two constraints JSON Schema cannot express: token uniqueness within each vocabulary list,
  and that every `predicates[].family` is declared in `predicateFamilies`.

### Changed

- **`predicateFamily` is no longer a closed core enumeration** (breaking, pre-1.0). The
  eight families the draft fixed in `DerivedRelation` (`classificatory`, `definitional`,
  `normativeDependency`, `institutional`, `procedural`, `factualCausal`, `attributional`,
  `normativeConsequential`) encoded one domain's carving of relation types into a contract
  that claims domain independence — a reviewer could fairly ask why a domain-independent
  core mandates deontic categories. The core now fixes **no** taxonomy: `predicateFamily`
  is an open string whose admitted values are declared, with their semantics, by the
  governing vocabulary. No family token is recognized or privileged by the core any more —
  those appearing in the spec, schemas, and templates are examples in documentation, and a
  legal instantiation declares its own downstream. `findAdmissiblePaths.predicateFamilies`
  loses its enum likewise.
- **`getPredicateFamilies`** takes an optional `profileId` and returns declared families as
  objects (`family`, `semantics`, `label`) rather than a fixed enum of strings.
- **The four vocabulary-introspection responses** (`getPredicates`, `getPredicateFamilies`,
  `getEntityTypes`, `getQualifierDimensions`) are now envelopes `⟨vocabularyRef, items⟩`
  instead of bare arrays, and their items mirror the `ProfileVocabulary` entries they expose
  — token plus a required `semantics` and optional `label`, replacing the looser
  `description` — so that "the introspection operations expose the declared vocabulary"
  (§11.1) is true of the shapes and not only of the intent. `profileId` does not identify a vocabulary version — a deployment
  may rebind it — so a bare array left a logged answer unattributable, which matters most for
  `getQualifierDimensions`, whose answer *is* the identity key. Admissibility, state, and
  path operations report their configuration in their own results (see below).
- **`GroundedPath` now requires `profileVersion` and `policyVersion`**, and
  `ProjectionMetadata` promotes both from optional to required (breaking, pre-1.0). Ids alone
  are rebindable, so a result attributed only to `profileId`/`policyId` cannot be replayed —
  the same ambiguity just removed from introspection. It also closes the vocabulary question
  for `findAdmissiblePaths`: a `predicateFamilies` filter makes the result depend on the
  vocabulary too, and ⟨profileId, profileVersion⟩ resolves to that profile version's
  `vocabularyRef`. No `vocabularyRef` is duplicated onto paths or projections; the chain
  suffices.
- **Every computed result now identifies the exact authorities it was computed under**
  (breaking, pre-1.0). A sweep of the non-request schemas that name a `profileId` or
  `policyId` applied one rule: an output, decision, explanation, or derived artifact must
  version-pin each authority its semantics depend on. `EvidentialStateSnapshot`,
  `RelationStateExplanation`, `RelationHistoryEntry`, `ExclusionExplanation`, and
  `CommunityRevision` now require `profileId`, `profileVersion`, `policyId`, and
  `policyVersion` — `RelationHistoryEntry` had no `policyId` at all, though two policies can
  produce different histories for the same relation and profile, and the snapshot and
  explanation carried the policy as optional context. The policy MUST be reported even when
  the caller omitted it and the deployment resolved its default: a request may be
  convenient, a provenance record may not. `AdmissibilityResult` version-pins only the
  profile and **drops its optional `policyId`** (breaking, pre-1.0): it was described as the
  policy "in force, when relevant to the decision", but `admissible_ρ(s, t)` never depends on
  π, and a field implying otherwise contradicts the contract. Policy context now lives only
  in the objects that consume the result. `EvidenceUnitRef` and `SourceStateRef` are
  unchanged: they are declarative references, not computed results, and `spec/09.4` now
  states the premise that makes that safe — `profileId` is a stable namespace, while
  `profileVersion` versions grounding behavior.

### Added

- **`ProfileVocabulary`** (`schemas/vocabulary/profile-vocabulary.schema.json`) — the
  declaration slot the open field requires, and the missing counterpart to §11.1, which
  promised that entity types, predicates, families, and qualifier dimensions were declared
  somewhere while no schema carried them. It is deliberately **separate** from
  `TemporalGroundingProfile`: the vocabulary fixes meaning and identity, the grounding
  profile fixes temporal authority, and folding the first into the second would have made a
  profile whose formal role is `⟨U, S, owner, admissible⟩` also the arbiter of what a
  predicate means. The effective profile of an implementation is the pair
  `⟨vocabulary, groundingProfile⟩`, versioned independently: identity comparison is scoped
  to a vocabulary version, evidential state to a grounding-profile version.
  `TemporalGroundingProfile.vocabularyRef` records which pair a deployment binds, `{id,
  version}` both required: an id alone would leave `Key_V(r)` irreproducible the moment the
  vocabulary moves. Illustrated in `profiles/generic/vocabulary-template.yaml`, mirrored as
  `tier:ProfileVocabulary` / `tier:usesVocabulary` in the ontology and JSON-LD context.
- **`ProfileVocabulary.qualifierDimensions[].identityRelevant`** is now the sole authority on
  identity relevance (see below).
- **`VocabularyRef`** (`schemas/common/vocabulary-ref.schema.json`) — `{id, version}`, both
  required, shared by the profile binding and the introspection envelopes.

### Removed

- **`RelationQualifier.identityRelevant`** (breaking, pre-1.0). Identity relevance is a
  property of the *dimension*, not of an occurrence: `identityRelevant(q) =
  identityRelevant_V(dimension(q))`. Keeping the flag on the instance as well would have
  admitted a qualifier that contradicts its own vocabulary, with no principled winner and no
  way to check it without cross-document semantic validation. `spec/03.1` states the rule.

### Fixed

- `TemporalGroundingProfile` described its contract as `B_π = ⟨U_π, S_π, owner_π,
  admissible_π⟩`, colliding with π (the admission policy). It is `B_ρ`, as `spec/05` always
  had it.

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
