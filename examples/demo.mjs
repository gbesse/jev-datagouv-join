// Purpose: Demonstrate deterministic and semantic public-data joins offline.
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
console.log(await joinRows(left, right, fake));
