import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";
const mixture = (
  masses: [number, number],
  initialPercent: number,
  targetPercent: number,
): TaskModel => ({
  kind: "isotope-mixture",
  masses,
  initialPercent,
  targetPercent,
  instruction: `Set mass-${masses[0]} atoms to ${targetPercent}%. Compare each isotope's contribution.`,
});
const rounded = (
  task: LearningTask,
  kind: "decimal-places" | "significant-figures",
  digits: number,
  answer: string,
): LearningTask => ({
  ...task,
  answer,
  rounding: { kind, digits },
  tolerance: 0,
});
export const relativeAtomicMassJourney: LessonJourney = {
  version: 1,
  introduction:
    "Relative atomic mass is a weighted average: common isotopes contribute more than rare ones. Build the mixture, calculate its average and check the required rounding.",
  outcomes: [
    "Calculate relative atomic mass from supplied isotope masses and percentage abundances.",
    "Use atom counts or three-isotope data, include every isotope and round only at the end.",
    "Explain why a weighted average may be non-integer without giving any atom a fractional neutron; distinguish mass number from relative atomic mass.",
  ],
  scopeNote:
    "Relative atomic mass has no unit: it compares the average atomic mass with one twelfth of a carbon-12 atom's mass. Reviewed GCSE calculations use supplied mass numbers as approximate relative isotope masses. These classroom mixtures are provided examples, not claimed exact natural compositions. Formula mass is a subsequent lesson.",
  warmup: [
    c(
      "ram-v1-w-isotope",
      "Two atoms are isotopes of the same element. Which quantity differs?",
      "Number of neutrons",
      {
        "Number of protons":
          "Different proton numbers mean different elements.",
        "Every particle count must differ":
          "Isotopes differ in neutrons, not necessarily electrons.",
      },
      "Isotopes have the same proton number but different neutron numbers and mass numbers.",
      "Retrieve the isotope comparison.",
      "Checks the isotope prerequisite before averaging masses.",
    ),
    n(
      "ram-v1-w-complement",
      "A two-isotope sample contains 75% of isotope A. What percentage is isotope B?",
      25,
      "%",
      "100 − 75 = 25%.",
      "The two percentages must total 100.",
      "Checks complementary percentage abundance.",
    ),
    n(
      "ram-v1-w-mean",
      "Two equally frequent values are 10 and 14. What is their mean?",
      12,
      "",
      "(10 + 14) ÷ 2 = 12. Equal weighting is appropriate here because their frequencies are equal.",
      "Add the values and divide by two.",
      "Establishes the special equal-abundance case before correcting unequal averaging.",
    ),
  ],
  refresher: [
    rounded(
      n(
        "ram-v1-r-significant",
        "Round 31.042 to 3 significant figures.",
        31,
        "",
        "31.042 rounds to 31.0; the zero is the third significant figure.",
        "Count from the first non-zero digit and retain the precision zero.",
        "Repairs significant-figure rounding separately from decimal places.",
      ),
      "significant-figures",
      3,
      "31.0",
    ),
    c(
      "ram-v1-r-weight",
      "A sample contains many more light-isotope atoms than heavy-isotope atoms. Where should its average lie?",
      "Closer to the light isotope's mass",
      {
        "Exactly halfway regardless of abundance":
          "Halfway is justified only by equal abundance.",
        "Above the heavy isotope's mass":
          "A positive weighted average lies between the supplied masses.",
      },
      "Each atom contributes. More light atoms pull the average toward the light mass.",
      "Think about which isotope contributes most atoms.",
      "Repairs equal averaging and range misconceptions.",
    ),
    n(
      "ram-v1-r-percent",
      "A two-isotope sample has 35% of isotope A. Find isotope B's percentage.",
      65,
      "%",
      "100 − 35 = 65%.",
      "Complete the total to 100.",
      "Repairs missing percentage with a new value.",
    ),
    n(
      "ram-v1-r-product",
      "For 100 atoms, 40 have mass number 22. What is 22 × 40, their contribution to the total?",
      880,
      "",
      "22 × 40 = 880. Divide the total of all contributions by the total number of atoms later.",
      "Multiply mass by the number of atoms represented.",
      "Repairs the multiplication step before dividing.",
    ),
    rounded(
      n(
        "ram-v1-r-round",
        "Round 36.584 to 1 decimal place.",
        36.6,
        "",
        "The second decimal digit is 8, so 36.584 rounds to 36.6.",
        "Keep the tenths; use the next digit to decide.",
        "Repairs final decimal-place rounding.",
      ),
      "decimal-places",
      1,
      "36.6",
    ),
    c(
      "ram-v1-r-meaning",
      "Does a relative atomic mass of 10.8 mean every atom has 10.8 protons and neutrons in total?",
      "No: it is an average across different isotopes",
      {
        "Yes: every atom has a fractional neutron":
          "Neutron and proton counts are whole numbers.",
        "Yes: all mass numbers are decimals":
          "Mass number counts protons plus neutrons and is a whole number.",
      },
      "An average may be non-integer even when every isotope's mass number is a whole number.",
      "Separate a population average from the count in one atom.",
      "Repairs fractional-neutron and mass-number confusion.",
    ),
    c(
      "ram-v1-r-units",
      "Relative atomic mass compares masses as a ratio. Which unit should you attach?",
      "No unit",
      {
        Grams: "Grams measure an actual mass, not this relative ratio.",
        Neutrons: "Relative atomic mass is not a neutron count.",
      },
      "Relative atomic mass is a ratio to one twelfth of carbon-12's atomic mass and has no unit.",
      "A ratio of masses in the same units cancels the units.",
      "Repairs confusion between relative mass and mass in grams.",
    ),
  ],
  guided: [
    {
      ...n(
        "ram-v1-g-light",
        "Mass-35 atoms make up 75%; mass-37 atoms make up 25%. Find Aᵣ.",
        35.5,
        "",
        "(35 × 75 + 37 × 25) ÷ 100 = (2625 + 925) ÷ 100 = 35.5.",
        "Weight each mass by its abundance, add both contributions, then divide by 100.",
        "Introduces weighted averaging through an editable supplied mixture.",
        {
          "36": "That is an unweighted mean, appropriate only for equal abundances.",
          "3550":
            "That is the total contribution for 100 atoms; divide by 100.",
        },
        mixture([35, 37], 50, 75),
      ),
      title: "Weight the two isotopes",
      openingHint: true,
    },
    {
      ...n(
        "ram-v1-g-heavy",
        "Reverse the mixture: mass-35 is 25% and mass-37 is 75%. Find Aᵣ.",
        36.5,
        "",
        "(35 × 25 + 37 × 75) ÷ 100 = 36.5. The average moves toward the now-more-abundant heavier isotope.",
        "The isotope masses stay fixed; only abundance changes.",
        "Separates abundance effects from isotope identity and predicts movement of the mean.",
        {
          "35.5": "That belongs to the previous, lighter-rich mixture.",
          "36": "Unequal abundance does not give the halfway mean.",
        },
        mixture([35, 37], 75, 25),
      ),
      title: "Change abundance, keep masses",
    },
    {
      ...n(
        "ram-v1-g-transfer",
        "A supplied sample has mass-63 atoms at 40% and mass-65 atoms at 60%. Find Aᵣ.",
        64.2,
        "",
        "(63 × 40 + 65 × 60) ÷ 100 = 64.2. It lies closer to 65 because the heavier isotope is more abundant.",
        "Use both products and divide their sum by 100.",
        "Fades support and transfers the method to new supplied masses.",
        {
          "64": "That ignores the unequal percentages.",
          "6420": "Divide the contribution total by 100.",
        },
        mixture([63, 65], 50, 40),
      ),
      title: "Transfer to a new pair",
    },
  ],
  practice: [
    n(
      "ram-v1-p-two",
      "A sample contains mass-20 atoms at 80% and mass-22 atoms at 20%. Calculate Aᵣ.",
      20.4,
      "",
      "(20 × 80 + 22 × 20) ÷ 100 = 20.4.",
      "Multiply each mass by its percentage; include both isotopes.",
      "Independent two-isotope calculation with different masses.",
      { "21": "The abundances are unequal, so the unweighted mean is wrong." },
    ),
    n(
      "ram-v1-p-missing",
      "A sample has only mass-35 and mass-37 atoms. Mass-35 accounts for 60%. Calculate Aᵣ.",
      35.8,
      "",
      "Mass-37 is 40%. (35 × 60 + 37 × 40) ÷ 100 = 35.8.",
      "Find the missing abundance before weighting.",
      "Requires completing a percentage table before calculating.",
    ),
    n(
      "ram-v1-p-counts",
      "A supplied ten-atom sample contains seven mass-14 atoms and three mass-15 atoms. Calculate its relative average mass.",
      14.3,
      "",
      "(14 × 7 + 15 × 3) ÷ 10 = 14.3. Divide by ten atoms, not 100 when using these counts.",
      "Weight by the given counts and divide by their total.",
      "Transfers the percentage formula to actual atom-count frequencies.",
      {
        "1.43": "These are ten atoms, not percentage values; divide by 10.",
        "14.5": "The isotope counts are unequal.",
      },
    ),
    n(
      "ram-v1-p-three",
      "A supplied sample has mass-24 atoms at 70%, mass-25 at 20% and mass-26 at 10%. Calculate Aᵣ.",
      24.4,
      "",
      "(24 × 70 + 25 × 20 + 26 × 10) ÷ 100 = 24.4.",
      "Include all three contributions; the percentages total 100.",
      "Transfers weighting to three isotopes without dropping the middle one.",
    ),
    rounded(
      n(
        "ram-v1-p-dp",
        "Mass-63 atoms are 68.3%; mass-65 are 31.7%. Calculate Aᵣ to 1 decimal place.",
        63.6,
        "",
        "(63 × 68.3 + 65 × 31.7) ÷ 100 = 63.634, which rounds to 63.6.",
        "Keep the unrounded value until the final rounding step.",
        "Matches the actual assessment demand of decimal abundance and final rounding.",
        { "63.634": "That is the unrounded value; give one decimal place." },
      ),
      "decimal-places",
      1,
      "63.6",
    ),
    rounded(
      n(
        "ram-v1-p-sf",
        "A supplied sample has mass-24 atoms at 99% and mass-25 at 1%. Find Aᵣ to 3 significant figures.",
        24,
        "",
        "(24 × 99 + 25 × 1) ÷ 100 = 24.01. To three significant figures this is 24.0; the zero records the precision.",
        "Round only at the end and keep the required trailing zero.",
        "Distinguishes a correct value from the requested significant-figure representation.",
      ),
      "significant-figures",
      3,
      "24.0",
    ),
    {
      ...n(
        "ram-v1-p-explain",
        "A pupil says: 'Aᵣ = 35.5 means every atom has half a neutron.' Explain why this is wrong.",
        0,
        "",
        "35.5 is an average across an isotope mixture. Individual atoms have whole proton/neutron counts and whole mass numbers; no atom gains half a neutron.",
        "Compare the average of many atoms with the mass number of one atom.",
        "Requires an exam-style correction of the fractional-neutron misconception.",
      ),
      answer:
        "Relative atomic mass is a weighted average across isotopes of different masses. Each atom has whole proton and neutron counts; an average of 35.5 does not mean any atom has half a neutron.",
      rubric: [
        "Different isotopes have the same proton number but different neutron numbers and masses.",
        "Relative atomic mass is an abundance-weighted average across the sample, not the mass number of an individual atom.",
        "Individual proton/neutron counts are whole numbers; there is no fractional neutron.",
      ],
    },
    c(
      "ram-v1-p-units",
      "Why is no unit written after relative atomic mass?",
      "It is a mass ratio relative to one twelfth of a carbon-12 atom's mass",
      {
        "Because every atom has zero actual mass":
          "Actual atoms have small, positive masses.",
        "Because it counts neutrons only":
          "It is an average mass ratio, not a neutron count.",
      },
      "The reference and average masses have the same units, so their ratio is dimensionless.",
      "Compare a mass ratio with an actual mass measured in grams.",
      "Connects the relative-mass definition to unit cancellation.",
    ),
    {
      id: "ram-v1-p-working",
      prompt:
        "A sample has mass-54 atoms at 90% and mass-56 at 10%. Complete both contributions and the weighted average, correcting the unweighted answer 55.",
      answer: JSON.stringify({ light: "4860", heavy: "560", mean: "54.2" }),
      partLegend: "Complete the weighted calculation",
      parts: [
        { id: "light", label: "54 × 90 contribution", answer: 4860 },
        { id: "heavy", label: "56 × 10 contribution", answer: 560 },
        {
          id: "mean",
          label: "Weighted average",
          answer: 54.2,
          inputMode: "decimal",
        },
      ],
      explanation:
        "4860 + 560 = 5420; divide by 100 to get 54.2. The abundant mass-54 isotope pulls the mean below 55.",
      hint: "Calculate each product, add them and divide by 100.",
      purpose:
        "Makes working visible and distinguishes a method error from the final answer.",
    },
    c(
      "ram-v1-p-bound",
      "Two supplied isotope masses are 10 and 11. A calculation gives Aᵣ = 12. What should you conclude?",
      "The calculation is inconsistent: a positive weighted mean must lie between 10 and 11",
      {
        "The rare isotope must have gained extra neutrons during averaging":
          "Averaging does not change the isotope masses.",
        "Any average above both values is acceptable":
          "The mean cannot exceed every value with non-negative weights.",
      },
      "A weighted mean lies within the supplied range and closer to the more abundant mass. Use this to check arithmetic.",
      "Compare the result with the lowest and highest supplied masses.",
      "Requires plausibility checking rather than blind substitution.",
    ),
  ],
  checkForms: [
    [
      n(
        "ram-v1-ca-two",
        "Mass-10 atoms are 30% and mass-11 atoms are 70%. Calculate Aᵣ.",
        10.7,
        "",
        "(10 × 30 + 11 × 70) ÷ 100 = 10.7.",
        "Use both percentage-weighted contributions.",
        "Reserved weighted calculation with new abundances.",
      ),
      n(
        "ram-v1-ca-three",
        "Masses 16, 17 and 18 have supplied abundances 80%, 5% and 15%. Calculate Aᵣ.",
        16.35,
        "",
        "(16 × 80 + 17 × 5 + 18 × 15) ÷ 100 = 16.35.",
        "Include each of the three isotopes.",
        "Reserved transfer to three-isotope data.",
      ),
      rounded(
        n(
          "ram-v1-ca-round",
          "A supplied sample has mass-58 atoms at 73.4% and mass-60 at 26.6%. Find Aᵣ to 1 decimal place.",
          58.5,
          "",
          "The unrounded value is 58.532; to one decimal place it is 58.5.",
          "Round after calculating the full weighted average.",
          "Reserved decimal abundance and rounding.",
        ),
        "decimal-places",
        1,
        "58.5",
      ),
      c(
        "ram-v1-ca-meaning",
        "Why can Aᵣ be non-integer when isotope mass numbers are whole numbers?",
        "It is an abundance-weighted average across different isotopes",
        {
          "Every atom contains a fractional neutron":
            "Individual neutron counts are whole numbers.",
          "Atomic number becomes fractional":
            "Proton counts and atomic numbers remain whole.",
        },
        "Averages can be fractional even when individual counts are whole.",
        "Separate the sample average from a single atom.",
        "Reserved isotope/average explanation recognition.",
      ),
    ],
    [
      n(
        "ram-v1-cb-missing",
        "A sample has only mass-28 and mass-30 atoms; mass-28 is 85%. Find Aᵣ.",
        28.3,
        "",
        "Mass-30 is 15%; (28 × 85 + 30 × 15) ÷ 100 = 28.3.",
        "Find the missing percentage first.",
        "Alternate reserved complement plus weighted calculation.",
      ),
      n(
        "ram-v1-cb-count",
        "Twelve supplied atoms consist of nine mass-40 atoms and three mass-42 atoms. Find their relative average mass.",
        40.5,
        "",
        "(40 × 9 + 42 × 3) ÷ 12 = 40.5.",
        "Divide by the total atom count, not 100.",
        "Alternate reserved count-frequency transfer.",
      ),
      rounded(
        n(
          "ram-v1-cb-round",
          "A supplied sample has mass-12 at 96% and mass-13 at 4%. Calculate Aᵣ to 3 significant figures.",
          12,
          "",
          "12.04 rounds to 12.0 to three significant figures.",
          "Retain the final zero required by the precision.",
          "Alternate reserved significant-figure representation.",
        ),
        "significant-figures",
        3,
        "12.0",
      ),
      c(
        "ram-v1-cb-check",
        "Mass-50 atoms are much more abundant than mass-52 atoms. Which result is plausible?",
        "An average between 50 and 52, closer to 50",
        {
          "An average above 52": "It must lie within the supplied range.",
          "Exactly 51 regardless of abundance":
            "Halfway requires equal abundance.",
        },
        "The positive weighted mean lies inside the range and is pulled toward the more common isotope.",
        "Check the range and the majority isotope.",
        "Alternate reserved plausibility and abundance reasoning.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ram-v1-ra-two",
        "A supplied sample contains 65% mass-20 and 35% mass-22 atoms. Find Aᵣ.",
        20.7,
        "",
        "(20 × 65 + 22 × 35) ÷ 100 = 20.7.",
        "Retrieve the weighted-average calculation.",
        "Delayed two-isotope calculation.",
      ),
      rounded(
        n(
          "ram-v1-ra-round",
          "Round a calculated relative atomic mass of 47.286 to 1 decimal place.",
          47.3,
          "",
          "47.286 rounds to 47.3.",
          "Use the next digit after the retained place.",
          "Delayed rounding retrieval.",
        ),
        "decimal-places",
        1,
        "47.3",
      ),
      c(
        "ram-v1-ra-unit",
        "Which describes relative atomic mass correctly?",
        "A weighted mass ratio with no unit",
        {
          "A neutron count in grams":
            "It is neither a neutron count nor a mass in grams.",
          "The mass number of every atom": "It averages across isotope masses.",
        },
        "It is a ratio and averages using isotope abundance.",
        "Retrieve the meaning of relative.",
        "Delayed definition and unit distinction.",
      ),
    ],
    [
      n(
        "ram-v1-rb-three",
        "Supplied masses 24, 25 and 26 have abundances 60%, 30% and 10%. Calculate Aᵣ.",
        24.5,
        "",
        "(24 × 60 + 25 × 30 + 26 × 10) ÷ 100 = 24.5.",
        "Include all three contributions.",
        "Alternate delayed three-isotope transfer.",
      ),
      n(
        "ram-v1-rb-counts",
        "Of twenty supplied atoms, sixteen have mass 54 and four have mass 56. Calculate the relative average mass.",
        54.4,
        "",
        "(54 × 16 + 56 × 4) ÷ 20 = 54.4.",
        "Divide the weighted total by twenty atoms.",
        "Alternate delayed frequency weighting.",
      ),
      c(
        "ram-v1-rb-half",
        "Does a non-integer relative atomic mass prove that individual atoms have fractional mass numbers?",
        "No: it averages a mixture whose atoms have whole mass numbers",
        {
          "Yes: every atom has half a proton": "Proton counts remain whole.",
          "Yes: averaging changes the nuclear composition":
            "A calculation does not change any nucleus.",
        },
        "A non-integer average is compatible with whole-number nuclear particle counts.",
        "Distinguish population average and individual atom.",
        "Alternate delayed interpretation of fractional averages.",
      ),
    ],
  ],
};
for (const task of [
  ...relativeAtomicMassJourney.guided,
  ...relativeAtomicMassJourney.practice,
])
  task.followUp = task.id.includes("sf")
    ? "ram-v1-r-significant"
    : task.id.includes("dp")
      ? "ram-v1-r-round"
      : task.id.includes("missing")
        ? "ram-v1-r-percent"
        : task.id.includes("explain")
          ? "ram-v1-r-meaning"
          : task.id.includes("units")
            ? "ram-v1-r-units"
            : task.id.includes("working")
              ? "ram-v1-r-product"
              : "ram-v1-r-weight";

