import type { PathwayJourney as Journey } from "./pathways-types";
import { warmup, refresher } from "./pathways-tasks";
import { guided } from "./pathways-guided";
import { practice } from "./pathways-practice";
import { checkForms, reviewForms } from "./pathways-assessments";
export { warmup, refresher, guided, practice, checkForms, reviewForms };
const prefix = "path-v1-";
const hydrogenDraws = [
  "p-ethene-h",
  "p-propene-h",
  "p-butene-h",
  "p-pentene-h",
  "p-internal-h",
];
const waterDraws = [
  "p-ethene-water",
  "p-propene-water",
  "p-butene-water",
  "p-pentene-water",
];
const chlorineDraws = [
  "p-ethene-cl",
  "p-propene-cl",
  "p-butene-cl",
  "p-pentene-cl",
];
const bromineDraws = [
  "p-ethene-br",
  "p-propene-br",
  "p-butene-br",
  "p-pentene-br",
  "p-internal-br",
];
const iodineDraws = ["p-ethene-i", "p-propene-i", "p-butene-i", "p-pentene-i"];
export const pathwaysRecovery: Record<string, string[]> = {};
const recovery: [string[], string[]][] = [
  [hydrogenDraws, ["r-addition", "r-original", "g-hydrogen"]],
  [waterDraws, ["r-steam", "r-count-oh", "g-water"]],
  [chlorineDraws, ["r-halogen", "g-bromine"]],
  [bromineDraws, ["r-halogen", "g-bromine"]],
  [iodineDraws, ["r-halogen", "r-original"]],
  [["p-h2-condition"], ["r-nickel"]],
  [["p-steam-condition"], ["r-hydration", "g-conditions"]],
  [["p-bromine-test"], ["r-bromine", "r-uv", "g-evidence"]],
  [["p-cl-pair"], ["r-halogen", "g-inverse"]],
  [["p-h2-infer"], ["r-addition", "g-internal"]],
  [
    ["p-ethanol-Mr", "p-pentanol-Mr"],
    ["r-count-oh", "g-mass"],
  ],
  [
    ["p-br-Mr", "p-cl-Mr", "p-i-Mr"],
    ["r-halogen", "g-mass"],
  ],
  [["p-propane-Mr"], ["r-original", "g-mass"]],
  [["p-family-halogen"], ["r-product", "w-family"]],
  [
    [
      "p-process-E",
      "p-process-W",
      "p-process-P",
      "p-process-bound",
      "p-process-zero",
    ],
    ["r-observed", "g-process"],
  ],
  [["p-cooler-explain"], ["r-water-origin", "g-cooling"]],
  [["p-recycle-explain"], ["r-recycle", "g-process"]],
  [["p-ester-explain"], ["r-ester", "g-ester"]],
  [["p-routes-explain"], ["r-hydration", "r-fermentation", "g-ferment"]],
  [["p-oxidation-limit"], ["r-oxidation"]],
  [["p-addition-polymer"], ["r-polymer", "g-polymer"]],
  [["p-higher-condensation"], ["r-higher-groups", "r-higher-water"]],
];
for (const [ids, targets] of recovery)
  for (const id of ids) {
    const t = practice.find((t) => t.id === prefix + id);
    if (!t) throw Error("Missing individually reviewed recovery " + id);
    const refs = targets.map((x) => prefix + x);
    pathwaysRecovery[t.id] = refs;
    t.followUp = refs[0];
  }
