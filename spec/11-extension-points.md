# 11 — Extension Points

TIER-Graph is extensible without weakening the core. Extensions are **clearly marked
optional/experimental** and MUST NOT alter core semantics.

## 11.1 Profile-defined vocabularies

- **Entity types** (`DerivedEntity.entityType`) — open, profile-defined.
- **Predicates** — the specific predicate vocabulary is profile-defined; the coarse
  `predicateFamily` classification is fixed by the core.
- **Qualifier dimensions** — profiles MAY add identity-relevant or descriptive dimensions
  beyond the minimum set, declaring which are identity-relevant.
- **Selectors** — profiles MAY define custom `EvidenceSelector` types.

Profiles declare these in their profile document
([`../profiles/generic/profile-template.yaml`](../profiles/generic/profile-template.yaml)).

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
