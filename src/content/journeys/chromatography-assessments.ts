import {
  choice as c,
  number as n,
  written as w,
  drawing as d,
  type ChromaTask,
} from "./chromatography-tasks";
// Reserved forms: no model bindings. Original givens belong in the prompts;
// explanations, criteria and references stay hidden until whole-set submission.
export const chromatographyCheckForms: ChromaTask[][] = [
  [
    c(
      "cA-practical",
      "Evaluate an unfamiliar setup",
      "A paper bottom is 4 mm above the base, the sample origin 32 mm high and water level 38 mm high. The origin line uses ink supplied as soluble in water. Which corrections are necessary?",
      "Use pencil and lower the level below 32 mm while keeping paper contact",
      {
        "Use pencil but keep water at 38 mm": "The sample remains immersed.",
        "Lower water to 1 mm and keep the ink line":
          "The paper loses solvent contact and the soluble line remains an error.",
      },
      "The sample must be above the reservoir, the paper must contact it, and the origin line must not travel as a soluble dye.",
      "Check the line and both height constraints.",
    ),
    c(
      "cA-phases",
      "Identify phases from a new solvent",
      "A supplied paper-chromatography run uses ethanol. Which pairing is correct?",
      "Paper stationary; ethanol mobile",
      {
        "Ethanol stationary; paper mobile":
          "The paper stays fixed while ethanol moves.",
        "Sample stationary; beaker mobile":
          "Neither names the supplied separating phase pair.",
      },
      "Paper provides the stationary phase here; moving ethanol is mobile.",
      "Identify the actual phases.",
    ),
    n(
      "cA-distance",
      "Read a centre with an offset origin",
      "The original calibrated record gives origin 18 mm, centre 63 mm and front 108 mm above the paper bottom. What distance has the spot travelled?",
      "45",
      "mm",
      "63 − 18 = 45 mm.",
      "Start at the original origin.",
    ),
    n(
      "cA-rf",
      "Form a ratio from coordinates",
      "Origin is 18 mm, centre 63 mm and front 108 mm above the paper bottom. Calculate Rf.",
      "0.5",
      "",
      "(63 − 18) ÷ (108 − 18) = 45 ÷ 90 = 0.5.",
      "Use two travel distances from the same origin.",
    ),
    n(
      "cA-inverse",
      "Predict travel independently",
      "A supplied Rf is 0.65. The solvent front travels 120 mm from the origin. Find spot travel.",
      "78",
      "mm",
      "0.65 × 120 = 78 mm.",
      "Rearrange the ratio.",
    ),
    {
      ...n(
        "cA-round",
        "Handle unit conversion and precision",
        "The spot travels 25 mm and the solvent front 6 cm. Give Rf to two significant figures.",
        "0.42",
        "",
        "6 cm = 60 mm; 25 ÷ 60 = 0.41666…, which rounds to 0.42.",
        "Convert before calculating and rounding.",
      ),
      rounding: { kind: "significant-figures", digits: 2 },
    },
    c(
      "cA-matches",
      "Interpret original same-condition lanes",
      "An uncontaminated unknown gives centres at 42 and 82 mm. In the same run, P gives 42 mm, Q gives 62 mm and R gives 82 mm. The origin is 22 mm and front 122 mm. Which match is supported among these references?",
      "Components consistent with P and R",
      {
        "A pure Q sample": "The unknown has two spots, neither at Q’s centre.",
        "Components certainly P and Q":
          "The upper unknown spot matches R rather than Q.",
      },
      "Under the same run conditions the supplied positions match P and R. This supports candidate identities, not unique identification among every possible substance.",
      "Compare the supplied centres.",
    ),
    c(
      "cA-purity",
      "Evaluate a single spot",
      "One unknown spot matches two supplied co-eluting references in this solvent. Which conclusion follows?",
      "The evidence cannot distinguish one reference from their unresolved mixture",
      {
        "One spot proves the unknown pure":
          "The two reference compounds could overlap in a mixture.",
        "Neither reference can be present":
          "Both have compatible positions under these conditions.",
      },
      "Co-elution leaves the component identities and purity unresolved.",
      "Retain every alternative consistent with the evidence.",
    ),
    w(
      "cA-mechanism",
      "Explain changed-paper evidence",
      "The same dye and solvent give Rf = 0.35 on paper A and 0.60 on paper B under otherwise controlled conditions. Explain the lower relative travel on A in terms of stationary-phase attraction and time distribution.",
      "The dye is attracted more strongly to the stationary phase on A in this controlled comparison. It spends a greater proportion of time retained there and less being carried by the mobile solvent, producing a smaller relative travel and lower Rf.",
      [
        "State greater stationary attraction/retention on A.",
        "Link it to more time in that phase.",
        "Connect less time carried by the mobile phase to lower relative travel.",
      ],
      "Connect evidence, distribution and movement.",
    ),
    d(
      "cA-drawing",
      "Construct new spot positions",
      "The original paper-bottom origin is 15 mm and front 115 mm. In water on paper, sample A has two supplied soluble resolved components, Rf = 0.20 and 0.70; sample B is one supplied soluble compound, Rf = 0.55. Independently construct the positions and labels.",
      { mode: "chromatogram", record: "plotCheckA" },
      "The front travels 100 mm. A centres are 15+20=35 mm and 15+70=85 mm; B is 15+55=70 mm. Origin 15 mm, front 115 mm; pencil origin, paper stationary and water mobile.",
      [
        "Preserve origin 15 mm and front 115 mm.",
        "Place A centres 35 and 85 mm and B centre 70 mm.",
        "Keep each centre in its supplied sample lane.",
        "Label pencil, stationary paper and mobile water.",
      ],
    ),
  ],
  [
    c(
      "cB-practical",
      "Preserve a correct original line",
      "The original origin line is already pencil. Paper bottom is 6 mm high, origin 26 mm and water level 26 mm. What correction is required?",
      "Lower water below 26 mm while retaining contact with the paper",
      {
        "Replace pencil with soluble ink":
          "The original line is already appropriate.",
        "Lower water below 6 mm":
          "The solvent would no longer reach the paper.",
      },
      "Equality touches the sample; choose a level at least 6 mm and strictly below 26 mm. The pencil line is already correct.",
      "Diagnose only the supplied error.",
    ),
    c(
      "cB-front",
      "Preserve the solvent measurement",
      "A student removes the paper and waits until the front is no longer visible before trying to record it. What should have happened?",
      "Mark the front immediately while visible",
      {
        "Use the paper top as the front":
          "The actual leading solvent boundary may not have reached the top.",
        "Assume the front travelled zero":
          "A lost reading is not a measured zero.",
      },
      "Record the boundary while visible so its travel can later be measured from the origin.",
      "Preserve the denominator evidence.",
    ),
    n(
      "cB-distance",
      "Measure centre rather than edge",
      "The origin is 16 mm above the paper bottom. A spot has centre 70 mm and radius 5 mm. What distance has it travelled?",
      "54",
      "mm",
      "70 − 16 = 54 mm; the upper and lower edges do not measure centre travel.",
      "Use the centre and original start.",
    ),
    n(
      "cB-rf",
      "Use the same origin for both distances",
      "The record gives origin 16 mm, spot centre 70 mm and front 106 mm above the paper bottom. Find Rf.",
      "0.6",
      "",
      "(70 − 16) ÷ (106 − 16) = 54 ÷ 90 = 0.6.",
      "Subtract the offset before dividing.",
    ),
    n(
      "cB-front-distance",
      "Find an unknown front distance",
      "A spot travels 42 mm and its supplied Rf is 0.70. How far has the solvent front travelled?",
      "60",
      "mm",
      "42 ÷ 0.70 = 60 mm.",
      "Rearrange with front distance as the unknown.",
    ),
    {
      ...n(
        "cB-round",
        "Show required trailing zeros",
        "Spot travel is 2.8 cm and front travel 70 mm. Calculate Rf to two decimal places.",
        "0.40",
        "",
        "2.8 cm = 28 mm; 28 ÷ 70 = 0.4, reported as 0.40 to two decimal places.",
        "Both units and reporting precision matter.",
      ),
      rounding: { kind: "decimal-places", digits: 2 },
    },
    c(
      "cB-conditions",
      "Check both phases",
      "The unknown gives Rf = 0.55 on paper U; its reference gives 0.55 on paper V. Solvent and temperature are equal. What is supported?",
      "The changed stationary phase prevents this being a valid same-condition match",
      {
        "A unique identification because the decimals agree":
          "The stationary phase can change retention and Rf.",
        "The unknown is definitely a mixture":
          "A conditions mismatch does not establish mixture composition.",
      },
      "Relevant phase conditions must match for the reference comparison.",
      "Read how the two values were obtained.",
    ),
    n(
      "cB-minimum",
      "Count original resolved spots",
      "The uncontaminated unknown gives four distinct resolved spots in one supplied chromatogram. What is its minimum number of detected components?",
      "4",
      "",
      "Four resolved spots support at least four detected components, with possible unresolved or undetected additional components.",
      "State a minimum, not a complete inventory.",
    ),
    w(
      "cB-mechanism",
      "Explain a controlled two-dye separation",
      "In the same paper and solvent, soluble dye K has Rf = 0.25 and soluble dye L has Rf = 0.80. Explain this difference using their relative distributions between phases.",
      "K is retained more in the stationary phase relative to the mobile phase under these conditions. It spends more of the run there and travels a smaller fraction of the front distance. L spends a greater proportion of time in the moving solvent and is carried farther relative to the front.",
      [
        "Identify stationary and mobile phases.",
        "Link K’s lower relative travel with more stationary retention.",
        "Link phase-time distribution to the difference in movement.",
      ],
      "Explain relative movement rather than colour, size or boiling point.",
    ),
    d(
      "cB-drawing",
      "Correct a new apparatus proposal",
      "The supplied fixed paper bottom is 5 mm high and sample origin 35 mm. Original water level is 42 mm and the original baseline ink is soluble in water. Independently propose the full corrected setup and recording method.",
      { mode: "setup", record: "setupCheckB" },
      "Choose a solvent level at least 5 mm and strictly below 35 mm, for example 15 mm. Replace soluble ink with pencil. Paper is stationary and water mobile. Use small separate spots with clean applicators and mark the front while still visible.",
      [
        "Keep the supplied paper and origin fixed.",
        "Contact paper while keeping origin above the reservoir.",
        "Use pencil and identify paper/water phases.",
        "Use clean small spots and mark the visible front.",
      ],
    ),
  ],
];
export const chromatographyReviewForms: ChromaTask[][] = [
  [
    {
      ...n(
        "vA-ratio",
        "Retrieve an offset calculation",
        "Origin 24 mm; centre 72 mm; front 104 mm above the paper bottom. Calculate Rf to two decimal places.",
        "0.60",
        "",
        "(72−24) ÷ (104−24) = 48 ÷ 80 = 0.60 to two decimal places.",
        "Measure from the same origin.",
      ),
      rounding: { kind: "decimal-places", digits: 2 },
    },
    c(
      "vA-coelution",
      "Retrieve an evidence limit",
      "An unknown and two references share one visible position under the same conditions. What remains possible?",
      "Either reference alone or an unresolved mixture",
      {
        "Only the first reference can be present":
          "Both supplied references share that position.",
        "No components are detectable": "A spot was detected.",
      },
      "A shared position does not resolve the alternatives or establish purity.",
      "Keep compatible alternatives open.",
    ),
    w(
      "vA-mechanism",
      "Retrieve a causal explanation",
      "Explain why a soluble dye retained more in the stationary phase travels less relative to the solvent front under controlled conditions.",
      "It spends a greater proportion of time in the stationary phase and less in the moving solvent. It is therefore carried a smaller fraction of the front distance and gives a lower Rf.",
      [
        "Identify the two phases.",
        "Link greater stationary retention to more time there.",
        "Connect less mobile-phase time with smaller relative travel.",
      ],
      "Explain the intermediate step as well as the result.",
    ),
    d(
      "vA-drawing",
      "Construct a fresh delayed plot",
      "Origin is 20 mm and front 100 mm above the paper bottom. On paper in water, A has two supplied soluble resolved components with Rf = 0.30 and 0.80. B is one supplied soluble compound with Rf = 0.45. Construct the positions and labels.",
      { mode: "chromatogram", record: "plotReviewA" },
      "Front travel is 80 mm. A centres are 20+24=44 and 20+64=84 mm; B centre is 20+36=56 mm. Origin 20, front 100 mm; pencil origin, paper stationary and water mobile.",
      [
        "Keep the 20 mm origin and 100 mm front.",
        "Place centres 44, 84 and 56 mm in the correct lanes.",
        "Use pencil and label both phases.",
      ],
    ),
  ],
  [
    n(
      "vB-inverse",
      "Retrieve inverse distance",
      "The supplied Rf is 0.48 and front travel 125 mm. Find spot travel from the origin.",
      "60",
      "mm",
      "0.48 × 125 = 60 mm.",
      "Rearrange the defining ratio.",
    ),
    c(
      "vB-amount",
      "Retrieve amount versus ratio",
      "The same dilute dye is loaded in a different amount below overload, while paper, solvent and temperature stay fixed. What is expected?",
      "Its Rf remains the same, although spot strength may change",
      {
        "Its Rf must equal its mass fraction":
          "Rf compares distances, not amounts.",
        "Its molecular identity changes with amount":
          "Changing amount does not itself change the compound.",
      },
      "Under these stated controlled dilute conditions, changing amount does not change the dye’s relative travel.",
      "Distinguish intensity from travel ratio.",
    ),
    w(
      "vB-conditions",
      "Explain a confounded comparison",
      "A dye runs on paper A in water and paper B in ethanol. Explain why the different Rf values cannot isolate the effect of paper.",
      "Both stationary and mobile phases changed. Either or both can alter relative distribution and travel. A controlled paper comparison would keep the solvent and other relevant conditions the same while changing paper alone.",
      [
        "Identify both changed phases.",
        "Explain their possible influence on relative distribution/travel.",
        "Specify how to control the comparison.",
      ],
      "Separate reading a difference from attributing its cause.",
    ),
    d(
      "vB-drawing",
      "Repair only the actual delayed error",
      "The original baseline is already pencil. Paper bottom is 4 mm high, sample origin 22 mm and water level 22 mm. Propose a valid level and complete phase, handling and front-recording labels.",
      { mode: "setup", record: "setupReviewB" },
      "Choose a level at least 4 mm and strictly below 22 mm, for example 10 mm. Keep pencil. Paper is stationary and water mobile. Use small separate spots and clean applicators, and mark the solvent front while visible.",
      [
        "Contact the paper while keeping the sample above the level.",
        "Preserve the correct pencil line rather than inventing an ink error.",
        "Label paper/water and choose clean spotting and visible-front recording.",
      ],
    ),
  ],
];

// Original evidence is visible during independent work; worked references are not.
const givenBindings: Record<string, string> = {
  "cA-distance": "coldAmeasurement",
  "cA-rf": "coldAmeasurement",
  "cA-matches": "coldAreferences",
  "cA-purity": "coldAoverlap",
  "cB-distance": "coldBmeasurement",
  "cB-rf": "coldBmeasurement",
  "cB-minimum": "coldBcount",
  "vA-ratio": "reviewAmeasurement",
};
for (const [suffix, record] of Object.entries(givenBindings)) {
  const task = [
    ...chromatographyCheckForms.flat(),
    ...chromatographyReviewForms.flat(),
  ].find((t) => t.id === "chromatography-v1-" + suffix);
  if (!task) throw Error("Missing original evidence destination");
  task.chromatographyGiven = { record };
}
