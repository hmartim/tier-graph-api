# 09 — Provenance & Review

Provenance and review keep derived propositions **auditable** and keep curation history
from ever masquerading as truth. Schemas:
[`../schemas/core/provenance-activity.schema.json`](../schemas/core/provenance-activity.schema.json),
[`../schemas/core/review-event.schema.json`](../schemas/core/review-event.schema.json).

## 9.1 ProvenanceActivity

A `ProvenanceActivity` records how an entity, relation candidate, or evidence record was
generated, reprocessed, reviewed, or verified. Required: `id`, `activityType`
(`extraction | curation | review | verification | import`), `startedAt`.

**Rule — confidence belongs to activities.** A `confidence` value attaches to an *activity
or assessment*, never to immutable source evidence. The same evidence occurrence may be
produced by a low-confidence extraction and later corroborated by a high-confidence
verification; both are activities over **one** evidence occurrence.

**Rule — no evidence inflation.** Multiple activities over the same evidence occurrence
**MUST NOT** inflate the number of independent evidence records. Re-running a pipeline
appends a `ProvenanceActivity`; it does not mint a new `RelationEvidence`
([04 — Evidence semantics](./04-evidence-semantics.md#44-evidence-identity)).

## 9.2 ReviewEvent

A `ReviewEvent` records an auditable transition in review status. Required: `id`,
`subjectType` (`derivedEntity | derivedRelation | relationEvidence`), `subjectId`,
`fromStatus`, `toStatus`, `occurredAt`.

The review lifecycle is:

```text
proposed ──accept──▶ accepted
   │                    │
   └──reject──▶ rejected │
                         └──supersede──▶ superseded (supersededById → replacement)
```

**Review status is orthogonal to evidential state.** `accepted` is a curation judgment;
`supported` is a computed evidential state at a time under a profile. An `accepted` relation
may be `unsupported` at some times, and vice versa.

## 9.3 Audit trails

The API composes these into audit views:

- `getEvidenceAuditTrail` — the evidence record, its anchors, source-state resolutions,
  review events, and provenance activities.
- `getRelationAuditTrail` — relation identity, qualifiers, review status, evidence records,
  anchors, source-state resolutions, admissibility results, provenance activities, review
  events.
- `explainRelationState` — a machine-readable explanation of *why* a relation is
  supported/refuted/contested/unsupported and admitted/excluded at a time.

These are structured-data operations. Natural-language rendering is a client concern.

## 9.4 Execution provenance

Every object that reports a **computed** result — a state, a projection, a path, an
explanation, a derived analytical artifact — **MUST** identify the exact versions of the
authorities its semantics depend on, not merely their identifiers:

```text
⟨profileId, profileVersion, policyId, policyVersion⟩
```

An identifier alone is rebindable, so a result attributed to one cannot be replayed. This is
distinct from request convenience: a caller **MAY** name only `profileId` and omit
`policyId`, letting the deployment resolve its default, but the result **MUST** report the
resolution that was actually used.

**Attribution is not yet replay.** Recording the versions makes a result *attributable*; it
becomes *replayable* only if the caller can ask for those versions again. Operations that
compute a result therefore accept optional `profileVersion` and `policyVersion`, and
`getGroundingProfile` and `getAdmissionPolicy` accept a version to retrieve a past document.
When a version is supplied, an implementation **MUST** execute that version or fail
(`profile-unavailable`); it **MUST NOT** silently substitute another. When it is omitted, the
deployment resolves its current binding and reports it. An implementation that cannot serve
past versions is still conformant for attribution, but **MUST NOT** claim replayability. Among computed results, `AdmissibilityResult` depends on a
single versioned authority — the `TemporalGroundingProfile` — and names **no** admission
policy at all: `admissible_ρ(s, t)` never depends on π, so recording a policy there would
suggest an influence the contract denies. The policy context belongs to the object that
consumed the result.

**Identifier versus version.** Declarative references (`EvidenceUnitRef`, `SourceStateRef`)
are not results and carry no versions. They rely on a premise this specification makes
explicit: `profileId` denotes a **stable identifier namespace**. Consequently
`⟨profileId, evidenceUnitId⟩` identifies the same evidence unit, and
`⟨profileId, sourceStateId⟩` the same source state, across versions of that profile.
`profileVersion` versions **behavior**: how `owner_ρ` resolves and what `admissible_ρ`
decides. A change that renames either identifier namespace constitutes a **different
profile**, not a new version of the same profile. Where a vocabulary-dependent filter was
applied, ⟨`profileId`, `profileVersion`⟩ resolves to that profile version's `vocabularyRef`
([08](./08-paths-and-temporal-topology.md)).

## 9.5 Separation summary

| Concept | Object | Answers |
| ------- | ------ | ------- |
| How was it produced? | `ProvenanceActivity` | provenance, confidence of an assessment |
| Was it accepted by review? | `ReviewEvent` | curation lifecycle |
| Is it supported now? | `EvidentialStateSnapshot` | computed evidential state |
| What does it cite? | `RelationEvidence` + `EvidenceAnchor` | evidence bases |

Keeping these four separate is a Core Model Conformance requirement.
