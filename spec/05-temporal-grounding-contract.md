# 05 — Temporal Grounding Profile Specification

This document is the **normative, domain-independent** specification of the temporal
grounding contract. It defines how TIER-Graph obtains temporal meaning **without owning any
temporal source of truth**, by delegating to a declared **`TemporalGroundingProfile`**.

Schemas: [`../schemas/grounding/`](../schemas/grounding/).

> This specification is **generic**. It names only abstract roles (`EvidenceUnitRef`,
> `SourceStateRef`, `owner`, `admissible`). It does **not** depend on, reference, or require
> any concrete substrate. A concrete legal profile over a versioned-norms substrate is
> demonstrated in the separate `tier-graph-reference` project and is **non-normative** here
> (see [§5.11](#511-reference-profiles-non-normative)).

## 5.1 The problem it solves

A derived relation has no intrinsic validity interval. Whether it is *supported at time t*
depends on whether its evidence is **admissible at t**, and admissibility is a property of
the **external source substrate**, not of the relation. TIER-Graph therefore delegates all
temporal judgment to a declared profile.

## 5.2 A profile as an interface

Conceptually a profile is:

```text
B_ρ = ⟨U_ρ, S_ρ, owner_ρ, admissible_ρ⟩
```

- `U_ρ` — the space of **evidence units** the profile controls;
- `S_ρ` — the space of **source states**;
- `owner_ρ` — resolves an evidence unit to the source state that owns it;
- `admissible_ρ` — decides whether a source state may ground a query at a temporal
  coordinate.

A conforming profile **MUST** provide the two behavioral functions:

```text
owner_ρ(evidenceUnitId) → SourceStateRef
admissible_ρ(sourceStateId, queryTime, observerTime?) → AdmissibilityResult
```

exposed through the grounding operations `resolveSourceState` and
`evaluateSourceStateAdmissibility` ([07 — API primitives](./07-api-primitives.md)).

## 5.3 Declaring external types

A profile **MUST** declare, in its `TemporalGroundingProfile` object:

- `id`, `name`, `version`;
- `evidenceUnitType` — the kind of evidence unit it controls (an opaque type label, e.g.
  `document-fragment`, `clinical-note`, `record-entry`);
- `sourceStateType` — the kind of source state that owns evidence units (e.g.
  `document-version`, `record-revision`);
- `admissibilitySemantics` — a **precise, human-readable** statement of what "admissible at
  time *t*" means for this profile. This is the authoritative definition the core defers to.

A profile **MAY** additionally declare `supportedSelectors`, `supportedTemporalCoordinates`,
a `defaultAdmissionPolicyId`, `documentationUri`, and `metadata`.

The declared type labels are **opaque to the core**. TIER-Graph never interprets them; they
exist so that callers and auditors can understand the substrate a profile grounds.

## 5.4 `EvidenceUnitRef` and `SourceStateRef`

- An **`EvidenceUnitRef`** is a *reference* to an externally controlled unit of evidence:
  the pair `⟨profileId, evidenceUnitId⟩`, optionally refined by an `EvidenceSelector`. The
  core **MUST NOT** require the full evidence content to be stored locally, and **MUST NOT**
  derive admissibility from any local copy.
- A **`SourceStateRef`** is a *reference* to the temporally controlled state that owns an
  evidence unit: `⟨profileId, sourceStateId⟩`, optionally with `sourceObjectId` (the
  canonical source object the state is a state *of*). It is normally **returned** by the
  profile and need not be persisted by the core.

## 5.5 Owner resolution

`owner_ρ(evidenceUnitId)` returns a `SourceStateRef`. Requirements:

- resolution **MUST** be deterministic or authoritative — the profile is the authority;
- the returned source state is a **reference**; the core does not persist the substrate's
  internal temporal data;
- `resolveSourceState` results **MUST** come from the profile. TIER-Graph **MUST NOT**
  fabricate or infer a competing source state.

## 5.6 Admissibility evaluation

`admissible_ρ(sourceStateId, queryTime, observerTime?)` returns an `AdmissibilityResult`
(`admissible: boolean` plus a `reasonCode`/`reason` and, for a basis, per-anchor detail).

**The profile defines what admissibility means. TIER-Graph MUST NOT override it.**

Because anchors within a `RelationEvidence` record are conjunctive
([04 — Evidence semantics](./04-evidence-semantics.md)), a **basis** is admissible at a
coordinate only when **every** anchor resolves to an admissible source state:

```text
admissible(E, t) ⇔ ∀ anchor a ∈ E : admissible(owner(a.evidenceUnit), t)
```

`evaluateEvidenceAdmissibility` returns per-anchor detail (`anchorResults`) so that a single
inadmissible anchor that sinks the basis is visible.

## 5.7 Temporal coordinates: query time, observer time, corrections

A profile **MUST** support a **query time** (`at`) — the time the caller is asking about.

A profile **MAY** support an **observer time** (`observerTime`) — the vantage point from
which admissibility is judged — enabling **bitemporal** queries ("as known on 2005-01-01,
was this so on 1996-05-01?"). A profile that supports it **MUST** declare `observerTime` in
`supportedTemporalCoordinates` and state, in `admissibilitySemantics`, how the two axes
interact (in particular, how **corrections/retractions** in the substrate are reflected: a
correction known only after an observer time **MUST NOT** affect a result as of that observer
time).

The *meaning* of each axis (event time, applicability time, observation time, availability
time, …) is defined by the profile, not by the core.

## 5.8 Authority and fallback declarations

A profile is **authoritative only for the source properties it explicitly controls**
(source-state identity, ownership, and temporal admissibility). It **MUST** state this scope
in its documentation. Beyond that scope it makes no claim, and the core makes none on its
behalf.

A profile **SHOULD** declare its **fallback behavior** for the boundary cases below, so that
results are reproducible and auditable:

- **Unknown evidence unit** — `owner` cannot resolve the unit (`RESOURCE_NOT_FOUND`).
- **Unknown source state** — admissibility cannot be evaluated.
- **Coordinate outside coverage** — the profile has no information at the requested time.
- **Ambiguous ownership** — more than one candidate owner (a profile **MUST** define a
  deterministic resolution or return an explicit error; it **MUST NOT** guess silently).

Fallbacks **MUST NOT** manufacture admissibility: when the profile cannot decide, the
result is *not admissible* with an explanatory `reasonCode`, never a fabricated *admissible*.

## 5.9 Versioning

A profile **MUST** expose an explicit `version`. A change to `admissibilitySemantics`,
`owner` resolution, or the meaning of a temporal axis is a **breaking** profile change and
**MUST** increment the profile's major version. Projections record the profile version they
were built with (`getProjectionMetadata`) so a temporal result can be audited against the
exact profile version that produced it ([13 — Versioning](./13-versioning-and-compatibility.md)).

## 5.10 Conformance (Temporal Grounding)

An implementation claiming **Temporal Grounding Conformance** **MUST**:

- declare at least one `TemporalGroundingProfile` with a precise `admissibilitySemantics`;
- provide deterministic/authoritative `owner` resolution;
- provide admissibility evaluation, with per-anchor detail for conjunctive bases;
- **not** copy authoritative source-state intervals into the core (no interval field on
  `DerivedRelation`);
- compute evidential state from admissibility, not from stored intervals
  ([06 — Evidential state & policies](./06-evidential-state-and-policies.md));
- declare its fallback behavior for the boundary cases in [§5.8](#58-authority-and-fallback-declarations).

## 5.11 A minimal abstract example (non-normative)

The following illustrates the *shape* of a profile declaration, using an abstract
versioned-documents substrate and **no** domain-specific vocabulary:

```yaml
id: example-versioned-documents
name: "Example — versioned documents"
version: "0.1.0"
evidenceUnitType: document-fragment
sourceStateType: document-version
admissibilitySemantics: >-
  A document-version S is admissible at query time t iff t falls within the half-open
  interval [S.effectiveFrom, S.effectiveTo) recorded by the substrate; when an observerTime
  o is given, that interval must have been known as of o.
supportedTemporalCoordinates: [queryTime, observerTime]
ownershipOperation: resolveSourceState
admissibilityOperation: evaluateSourceStateAdmissibility
```

See [`../profiles/generic/profile-template.yaml`](../profiles/generic/profile-template.yaml)
to start a new profile.

## 5.12 Reference profiles (non-normative)

A concrete legal grounding profile — mapping the abstract roles onto a versioned legal-norms
substrate, together with an executable adapter — is demonstrated in the separate
**`tier-graph-reference`** project. That profile is **one possible instantiation** of this
contract and is **not** part of, nor required by, the TIER-Graph API specification. Any
controlled temporal substrate (versioned legislation, clinical records, scientific records,
financial datasets, corporate documents, …) may satisfy this contract without knowledge of
any other.
