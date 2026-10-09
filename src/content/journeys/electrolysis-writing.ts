import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
const prefix = "el-write-v1-";
const mixtureAnswer =
  "The mixture has a lower melting point than pure aluminium oxide, so less energy is needed to keep the electrolyte molten. Electrical current is still needed for electrolysis.";
const anodeAnswer =
  "The positive electrode is carbon (graphite). Oxygen produced there reacts with the carbon to form carbon dioxide in this simplified cell, consuming the electrode, so it must be replaced.";
const mixtureCriteria = [
  "Compare the mixture's lower melting point with pure aluminium oxide.",
  "Link the lower required temperature to less heating energy; cost alone is insufficient.",
];
const anodeCriteria = [
  "Identify the electrode as carbon or graphite.",
  "Explain its reaction with oxygen produced at the positive electrode.",
  "Explain carbon dioxide formation or carbon consumption, linking this to replacement; physical wear alone is insufficient.",
];
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  family: string,
): LearningTask {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    referenceResponse: answer,
    explanation:
      answer +
      " Compare your retained response with the criteria; this is manual review, not an automatic examiner mark.",
    hint: "Link the chemical cause to its consequence.",
    purpose:
      "Construct a short chemical explanation or complete reaction independently.",
    followUp: prefix + "r-" + family,
  };
}
function teaching(
  id: string,
  family: "mixture" | "anode",
  guided: boolean,
): LearningTask {
  const isMixture = family === "mixture";
  return {
    ...choice(
      prefix + id,
      isMixture
        ? "Why does the cryolite mixture reduce heating energy?"
        : "Why is the carbon positive electrode consumed?",
      isMixture
        ? "Lower melting point → lower required temperature"
        : "Oxygen reacts with carbon → carbon is used up",
      isMixture
        ? {
            "Cryolite is a catalyst → no current needed":
              "Cryolite is not a catalyst or an electrical supply.",
            "Lower boiling point → no melting needed":
              "The electrolyte must be molten; compare melting points.",
          }
        : {
            "Graphite is inert → oxygen cannot react":
              "Carbon reacts with the oxygen in this aluminium cell.",
            "Aluminium deposits at the positive electrode":
              "Aluminium forms at the negative electrode.",
          },
      isMixture ? mixtureAnswer : anodeAnswer,
      "Explain the cause and its consequence.",
      isMixture ? "Explain the mixture" : "Explain anode consumption",
    ),
    title: isMixture ? "Explain the mixture" : "Explain anode consumption",
    conciseHeading: true,
    followUp: prefix + "r-" + family,
    ...(guided
      ? {
          model: {
            kind: "electrolysis-process" as const,
            mode: family,
            instruction: isMixture
              ? "Compare the stated cryolite and pure-oxide cases; then explain the energy consequence."
              : "Compare carbon and inert electrodes; distinguish chemical consumption from physical wear.",
          },
        }
      : {}),
  };
}
export const electrolysisWriting = {
  refresher: [
    teaching("r-mixture", "mixture", false),
    teaching("r-anode", "anode", false),
  ],
  guided: [
    teaching("g-mixture", "mixture", true),
    teaching("g-anode", "anode", true),
  ],
  practice: [
    written(
      "p-mixture",
      "Explain the energy saving",
      "Aluminium oxide is dissolved in molten cryolite. Explain the heating-energy benefit.",
      mixtureAnswer,
      mixtureCriteria,
      "mixture",
    ),
    written(
      "p-anode",
      "Explain continual replacement",
      "Explain why carbon anodes must be replaced in aluminium extraction.",
      anodeAnswer,
      anodeCriteria,
      "anode",
    ),
  ],
  checkForms: [
    [
      written(
        "cA-mixture",
        "Explain the mixture",
        "Why use aluminium oxide dissolved in cryolite rather than pure molten aluminium oxide? Link to energy.",
        mixtureAnswer,
        mixtureCriteria,
        "mixture",
      ),
      written(
        "cA-anode",
        "Explain replacement",
        "Explain why the graphite positive electrodes in aluminium extraction must be continually replaced.",
        anodeAnswer,
        anodeCriteria,
        "anode",
      ),
      written(
        "cA-reaction",
        "Write the anode reaction",
        "Carbon dioxide forms when oxygen reacts with the carbon electrode. Write a balanced symbol equation for this reaction.",
        "C + O2 → CO2",
        [
          "Use carbon and oxygen as reactants and carbon dioxide as product.",
          "Use C, O2 and CO2; conserve one carbon and two oxygen atoms. State symbols are not required.",
        ],
        "anode",
      ),
    ],
    [
      written(
        "cB-mixture",
        "Correct the energy claim",
        "A student says cryolite saves energy because it is a catalyst. Correct the claim, explaining the actual benefit.",
        "Cryolite is not a catalyst. The mixture has a lower melting point than pure aluminium oxide, so less heating energy is needed; current is still required.",
        ["Reject the catalyst claim.", ...mixtureCriteria],
        "mixture",
      ),
      written(
        "cB-anode",
        "Explain electrode mass loss",
        "A carbon anode loses mass as oxygen is produced in an aluminium cell. Explain the chemical cause and why replacement is needed.",
        anodeAnswer,
        anodeCriteria,
        "anode",
      ),
      written(
        "cB-reaction",
        "Construct the decomposition",
        "Aluminium oxide decomposes to aluminium and oxygen. Write a balanced symbol equation using Al2O3, Al and O2.",
        "2 Al2O3 → 4 Al + 3 O2",
        [
          "Keep the supplied chemical formulae; do not change subscripts.",
          "Balance both elements: 4 aluminium atoms and 6 oxygen atoms on each side. Multiples are valid; state symbols are not required.",
        ],
        "mixture",
      ),
    ],
  ],
  reviewForms: [
    [
      written(
        "vA-mixture",
        "Explain the temperature choice",
        "A cryolite–aluminium oxide mixture melts below pure aluminium oxide. Explain how this benefits extraction without removing the need for current.",
        mixtureAnswer,
        [
          ...mixtureCriteria,
          "State that electrolysis still requires electrical current.",
        ],
        "mixture",
      ),
      written(
        "vA-anode",
        "Compare carbon and inert electrodes",
        "Oxygen forms at both a carbon anode and an anode stated to be inert. Explain why only the carbon anode is chemically consumed in these records.",
        "Oxygen reacts with the carbon anode to form carbon dioxide in this simplified record, using up carbon. The stated inert electrode does not react with oxygen.",
        [
          "Link oxygen reaction to carbon dioxide/carbon consumption.",
          "Explain that the stipulated inert electrode does not react; do not claim all electrodes are consumed.",
        ],
        "anode",
      ),
      written(
        "vA-reaction",
        "Construct a molten reaction",
        "Molten magnesium chloride with inert electrodes gives magnesium and chlorine. Write a balanced symbol equation using MgCl2, Mg and Cl2.",
        "MgCl2 → Mg + Cl2",
        [
          "Place MgCl2 as reactant, Mg and Cl2 as products.",
          "Conserve one Mg and two Cl atoms; do not substitute chloride ions or hydrogen for the final elements. State symbols are not required.",
        ],
        "mixture",
      ),
    ],
    [
      written(
        "vB-mixture",
        "Distinguish two energy needs",
        "A student says using cryolite means aluminium extraction needs no energy. Correct the claim and explain the real benefit.",
        "The mixture lowers the melting point, reducing heating energy. Heating is still needed to maintain the melt, and electrical current is needed to drive electrolysis.",
        [
          ...mixtureCriteria,
          "Explain that both heating and electrical current remain necessary.",
        ],
        "mixture",
      ),
      written(
        "vB-anode",
        "Correct physical-wear reasoning",
        "A student says aluminium-cell carbon anodes need replacement only because they wear away. Give the chemical explanation.",
        anodeAnswer,
        [
          ...anodeCriteria,
          "Distinguish reaction/consumption from unsupported physical wear.",
        ],
        "anode",
      ),
      written(
        "vB-reaction",
        "Construct a different melt reaction",
        "Molten calcium bromide with inert electrodes gives calcium and bromine. Write a balanced symbol equation using CaBr2, Ca and Br2.",
        "CaBr2 → Ca + Br2",
        [
          "Place CaBr2 as reactant, Ca and Br2 as products.",
          "Conserve one calcium and two bromine atoms; bromine is the neutral element, not bromide ions. State symbols are not required.",
        ],
        "mixture",
      ),
    ],
  ],
};
export function addElectrolysisWriting(j: LessonJourney) {
  j.refresher.push(...electrolysisWriting.refresher);
  j.guided.push(...electrolysisWriting.guided);
  j.practice.push(...electrolysisWriting.practice);
  j.checkForms.push(...electrolysisWriting.checkForms);
  j.reviewForms.push(...electrolysisWriting.reviewForms);
  const added = [
    ...electrolysisWriting.refresher,
    ...electrolysisWriting.guided,
    ...electrolysisWriting.practice,
    ...electrolysisWriting.checkForms.flat(),
    ...electrolysisWriting.reviewForms.flat(),
  ];
  for (const family of ["mixture", "anode"]) {
    const linked = added.filter((q) => q.id.endsWith("-" + family));
    for (const q of linked)
      q.exposureAliases = [
        ...linked.filter((other) => other !== q).map((other) => other.id),
        "el-v1-p-extraction-write",
        ...(family === "mixture"
          ? ["el-v1-r-mixture", "el-v1-g-mixture", "el-v1-p-cryolite"]
          : ["el-v1-r-anode", "el-v1-g-anode", "el-v1-p-carbon"]),
      ];
  }
}
