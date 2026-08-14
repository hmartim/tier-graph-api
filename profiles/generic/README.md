# Generic grounding profile (template)

This directory contains **templates** for the two documents that make up an implementation's
effective profile over any domain and source substrate. They are orthogonal: the vocabulary
fixes *meaning and identity*, the grounding profile fixes *temporal authority*, and each is
versioned on its own.

- [`vocabulary-template.yaml`](./vocabulary-template.yaml) — copy to
  `profiles/<your-profile>/vocabulary.yaml` and fill in. Validates against
  [`../../schemas/vocabulary/profile-vocabulary.schema.json`](../../schemas/vocabulary/profile-vocabulary.schema.json).
- [`profile-template.yaml`](./profile-template.yaml) — copy to
  `profiles/<your-profile>/profile.yaml` and fill in. Validates against
  [`../../schemas/grounding/temporal-grounding-profile.schema.json`](../../schemas/grounding/temporal-grounding-profile.schema.json).

## Authoring checklist

1. **Declare the substrate.** What is an evidence unit? What is a source state? What owns
   what?
2. **Pin down admissibility.** State precisely what "admissible at time *t*" means,
   including the temporal axis and interval bounds. This is the authoritative definition
   the core defers to.
3. **Implement the two functions.** `owner(evidenceUnit) → SourceStateRef` and
   `admissible(sourceState, t, observerTime?) → AdmissibilityResult`, exposed via the
   grounding operations.
4. **Declare your vocabulary.** In the vocabulary document, list every entity type,
   predicate, predicate family, and qualifier dimension your relations carry, and say what
   each one means. The core fixes no taxonomy for any of them, so an undeclared value is
   non-conformant — and since identity comparison is scoped to a vocabulary version,
   changing the list is a version change.
5. **Do not leak the substrate.** The core references source states; it does not persist
   the substrate's internal temporal data.
6. **Provide a minimal fixture** for conformance rather than the whole substrate
   ([`../../spec/12-security-and-privacy.md`](../../spec/12-security-and-privacy.md)).
