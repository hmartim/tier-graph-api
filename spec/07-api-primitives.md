# 07 — API Primitives

> The operation-by-operation contract for all operations below is defined in
> [`../openapi/`](../openapi/) (OpenAPI 3.1.0, one path file per operation). This document
> fixes the *shape* of the API and the required operation set; HTTP signatures and schemas
> live in the OpenAPI document. The HTTP bindings there are RECOMMENDED and MAY be re-bound
> by an implementation while preserving operation semantics.

The public API distinguishes five families:

- **Required query primitives**;
- **Required grounding primitives**;
- **Optional discovery primitives**;
- **Optional authoring primitives**;
- **Optional analytical-extension primitives**.

A read-only implementation MAY claim **Query Conformance** without authoring.

**Naming conventions** (aligned with SAT-Graph): `get<Thing>` for a single fetch,
`get<Things>` for simple enumeration, `query<Things>` for a rich filter, `getBatch<Things>`
for a batch by ids, `resolve<Thing>Candidates` for a probabilistic entry point. There is no
`list` prefix.

## Required operations

Grounding and profiles:
`getGroundingProfiles`, `getGroundingProfile`, `resolveSourceState`,
`evaluateSourceStateAdmissibility`, `evaluateEvidenceAdmissibility`
(`evaluateBatchEvidenceAdmissibility` is a convenience with identical semantics).

Policy discovery:
`getAdmissionPolicies`, `getAdmissionPolicy` — `policyId` parametrizes projection/state/path
operations, so a conforming agent must be able to discover policies rather than hard-code them.

Reasoning-vocabulary introspection:
`getPredicates`, `getPredicateFamilies`, `getQualifierDimensions`, `getEntityTypes` — the
declared vocabulary an agent needs to *form* queries. Each response is an envelope
`⟨vocabularyRef, items⟩` and **MUST** name the exact `ProfileVocabulary` version the values
were read from: `profileId` alone does not identify one, since a deployment may rebind it,
and a logged answer that cannot be attributed to a vocabulary version cannot be replayed.

Entities:
`getEntity`, `getBatchEntities`, `queryEntities`, `getRelationsByEntity` (CQ1 — canonical
single-hop, projection-aware). Optional: `resolveEntityCandidates`.

Relations:
`getRelation`, `getBatchRelations`, `queryRelations`, `getRelationEvidence` (CQ2),
`getRelationStateAtTime` (CQ3), `getRelationHistory` (CQ5/CQ6),
`getRelationsChangingAtBoundary`, `getProjectedRelations`. Recommended optional:
`compareRelationIdentity`.

Evidence:
`getEvidence`, `getBatchEvidence`, `queryEvidence`, `getRelationsByEvidenceUnit` (CQ4),
`getEvidenceActivities`, `getEvidenceAuditTrail`.

Paths (see [08](./08-paths-and-temporal-topology.md)):
`findAdmissiblePaths` (CQ7), `validatePathAtTime`, `explainPathExclusion` (CQ8).

Audit:
`getRelationAuditTrail`, `explainRelationState`.

**Minimalism.** `getRelationsByEntity` is the one way to get a single entity's edges;
`queryRelations` is for predicate/family/status filters and the between-a-pair case
(`betweenEntityIds`). `getRelationEvidence` is the one way to get a relation's evidence;
`queryEvidence` is for stance/unit/activity filters.

## Optional operations

- **Authoring** (isolated Authoring Conformance Class): `createEntity`, `createRelation`,
  `createEvidence`, `appendProvenanceActivity`, `recordReviewEvent`,
  `mergeRelationCandidates`.
- **Analytical extensions** (experimental tag): `getCompatibleCommunityRevision`,
  `getActiveCausalGates`, `explainArtifactExclusion`.

## Cross-cutting rules

- **Determinism at the edges.** Probabilistic operations (`resolveEntityCandidates`) are
  isolated at entry points and MUST NOT silently select a canonical entity below the
  declared confidence threshold.
- **Reference, not copy.** Grounding results come from the profile; the core does not
  fabricate source states or intervals.
- **Structured explanations.** Audit/exclusion operations return structured data;
  natural-language rendering is a client concern.
- **Pagination.** List operations return a cursor-based `Page`
  ([`../schemas/common/page.schema.json`](../schemas/common/page.schema.json)).
