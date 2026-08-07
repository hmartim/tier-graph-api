# 04 — Evidence Semantics

Evidence is what makes a derived relation auditable. This document defines how evidence
bases are structured, identified, and interpreted. Schema:
[`../schemas/core/relation-evidence.schema.json`](../schemas/core/relation-evidence.schema.json).

## 4.1 What a RelationEvidence record is

A `RelationEvidence` record states that **one non-empty set** of evidence units *jointly*
supports or refutes **one** `DerivedRelation`. It has:

- `relationId` — exactly one relation;
- `anchors` — at least one `EvidenceAnchor`, each pointing to an external `EvidenceUnitRef`;
- `stance` — `supports` or `refutes`.

## 4.2 Conjunctive evidence (within a record)

Several anchors **within one** `RelationEvidence` record are **conjunctive**: all of them
are jointly required for that evidential basis.

```text
RelationEvidence E1:
  units = {U1, U2}
  semantics = U1 AND U2
```

If either `U1` or `U2` becomes inadmissible at a query time, the **whole basis** `E1` is
inadmissible at that time (see [06](./06-evidential-state-and-policies.md)).

## 4.3 Alternative evidence (separate records)

Alternative or independently sufficient bases **MUST** be represented as **separate**
`RelationEvidence` records:

```text
RelationEvidence E1: units = {U1}
RelationEvidence E2: units = {U2}
semantics = E1 OR E2
```

A relation is supported at a time if **any** supporting basis is admissible at that time.
Encoding alternatives as multiple anchors within one record (which would make them
conjunctive) is a modeling error.

## 4.4 Evidence identity

```text
EvidenceKey(e) = ⟨relationId, anchors, stance⟩
```

Each anchor is a `⟨evidenceUnit, selector?⟩` pair, so selectors participate in evidence
identity through the anchor set. Re-executing an extraction/curation pipeline over the
**same** relation, anchors, and stance **MUST NOT** create a new, independent evidence record — doing so
would inflate apparent corroboration. Instead it **SHOULD** append a new
`ProvenanceActivity` to the existing evidence occurrence
([09 — Provenance & review](./09-provenance-and-review.md)).

## 4.5 Stance vs. polarity

`stance` (`supports` / `refutes`) describes **only** the relationship between the cited
evidence basis and the normalized proposition. It is **not** the same as proposition
polarity, and **MUST NOT** be used as a substitute for any of:

- proposition **polarity** (a qualifier on the relation);
- disagreement between extraction systems;
- normative conflict;
- exceptions or special scope;
- review disagreement.

Two orthogonal axes result:

| | polarity `+` (affirmative proposition) | polarity `−` (negative proposition) |
| --- | --- | --- |
| stance `supports` | evidence that X **does** relate to Y | evidence that X does **not** relate to Y |
| stance `refutes` | evidence against "X relates to Y" | evidence against "X does not relate to Y" |

A refutation of an affirmative relation is **not** the same object as an affirmative
relation with negative polarity. Keep them distinct.

## 4.6 EvidenceAnchor and EvidenceSelector

- An **`EvidenceAnchor`** binds one basis to one external evidence unit. Its optional
  `role` (e.g. `definition`, `duty`, `observation`, `result`) is descriptive and **does
  not** change the conjunctive semantics of anchors within the record.
- An **`EvidenceSelector`** refines the *location* within an evidence unit (character
  offsets, JSON Pointer, XPath-like path, fragment id, page/paragraph, …). A selector
  **does not** create a new source state; the owning source state is still resolved from
  the evidence unit by the profile.

## 4.7 Evidence references, not copies

An `EvidenceUnitRef` is a **reference**. The TIER-Graph layer **MUST NOT** require the full
evidence content to be stored locally, and **MUST NOT** derive temporal admissibility from
a locally cached copy — admissibility comes from the profile
([05 — Temporal grounding contract](./05-temporal-grounding-contract.md)).
