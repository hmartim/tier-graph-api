# 08 — Paths & Temporal Topology

> Path operation schemas
> ([`../schemas/query/grounded-path.schema.json`](../schemas/query/grounded-path.schema.json),
> [`path-step.schema.json`](../schemas/query/path-step.schema.json)) and the `findAdmissiblePaths`,
> `validatePathAtTime`, and `explainPathExclusion` operations are defined in
> [`../openapi/`](../openapi/).

## 8.1 The temporal topology principle

A path answer is only trustworthy if the graph it was found in is the graph that **existed
at the query time**. TIER-Graph therefore requires path candidates to be generated over the
**time-indexed projection** for `⟨profileId, at, policyId⟩`
([06 — Evidential state & policies](./06-evidential-state-and-policies.md#65-projections)).

## 8.2 Temporal-topology leakage (prohibited)

**Temporal-topology leakage** is the anti-pattern of traversing an *all-time* graph — one
that includes edges never co-admissible at the query time — and then filtering the cited
evidence afterward, while presenting the result as a point-in-time path.

**A conforming path operation MUST NOT do this.** Candidate generation **MUST** be
constrained by the projected graph. Post-hoc-only temporal filtering **MUST NOT** be used
by any operation claiming Path Conformance. An implementation that filters citations after
an all-time traversal **MUST NOT** claim temporal-topology conformance.

Why it matters: two relations may each have existed at *some* time yet never at the *same*
time. A path chaining them is **anachronistic** — it never existed. Only projection-first
traversal excludes such paths (conformance case
[T10 — anachronistic path](../conformance/cases/) exercises exactly this).

## 8.3 GroundedPath and PathStep

- A **`GroundedPath`** records `profileId`, `queryTime`, `policyId`, its ordered `steps`,
  and whether the whole path is `admissible` (all steps admitted).
- A **`PathStep`** records the traversed relation, direction, and the step's
  `evidentialState` and `admitted` flag.

A grounded path is **non-empty**: `steps` has at least one element. This operation returns
*relational* paths, so a query whose source and target entities are identical does **not**
yield a zero-length path, even though graph theory admits the trivial path from a vertex to
itself. A zero-step answer would carry no evidence and no admissibility to report.

### Admission is not evidential support

`admissible` means **every step was admitted by the policy** — nothing more. A
recall-oriented policy ([06 §6.4](./06-evidential-state-and-policies.md#64-admission-policies))
may admit `refuted` or `contested` relations, so an admissible path MAY contain steps that
are not supported. Every step therefore preserves its own `evidentialState`, and an
implementation **MUST NOT** drop it: without it, a relation admitted while refuted is
indistinguishable from a supported one.

A path is **positively supported** only when every step's evidential state is `supported`:

```text
SupportedPath(p, t) ⇔ ∀ s ∈ steps(p) : s.evidentialState.state = supported
```

This is a derived predicate over the steps, not a stored field; `GroundedPath` declares
`additionalProperties: false` and MUST NOT be extended with one. A consumer requiring a
positively supported chain evaluates it from the steps.

## 8.4 Operations

- `findAdmissiblePaths` (CQ7) — search the projection for paths between two entities under
  `⟨at, profileId, policyId⟩`, bounded by `maxDepth`, `predicateFamilies`, `direction`,
  and `limit`.
- `validatePathAtTime` — evaluate a caller-supplied ordered path, returning path- and
  step-level admissibility and the profile/policy used.
- `explainPathExclusion` (CQ8) — return `ExclusionExplanation` objects naming the
  inadmissible evidence units / source states responsible for excluding a path.

## 8.5 Conformance (Path)

Path Conformance requires: paths generated over a time-indexed projection; step-level
evidence grounding; exclusion explanations; and **no post-hoc-only temporal filtering**.
