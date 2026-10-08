import { warmup, refresher } from "./natural-tasks";
import { guided } from "./natural-guided";
import { practice } from "./natural-practice";
import { checkForms, reviewForms } from "./natural-assessments";
import type { NaturalJourney } from "./natural-types";
const focusTasks: Record<string, import("../../lib/natural").NaturalFocus> = {
  "r-dna-unit": "unit",
  "r-dna-shape": "shape",
  "r-dna-types": "types",
  "g-unit": "unit",
  "g-count": "count",
  "g-types": "types",
  "r-mass": "Mr",
  "r-core-ends": "ends",
  "r-core-subtract": "core",
  "g-core": "core",
  "g-inventory": "H",
};
for (const q of [...refresher, ...guided]) {
  const focus = focusTasks[q.id.replace("natural-v1-", "")];
  if (focus && q.model?.kind === "natural-polymers") q.model.focus = focus;
}
const informationRefresher = refresher.find(
  (q) => q.id === "natural-v1-r-information",
);
if (informationRefresher) delete informationRefresher.model;
export const naturalRecovery: Record<string, string[]> = {};
const routes: [string[], string[]][] = [
  [
    ["amino-repeat", "amino-repeat-draw", "amino-repeat-ends"],
    ["amino-repeat"],
  ],
  [["amino-mass", "acid-mass", "core-ends"], ["core-ends"]],
  [
    ["core-75", "core-103"],
    ["core-subtract", "core-ends"],
  ],
  [["visual"], ["dna-shape", "dna-unit"]],
  [["dna-unit", "dna-draw", "dna-explain"], ["dna-unit"]],
  [["dna-shape", "dna-most"], ["dna-shape"]],
  [["dna-count"], ["dna-unit", "g-count"]],
  [["dna-types"], ["dna-types"]],
  [["dna-information"], ["information"]],
  [["starch", "cellulose", "starch-cellulose"], ["glucose"]],
  [["ring-draw", "ring-explain"], ["repeat"]],
  [["ring-identity"], ["identity"]],
  [["protein", "protein-mixed"], ["protein"]],
  [["order"], ["sequence"]],
  [["composition"], ["composition"]],
  [["connectivity"], ["connectivity"]],
  [["function"], ["function"]],
  [["groups", "one-type"], ["groups"]],
  [
    ["peptide-bond", "peptide-draw"],
    ["peptide", "water"],
  ],
  [["water-origin"], ["water"]],
  [
    ["gly-three-water", "endgroups", "peptide-three"],
    ["links", "water"],
  ],
  [["gly-four-mass", "mixed-mass", "three-mass"], ["mass"]],
  [
    ["mixed-H", "mixed-O"],
    ["water", "mass"],
  ],
  [
    ["three-N", "three-carbon"],
    ["mass", "peptide"],
  ],
  [["condensation-explain"], ["groups", "water", "peptide"]],
];
for (const [ids, refs] of routes)
  for (const id of ids) {
    const q = practice.find((q) => q.id === "natural-v1-p-" + id);
    if (!q) throw Error("Missing reviewed recovery " + id);
    const targets = refs.map(
      (x) => "natural-v1-" + (x.startsWith("g-") ? x : "r-" + x),
    );
    naturalRecovery[q.id] = targets;
    q.followUp = targets[0];
  }
