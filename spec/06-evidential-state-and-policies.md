# 06 — Evidential State & Admission Policies

This document defines the **computed** state of a relation at a time and the policies that
govern which states enter a graph projection. Schemas:
[`../schemas/query/`](../schemas/query/) and
[`../schemas/grounding/admission-policy.schema.json`](../schemas/grounding/admission-policy.schema.json).

## 6.0 Evaluation context

Every definition in this document is evaluated against an **explicit, versioned snapshot**
of the derived layer and of the grounding profile. `queryTime` denotes **legal reference
time**: it answers *"what was the applicable state at `t`?"*.

It does **not** answer *"what did the system know, or how had this evidence been reviewed,
at some earlier observer time?"*. `review(e)` below is read from the snapshot in force for
the evaluation, not reconstructed as of `queryTime`: a record accepted today counts as
accepted even when the query asks about an earlier legal reference time. Reconstruction of
prior review or knowledge states at an observer time is **outside the present contract**.

`observerTime` is accepted where a profile can meaningfully vary its answer by transaction
time, but a profile that ignores it remains conforming. The snapshot identity, profile
version, and policy are fixed by the evaluation context and omitted from the notation below
for readability.

## 6.1 Evidential state

An evidence basis `e` is **admissible** at query time `t` iff **both**:

1. its review status is in `Π_review`, the set the admission policy declares; **and**
2. every anchor's owning source state is admissible at `t` under the profile
   ([05 — Temporal grounding contract](./05-temporal-grounding-contract.md#56-admissibility-of-an-evidence-basis)).

Formally, `Admissible(e, t) ⇔ review(e) ∈ Π_review ∧ ∀ u ∈ units(e) :
admissible(owner(u), t)`, where `Π_review` is declared by the admission policy
([§6.4](#64-admission-policies)).

**Core invariant, not a policy dial:** `Π_review ⊆ {proposed, accepted}`. Records that are
`rejected` or `superseded` remain stored and auditable but **MUST NOT** ground a relation
under **any** policy. These are not higher levels of review but terminal outcomes, so
`minimumReviewStatus` admits only `proposed` or `accepted` as values: a policy naming a
terminal status is not merely empty, it is not expressible.

**Policy choice:** whether *unreviewed* extraction may ground an answer is a deliberate
deployment decision and MUST be declared, not inherited from a default. A
**reviewed-evidence** policy sets `Π_review = {accepted}`; an **exploratory** policy sets
`Π_review = {proposed, accepted}` and **MUST** make the review status of the grounding
evidence retrievable — it need not duplicate that status in each path step, but the
evidence identifiers a state cites MUST be dereferenceable to records that expose it.
`supported` by a proposed record is not the same claim as `supported` by an accepted one,
and a consumer that cannot tell them apart has not been given the state at all.

A policy that omits `minimumReviewStatus` takes the permissive reading. The legal reference
profile declares `accepted`, so its results never depend on unreviewed extraction.

At a given `profileId` and `queryTime` (and optional `observerTime`), a relation has an
**evidential state** computed from its admissible evidence bases:

| State | Condition |
| ----- | --------- |
| `supported` | at least one admissible **supporting** basis; **no** admissible refuting basis |
| `refuted` | at least one admissible **refuting** basis; **no** admissible supporting basis |
| `contested` | at least one admissible **supporting** basis **and** at least one admissible **refuting** basis |
| `unsupported` | **no** admissible basis in either direction |

**These are evidence states, not domain truth.** They describe *registered* evidence under
*one* profile and time. `supported` means "the registered evidence, admissible now, points
this way" — not "this is true in the world".

The computation is captured by an `EvidentialStateSnapshot`, which lists the admissible
`supportingEvidenceIds` and `refutingEvidenceIds` and MAY record `excludedEvidence` with
reasons.

## 6.2 Determinism

Given the same relation, profile, query time, and observer time, the evidential state
**MUST** be deterministic: it is a pure function of the profile's admissibility decisions
over the relation's evidence bases. Confidence scores from provenance activities **MUST
NOT** change the state (they may inform ranking or review, not state).

## 6.3 History and boundaries

A relation's state changes only at **boundaries** where the admissibility of some evidence
basis changes. `getRelationHistory` returns ordered `RelationHistoryEntry` objects, each a
period `[from, to)` with a constant state. The history is **computed** from evidence and
source-state admissibility; the API **MUST NOT** require a copied relation-level interval.

When the profile's substrate exposes authoritative transitions (e.g. a formal amendment or
revision event), a boundary often corresponds to one; the entry's `boundaryCauseRefs` MAY
reference such a transition identifier. This is profile-specific enrichment, not a core
requirement.

`listRelationsChangingAtBoundary` answers the prospective/retrospective question "which
relations change state at (or around) this boundary?" — useful for amendment, correction,
withdrawal, and impact analysis.

## 6.4 Admission policies

Evidential state is computed first; an **`AdmissionPolicy`** then decides which states are
**admitted** into a query-time projection. The policy does **not** change the state — only
whether a relation in that state is admitted for return/traversal. A `ProjectedRelation`
carries both the `evidentialState` and the resulting `admitted` flag.

Recommended standard policies:

1. **`strict-supported`** — admit only `supported` relations.
2. **`recall-with-contested`** — admit `supported` and `contested`, **preserving** the
   state in results so the caller sees the contest.
3. **`audit-all-registered`** — return all relations for audit, but **do not** use
   `unsupported` or inadmissible relations for path traversal unless explicitly requested.

A policy declares `admittedStates` and MAY set convenience flags (`includeContested`,
`includeRefuted`) and a `minimumReviewStatus`. For traversal projections,
`admittedStates` **SHOULD** be a subset of `{supported, refuted, contested}`; admitting
`unsupported` is reserved for audit-style policies, which **MUST NOT** drive traversal or
ranking.

## 6.5 Projections

A **projection** is the time-indexed edge set for a specific `⟨profileId, at, policyId⟩`.
`getProjectedRelations` returns the admitted `ProjectedRelation` set;
`getProjectionMetadata` returns auditing metadata (profile version, policy version, source
revision/observer time, projection hash, generation time, admitted/excluded counts).

Projections are the substrate for path operations
([08 — Paths & temporal topology](./08-paths-and-temporal-topology.md)). A conforming path
operation traverses the projection, never an all-time graph filtered afterward.

## 6.6 Explaining exclusion

For any subject excluded from a projection, `explainRelationState` /
`explainPathExclusion` return structured `ExclusionExplanation` objects naming the
`inadmissibleEvidenceUnitIds` and `inadmissibleSourceStateIds` responsible. Natural-language
rendering is a client concern; the API returns structured data.

## 6.7 Conformance (Query API)

Query API Conformance requires: entity lookup, relation lookup, relation evidence, reverse
evidence lookup, relation state at time, relation history, and projected relations — all
consistent with the state definitions above.
