// Cas limite : un identifiant exact prime toujours sur la similarité sémantique.
import assert from "node:assert/strict";
import { joinRows } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";

const jev = createFakeProvider(() => {
  throw new Error("Jev ne doit pas être appelé");
});
const resultat = await joinRows(
  [{ name: "Ville de Lyon", siren: "216901231" }],
  [{ name: "Commune de Lyon", siren: "216901231" }],
  jev,
);
assert.equal(resultat[0].decision, "same_entity");
assert.equal(resultat[0].deterministic, true);
assert.equal(jev.calls, 0);
console.log(JSON.stringify(resultat, null, 2));