export const naturalExposureFamilies: Record<string, string[]> = {
  nucleotideUnit: ["r-dna-unit", "g-unit", "p-dna-unit", "c-b-dna", "v-b-dna"],
  DNAshape: ["r-dna-shape", "p-dna-shape", "c-a-shape"],
  DNAtypes: ["r-dna-types", "g-types", "p-dna-types", "c-a-types", "c-b-types"],
  proteinMonomer: ["r-protein", "p-protein", "c-a-protein", "v-a-protein"],
  celluloseMonomer: ["r-glucose", "g-glucose", "p-cellulose", "c-b-cellulose"],
  starchMonomer: [
    "r-glucose",
    "g-glucose",
    "p-starch",
    "c-a-glucose",
    "v-b-glucose",
  ],
  naturalGlucoseShared: ["p-starch-cellulose", "v-b-glucose"],
  DNADrawing: ["g-unit", "p-dna-draw", "c-a-draw", "v-b-draw"],
  glucoseContribution: [
    "r-repeat",
    "g-repeat",
    "p-ring-draw",
    "p-ring-explain",
    "c-b-draw",
    "v-a-draw",
  ],
  diagramRecognition: ["p-visual", "c-a-diagram", "c-b-diagram"],
  DNArole: [
    "r-information",
    "p-dna-information",
    "c-b-information",
    "c-a-information",
  ],
  repeatedThreeByTwo: ["w-units", "v-a-count"],
  sequenceInventory: ["r-sequence", "g-order", "p-order", "c-b-sequence"],
  glycineGroups: ["r-groups", "p-groups"],
  aminoRepeat: [
    "r-amino-repeat",
    "g-amino-repeat",
    "p-amino-repeat",
    "p-amino-repeat-draw",
    "p-amino-repeat-ends",
  ],
  peptideJoining: ["r-peptide", "g-join", "p-peptide-bond"],
  unknownSection75: ["r-core-subtract", "p-core-75"],
  unchangedGroups: ["r-core-ends", "p-core-ends"],
  peptideWater: ["r-water", "p-water-origin"],
};
const allTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const q of allTasks) {
  const direct = new Set<string>();
  for (const ids of Object.values(naturalExposureFamilies)) {
    const full = ids.map((id) => "natural-v1-" + id);
    if (full.includes(q.id))
      for (const id of full) if (id !== q.id) direct.add(id);
  }
  if (direct.size) q.exposureAliases = [...direct];
}
export const naturalJourney: NaturalJourney = {
  version: 1,
  introduction:
    "Identify original monomer types and complete contributions in natural polymer chains. Distinguish nucleotide units, glucose-derived contributions and amino-acid sequence; Higher tasks build actual peptide junctions and conserve finite-chain atoms.",
  scopeNote:
    "Chemistry only. Natural-polymer monomer types and DNA structure are both-tier content. Tasks explicitly headed Higher cover amino-acid condensation, peptide structures and finite-chain accounting. The reserved checks and delayed reviews assess the common both-tier content; they do not certify Higher condensation exam readiness.",
  outcomes: [
    "Identify nucleotides, amino acids and glucose as the appropriate monomer types.",
    "Distinguish one nucleotide from a whole rung and recognise the common two-strand double helix.",
    "Select a complete glucose-derived contribution and avoid unsupported unique identity claims.",
    "Distinguish atom composition, sequence, connectivity and limits on function claims.",
    "Higher: preserve original carbon groups and terminal groups while making peptide C–N links.",
    "Higher: account for water losses and the whole finite chain, separately from end-omitted repeat shorthand.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Higher: bracketed amino-acid contributions",
      taskIds: [
        "natural-v1-p-amino-repeat",
        "natural-v1-p-amino-repeat-draw",
        "natural-v1-p-amino-repeat-ends",
      ],
    },
    {
      label: "DNA: whole units, types and shape",
      taskIds: practice.slice(0, 8).map((q) => q.id),
    },
    {
      label: "Glucose-based polymers and complete contributions",
      taskIds: practice.slice(8, 14).map((q) => q.id),
    },
    {
      label: "Proteins: units, sequence and evidence",
      taskIds: practice.slice(14, 20).map((q) => q.id),
    },
    {
      label: "Higher: groups and peptide construction",
      taskIds: practice.slice(20, 25).map((q) => q.id),
    },
    {
      label: "Higher: finite-chain atoms and mass",
      taskIds: practice.slice(25, 33).map((q) => q.id),
    },
    {
      label: "Higher: terminal groups and mechanism comparison",
      taskIds: practice.slice(33, 36).map((q) => q.id),
    },
    {
      label: "Higher: inverse mass and unknown sections",
      taskIds: practice.slice(36, 41).map((q) => q.id),
    },
    {
      label: "Recognise a supplied natural-polymer structure",
      taskIds: practice.slice(41, 42).map((q) => q.id),
    },
  ],
};

const shapeRefresher = refresher.find((q) => q.id === "natural-v1-r-dna-shape");
if (shapeRefresher?.model?.kind === "natural-polymers")
  shapeRefresher.model.record = "eight";
