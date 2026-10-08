import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask {
  return {
    ...choice(
      `pc-v1-${id}`,
      prompt,
      answer,
      errors,
      explanation,
      hint,
      title,
      model,
    ),
    title,
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  dp?: number,
): LearningTask {
  const q = {
    ...number(`pc-v1-${id}`, prompt, answer, unit, explanation, hint, title),
    title,
  };
  return dp === undefined
    ? q
    : {
        ...q,
        answer: answer.toFixed(dp),
        rounding: { kind: "decimal-places", digits: dp },
      };
}
const guided = [
  c(
    "g-contribution",
    "Choose part and whole",
    "For initial CaCO₃, calculate calcium percentage by mass. Supplied Aᵣ Ca=40, C=12, O=16; Mᵣ=100.",
    "40/100 ×100 =40%",
    {
      "1/5 ×100 =20%": "That compares atom counts, not mass.",
      "40/60 ×100 =66.7%":
        "The denominator must include calcium as well as the other elements.",
    },
    "Calcium contributes 40 to the complete relative formula mass 100. The complete compound is the denominator.",
    "Use element count×Aᵣ over the entire Mᵣ.",
    {
      kind: "percentage-composition",
      mode: "contribution",
      instruction:
        "Predict the named element contribution, complete Mᵣ and mass percentage.",
    },
  ),
  c(
    "g-count-mass",
    "Distinguish atom count and mass",
    "In initial MgO, Mg and O counts are both one. Supplied Aᵣ Mg=24 and O=16. What is magnesium percentage by mass?",
    "24/40 ×100 =60%",
    {
      "1/2 ×100 =50%": "Equal counts do not have equal masses.",
      "24/16 ×100 =150%":
        "The denominator is the whole compound, not oxygen alone.",
    },
    "The mass contribution of Mg is 24 and the total is 40. Counts alone answer a different question.",
    "Compare the two strips and their quantities.",
    {
      kind: "percentage-composition",
      mode: "count-mass",
      instruction:
        "Choose mass or count reasoning and predict the named element’s mass percentage.",
    },
  ),
  c(
    "g-sample",
    "Scale a pure sample",
    "For initial 10 g pure CaCO₃, calcium is 40% by mass. What calcium mass is present?",
    "4 g; calcium remains 40% by mass",
    {
      "40 g; calcium is always 40 g":
        "Forty is a percentage, not a fixed mass.",
      "4 g; the percentage becomes 4%":
        "Grams and percentage are different quantities.",
    },
    "0.40×10 g=4 g. Scaling a pure sample changes part and whole together.",
    "Use the fraction 40/100.",
    {
      kind: "percentage-composition",
      mode: "sample",
      instruction:
        "Change pure sample mass, then predict calcium mass and unchanged mass percentage.",
    },
  ),
  c(
    "g-compare",
    "Compare compounds",
    "For the initial nitrogen comparison, which supplied compound has the highest nitrogen mass percentage? Use C=12,H=1,N=14,O=16,S=32.",
    "Urea: 28/60 ×100 ≈46.7%",
    {
      "All three are equal because each formula has two N":
        "Their complete Mᵣ values differ.",
      "Ammonium sulfate because its formula has more atoms":
        "Use nitrogen contribution divided by the total Mᵣ.",
    },
    "The same N contribution 28 is divided by 60, 80 or 132. Urea has the largest nitrogen fraction; other suitability needs other evidence.",
    "Keep the named element and the complete denominator in view.",
    {
      kind: "percentage-composition",
      mode: "compare",
      instruction:
        "Change the named element and compare mass fractions at equal pure-compound mass.",
    },
  ),
];
guided[0].openingHint = true;
export const compositionJourney: LessonJourney = {
  version: 1,
  introduction:
    "Select the named element’s mass contribution, use the complete compound denominator and distinguish percentage from grams or atom counts.",
  scopeNote:
    "Common Foundation/combined percentage-by-mass calculations from supplied relative masses. Pure-compound composition stays fixed when sample size changes. Supplied mixtures can have different compositions. Empirical formulas, yield and atom economy remain separate later lessons.",
  outcomes: [
    "Calculate named-element contribution over complete Mᵣ and multiply by 100.",
    "Distinguish mass percentage from atom-count percentage.",
    "Scale pure samples and convert mass units while keeping the fraction.",
    "Compare supplied compounds and report appropriate rounded percentages.",
  ],
  warmup: [
    n(
      "w-fraction",
      "Recall a percentage",
      "Convert 3/4 to a percentage.",
      75,
      "%",
      "3/4×100=75%.",
      "Make hundredths or multiply by 100.",
    ),
    n(
      "w-mass",
      "Recall a formula contribution",
      "For CO₂ with C=12 and O=16, what is the complete Mᵣ?",
      44,
      "",
      "12+2×16=44.",
      "Include both oxygen atoms.",
    ),
  ],
  refresher: [
    c(
      "r-numerator",
      "Use every named atom",
      "For nitrogen in NH₄NO₃, supplied N=14, what mass contribution belongs in the numerator?",
      "2×14 =28",
      {
        "14": "N appears twice in the formula.",
        "80": "That is the complete compound Mᵣ with the usual supplied relative masses.",
      },
      "All named-element atoms contribute, including repeated symbols in different groups.",
      "Count both N symbols.",
    ),
    c(
      "r-denominator",
      "Use the whole compound",
      "Which denominator belongs in element percentage by mass?",
      "The complete compound Mᵣ",
      {
        "Only the other elements’ contributions":
          "The whole includes the named element too.",
        "The number of atoms": "That produces an atom-count fraction.",
      },
      "A percentage asks what part of the whole is represented.",
      "Include every element.",
    ),
    c(
      "r-mass-not-count",
      "Weight atom counts",
      "Does one Mg and one O in MgO mean equal mass contribution, using Mg=24,O=16?",
      "No; Mg contributes 24 and O contributes 16",
      {
        "Yes; one always weighs the same as one":
          "Elements have different supplied Aᵣ.",
        "No; oxygen must be absent": "O occurs in the formula.",
      },
      "Equal atom counts can have unequal relative-mass contributions.",
      "Multiply count by Aᵣ.",
    ),
    c(
      "r-scale",
      "Scale part and whole",
      "If a pure-compound sample doubles, what happens to its element mass fraction?",
      "It stays unchanged while part and whole masses both double",
      {
        "It doubles": "The numerator and denominator scale together.",
        "It halves": "The part also increases.",
      },
      "A pure compound keeps its composition.",
      "Keep the fraction, not a fixed number of grams.",
    ),
    c(
      "r-percent",
      "Convert the fraction",
      "How do you turn a mass fraction into a percentage?",
      "Multiply by 100",
      {
        "Divide by 100": "That converts percentage to fraction.",
        "Add 100": "Adding does not produce hundredths.",
      },
      "0.40 corresponds to 40%.",
      "Percentage means per hundred.",
    ),
  ],
  guided,
  practice: [
    n(
      "p-ca",
      "Use a supplied whole",
      "Calcium contributes 40 to CaCO₃ Mᵣ=100. Calculate calcium percentage by mass.",
      40,
      "%",
      "40/100×100=40%.",
      "Use part over whole.",
    ),
    n(
      "p-carbon",
      "Use another named element",
      "For CaCO₃, supplied C=12 and complete Mᵣ=100. Calculate carbon percentage by mass.",
      12,
      "%",
      "12/100×100=12%.",
      "One C contributes 12.",
    ),
    n(
      "p-carbonate-oxygen",
      "Include all oxygen",
      "For CaCO₃, supplied O=16 and Mᵣ=100. Calculate oxygen percentage by mass.",
      48,
      "%",
      "3×16=48; 48/100×100=48%.",
      "Include three oxygen atoms.",
    ),
    {
      id: "pc-v1-p-working",
      title: "Construct chemical working",
      prompt:
        "For CO₂ with C=12,O=16, complete the O count, O mass contribution and complete compound Mᵣ before calculating a percentage.",
      answer: JSON.stringify({ count: "2", part: "32", whole: "44" }),
      parts: [
        { id: "count", label: "O count", answer: 2 },
        { id: "part", label: "O mass contribution", answer: 32 },
        { id: "whole", label: "Complete Mᵣ", answer: 44 },
      ],
      partLegend: "Named element contribution and complete whole",
      explanation: "O count 2 gives 2×16=32; the whole is 12+32=44.",
      hint: "The denominator includes carbon and oxygen.",
      purpose:
        "Requires the chemical quantities independently before percentage conversion.",
    },
    n(
      "p-rounded-oxygen",
      "Report a rounded percentage",
      "For oxygen in CO₂, contribution 32 and Mᵣ 44. Calculate percentage by mass to one decimal place.",
      72.7,
      "%",
      "32/44×100=72.727…%, reported as 72.7%.",
      "Keep the full division until final rounding.",
      1,
    ),
    n(
      "p-mgo",
      "Use mass rather than equal counts",
      "For MgO with Mg=24,O=16, calculate magnesium percentage by mass.",
      60,
      "%",
      "24/(24+16)×100=60%, not 50%.",
      "Equal atom counts do not mean equal masses.",
    ),
    n(
      "p-iron",
      "Include both iron atoms",
      "For Fe₂O₃, supplied Fe=56,O=16,Mᵣ=160. Calculate iron percentage by mass.",
      70,
      "%",
      "2×56/160×100=70%.",
      "Use the whole iron contribution 112.",
    ),
    n(
      "p-hydroxide",
      "Use bracketed oxygen",
      "For Ca(OH)₂, supplied O=16 and Mᵣ=74. Calculate oxygen percentage by mass to one decimal place.",
      43.2,
      "%",
      "2×16/74×100=43.243…%=43.2%.",
      "The bracket doubles O.",
      1,
    ),
    n(
      "p-nitrate",
      "Count nitrogen in two places",
      "For NH₄NO₃, supplied N=14 and Mᵣ=80. Calculate nitrogen percentage by mass.",
      35,
      "%",
      "2×14/80×100=35%.",
      "Count both N symbols.",
    ),
    n(
      "p-urea",
      "Compare a molecular compound",
      "For CH₄N₂O, supplied N=14 and Mᵣ=60. Calculate nitrogen percentage by mass to one decimal place.",
      46.7,
      "%",
      "28/60×100=46.666…%=46.7%.",
      "Use both nitrogen atoms.",
      1,
    ),
    n(
      "p-sulfate",
      "Keep the group multiplier",
      "For (NH₄)₂SO₄, supplied N=14 and Mᵣ=132. Calculate nitrogen percentage by mass to one decimal place.",
      21.2,
      "%",
      "28/132×100=21.212…%=21.2%.",
      "Two ammonium groups give two N.",
      1,
    ),
    n(
      "p-chlorine",
      "Retain decimal relative mass",
      "For MgCl₂, supplied Cl=35.5 and Mᵣ=95. Calculate chlorine percentage by mass to one decimal place.",
      74.7,
      "%",
      "2×35.5/95×100=74.736…%=74.7%.",
      "Keep both Cl contributions and the decimal.",
      1,
    ),
    n(
      "p-sample",
      "Scale a pure sample",
      "Pure CaCO₃ is 40% calcium by mass. How much calcium is in 25 g of pure CaCO₃?",
      10,
      "g",
      "0.40×25=10 g.",
      "Convert percent to a fraction.",
    ),
    n(
      "p-kg",
      "Convert the resulting mass",
      "A supplied mixture is 5% component X by mass. A sample has mass 2.6 kg. Calculate X mass in grams.",
      130,
      "g",
      "0.05×2.6 kg=0.13 kg=130 g.",
      "Convert kg to g without changing the fraction.",
    ),
    n(
      "p-whole",
      "Recover the whole sample",
      "A pure sample contains 12 g of an element that is 60% of its mass. What is total sample mass?",
      20,
      "g",
      "12/0.60=20 g.",
      "The given mass is the part, not the whole.",
    ),
    n(
      "p-target",
      "Find material for a target amount",
      "A supplied pure compound is 35% nitrogen by mass. What compound mass contains 14 g nitrogen?",
      40,
      "g",
      "14/0.35=40 g.",
      "Divide the needed element mass by its mass fraction.",
    ),
    c(
      "p-invariance",
      "Keep pure composition fixed",
      "How do 10 g and 50 g pure samples of the same compound compare?",
      "The same mass percentage, but different element masses",
      {
        "The larger sample must have a larger percentage":
          "Part and whole increase together.",
        "They have identical element masses":
          "The larger sample contains more material.",
      },
      "Percent composition is a fraction, not a fixed amount.",
      "Scale numerator and denominator together.",
    ),
    c(
      "p-mixture",
      "Bound the composition claim",
      "Why can two mixtures have different mass percentages even when both contain the same components?",
      "Their component proportions can differ",
      {
        "Every mixture has a fixed chemical formula ratio":
          "That applies to a pure compound’s composition, not all mixtures.",
        "Percentage depends only on sample size":
          "Different proportions, not merely total size, change composition.",
      },
      "A mixture can be prepared at different proportions; a pure compound has a defined formula composition.",
      "Separate proportion from total quantity.",
    ),
    c(
      "p-rounding",
      "Interpret a reported sum",
      "Three element percentages reported to one decimal place sum to 100.1%. What is possible?",
      "Separate final rounding can cause a small difference from 100%",
      {
        "The exact composition must contain extra material":
          "Rounding changes reported values, not material.",
        "Each individual element can have 150% mass share":
          "A part cannot exceed the complete positive whole.",
      },
      "Unrounded complete shares sum to 100; rounded reports can sum slightly differently.",
      "Distinguish exact proportions from display rounding.",
    ),
    c(
      "p-comparison",
      "Keep the named-element criterion",
      "At equal compound mass, A is 40% element X and B is 25% element X. Which supplies more X?",
      "A, because its mass fraction of X is higher",
      {
        "B, because a lower percentage always means more X":
          "Equal totals make the larger fraction the larger part.",
        "There is no way to compare given percentages":
          "The named fraction and equal total mass suffice.",
      },
      "Equal total mass times a higher fraction gives more named element.",
      "Use the stated equal-mass condition.",
    ),
    {
      ...c(
        "p-explain",
        "Explain a count error",
        "A student says magnesium is 50% by mass in MgO because Mg and O counts are both one. Correct the explanation using Mg=24,O=16.",
        "Equal atom counts do not give equal mass. Magnesium contributes 24 of total 40, so 24/40×100=60%.",
        {},
        "Weight counts by their supplied relative masses.",
        "Compare count and mass fractions.",
      ),
      options: undefined,
      rubric: [
        "Distinguishes atom count from mass contribution.",
        "Uses magnesium 24 over complete total 40.",
        "Calculates 60%, explaining why 50% is an atom-count fraction.",
      ],
    },
    {
      ...c(
        "p-evaluate",
        "Explain numerator and denominator",
        "Explain why using 14/80 for nitrogen in NH₄NO₃ is wrong, with N=14 and complete Mᵣ 80.",
        "The formula has two nitrogen atoms in different positions. Their contribution is 28, so 28/80×100=35%. The denominator includes every element.",
        {},
        "Include all named atoms while keeping the complete denominator.",
        "Find both nitrogen symbols.",
      ),
      options: undefined,
      rubric: [
        "Counts two N atoms.",
        "Uses contribution 28 over complete Mᵣ 80.",
        "Calculates 35% and retains the complete compound denominator.",
      ],
    },
  ],
  checkForms: [
    [
      n(
        "ca-lithium",
        "Calculate new formula data",
        "For Li₂O, supplied Li=7,O=16 and Mᵣ=30. Calculate lithium percentage by mass to one decimal place.",
        46.7,
        "%",
        "14/30×100=46.666…%=46.7%.",
        "Include both Li atoms.",
        1,
      ),
      n(
        "ca-sulfur",
        "Use a different numerator",
        "For SO₂, supplied S=32 and Mᵣ=64. Calculate sulfur percentage by mass.",
        50,
        "%",
        "32/64×100=50%.",
        "Use sulfur contribution and complete total.",
      ),
      n(
        "ca-scale",
        "Scale new supplied mass",
        "A supplied pure compound is 25% element X by mass. How much X is in 36 g?",
        9,
        "g",
        "0.25×36=9 g.",
        "Convert 25% to 0.25.",
      ),
      c(
        "ca-count",
        "Check a quantity distinction",
        "Equal atom counts of two different elements guarantee which conclusion?",
        "Equal numbers of atoms, but not necessarily equal masses",
        {
          "Equal masses for every pair of elements": "Aᵣ values can differ.",
          "Exactly 50% by mass of either element":
            "That needs equal mass contributions too.",
        },
        "Count and mass are different quantities.",
        "Use supplied Aᵣ for mass reasoning.",
      ),
      c(
        "ca-whole",
        "Check the denominator",
        "For percentage by mass of oxygen in a compound, what belongs below the oxygen contribution?",
        "Complete compound Mᵣ including oxygen",
        {
          "Only non-oxygen contributions": "The whole includes the part.",
          "Only the number of oxygen atoms":
            "That is not the complete mass total.",
        },
        "Percentage uses part divided by complete whole.",
        "Include every element.",
      ),
    ],
    [
      n(
        "cb-sodium",
        "Calculate another formula",
        "For Na₂O, supplied Na=23 and Mᵣ=62. Calculate sodium percentage by mass to one decimal place.",
        74.2,
        "%",
        "46/62×100=74.193…%=74.2%.",
        "Include both sodium atoms.",
        1,
      ),
      n(
        "cb-ammonia",
        "Calculate another nitrogen fraction",
        "For NH₃, supplied N=14 and Mᵣ=17. Calculate nitrogen percentage by mass to one decimal place.",
        82.4,
        "%",
        "14/17×100=82.352…%=82.4%.",
        "Use the complete 17 denominator.",
        1,
      ),
      n(
        "cb-scale",
        "Convert new sample units",
        "A supplied mixture is 12% component Y by mass. A sample is 0.75 kg. Calculate Y mass in grams.",
        90,
        "g",
        "0.12×0.75 kg=0.09 kg=90 g.",
        "Convert the resulting kg mass to g.",
      ),
      c(
        "cb-invariance",
        "Check sample scaling",
        "A pure-compound sample triples with unchanged composition. What happens to its element percentage?",
        "It stays unchanged",
        {
          "It triples": "Part and whole both triple.",
          "It becomes a number of grams":
            "Percent and mass are different quantities.",
        },
        "Scaling the same composition preserves its fraction.",
        "Scale both quantities.",
      ),
      c(
        "cb-rounding",
        "Check rounded reporting",
        "Which statement about complete element percentages is correct?",
        "Exact shares sum to 100%; separately rounded reports can differ slightly",
        {
          "Each named element can exceed 100%":
            "An element contribution cannot exceed the positive whole.",
          "Rounding changes the chemical formula":
            "It changes reported precision only.",
        },
        "Different reported rounding does not create or remove material.",
        "Distinguish exact and rounded.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-carbon",
        "Retrieve a fresh calculation",
        "For CH₄, supplied C=12 and Mᵣ=16. Calculate carbon percentage by mass.",
        75,
        "%",
        "12/16×100=75%.",
        "Named element over complete total.",
      ),
      n(
        "ra-scale",
        "Retrieve part from whole",
        "A supplied compound is 20% X by mass. How much X is in 45 g?",
        9,
        "g",
        "0.20×45=9 g.",
        "Keep the mass fraction.",
      ),
      c(
        "ra-numerator",
        "Retrieve complete contribution",
        "A formula has three atoms of the named element with supplied Aᵣ A. What is its relative-mass contribution?",
        "3×A",
        {
          "A only": "All three atoms contribute.",
          "3 only": "That is the count, not the mass contribution.",
        },
        "Multiply atom count by relative atomic mass.",
        "Count every named atom.",
      ),
    ],
    [
      n(
        "rb-magnesium",
        "Retrieve another percentage",
        "For MgS, supplied Mg=24 and Mᵣ=56. Calculate magnesium percentage by mass to one decimal place.",
        42.9,
        "%",
        "24/56×100=42.857…%=42.9%.",
        "Use part over whole and round at the end.",
        1,
      ),
      n(
        "rb-whole",
        "Retrieve a whole sample",
        "A sample contains 6 g X at 30% by mass. What is the whole sample mass?",
        20,
        "g",
        "6/0.30=20 g.",
        "The 6 g is the part.",
      ),
      c(
        "rb-fraction",
        "Retrieve pure-sample scaling",
        "If part and whole masses both double, what happens to their percentage?",
        "It stays unchanged",
        {
          "It doubles": "The fraction cancels the common scale.",
          "It becomes100% automatically":
            "Doubling is not replacing the whole by the part.",
        },
        "The fraction is invariant under common scaling.",
        "Compare2m/2M with m/M.",
      ),
    ],
  ],
};
for (const q of [
  ...compositionJourney.warmup,
  ...compositionJourney.refresher,
  ...guided,
  ...compositionJourney.practice,
])
  q.followUp =
    q.id.includes("scale") ||
    q.id.includes("sample") ||
    q.id.includes("invariance") ||
    q.id.includes("kg") ||
    q.id.includes("whole") ||
    q.id.includes("target")
      ? "pc-v1-r-scale"
      : q.id.includes("count") ||
          q.id.includes("mgo") ||
          q.id.includes("explain")
        ? "pc-v1-r-mass-not-count"
        : q.id.includes("numerator") ||
            q.id.includes("nitrate") ||
            q.id.includes("sulfate") ||
            q.id.includes("urea") ||
            q.id.includes("hydroxide") ||
            q.id.includes("chlorine") ||
            q.id.includes("evaluate")
          ? "pc-v1-r-numerator"
          : q.id.includes("percent") ||
              q.id.includes("fraction") ||
              q.id.includes("round")
            ? "pc-v1-r-percent"
            : "pc-v1-r-denominator";
