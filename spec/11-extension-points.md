# 11 — Extension Points

TIER-Graph is extensible without weakening the core. Extensions are **clearly marked
optional/experimental** and MUST NOT alter core semantics.

## 11.1 Declared vocabularies

The effective profile of an implementation is a **pair**: a `ProfileVocabulary` and a
`TemporalGroundingProfile`. They are orthogonal — the vocabulary fixes *meaning and
identity*, the grounding profile fixes *temporal authority* — and are versioned
independently. The same vocabulary MAY be grounded on a different substrate, and the same
grounding profile MAY serve a different vocabulary. Automatic identity comparison
([03](./03-relation-identity.md)) is scoped to a vocabulary version; evidential state
([06](./06-evidential-state-and-policies.md)) is scoped to a grounding-profile version.

Declared in the **vocabulary**
([`../profiles/generic/vocabulary-template.yaml`](../profiles/generic/vocabulary-template.yaml)):

- **Entity types** (`DerivedEntity.entityType`) — open; declare each with its semantics.
- **Predicates** — open; declare each with its semantics and, optionally, its family.
- **Predicate families** (`DerivedRelation.predicateFamily`) — open. The core fixes no
  taxonomy and privileges no token (see [02 — Core ontology](./02-core-ontology.md)).
- **Qualifier dimensions** — beyond the minimum set, declaring which are identity-relevant.

An implementation **MUST NOT** emit a value its vocabulary has not declared, and **MUST**
expose the declared vocabulary through the introspection operations (`getEntityTypes`,
`getPredicates`, `getPredicateFamilies`, `getQualifierDimensions`), so an agent can build
filters without hard-coding domain tokens.

Declared in the **grounding profile**
([`../profiles/generic/profile-template.yaml`](../profiles/generic/profile-template.yaml)):

- **Selectors** — profiles MAY define custom `EvidenceSelector` types.

## 11.2 Analytical-extension objects (optional)

Two optional artifacts are specified but are **not** part of the three-object core:

- **`CommunityRevision`** — a revision-indexed analytical artifact (e.g. a graph community)
  derived from a *compatible* projection. It MUST NOT be reused for a temporal projection
  unless compatibility is proven (`derivedFromProjectionHash`).
- **`CausalGate`** — connects compatible community revisions through supporting relations.
  It MUST be excluded if its supporting relations or community revisions are incompatible
  with the requested projection.

Operations `getCompatibleCommunityRevision`, `getActiveCausalGates`, and
`explainArtifactExclusion` live under an experimental OpenAPI tag.

## 11.3 Extension rules

1. An extension **MUST NOT** relax a core invariant (identity, evidence, temporal
   grounding, stance/polarity separation).
2. An extension **MUST** be temporally compatible: an analytical artifact is valid only for
   projections it is proven compatible with.
3. Experimental operations **MUST** be clearly tagged and MAY change between minor
   versions.

> **Scope boundary for `v0.1.0-draft`.** This version specifies *that* an analytical
> artifact must declare the projection it was derived from, and that consuming it outside
> that projection is non-conformant. It does not specify what `derivedFromProjectionHash`
> ranges over; until it does, the hash is opaque to this specification and an
> implementation MUST NOT rely on cross-implementation comparability of its value.