export const pathwaysExposureFamilies: Record<string, string[]> = {
  hydrogenAddition: [
    "r-addition",
    "g-hydrogen",
    ...hydrogenDraws,
    "p-h2-infer",
    "g-internal",
  ],
  hydrationStructure: [
    "w-water",
    "r-steam",
    "r-count-oh",
    "g-water",
    "g-oh-site",
    ...waterDraws,
    "b-drawing",
  ],
  chlorineAddition: ["p-cl-pair", ...chlorineDraws, "b-infer"],
  bromineAddition: ["r-halogen", "g-bromine", ...bromineDraws, "a-drawing"],
  iodineAddition: [...iodineDraws, "d2-pair"],
  hydrocarbon: ["w-family", "r-product", "p-family-halogen", "a-family"],
  hydrogenConditions: ["r-nickel", "p-h2-condition", "b-condition"],
  hydrationConditions: [
    "r-hydration",
    "g-conditions",
    "p-steam-condition",
    "a-condition",
  ],
  bromineTest: ["r-bromine", "r-uv", "g-evidence", "p-bromine-test", "d1-test"],
  waterInference: ["g-inverse"],
  ethanolMass: ["g-mass", "p-ethanol-Mr"],
  bromineMass: ["p-br-Mr", "a-mass"],
  chlorineMass: ["p-cl-Mr", "d2-mass"],
  waterInventory: [
    "r-water-origin",
    "g-cooling",
    "p-cooler-explain",
    "a-explain",
    "d1-explain",
  ],
  reportedConversion: [
    "r-observed",
    "g-process",
    "p-process-E",
    "p-process-W",
    "p-process-P",
    "p-process-bound",
    "p-process-zero",
    "a-unused",
    "b-unused",
    "d1-flow",
  ],
  recycling: ["r-recycle", "p-recycle-explain"],
  esterCarbon: ["r-ester", "g-ester", "p-ester-explain", "b-explain"],
  fermentation: [
    "r-fermentation",
    "g-ferment",
    "p-routes-explain",
    "a-feed",
    "b-product",
  ],
  primaryOxidation: ["r-oxidation", "p-oxidation-limit"],
  polymerExtent: ["r-polymer", "g-polymer", "p-addition-polymer", "d2-explain"],
  higherCondensation: [
    "r-higher-groups",
    "r-higher-water",
    "p-higher-condensation",
  ],
};
const all = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const ids of Object.values(pathwaysExposureFamilies)) {
  const aliases = ids.map((x) => prefix + x);
  for (const t of all)
    if (aliases.includes(t.id))
      t.exposureAliases = [
        ...new Set([
          ...(t.exposureAliases ?? []),
          ...aliases.filter((x) => x !== t.id),
        ]),
      ];
}
export const pathwaysJourney: Journey = {
  version: 1,
  introduction:
    "Construct fully displayed alkene addition products, select reaction conditions and infer missing reagents. Then track real reported conversion through a reactor and cooler and distinguish ethanol, acid, ester and polymer pathways.",
  scopeNote:
    "Separate Chemistry, both tiers: actual AQA8462 4.7.2.1–2 includes the first four alkenes and displayed H2, water and halogen addition products. Actual AQA specimen Foundation Paper2 question06.4–6 with its mark scheme informed hydration, recycling and ethanol oxidation; RSC teaching worksheets informed the comparisons, with a published single/double-bond definition error corrected. Pearson9.12C–16C was checked for alkene structure, bromine evidence and given structural extension; this is limited alignment, not verification of every AQA-specific reaction demand for every board. Hydration OH landing sites and longer alcohol names are provided; no mechanism, stereochemical selectivity or product-proportion recall is required. The oxidation branch specifically uses primary ethanol. Ester/fermentation/addition-polymer routes retrieve earlier lessons; polyester condensation is explicitly Higher practice, outside the shared/Foundation cold checks. All written/drawn responses require self-review with no automated examiner mark. Whole-course coverage, Maths parity and exam readiness remain unfinished.",
  outcomes: [
    "Construct complete displayed products for the first four alkenes with H2, steam, Cl2, Br2 and I2 while retaining every original chain atom.",
    "Choose stated hydrogenation/hydration conditions and interpret the ordinary bromine-water test.",
    "Infer reagents from actual atom changes and distinguish saturation from hydrocarbon composition.",
    "Count complete molecules and supplied relative molecular masses, including O–H and both halogen atoms.",
    "Distinguish reported conversion from a supplied-feed bound and account for unused feed, cooled liquid and recycle gas.",
    "Distinguish primary ethanol oxidation, esterification, fermentation and addition-polymerisation by feed and product.",
    "Higher: distinguish chemical polyester condensation from physical water condensation.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Hydrogen addition: complete displayed products",
      taskIds: hydrogenDraws.map((x) => prefix + x),
    },
    {
      label: "Steam addition: supplied OH connectivities",
      taskIds: waterDraws.map((x) => prefix + x),
    },
    {
      label: "Halogen addition: preserve all original H",
      taskIds: [...chlorineDraws, ...bromineDraws, ...iodineDraws].map(
        (x) => prefix + x,
      ),
    },
    {
      label: "Conditions, evidence and reagent inference",
      taskIds: [
        "p-h2-condition",
        "p-steam-condition",
        "p-bromine-test",
        "p-cl-pair",
        "p-h2-infer",
      ].map((x) => prefix + x),
    },
    {
      label: "Molecular inventory, mass and product family",
      taskIds: [
        "p-ethanol-Mr",
        "p-br-Mr",
        "p-cl-Mr",
        "p-i-Mr",
        "p-propane-Mr",
        "p-pentanol-Mr",
        "p-family-halogen",
      ].map((x) => prefix + x),
    },
    {
      label: "Reported conversion, cooled streams and recycling",
      taskIds: [
        "p-process-E",
        "p-process-W",
        "p-process-P",
        "p-process-bound",
        "p-process-zero",
        "p-cooler-explain",
        "p-recycle-explain",
      ].map((x) => prefix + x),
    },
    {
      label: "Retrieve and explain distinct organic routes",
      taskIds: [
        "p-ester-explain",
        "p-routes-explain",
        "p-oxidation-limit",
        "p-addition-polymer",
      ].map((x) => prefix + x),
    },
    {
      label: "Higher: chemical polyester condensation",
      taskIds: ["p-higher-condensation"].map((x) => prefix + x),
    },
  ],
};
