# Reference implementation & fixture contract

**Reference implementation status: available.** See
[`tier-graph-reference`](https://github.com/hmartim/tier-graph-reference).

`tier-graph-api` **defines** conformance (this directory). A separate public repository,
**`tier-graph-reference`**, **executes** it: it supplies the executable fixtures, a fixture
runner, a concrete grounding adapter, and — optionally — a reference service and a TIER-only
database. That repository declares:

```text
Implements tier-graph-api v0.1.0-draft
```

## Division of responsibility

| Concern | Repository |
| ------- | ---------- |
| Normative case catalog (T01–T10), CQs, invariants, expected behavior | `tier-graph-api` (here) |
| Case-definition and manifest schemas (the fixture contract) | `tier-graph-api` (here) |
| Executable payloads (`input.json`, `profile-fixture.json`, `request.json`, `expected.json`) | `tier-graph-reference` |
| Fixture runner / test harness (e.g. pytest) | `tier-graph-reference` |
| Concrete grounding adapter (`TemporalGroundingProvider`) | `tier-graph-reference` |
| Obtained results, TIER-only database (if produced), reference service | `tier-graph-reference` |

## The fixture contract

Each executable case in `tier-graph-reference` is expected to provide, under
`fixtures/cases/T0N-<slug>/`:

```text
input.json            # entities / relations / evidence under test
profile-fixture.json  # MINIMAL, test-specific grounding data (owner + admissibility windows)
request.json          # the operation + parameters/body to run
expected.json         # the expected structured result
README.md             # optional local notes
```

An implementation repository's fixture **manifest** SHOULD reuse the normative case
definitions here: each fixture case corresponds, by `id`, to an entry in
[`manifest.yaml`](./manifest.yaml) and MUST satisfy that entry's `requiredInvariants` and
`expectedBehavior`. The shape of a case definition is fixed by
[`case-definition.schema.json`](./case-definition.schema.json).

The concrete data shapes are those of the published JSON Schemas in
[`../schemas/`](../schemas/):

- `input.json` objects validate against the relevant core schemas (`DerivedEntity`,
  `DerivedRelation`, `RelationEvidence`, …);
- `request.json` matches the operation's parameters or request-body schema in
  [`../openapi/openapi.yaml`](../openapi/openapi.yaml);
- `expected.json` matches the operation's response schema.

## Grounding adapter (in the implementation repository)

The reference implements the generic grounding interface. Conceptually:

```python
class TemporalGroundingProvider:          # generic interface (spec/05)
    def resolve_source_state(self, evidence_unit_id): ...
    def evaluate_source_state(self, source_state_id, at, observer_time=None): ...
```

A concrete adapter (over whatever substrate the reference chooses to demonstrate) implements
this interface. The core does not know, and does not need to know, how the adapter obtains
its answers (HTTP call, authorized local access, mock, fixture, or otherwise).
