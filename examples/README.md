# Examples

Synthetic and legal example instances. Every example **MUST** be internally consistent and
validate against the JSON Schemas ([`../schemas/`](../schemas/)).

## How validation works

An example opts into schema validation by including a `$schema` property whose value is a
**repo-relative path** to the schema it should validate against, e.g.:

```json
{ "$schema": "../../schemas/core/derived-relation.schema.json", "id": "...", ... }
```

The `$schema` pointer is a convenience for the validator
([`../scripts/validate_examples.mjs`](../scripts/validate_examples.mjs)) and is stripped
before validation. Run:

```bash
npm --prefix ../scripts run validate:examples
```

## Layout

- [`synthetic/`](./synthetic/) — domain-neutral examples that exercise a single semantic
  point (persistence, conjunctive vs. alternative evidence, polarity vs. refutation, …).

Concrete, domain-grounded examples (e.g. legal instances tied to a specific substrate) are
**not** kept here — they belong with the concrete profile in the `tier-graph-reference`
repository, alongside its executable fixtures. Examples in this repository stay abstract and
domain-neutral.

`synthetic/persistent-relation.json` is the abstract example carried by this version; it
validates against the normative schemas and is checked in CI.
