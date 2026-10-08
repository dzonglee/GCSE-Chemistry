import { purityWarmup, purityRefreshers } from "./purity-recovery-tasks";
import { purityGuided } from "./purity-guided";
import { purityPractice } from "./purity-practice";
import { purityCheckForms, purityReviewForms } from "./purity-assessments";
const id = (s: string) => "purity-v1-" + s;
export const purityRecovery: Record<string, string[]> = {};
const routes: [string[], string[]][] = [
  [["ingredient-ratio"], ["ratio"]],
  [["element", "compound", "mixture"], ["definition"]],
  [
    ["milk", "water-label"],
    ["label", "definition"],
  ],
  [["narrow-width"], ["width"]],
  [["melt-match"], ["reference"]],
  [["melt-broad"], ["interval"]],
  [["incomplete"], ["width", "reference"]],
  [
    ["boil-match", "boil-salt", "boil-missing"],
    ["pressure", "reference"],
  ],
  [["pigment", "fragrance"], ["percent"]],
  [["accidental"], ["formulation"]],
  [["sand-method"], ["filter", "target"]],
  [["crystal-method"], ["crystals"]],
  [["fractional-method", "distil-draw"], ["target"]],
  [
    ["undissolved", "damp-filtrate", "filter-draw"],
    ["filter", "mother"],
  ],
  [["product-recovery"], ["recovery", "purity"]],
  [["collected-mass"], ["purity"]],
];
for (const [questions, refs] of routes)
  for (const suffix of questions) {
    const task = purityPractice.find((q) => q.id === id("p-" + suffix));
    if (!task)
      throw Error(
        "Missing individually reviewed practice destination " + suffix,
      );
    const targets = refs.map((r) => id("r-" + r));
    if (targets.some((t) => !purityRefreshers.find((q) => q.id === t)))
      throw Error("Missing purity refresher");
    purityRecovery[task.id] = targets;
    task.followUp = targets[0];
  }
/** Only direct evidence aliases. Fresh numerical applications retain their distinct givens. */
export const purityExposureFamilies: Record<string, string[]> = {
  pureCompoundClassification: [
    "w-substance",
    "g-compound",
    "p-compound",
    "cA-compound",
  ],
  pureElementClassification: ["p-element", "cB-element", "rB-element"],
  everydayLabelMeaning: [
    "r-label",
    "p-milk",
    "p-water-label",
    "cA-label",
    "cB-label",
  ],
  lowerWiderInference: ["r-interval", "p-melt-broad", "cA-interval"],
  matchingReferenceInference: ["g-interval", "p-melt-match", "cB-interval"],
  missingPressure: [
    "r-pressure",
    "g-pressure",
    "p-boil-missing",
    "rA-pressure",
  ],
  completeFilterSaltPath: ["w-solubility", "g-filter-salt", "cA-filtrate"],
  crystalRoute: ["r-crystals", "p-crystal-method"],
  formulationDesign: ["r-formulation", "p-accidental"],
  solventCollection: ["r-target", "g-solvent", "cB-method"],
};
const all = [
  ...purityWarmup,
  ...purityRefreshers,
  ...purityGuided,
  ...purityPractice,
  ...purityCheckForms.flat(),
  ...purityReviewForms.flat(),
];
for (const q of all) {
  const direct = new Set<string>();
  for (const family of Object.values(purityExposureFamilies)) {
    const ids = family.map(id);
    if (ids.includes(q.id))
      for (const alias of ids) if (alias !== q.id) direct.add(alias);
  }
  if (direct.size) q.exposureAliases = [...direct];
}
const group = (label: string, ids: string[]) => ({
  label,
  taskIds: ids.map((s) => id("p-" + s)),
});
export const purityJourney = {
  version: 1 as const,
  introduction:
    "Distinguish chemical purity from everyday labels, compare measured data with references, and choose physical separation for a stated target. Preserve where each supplied material goes.",
  scopeNote:
    "AQA both-tier purity and formulation, supported by physical-separation foundations. Percentage recovery and collected-sample product fraction practise interpreting supplied practical data; they are not a separate purity-specification formula requirement. The next lessons address chromatography and separation investigations in their own right. Completing this lesson does not establish whole-course exam readiness.",
  outcomes: [
    "Classify a complete composition as an element, compound or mixture and interpret everyday purity claims.",
    "Read a melting interval and compare temperature data under stated conditions without claiming unique identity.",
    "Calculate ingredient masses and simplest ordered ratios for a deliberately designed formulation.",
    "Select a separation method for the given properties and requested product.",
    "Account for dissolved material, insoluble residue and retained mother liquor without inventing a reaction.",
    "Distinguish product recovery from the product fraction of a wet or contaminated collection.",
  ],
  warmup: purityWarmup,
  refresher: purityRefreshers,
  guided: purityGuided,
  practice: purityPractice,
  checkForms: purityCheckForms,
  reviewForms: purityReviewForms,
  practiceGroups: [
    group("Complete composition and everyday labels", [
      "element",
      "compound",
      "mixture",
      "milk",
      "water-label",
    ]),
    group("Temperature readings, references and missing evidence", [
      "narrow-width",
      "melt-match",
      "melt-broad",
      "incomplete",
      "boil-match",
      "boil-salt",
      "boil-missing",
    ]),
    group("Formulation masses, purpose and simplest ratios", [
      "ingredient-ratio",
      "pigment",
      "fragrance",
      "accidental",
    ]),
    group("Choose for the stated target and construct the apparatus", [
      "sand-method",
      "crystal-method",
      "fractional-method",
      "distil-draw",
    ]),
    group("Filtration, dissolved material and mother liquor", [
      "undissolved",
      "damp-filtrate",
      "filter-draw",
    ]),
    group("Different mass references for recovery and composition", [
      "product-recovery",
      "collected-mass",
    ]),
  ],
};
