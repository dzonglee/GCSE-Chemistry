import { chromatographyWarmup } from "./chromatography-warmup";
import { chromatographyRecovery } from "./chromatography-recovery";
import { chromatographyGuided } from "./chromatography-guided";
import { chromatographyPractice } from "./chromatography-practice";
import {
  chromatographyCheckForms,
  chromatographyReviewForms,
} from "./chromatography-assessments";
const id = (suffix: string) => "chromatography-v1-" + suffix;
export const chromatographyRecoveryRoutes: Record<string, string[]> = {};
for (const [question, target] of [
  ["w-compound", "r-substances"],
  ["w-soluble", "r-solubility"],
  ["w-fraction", "r-direct"],
]) {
  const task = chromatographyWarmup.find((t) => t.id === id(question));
  if (!task || !chromatographyRecovery.find((t) => t.id === id(target)))
    throw Error("Missing prerequisite recovery");
  task.followUp = id(target);
}
const routes: [string, string[]][] = [
  ["p-pencil", ["r-pencil"]],
  ["p-immersed", ["r-contact"]],
  ["p-touch", ["r-contact"]],
  ["p-phase-paper", ["r-phase-identity"]],
  ["p-phase-saline", ["r-mobile"]],
  ["p-tlc", ["r-phase-identity"]],
  ["p-origin", ["r-offset"]],
  ["p-centre", ["r-centre"]],
  ["p-front", ["r-front-distance"]],
  ["p-missing-front", ["r-missing"]],
  ["p-direct", ["r-direct"]],
  ["p-inverse", ["r-inverse"]],
  ["p-find-front", ["r-denominator"]],
  ["p-mixed-units", ["r-units"]],
  ["p-two-sf", ["r-precision"]],
  ["p-zero", ["r-unmoved"]],
  ["p-one", ["r-endpoint"]],
  ["p-invalid", ["r-ratio-range"]],
  ["p-retention-reverse", ["r-phase-cause"]],
  ["p-explain", ["r-phase-cause"]],
  ["p-count", ["r-minimum"]],
  ["p-mixture-matches", ["r-lanes"]],
  ["p-inventory-pure", ["r-pure-spot"]],
  ["p-coelution", ["r-coelution"]],
  ["p-colour", ["r-colour"]],
  ["p-unmatched", ["r-lanes"]],
  ["p-solvent", ["r-resolve"]],
  ["p-confounded", ["r-confounded"]],
  ["p-proportions", ["r-amount"]],
  ["p-longer", ["r-proportional"]],
  ["p-draw-plot", ["r-offset", "r-inverse"]],
  ["p-draw-setup", ["r-pencil", "r-contact", "r-front", "r-clean"]],
];
for (const [suffix, targets] of routes) {
  const task = chromatographyPractice.find((t) => t.id === id(suffix));
  if (
    !task ||
    targets.some((s) => !chromatographyRecovery.find((t) => t.id === id(s)))
  )
    throw Error("Missing individually authored recovery destination");
  chromatographyRecoveryRoutes[task.id] = targets.map(id);
  task.followUp = id(targets[0]);
}
// Only direct repetitions. A fresh numerical application is not linked merely
// because it practises the same operation; no graph/transitive traversal.
export const chromatographyExposureFamilies = {
  solubleOriginLine: ["r-pencil", "p-pencil"],
  sameImmersedSetup: ["g-setup", "p-immersed"],
  samePaperWaterPhase: ["g-phases", "p-phase-paper", "r-phase-identity"],
  sameOffset30: ["r-offset", "p-origin"],
  sameCentre48: ["g-centre", "p-centre"],
  sameFront80: ["r-front-distance", "p-front"],
  sameMissingFront: ["r-missing", "p-missing-front"],
  sameRatio35: ["g-rf", "p-direct"],
  sameInverse46: ["r-inverse", "p-inverse"],
  sameMixedUnits: ["r-units", "p-mixed-units"],
  sameTwoSf: ["r-precision", "p-two-sf"],
  samePastFront: ["r-ratio-range", "p-invalid"],
  sameKnownReferences: ["g-reference", "p-mixture-matches"],
  sameCoelution: [
    "g-one-spot",
    "p-coelution",
    "r-coelution",
    "cA-purity",
    "vA-coelution",
  ],
  sameThreeSpots: ["r-minimum", "p-count"],
  sameGeneralMechanism: ["g-explain", "p-explain", "vA-mechanism"],
  samePureQPrediction: ["r-pure-spot", "p-inventory-pure"],
  sameVisibleFrontRecording: ["r-front", "cB-front"],
  sameDifferentPaperReference: ["g-conditions", "cB-conditions"],
};
const all = [
  ...chromatographyWarmup,
  ...chromatographyRecovery,
  ...chromatographyGuided,
  ...chromatographyPractice,
  ...chromatographyCheckForms.flat(),
  ...chromatographyReviewForms.flat(),
];
for (const family of Object.values(chromatographyExposureFamilies)) {
  const ids = family.map(id);
  for (const current of ids) {
    const task = all.find((t) => t.id === current);
    if (!task) throw Error("Unreviewed alias " + current);
    task.exposureAliases = [
      ...new Set([
        ...(task.exposureAliases ?? []),
        ...ids.filter((s) => s !== current),
      ]),
    ];
  }
}
const group = (label: string, suffixes: string[]) => ({
  label,
  taskIds: suffixes.map(id),
});
export const chromatographyJourney = {
  version: 1 as const,
  introduction:
    "Set up paper chromatography, measure from the origin and use relative travel as evidence. Explain separation through both phases and preserve the limits of reference and purity claims.",
  scopeNote:
    "AQA both-tier chromatography and required-practical skills, with a limited comparison to Pearson. The explicitly supplied silica example extends phase vocabulary. These original practice tasks are not an exam-board question bank or proof of exam readiness.",
  outcomes: [
    "Diagnose sample immersion, soluble baseline ink and missing front measurements, and propose a valid arrangement.",
    "Identify stationary and mobile phases and explain differences in relative movement through phase distribution.",
    "Measure origin-to-centre and origin-to-front travel, with correct zero, units and requested precision.",
    "Calculate and rearrange Rf without assigning units or concealing inconsistent evidence.",
    "Interpret original reference lanes, minimum component counts and the limits of single-spot evidence.",
    "Compare controlled changes in paper, solvent, amount and run distance without unsupported causal claims.",
  ],
  warmup: chromatographyWarmup,
  refresher: chromatographyRecovery,
  guided: chromatographyGuided,
  practice: chromatographyPractice,
  checkForms: chromatographyCheckForms,
  reviewForms: chromatographyReviewForms,
  practiceGroups: [
    group("Practical setup and phase identity", [
      "p-pencil",
      "p-immersed",
      "p-touch",
      "p-phase-paper",
      "p-phase-saline",
      "p-tlc",
    ]),
    group("Origin, centre and missing measurements", [
      "p-origin",
      "p-centre",
      "p-front",
      "p-missing-front",
    ]),
    group("Ratios, inverse distances, units and precision", [
      "p-direct",
      "p-inverse",
      "p-find-front",
      "p-mixed-units",
      "p-two-sf",
      "p-zero",
      "p-one",
      "p-invalid",
    ]),
    group("Explain separation and evaluate reference lanes", [
      "p-retention-reverse",
      "p-explain",
      "p-count",
      "p-mixture-matches",
      "p-inventory-pure",
      "p-coelution",
      "p-colour",
      "p-unmatched",
    ]),
    group("Changed conditions and original constructions", [
      "p-solvent",
      "p-confounded",
      "p-proportions",
      "p-longer",
      "p-draw-plot",
      "p-draw-setup",
    ]),
  ],
};
