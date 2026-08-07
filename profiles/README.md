# Grounding profiles

A **`TemporalGroundingProfile`** is the narrow, declared interface between the TIER-Graph
core and an external, authoritative source substrate. It provides two behavioral functions —
`owner(evidenceUnit)` and `admissible(sourceState, t)` — and declares metadata about the
substrate it grounds. It is the **only** point at which a concrete substrate couples to the
core. See [`../spec/05-temporal-grounding-contract.md`](../spec/05-temporal-grounding-contract.md).

## Contents

- [`generic/`](./generic/) — a profile **template** and an authoring guide for creating your
  own profile over any domain and substrate. This is the normative companion to `spec/05`.

## Rules for any profile

1. The profile **defines** what temporal admissibility means; the core **MUST NOT** override
   it.
2. `owner` resolution **MUST** be deterministic or authoritative.
3. Profiles **MUST NOT** require the core to copy source-state intervals onto relations.
4. Profile-defined vocabularies (entity types, predicates, qualifier dimensions, selectors)
   are extensions and **MUST NOT** relax core invariants
   ([`../spec/11-extension-points.md`](../spec/11-extension-points.md)).
5. The core **MUST NOT** depend on any concrete substrate's classes, endpoints, schemas, or
   namespaces. Concrete substrate types appear only inside a profile/adapter, never in the
   core.

## Reference profile (non-normative)

A concrete legal grounding profile over a versioned legal-norms substrate — one possible
instantiation of this contract, together with an executable adapter and legal fixtures — is
demonstrated in the separate **`tier-graph-reference`** project. It is **not** part of, nor
required by, the TIER-Graph API specification. Any controlled temporal substrate may satisfy
this contract without knowledge of that or any other profile.
