# Validation scripts

These scripts validate the **specification**. They do **not** implement the API.

| Script | npm alias | Purpose |
| ------ | --------- | ------- |
| `validate_json_schemas.mjs` | `npm run validate:schemas` | Every `schemas/**/*.schema.json` is a well-formed JSON Schema 2020-12 doc and all `$ref`s resolve (Ajv 2020). |
| `validate_examples.mjs` | `npm run validate:examples` | Each example/fixture with a repo-relative `$schema` validates against it. |
| `validate_conformance.mjs` | `npm run validate:conformance` | Conformance schemas compile; `manifest.yaml` validates; each `cases/T0N.md` exists; and NO executable payloads are present here. |
| `validate_rdf.mjs` | `npm run validate:rdf` | Parse `ontology/*.ttl` (Turtle syntax check, n3). Full SHACL execution against instances is deferred to the implementation repository. |
| `reject_private_artifacts.mjs` | `npm run guard:private` | Fail if any tracked file matches a private-artifact pattern (`*.db`, `.env`, secrets, …). |
| — | `npm run validate:openapi` | Validate the OpenAPI contract (delegates to swagger-cli). |

## Usage

```bash
npm install            # in this directory
npm run validate:all   # schemas + examples + private-artifact guard
npm run validate:rdf   # ontology (requires n3 + rdf-validate-shacl)
```

## Notes

- `validate_rdf.mjs` exits `0` with a note if `n3` is not installed, so a bare checkout does
  not fail; CI installs it and enforces the Turtle parse check.
- The private-artifact guard scans **git-tracked** files only, so local gitignored scratch
  data does not trip it — but nothing private can be committed.
