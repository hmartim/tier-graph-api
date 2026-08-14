# 02 — Core Ontology

The TIER-Graph ontological core is **three objects** plus the qualifier, provenance, and
review machinery that keeps them auditable. This document is normative for Core Model
Conformance ([10 — Conformance](./10-conformance.md)).

Schemas: [`../schemas/core/`](../schemas/core/).

## The three objects

```text
DerivedEntity  --predicate-->  DerivedEntity        (a DerivedRelation)
                     ▲
                     │ supported / refuted by
              RelationEvidence  --anchors-->  EvidenceUnitRef   (external)
```

1. **`DerivedEntity`** — a normalized referent.
2. **`DerivedRelation`** — a normalized, qualified, defeasible proposition between two
   entities.
3. **`RelationEvidence`** — a record that a non-empty set of external evidence units
   jointly supports or refutes one relation.

## 2.1 DerivedEntity

A `DerivedEntity` is a normalized referent that participates in one or more derived
propositions: a concept, actor, institution, event, state, condition, capability, duty,
permission, prohibition, legal power, consequence, outcome, or any domain-specific
referent.

Required fields: `id`, `canonicalLabel`, `entityType`, `reviewStatus`.

**Identity rule.** Labels and aliases do **not** define identity. Implementations **MUST**
use opaque identifiers. Two entity candidates **MAY** be merged only when they denote the
same referent under compatible type and scope. Uncertain candidates **MUST** remain
separate or be connected by a non-equivalence relation such as `possiblySameAs`.

**Non-goal.** A `DerivedEntity` is not an authoritative source object and does not replace
a source system's canonical identifiers. External identifiers are recorded as
cross-references (`externalIdentifiers`), never as identity.

## 2.2 RelationQualifier

A `RelationQualifier` represents a **truth-conditional dimension** that may affect relation
identity. The minimum dimensions the base specification recognizes are:

- `polarity`;
- `condition`;
- `scope`;
- `modality` (when modality is not encoded by the predicate);
- `participantRoles`.

A `ProfileVocabulary` **MAY** declare additional dimensions (jurisdiction, threshold,
exception, population, temporal relation among represented events, dosage, territorial
scope, authority level, …), and declares for each whether it is identity-relevant. A
`RelationQualifier` instance carries the dimension, never that flag
([03 — Relation identity](./03-relation-identity.md)).

**Qualifier status.** Every declared identity-relevant dimension **MUST** carry a status:

```yaml
status: specified | absent | unknown
```

When `status` is `specified`, a normalized `value` **MUST** be present.

**Critical rule.** `unknown` **MUST NOT** be treated as equivalent to `absent`. Any
unresolved (i.e. `unknown`) identity-relevant qualifier **MUST** block automatic relation
merging (see [03 — Relation identity](./03-relation-identity.md)).

## 2.3 DerivedRelation

A `DerivedRelation` is a normalized, qualified, defeasible proposition:

```text
sourceEntity --predicate--> targetEntity
r = ⟨source, predicate, target, polarity, qualifiers⟩
```

Required fields: `id`, `sourceEntityId`, `predicate`, `targetEntityId`, `qualifiers`,
`reviewStatus`. Every well-formed relation **MUST** include a `polarity` qualifier: in the
transfer representation polarity is carried as a qualifier, but it is a distinguished
component of the identity key ([03 — Relation identity](./03-relation-identity.md)), not
one truth-conditional dimension among others.

**Predicate families.** `predicateFamily` is an optional coarse classification of the
predicate, used to filter relations and to bound path traversal. The core **fixes no
universal taxonomy of predicate families**: a closed list would encode one domain's carving
of relation types into a domain-independent contract, and every domain that did not fit —
biomedical (`biologicalInteraction`, `diagnostic`), spatial, mereological — would have to
misfile its relations. Instead:

- A deployment **MAY** define a controlled vocabulary of predicate families, declared in
  `ProfileVocabulary.predicateFamilies` ([11 — Extension points](./11-extension-points.md)).
- A vocabulary whose relations carry `predicateFamily` **MUST** declare every value emitted
  and **MUST** define the semantics of each, precisely enough that an auditor can decide
  whether a given predicate belongs to a family.
- An implementation **MUST NOT** emit a family its vocabulary has not declared, and **MUST**
  expose the declared families through `getPredicateFamilies`.

Determinism is therefore preserved where it is checkable — the list is fixed within a
vocabulary version — without asserting a universal taxonomy. Any family token appearing in
this specification, in the schemas, or in the templates is an **example in documentation**;
the core recognizes none of them and privileges none of them. The vocabulary of *specific*
predicates, entity types, and qualifier dimensions is declared the same way.

> Cross-vocabulary portability of family filters is deliberately **not** guaranteed: a
> client that hard-codes family tokens is bound to a vocabulary version. What the core makes
> interoperable is the *mechanism*, not the values — the same answer it gives for
> `entityType`. A future revision **MAY** add an optional mapping from vocabulary-specific
> families to a small interoperability set; this version does not specify one.

**No copied intervals.** A `DerivedRelation` **MUST NOT** carry an authoritative
source-state interval. Its temporal behavior is *computed* (see
[05](./05-temporal-grounding-contract.md), [06](./06-evidential-state-and-policies.md)).

### Binary topology and n-ary propositions

The binary edge is a **minimal retrieval topology**, not a complete logical representation.
Implementations **MAY** model events or states as entities, attach participant-role
qualifiers, or reify a proposition frame in an extension profile. If binary representation
would lose material truth conditions, the implementation **MUST NOT** claim complete
semantic equivalence.

## 2.4 Provenance and review (summary)

- **`ProvenanceActivity`** records how an object was generated, reprocessed, reviewed, or
  verified. **Confidence belongs to an activity**, not to immutable source evidence.
- **`ReviewEvent`** records an auditable transition in review status
  (`proposed → accepted → …`).

These are detailed in [09 — Provenance & review](./09-provenance-and-review.md). They are
kept **separate** from evidence and from evidential state so that curation history never
masquerades as truth.

## 2.5 Object separation (invariants)

Core Model Conformance requires that an implementation keep these distinct:

1. **Identity vs. label** — identity is opaque; labels never define it.
2. **Polarity vs. stance** — proposition polarity (a qualifier) is not evidence stance.
3. **`unknown` vs. `absent`** — an unresolved qualifier is not an omitted one.
4. **Conjunctive vs. alternative evidence** — anchors within a record vs. separate records.
5. **Confidence vs. evidence** — confidence attaches to activities/assessments.
6. **Review lifecycle vs. evidential state** — `accepted` is not `supported`.
