import type { LearningTask } from "../types";

const id = (suffix: string) => `materials-v1-rust-design-${suffix}`;
const plan =
  "Compare matched clean uncoated iron nails in three conditions: water with air, genuinely dry air, and water with oxygen removed and kept out. A suitable drying agent, such as anhydrous calcium chloride, removes water from the dry-air control; a closed tube prevents moist air entering but retains oxygen. In a school-supervised preparation, boiling water removes dissolved gases and an oil layer prevents oxygen returning to the cooled water. Oil over ordinary unboiled water does not remove oxygen already dissolved. Keep nail preparation and exposed area, temperature and observation time comparable. Record rust formation, repeat each condition and compare results. Rust in wet air but not in either exclusion control supports the need for both oxygen and water under the tested conditions.";
const criteria = [
  "Three comparable conditions: wet air, dry air, and water with oxygen excluded. Include a wet-air positive comparison rather than only two non-rusting controls.",
  "Explain achieving and maintaining each exclusion: suitable drying agent/closed dry-air tube; removal of dissolved oxygen plus prevention of its return. Scientifically valid alternative arrangements can be reviewed manually.",
  "Matched nail preparation/exposed area, temperature and duration; record rust formation and repeat comparable trials.",
  "Use wet-air versus dry-air evidence for water, and wet-air versus oxygen-excluded water for oxygen. Limit conclusions to tested conditions; no-rust observations alone do not establish the two-reactant conclusion.",
];
function written(
  suffix: string,
  title: string,
  prompt: string,
  answer = plan,
  rubric = criteria,
): LearningTask {
  return {
    id: id(suffix),
    title,
    purpose: title,
    conciseHeading: true,
    prompt,
    answer,
    referenceResponse: answer,
    explanation: answer,
    rubric,
    hint: "Change one reactant at a time and compare each exclusion with wet air.",
  };
}
function recovery(
  suffix: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  record: "dry" | "noOxygen" | "wet",
): LearningTask {
  const options = [answer, ...Object.keys(errors)];
  const offset =
    [...suffix].reduce((sum, c) => sum + c.charCodeAt(0), 0) % options.length;
  return {
    id: id(suffix),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint: "Distinguish removing a reactant from stopping its return.",
    model: { kind: "materials-investigation", mode: "rust", record },
  };
}
export const rustDesignRecovery = [
  recovery(
    "r-dry",
    "Make the dry-air control",
    "A school experiment uses a drying agent and closed tube. Why are both needed for the dry-air nail?",
    "Remove water and prevent moist air returning, while oxygen remains",
    {
      "Remove all oxygen while water remains":
        "That describes the other exclusion control.",
      "Turn iron into stainless steel":
        "A drying agent changes the water availability, not the nail composition.",
    },
    "A suitable drying agent, for example anhydrous calcium chloride, absorbs water. Closing the dry-air tube maintains dry conditions; oxygen remains available. A comparable wet-air nail provides evidence that the absence of water prevents typical rusting in this test.",
    "dry",
  ),
  recovery(
    "r-oxygen",
    "Make the water-only control",
    "A technician prepares boiled water beneath oil. What roles do boiling and the oil layer have?",
    "Remove dissolved gases, then prevent oxygen returning",
    {
      "Oil alone removes oxygen already dissolved":
        "Oil prevents entry; it does not remove oxygen already in ordinary water.",
      "Boiling converts all water to hydrogen":
        "Heating water here removes dissolved gases; it does not split water into its elements.",
    },
    "School-supervised boiling removes dissolved gases, including oxygen. An oil layer keeps oxygen from re-entering the cooled water. Water remains available. Compare with a matched nail in ordinary water and air; a stopper alone does not remove dissolved oxygen.",
    "noOxygen",
  ),
  recovery(
    "r-positive",
    "Include a wet-air comparison",
    "Neither a dry-air nail nor an oxygen-excluded-water nail rusts. What extra comparison is needed?",
    "A matched iron nail with both water and air available",
    {
      "A different metal without either reactant":
        "Changing the metal does not give a matched positive comparison.",
      "No comparison: two unchanged nails prove every condition":
        "No rust in two controls alone does not show that these nails rust when both reactants are present.",
    },
    "Matched nails in wet air should rust under suitable observed conditions. Compare wet air with dry air to isolate water; compare wet air with oxygen-excluded water to isolate oxygen. Keep nail preparation, temperature and time comparable and repeat observations. These are simulated experiment-planning tasks, not instructions for an unsupervised home practical.",
    "wet",
  ),
];
export const rustDesignGuided = [
  written(
    "g-plan",
    "Plan the three comparisons",
    "Describe a school-supervised investigation showing whether iron needs both water and oxygen to rust. Explain the three conditions, fair comparisons and expected observations.",
  ),
];
export const rustDesignPractice = [
  written(
    "p-plan",
    "Describe a rust investigation",
    "Describe how to compare wet air, dry air and oxygen-excluded water using iron nails. Explain the exclusions, fair comparisons and conclusions.",
  ),
  written(
    "p-flaw",
    "Repair a misleading control",
    "A student puts oil over ordinary water and compares a rusty iron nail with a clean steel nail. Explain two problems and how to repair the comparison.",
    "Oil over ordinary water does not remove oxygen already dissolved. Remove dissolved oxygen using a suitable school-supervised preparation and prevent its return. Different nail composition and initial rust confound the comparison: use comparable clean uncoated iron nails, exposed areas, temperature and duration. Include a wet-air positive comparison and genuinely dry air; repeat and record rust observations.",
    [
      "Oil does not remove existing dissolved oxygen; specify removal and prevention of return.",
      "Use matched clean uncoated iron nails rather than different composition/pre-existing rust.",
      "Keep exposed area, temperature and duration comparable; include wet-air/dry-air controls and repeat observations.",
    ],
  ),
];
export const rustDesignCheck = [
  written(
    "c-plan",
    "Describe an investigation",
    "Describe an investigation to show whether both water and oxygen are needed for iron to rust. Explain how you maintain the conditions and interpret the comparisons.",
  ),
  written(
    "c-oil",
    "Evaluate an oxygen exclusion",
    "A nail rusts in unboiled water beneath oil. Does this show that oxygen is unnecessary? Explain the control problem and a suitable comparison.",
    "No. Ordinary water can contain dissolved oxygen; an oil layer prevents entry but does not remove oxygen already present. Remove dissolved oxygen using a suitable school-supervised preparation and prevent it returning. Use a matched nail with water and air as the positive comparison, keeping preparation, temperature and time comparable. Rust in wet air but not the genuinely oxygen-excluded water supports oxygen necessity.",
    [
      "Reject the conclusion because dissolved oxygen may remain.",
      "Distinguish oxygen removal from preventing its return, with a suitable maintained exclusion.",
      "Use a matched wet-air comparison and interpret condition-specific results.",
    ],
  ),
];
export const rustDesignReview = [
  written(
    "v-plan",
    "Retrieve the experiment design",
    "Describe three iron-nail conditions that test whether water and oxygen are needed for rusting. Explain their preparation, fair comparisons and expected results.",
  ),
  written(
    "v-negative",
    "Interpret two unchanged nails",
    "No rust forms on a nail in dry air or a nail in oxygen-excluded water. Explain why another comparison is needed and what its result could establish.",
    "Include a matched clean iron nail with both air and water available. Two unchanged controls alone do not show the nails will rust when both reactants are present. Rust in wet air but not dry air supports water necessity; rust in wet air but not oxygen-excluded water supports oxygen necessity. Keep nail preparation, exposed area, temperature and time comparable, maintain exclusions and repeat observations. Limit conclusions to the tested conditions.",
    [
      "A matched wet-air positive comparison; explain why two no-rust controls are insufficient.",
      "Correct wet/dry and wet/oxygen-excluded pairings and condition-specific conclusions.",
      "Comparable nails/temperature/time, maintained exclusions and repeated observations.",
    ],
  ),
];
