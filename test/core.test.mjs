// Purpose: Verify deterministic blocking and semantic join decisions.
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeName, candidates, joinRows } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
test("normalizes French legal names", () =>
  assert.equal(normalizeName("SAS Élan !"), "elan"));
test("exact SIREN wins without a call", async () => {
  let calls = 0;
  const p = createFakeProvider(() => {
    calls++;
  });
  const out = await joinRows(
    [{ name: "A", siren: "1" }],
    [{ name: "B", siren: "1" }],
    p,
  );
  assert.equal(out[0].deterministic, true);
  assert.equal(calls, 0);
});
test("blocks plausible names", () =>
  assert.equal(
    candidates([{ name: "Association Élan" }], [{ name: "Elan" }])[0].candidates
      .length,
    1,
  ));
