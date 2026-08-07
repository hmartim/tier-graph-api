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

## 9.4 Separation summary

| Concept | Object | Answers |
| ------- | ------ | ------- |
| How was it produced? | `ProvenanceActivity` | provenance, confidence of an assessment |
| Was it accepted by review? | `ReviewEvent` | curation lifecycle |
| Is it supported now? | `EvidentialStateSnapshot` | computed evidential state |
| What does it cite? | `RelationEvidence` + `EvidenceAnchor` | evidence bases |

Keeping these four separate is a Core Model Conformance requirement.