// Individually selected original tables: these present data, never calculated answers.
relativeAtomicMassJourney.practice[2].isotopeData = [
  { mass: 14, abundance: 7 },
  { mass: 15, abundance: 3 },
];
relativeAtomicMassJourney.practice[2].abundanceKind = "count";
relativeAtomicMassJourney.practice[3].isotopeData = [
  { mass: 24, abundance: 70 },
  { mass: 25, abundance: 20 },
  { mass: 26, abundance: 10 },
];
relativeAtomicMassJourney.practice[4].isotopeData = [
  { mass: 63, abundance: 68.3 },
  { mass: 65, abundance: 31.7 },
];
relativeAtomicMassJourney.checkForms[0][1].isotopeData = [
  { mass: 16, abundance: 80 },
  { mass: 17, abundance: 5 },
  { mass: 18, abundance: 15 },
];
relativeAtomicMassJourney.checkForms[1][1].isotopeData = [
  { mass: 40, abundance: 9 },
  { mass: 42, abundance: 3 },
];
relativeAtomicMassJourney.checkForms[1][1].abundanceKind = "count";

relativeAtomicMassJourney.practice[2].title = "Average a counted sample";
relativeAtomicMassJourney.practice[2].prompt =
  "Use the supplied atom counts to calculate the sample's relative average mass.";
relativeAtomicMassJourney.practice[3].title = "Include every isotope";
relativeAtomicMassJourney.practice[3].prompt =
  "Calculate Aᵣ for the supplied three-isotope sample.";
relativeAtomicMassJourney.practice[4].title = "Round at the end";
relativeAtomicMassJourney.practice[4].prompt =
  "Calculate Aᵣ for the supplied sample to 1 decimal place.";
relativeAtomicMassJourney.checkForms[0][1].prompt =
  "Use the supplied table to calculate Aᵣ for this sample.";
relativeAtomicMassJourney.checkForms[1][1].prompt =
  "Use the supplied atom counts to calculate this sample's relative average mass.";
