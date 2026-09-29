// Objectif : démontrer la frontière de décision sans appel réseau.
import assert from "node:assert/strict";
import { joinRows } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const left = [
  { name: "Mairie de Saint Étienne", siren: "111" },
  { name: "Ass. Les Amis du Parc" },
];
const right = [
  { name: "Commune de Saint-Etienne", siren: "111" },
  { name: "Association Les Amis du Parc", city: "Lyon" },
];
const fake = createFakeProvider(() => ({
  model: "jev-1.13.0",
  answers: {
    match: {
      type: "choice",
      choice: "candidate_0",
      probabilities: { candidate_0: 0.91, none: 0.09 },
      confidence: 0.91,
    },
  },
  usage: { input_tokens: 90, output_tokens: 0 },
}));
const resultat = await joinRows(left, right, fake);
assert.equal(resultat[1].decision, "same_entity");
console.log(JSON.stringify(resultat, null, 2));
