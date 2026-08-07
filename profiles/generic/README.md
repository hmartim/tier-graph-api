# Generic grounding profile (template)

This directory contains a **template** for authoring a `TemporalGroundingProfile` over any
domain and source substrate.

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
4. **Do not leak the substrate.** The core references source states; it does not persist
   the substrate's internal temporal data.
5. **Provide a minimal fixture** for conformance rather than the whole substrate
   ([`../../spec/12-security-and-privacy.md`](../../spec/12-security-and-privacy.md)).
