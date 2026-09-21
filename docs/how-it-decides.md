# How it decides

Jev data.gouv Join blocks rows with deterministic identifiers and normalized names, then asks Jev only about ambiguous candidate pairs. It returns links, rejections and review cases with provenance.

The exact question and criteria live beside the call in [src/index.mjs](../src/index.mjs), making review and version control straightforward. Dates, identifiers, arithmetic, candidate generation, thresholds and state transitions remain code-owned. Synthetic demo probabilities are illustrative. Calibrate review thresholds on representative human labels before operational use.
