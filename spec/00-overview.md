# 00 — Overview

**TIER-Graph** — *Temporally Indexed Evidence-Linked Relations Graph.*

This document set is the **normative conceptual specification** for the TIER-Graph API. It
defines an implementation-neutral contract for publishing, querying, and auditing *derived
relational propositions* whose evidence is linked to **externally controlled temporal
source states**.

## Purpose

TIER-Graph specifies a **domain-independent** API for relations that are:

- **Derived** — produced by extraction, rules, or curation, and therefore *defeasible*;
- **Evidence-linked** — each relation's support (or refutation) is recorded as one or more
  evidence bases that reference externally controlled units;
- **Temporally indexed** — a relation's state at a time is *computed* from the temporal
  admissibility of its evidence, resolved by a declared grounding profile — never copied
  from the source.

The specification is deliberately independent of any storage engine, source system, or
domain. A conforming implementation supplies its own **`TemporalGroundingProfile`** over
its own source substrate.

## What this specification is (and is not)

| It is | It is not |
| ----- | --------- |
| A public interaction contract | A service implementation |
| Canonical data models (JSON Schema 2020-12) | A database schema for a specific engine |
| Temporal and evidential semantics | A statement of domain truth |
| Conformance requirements and fixtures | A hosted endpoint or reference server |

Derived relations are **non-authoritative**. The specification's job is to keep them
**auditable**: every asserted proposition can be traced to its evidence, that evidence to
its external source states, and those states to a temporal admissibility decision made by
an authoritative profile.

## Precedence between artifacts

The model is described at three levels, which serve different purposes and must not
contradict one another. When they do, precedence is:

1. **Conceptual semantics** — this document set and the ontology define what the objects
   *mean*: identity, evidence composition, evidential state, admission, and temporal
   projection.
2. **Machine-readable conformance** — the versioned API specification (JSON Schemas, SHACL
   constraints, JSON-LD context, OpenAPI contract) is normative for the **form** of
   interchanged representations and for conformance checking.
3. **Reference implementation** — **non-normative**. It must conform to both levels above;
   where it diverges, the implementation is wrong.

A divergence between levels 1 and 2 is a defect in this specification and MUST be resolved
here, not accommodated downstream. Implementers should validate whole objects against the
schemas rather than field-by-field: partial checking is how a representation drifts from
the contract while appearing correct.

## Normative language

This specification uses RFC 2119 / RFC 8174 keywords — **MUST**, **MUST NOT**, **SHOULD**,
**SHOULD NOT**, **MAY** — and only in that sense. Three further terms are used carefully:

- **Ontological core** — the objects and invariants defined by TIER-Graph itself.
- **Authoritative source substrate** — the external system responsible for source-state
  identity and temporal admissibility, reached only through a `TemporalGroundingProfile`. It
  is authoritative *only* for the source properties it explicitly controls.
- **Derived relation** — a defeasible proposition produced by extraction, rules, or
  curation; **not** automatically domain truth.

Where a design decision is unsettled, the relevant section is marked:

```text
Status: Draft — open design question
```

and the unresolved issue is stated explicitly.

## Document map

| Doc | Title |
| --- | ----- |
| [00](./00-overview.md) | Overview |
| [01](./01-architecture.md) | Architecture |
| [02](./02-core-ontology.md) | Core ontology (the three objects) |
| [03](./03-relation-identity.md) | Relation identity & merge rules |
| [04](./04-evidence-semantics.md) | Evidence semantics |
| [05](./05-temporal-grounding-contract.md) | Temporal grounding contract |
| [06](./06-evidential-state-and-policies.md) | Evidential state & admission policies |
| [07](./07-api-primitives.md) | API primitives |
| [08](./08-paths-and-temporal-topology.md) | Paths & temporal topology |
| [09](./09-provenance-and-review.md) | Provenance & review |
| [10](./10-conformance.md) | Conformance |
| [11](./11-extension-points.md) | Extension points |
| [12](./12-security-and-privacy.md) | Security & privacy |
| [13](./13-versioning-and-compatibility.md) | Versioning & compatibility |

## Competency questions

The API is designed to answer a fixed set of competency questions (CQs), referenced
throughout:

- **CQ1** — In which derived relations does an entity participate?
- **CQ2** — Which evidence units jointly or independently support or refute a relation?
- **CQ3** — What is the evidential state of a relation at time *t* under a grounding profile?
- **CQ4** — Which derived relations are evidenced by a given evidence unit?
- **CQ5** — Does the same proposition persist across successive source states or instruments?
- **CQ6** — Which relations change evidential state at an admissibility boundary?
- **CQ7** — Which evidence-grounded paths connect two entities at time *t*?
- **CQ8** — Which paths or analytical artifacts must be excluded as temporally inadmissible (and why)?

These match the competency questions in the TIER-Graph paper (Table 1).

## Conformance classes (summary)

See [10 — Conformance](./10-conformance.md). An implementation may claim: Core Model,
Temporal Grounding, Query API, Path, and optionally Authoring and Analytical Extension
conformance. A read-only implementation may claim Query Conformance without authoring.
