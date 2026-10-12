import type { LearningTask } from "../types";
import type { WaterGiven } from "../../lib/water";

// RP8 (8462) / RP13 (8464): compare different sources. All data are original
// exercises, not drinking-water certification or instructions for home experiments.
const id = (suffix: string) => `water-v1-sources-${suffix}`;
type Sample = readonly [
  name: string,
  ph: number,
  residue: number,
  volume: number,
];
export const sourceSets = {
  taught: [
    ["Rain", 6, 0.01, 10],
    ["Borehole", 7.5, 0.02, 10],
    ["Coastal", 7, 0.35, 10],
  ],
  practice: [
    ["Pond P", 5.5, 0.03, 10],
    ["Stream Q", 8, 0.05, 25],
  ],
  checkC: [
    ["Lake D", 6.8, 0.1, 50],
    ["Well E", 7.6, 0.06, 20],
  ],
  checkD: [
    ["River X", 7.3, 0.04, 20],
    ["Spring Y", 8.2, 0.15, 50],
  ],
  reviewC: [
    ["Reservoir M", 5.8, 0.02, 10],
    ["Spring N", 7.1, 0.03, 30],
  ],
  reviewD: [
    ["Stream U", 6.1, 0.12, 40],
    ["Lake V", 6.6, 0.1, 20],
  ],
} as const satisfies Record<string, readonly Sample[]>;
function given(samples: readonly Sample[]): WaterGiven {
  return {
    title: "Original source measurements",
    note: "Exercise readings at 25 °C. Filtered samples; stable dry cooled residue after dish subtraction. No drinking-water safety test is supplied.",
    rows: samples.map(([name, ph, residue, volume]) => ({
      label: name,
      text: `pH ${ph.toFixed(1)}; ${residue.toFixed(2)} g residue from ${volume} cm³`,
    })),
  };
}
function choice(
  suffix: string,
  samples: readonly Sample[],
  answer: string,
  prompt: string,
): LearningTask {
  const options = samples.map(([name]) => name);
  return {
    id: id(suffix),
    title: "Compare source pH",
    purpose: "Interpret pH measurements from different water sources",
    conciseHeading: true,
    prompt,
    answer,
    options,
    waterGiven: given(samples),
    explanation: `${answer} is the source identified by the requested pH comparison. At 25 °C pH below 7 is acidic, 7 is neutral and above 7 is alkaline. Residue mass measures another property; neutral pH alone does not establish purity or potability.`,
    hint: "Read the pH values, not the residue masses. Lower pH means more acidic.",
  };
}
function concentrations(
  suffix: string,
  samples: readonly Sample[],
  answers: readonly number[],
): LearningTask {
  return {
    id: id(suffix),
    title: "Compare sources",
    purpose: "Compare source concentrations using measured sample volumes",
    conciseHeading: true,
    prompt: `Calculate g/dm³ for ${samples.map(([name]) => name).join(" and ")}.`,
    answer: JSON.stringify(
      Object.fromEntries(answers.map((v, i) => [`s${i}`, String(v)])),
    ),
    parts: samples.map(([name], i) => ({
      id: `s${i}`,
      label: `${name} / g per dm³`,
      answer: answers[i],
      inputMode: "decimal",
    })),
    partLegend: "Source concentrations",
    waterGiven: given(samples),
    explanation:
      samples
        .map(
          ([name, , mass, volume], i) =>
            `${name}: ${mass.toFixed(2)} ÷ ${(volume / 1000).toFixed(3)} = ${answers[i]} g/dm³.`,
        )
        .join(" ") +
      " Different sample volumes must be normalised; pH does not determine dissolved-solid concentration. These measurements do not establish microbiological safety.",
    hint: "Divide dry residue mass by the sampled volume in dm³.",
  };
}
export const potableSourceRefresher = [
  choice(
    "r-ph",
    sourceSets.taught,
    "Rain",
    "Which source has the lowest pH? Use the supplied source readings.",
  ),
];
potableSourceRefresher.push({
  id: id("r-solids"),
  title: "Compare equal volumes",
  purpose: "Repair a raw-residue ranking using measured sample volumes",
  conciseHeading: true,
  prompt:
    "Pond P and Stream Q were sampled using different volumes. What must you compare?",
  answer: "Dry residue mass per dm³",
  options: [
    "Dry residue mass per dm³",
    "Raw residue masses only",
    "pH values only",
  ],
  waterGiven: given(sourceSets.practice),
  explanation:
    "Pond P: 0.03 g in 0.010 dm³ gives 3 g/dm³. Stream Q: 0.05 g in 0.025 dm³ gives 2 g/dm³. The larger raw residue came from the larger sample, so it need not mean a higher concentration. pH measures another property. Return to your retained answer and compare equal-volume concentrations.",
  hint: "Divide residue mass by the sample volume in dm³ before comparing sources.",
});
export const potableSourceGuided = [
  concentrations("g-solids", sourceSets.taught, [1, 2, 35]),
];
export const potableSourcePractice = [
  choice(
    "p-ph",
    sourceSets.practice,
    "Pond P",
    "Which source is acidic at 25 °C? Use the pH readings.",
  ),
  concentrations("p-solids", sourceSets.practice, [3, 2]),
];
export const potableSourceChecks = [
  [
    choice(
      "cC-ph",
      sourceSets.checkC,
      "Lake D",
      "Which source is more acidic?",
    ),
    concentrations("cC-solids", sourceSets.checkC, [2, 3]),
  ],
  [
    choice(
      "cD-ph",
      sourceSets.checkD,
      "Spring Y",
      "Which source is more alkaline at 25 °C?",
    ),
    concentrations("cD-solids", sourceSets.checkD, [2, 3]),
  ],
];
export const potableSourceReviews = [
  [
    choice(
      "vC-ph",
      sourceSets.reviewC,
      "Reservoir M",
      "Which source has the lower pH?",
    ),
    concentrations("vC-solids", sourceSets.reviewC, [2, 1]),
  ],
  [
    choice(
      "vD-ph",
      sourceSets.reviewD,
      "Stream U",
      "Which source is more acidic?",
    ),
    concentrations("vD-solids", sourceSets.reviewD, [3, 5]),
  ],
];
// Equivalent comparisons never become fresh merely because names/data change or
// seven days elapse. A cold unopened form can still supply independent evidence.
const all = [
  ...potableSourceRefresher,
  ...potableSourceGuided,
  ...potableSourcePractice,
  ...potableSourceChecks.flat(),
  ...potableSourceReviews.flat(),
];
// Existing residue/repeat models and constructed calculations teach the same
// normalisation. Reading those equivalents must also retire fresh source evidence.
const priorSolids = [
  "r-dish10",
  "g-residue",
  "r-dish25",
  "r-dish50",
  "r-dish100",
  "r-repeat50",
  "g-repeat",
  "r-repeat25",
  "r-repeat10",
  "p-residue",
  "p-dilute",
  "p-repeat",
  "cA-residue",
  "cB-residue",
  "vA-residue",
].map((suffix) => `water-v1-${suffix}`);
for (const numeric of [false, true]) {
  const family = all.filter(
    (q) => (Boolean(q.parts) || q.id === id("r-solids")) === numeric,
  );
  for (const q of family)
    q.exposureAliases = [
      ...family.filter((o) => o.id !== q.id).map((o) => o.id),
      ...(numeric ? priorSolids : []),
    ];
}
for (const q of potableSourcePractice)
  q.followUp = q.parts
    ? potableSourceRefresher[1].id
    : potableSourceRefresher[0].id;
