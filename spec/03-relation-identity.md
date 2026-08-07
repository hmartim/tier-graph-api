# 03 — Relation Identity & Merge Rules

Relation identity governs when two relation candidates are the *same* proposition and may
be merged. Getting this wrong silently corrupts a knowledge graph, so the rules are
conservative by design.

## 3.1 The identity key

The minimum identity key of a relation `r` is:

```text
Key(r) = ⟨sourceEntityId, predicate, targetEntityId, polarity, truth-conditional qualifiers⟩
```

where *truth-conditional qualifiers* are the identity-relevant dimensions declared by the
profile (see [02 — RelationQualifier](./02-core-ontology.md#22-relationqualifier)). Polarity
is itself a qualifier dimension; it is called out in the key because a well-formed relation
**MUST** always specify it.

## 3.2 When automatic merging is permitted

Two candidates **MAY** be merged automatically only when **all** of the following hold:

1. source identifiers are equivalent;
2. predicates are equivalent;
3. target identifiers are equivalent;
4. polarity is equivalent;
5. all identity-relevant qualifiers are equivalent;
6. **no** identity-relevant qualifier is `unknown`.

If any condition fails, the candidates **MUST** remain distinct. In particular, condition
(6) means an unresolved (`unknown`) identity-relevant qualifier **blocks** automatic
merging even if everything else matches — because the merge might conflate two genuinely
different propositions.

## 3.3 `unknown` is not `absent`

This is the single most important identity rule.

- `absent` means: *the profile asserts this dimension does not apply* — it is a specified
  fact about the proposition (e.g. "this duty has no jurisdictional restriction").
- `unknown` means: *we have not resolved this dimension* — it is an epistemic gap.

Two relations that agree on everything except that one has `condition = absent` and the
other has `condition = unknown` are **not** known to be the same proposition. Merging them
would fabricate certainty. Therefore `unknown` **MUST NOT** be treated as `absent`, and an
`unknown` identity-relevant qualifier blocks the merge.

### When may `absent` be asserted?

Because `absent` is a claim about the proposition, it requires a positive determination —
it is never a default and never the residue of a failed extraction.

- `unknown` is the **default** whenever a declared qualifier dimension has not been
  resolved. An extractor that produced no value, a field left blank, an unannotated
  document, and a low-confidence result all yield `unknown`.
- `absent` **MUST** be asserted only by an extraction, rule, or review activity that
  positively determines that no value for that dimension qualifies the proposition, and
  that activity **MUST** remain auditable through the evidence record's provenance.

Silently converting an unresolved dimension into `absent` turns a gap in the pipeline into
a truth-conditional assertion about the norm, which is exactly the fabricated certainty
this rule exists to prevent.

## 3.4 The `compareRelationIdentity` operation

Implementations **SHOULD** expose a decision procedure (API operation
`compareRelationIdentity`, see [07 — API primitives](./07-api-primitives.md)) returning:

```yaml
decision: equivalent | distinct | unresolved
blockingDimensions: [string]
explanation: string
```

**Rule.** If any identity-relevant qualifier is `unknown`, the decision **MUST NOT** be
`equivalent`; it is `unresolved`, and `blockingDimensions` lists the offending dimensions.

## 3.5 Merging is a reviewed action

Automatic merge-compatibility is a *precondition*, not a mandate. The `mergeRelationCandidates`
authoring operation **SHOULD** require explicit review authorization and **MUST NOT** merge
candidates when an identity-relevant qualifier is unresolved. A merge is recorded through
provenance and review events so it remains auditable and reversible.

## 3.6 Predicate and entity equivalence

- **Entity equivalence** is decided by opaque identifier equality, or by a reviewed merge
  of the entities themselves — never by label similarity alone.
- **Predicate equivalence** is decided within the profile's predicate vocabulary. Two
  spellings that the profile maps to the same normalized predicate are equivalent; a
  broader/narrower predicate is **not** automatically equivalent.

## 3.7 Worked micro-examples

| A | B | Decision | Why |
| - | - | -------- | --- |
| `⟨X, requires, Y, +, {jurisdiction: BR}⟩` | `⟨X, requires, Y, +, {jurisdiction: BR}⟩` | equivalent | full key match |
| `⟨X, requires, Y, +, {jurisdiction: BR}⟩` | `⟨X, requires, Y, +, {jurisdiction: US}⟩` | distinct | jurisdiction differs |
| `⟨X, requires, Y, +, {condition: absent}⟩` | `⟨X, requires, Y, +, {condition: unknown}⟩` | unresolved | `unknown` ≠ `absent`, blocks merge |
| `⟨X, requires, Y, +⟩` | `⟨X, requires, Y, −⟩` | distinct | polarity differs |

Polarity `+`/`−` above denotes the value of the `polarity` qualifier, **not** evidence
stance (see [04 — Evidence semantics](./04-evidence-semantics.md)).
