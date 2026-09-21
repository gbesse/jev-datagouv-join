// Purpose: Join public-data rows with deterministic blocking and reviewed semantic resolution.
import { readFile } from "node:fs/promises";
export function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\b(sa|sas|sarl|eurl|association)\b/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function candidates(left, right, options = {}) {
  const idKeys = options.idKeys || ["siren", "siret"];
  const max = options.maxCandidates || 5;
  return left.map((row) => {
    const exact = right.filter((other) =>
      idKeys.some(
        (key) =>
          row[key] && other[key] && String(row[key]) === String(other[key]),
      ),
    );
    if (exact.length)
      return {
        row,
        candidates: exact.slice(0, max),
        reason: "exact_identifier",
      };
    const name = normalizeName(row.name);
    const blocked = right.filter((other) => {
      const n = normalizeName(other.name);
      return (
        n &&
        name &&
        (n.includes(name) ||
          name.includes(n) ||
          n.split(" ")[0] === name.split(" ")[0])
      );
    });
    return {
      row,
      candidates: blocked.slice(0, max),
      reason: "normalized_name",
    };
  });
}
export async function joinRows(left, right, provider, options = {}) {
  const out = [];
  for (const block of candidates(left, right, options)) {
    if (block.reason === "exact_identifier" && block.candidates.length === 1) {
      out.push({
        left: block.row,
        right: block.candidates[0],
        decision: "same_entity",
        probability: 1,
        deterministic: true,
      });
      continue;
    }
    if (!block.candidates.length) {
      out.push({
        left: block.row,
        right: null,
        decision: "no_candidate",
        probability: 1,
        deterministic: true,
      });
      continue;
    }
    const criteria = { none: "No candidate is the same entity" };
    block.candidates.forEach((_, i) => {
      criteria["candidate_" + i] =
        "Candidate " + i + " is the same real-world entity";
    });
    const r = await provider.decide({
      state: { left: block.row, candidates: block.candidates },
      questions: {
        match: {
          type: "choice",
          instructions:
            "Choose the same real-world French entity. Names may contain abbreviations or legal forms. Do not infer identity from a shared city alone.",
          criteria,
        },
      },
    });
    const a = r.answers.match;
    const idx = Number(a.choice.replace("candidate_", ""));
    out.push({
      left: block.row,
      right: a.choice === "none" ? null : block.candidates[idx],
      decision: a.choice === "none" ? "different_entity" : "same_entity",
      probability: a.probabilities[a.choice],
      review: a.confidence < (options.minConfidence ?? 0.85),
      deterministic: false,
    });
  }
  return out;
}
export async function runCli(argv, io = console) {
  if (argv.length !== 2)
    throw new Error("Usage: jev-datagouv-join <left.json> <right.json>");
  const [l, r] = await Promise.all(
    argv.map(async (f) => JSON.parse(await readFile(f, "utf8"))),
  );
  io.log(JSON.stringify(candidates(l, r), null, 2));
}
