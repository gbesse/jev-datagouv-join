# Jev data.gouv Join

**Résout les jointures ambiguës entre jeux de données publics français avec des candidats auditables.**

[![Tests](https://github.com/gbesse/jev-datagouv-join/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/jev-datagouv-join/actions/workflows/test.yml) [MIT](LICENSE) · Node.js 22+ · v0.1.4 · Documentation française

Le moteur bloque d’abord les lignes à l’aide des identifiants déterministes et des noms normalisés. Jev n’examine que les paires encore ambiguës et renvoie les rapprochements, rejets et cas à vérifier avec leur provenance.

## Démarrage rapide

```sh
git clone https://github.com/gbesse/jev-datagouv-join.git
cd jev-datagouv-join
npm install
npm run demo
```

La démonstration utilise uniquement des données et probabilités synthétiques. Elle n’effectue aucun appel réseau et ne constitue pas une mesure de qualité de Jev.

## Exemple exécutable

Cet exemple rapproche deux listes d’organismes par SIREN puis par similarité contrôlée. Il utilise un fournisseur Jev simulé : aucune clé API ni connexion réseau n’est nécessaire. L’assertion intégrée fait échouer la commande si le comportement attendu change.

Le code complet de [`examples/demo.mjs`](examples/demo.mjs) est directement copiable :

```js
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
```

Lancez-le avec :

```sh
npm run demo:principal
```

Résultat à repérer : `decision: same_entity`.

### Cas limite à tester

Un SIREN identique impose la jointure avant toute comparaison sémantique. Le code se trouve dans [`examples/cas-limite.mjs`](examples/cas-limite.mjs).

```sh
npm run demo:limite
```

Résultat à repérer : `decision: same_entity · deterministic: true`. La commande `npm run demo` exécute les deux exemples.

## Utilisation de la bibliothèque

Importez les fonctions métier depuis `@gbesse/jev-datagouv-join`. Fournissez soit `createJevClient()` depuis l’export `./jev`, soit `createFakeProvider()` pour les tests hors ligne.

Les noms de l’API JavaScript restent stables pour préserver la compatibilité avec les versions précédentes. La documentation, les exemples et les explications destinées aux utilisateurs sont en français.

## Frontière de décision

Les SIREN, SIRET et autres identifiants exacts priment toujours sur la similarité sémantique. Le dépôt ne recherche pas lui-même des jeux de données et ne garantit jamais l’identité juridique d’une entité.

La question exacte envoyée à Jev est versionnée dans [`src/index.mjs`](src/index.mjs). Les identifiants, dates, calculs, filtres, seuils et transitions d’état restent gérés par du code ordinaire.

## Sources

- [https://www.data.gouv.fr](https://www.data.gouv.fr)
- [https://github.com/gbesse/matchgraph](https://github.com/gbesse/matchgraph)

Conservez l’attribution amont, les identifiants d’origine, les URL de source et les dates de récupération avec chaque enregistrement dérivé.

## Appels Jev réels

Les appels réels sont facultatifs et payants. Le client fixe le modèle `jev-1.13.0`, valide l’identité du modèle et toutes les probabilités, refuse les redirections, ne retente que les erreurs réseau et les réponses HTTP 429/529, puis bloque les requêtes dépassant une estimation prudente de 24 000 jetons.

```sh
TYPESAFE_API_KEY=... node scripts/live-smoke.mjs
```

N’envoyez jamais de secret, de donnée personnelle ni de dossier sensible non expurgé. Évaluez le comportement sur un jeu représentatif de cas français avant tout usage opérationnel.

## Parcours comparatif

`npm run demo:parcours` produit un rapport JSON partageable pour **jev-datagouv-join** : le scénario principal et la frontière déterministe. Chaque scénario garde sa sortie propre et échoue si son assertion ne passe plus. Les données et probabilités sont synthétiques ; aucun appel Jev n’est effectué.

Cette vue permet de comparer rapidement les chemins de décision et de choisir quel exemple adapter à vos propres données sourcées.

## Validation

```sh
npm run check
npm run typecheck
npm test
npm run demo
```

La CI exécute ces vérifications sous Node.js 22 et 24.

Projet indépendant, sans affiliation avec TypeSafe AI ni avec l’administration française. Consultez la [documentation de l’API Jev](https://docs.typesafe.ai/api) et les [limites du modèle](https://docs.typesafe.ai/model-jaggedness/jev-1.13).
