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
      `fm-v1-${id}`,
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
  explanation: string,
  hint: string,
): LearningTask {
  return {
    ...number(`fm-v1-${id}`, prompt, answer, "", explanation, hint, title),
    title,
  };
}
function parts(
  id: string,
  title: string,
  prompt: string,
  entries: [string, string, number][],
  explanation: string,
  hint: string,
): LearningTask {
  return {
    id: `fm-v1-${id}`,
    title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(entries.map(([key, , value]) => [key, String(value)])),
    ),
    parts: entries.map(([id, label, answer]) => ({
      id,
      label,
      answer,
      inputMode: "decimal",
    })),
    partLegend: "Complete every count or contribution",
    explanation,
    hint,
    purpose: title,
  };
}
const guided = [
  c(
    "g-count",
    "Count from a formula",
    "For the initial H₂O molecule, how many atoms of each element are shown?",
    "Two H and one O",
    {
      "One H and two O": "The subscript 2 belongs to H.",
      "Two H and two O": "O has no written subscript, so its count is one.",
    },
    "H₂O shows two hydrogen atoms and one oxygen atom. The actual molecular asset gives the same counts.",
    "Read the subscript immediately after each symbol.",
    {
      kind: "formula-mass",
      mode: "count",
      instruction:
        "Predict each element count, then inspect water or carbon dioxide.",
    },
  ),
  c(
    "g-mass",
    "Build the mass ledger",
    "For initial MgCl₂, supplied Aᵣ Mg=24 and Cl=35.5. Which working gives Mᵣ?",
    "1×24 + 2×35.5 = 95",
    {
      "24 + 35.5 = 59.5": "The formula contains two chlorines per magnesium.",
      "2×24 + 35.5 = 83.5": "The 2 belongs to Cl, not Mg.",
    },
    "Multiply each supplied Aᵣ by the formula count, then add all contributions. Mᵣ is dimensionless.",
    "Keep the two-letter symbol Cl together and read its subscript.",
    {
      kind: "formula-mass",
      mode: "mass",
      instruction:
        "Build your element counts and predict Mᵣ from the supplied relative masses.",
    },
  ),
  c(
    "g-brackets",
    "Expand a bracketed group",
    "For initial Ca(OH)₂, what counts does one formula ratio specify?",
    "Ca=1, O=2, H=2",
    {
      "Ca=2, O=1, H=1": "The outside 2 multiplies OH, not Ca.",
      "Ca=1, O=1, H=2": "Both O and H are inside the group.",
    },
    "Two OH groups give two O and two H; Ca stays one. This ionic formula gives proportions, not a separate molecule.",
    "Apply the outside multiplier to the entire bracket.",
    {
      kind: "formula-mass",
      mode: "brackets",
      instruction:
        "Predict counts for every element; inspect two copies of the bracketed group.",
    },
  ),
  c(
    "g-quantity",
    "Separate coefficient from Mᵣ",
    "What does 2H₂O mean, using H=1 and O=16?",
    "Two water molecules; four H and two O represented; Mᵣ of water stays 18",
    {
      "One water molecule with Mᵣ 36":
        "The coefficient counts complete molecules.",
      "The formula changes to H₄O₂":
        "Do not change the formula to represent the coefficient.",
    },
    "The coefficient changes quantity. Each water molecule still has formula H₂O and Mᵣ 18.",
    "Distinguish the number in front from subscripts inside the formula.",
    {
      kind: "formula-mass",
      mode: "quantity",
      instruction:
        "Change the coefficient, count total atoms and predict Mᵣ for one water formula.",
    },
  ),
];
guided[0].openingHint = true;
export const formulaMassJourney: LessonJourney = {
  version: 1,
  introduction:
    "Read the formula first, build every element contribution and distinguish formula mass from represented quantity.",
  scopeNote:
    "Common Foundation/combined relative formula mass with supplied Aᵣ values. Ionic formulae indicate ratios, not isolated molecules. Mᵣ has no units. Percentage composition and full balancing are subsequent individual lessons.",
  outcomes: [
    "Read omitted subscripts, brackets and coefficients correctly.",
    "Calculate every count×Aᵣ contribution and their sum, including decimal Aᵣ.",
    "Distinguish relative formula mass from actual mass and molar mass.",
    "Use ionic formula ratios without inventing isolated molecules.",
  ],
  warmup: [
    c(
      "w-subscript",
      "Recall a subscript",
      "In CO₂, which element has count two?",
      "Oxygen",
      {
        Carbon: "The 2 follows O.",
        "Both elements": "A subscript applies to the preceding symbol.",
      },
      "One C and two O are shown.",
      "Read each symbol and its following number.",
    ),
    c(
      "w-symbol",
      "Read a chemical symbol",
      "What does Cl represent?",
      "The single element chlorine",
      {
        "Carbon and an element l": "The lower-case l belongs to Cl.",
        "Two chlorine atoms": "A two-letter symbol is not an atom count.",
      },
      "Chemical symbols start with a capital and may include a lower-case letter.",
      "Keep letters in a symbol together.",
    ),
  ],
  refresher: [
    c(
      "r-subscript",
      "Read missing numbers",
      "How many Mg atoms does the ratio formula MgCl₂ specify per formula?",
      "One",
      { Two: "The 2 follows Cl.", Zero: "Omitted subscripts mean one." },
      "Mg has an implied subscript of one.",
      "Look for an actual following subscript.",
    ),
    c(
      "r-bracket",
      "Multiply the whole group",
      "What does (NO₃)₂ specify?",
      "Two N and six O",
      {
        "Two N and three O":
          "The outside 2 multiplies all three O in each group.",
        "One N and six O": "The N also belongs to the repeated group.",
      },
      "Two copies each contain N and three O.",
      "Multiply each count inside by two.",
    ),
    c(
      "r-working",
      "Use count times Aᵣ",
      "Which method calculates Mᵣ from a supplied formula?",
      "Add count×Aᵣ for every element",
      {
        "Add one Aᵣ per element regardless of count":
          "Subscripts determine the required numbers.",
        "Multiply all Aᵣ values together": "Contributions are added.",
      },
      "Mᵣ sums every element contribution.",
      "Count first, multiply, then sum.",
    ),
    c(
      "r-units",
      "Recall relative units",
      "Which unit belongs on Mᵣ?",
      "No unit",
      {
        g: "That is actual mass.",
        "g mol⁻¹": "That is molar mass, a different quantity.",
      },
      "Mᵣ compares masses relative to a reference and is dimensionless.",
      "Distinguish a ratio from actual mass.",
    ),
    c(
      "r-coefficient",
      "Keep the formula unchanged",
      "Does writing 3H₂O change Mᵣ of one H₂O formula?",
      "No; it changes how many complete molecules are represented",
      {
        "Yes; each water molecule becomes three times larger":
          "The molecules retain the same formula.",
        "Yes; the subscripts become H₆O₃":
          "A coefficient is not an internal subscript.",
      },
      "The coefficient scales quantity, not per-formula relative mass.",
      "Keep one formula separate from the number of copies.",
    ),
    c(
      "r-ionic",
      "Use the right interpretation",
      "For an ionic salt such as NaCl, what does the formula specify?",
      "The ratio of ions in the ionic substance",
      {
        "A separate NaCl molecule": "Ionic salts have extended structures.",
        "Only the size of one atom": "Formula symbols specify composition.",
      },
      "Relative formula mass can be calculated without asserting an isolated molecule.",
      "Remember the ionic lattice.",
    ),
  ],
  guided,
  practice: [
    n(
      "p-water",
      "Calculate water",
      "Calculate Mᵣ of H₂O. Supplied Aᵣ: H=1, O=16.",
      18,
      "2×1+16=18.",
      "Include both H.",
    ),
    n(
      "p-co2",
      "Calculate carbon dioxide",
      "Calculate Mᵣ of CO₂. Supplied Aᵣ: C=12, O=16.",
      44,
      "12+2×16=44.",
      "The subscript belongs to O.",
    ),
    n(
      "p-mgcl",
      "Use decimal chlorine",
      "Calculate Mᵣ of MgCl₂. Supplied Aᵣ: Mg=24, Cl=35.5.",
      95,
      "24+2×35.5=95.",
      "Multiply chlorine contribution by two.",
    ),
    n(
      "p-nacl",
      "Use an implied one",
      "Calculate Mᵣ of NaCl. Supplied Aᵣ: Na=23, Cl=35.5.",
      58.5,
      "23+35.5=58.5.",
      "Both counts are one.",
    ),
    parts(
      "p-ca-count",
      "Count a hydroxide ratio",
      "Complete the atom counts specified by Ca(OH)₂ per formula ratio.",
      [
        ["ca", "Ca count", 1],
        ["o", "O count", 2],
        ["h", "H count", 2],
      ],
      "Ca is outside; two OH copies give O₂H₂.",
      "Multiply every atom inside the bracket.",
    ),
    parts(
      "p-nitrate-count",
      "Count a nitrate ratio",
      "Complete the atom counts specified by Mg(NO₃)₂.",
      [
        ["mg", "Mg count", 1],
        ["n", "N count", 2],
        ["o", "O count", 6],
      ],
      "Mg remains one; N is doubled and O is 3×2=6.",
      "Count each copy of NO₃.",
    ),
    parts(
      "p-sulfate-count",
      "Combine inside and outside subscripts",
      "Complete the counts specified by Al₂(SO₄)₃.",
      [
        ["al", "Al count", 2],
        ["s", "S count", 3],
        ["o", "O count", 12],
      ],
      "Two Al, three sulfate groups: three S and twelve O.",
      "Keep Al₂ outside the bracket multiplier.",
    ),
    n(
      "p-sulfate-mr",
      "Sum a larger ionic formula",
      "Calculate Mᵣ of Al₂(SO₄)₃. Supplied Aᵣ: Al=27, S=32, O=16.",
      342,
      "2×27+3×32+12×16=54+96+192=342.",
      "Count all group copies first.",
    ),
    n(
      "p-ammonium-count",
      "Count repeated ammonium",
      "How many H atoms are specified by (NH₄)₂SO₄ per formula ratio?",
      8,
      "Two NH₄ groups give 2×4=8 H.",
      "The outside 2 multiplies H₄.",
    ),
    n(
      "p-ammonium-mr",
      "Calculate an ammonium salt",
      "Calculate Mᵣ of (NH₄)₂SO₄. Supplied Aᵣ: N=14, H=1, S=32, O=16.",
      132,
      "2×14+8×1+32+4×16=132.",
      "The outside 2 does not multiply the separate SO₄ group.",
    ),
    parts(
      "p-working",
      "Construct all contributions",
      "For Mg(OH)₂, supplied Aᵣ Mg=24, O=16, H=1. Complete each element contribution and Mᵣ.",
      [
        ["mg", "Mg contribution", 24],
        ["o", "O contribution", 32],
        ["h", "H contribution", 2],
        ["mr", "Mᵣ total", 58],
      ],
      "1×24+2×16+2×1=24+32+2=58.",
      "Multiply the counts before adding.",
    ),
    n(
      "p-chlorine",
      "Keep a two-letter symbol intact",
      "Calculate Mᵣ of Cl₂ using Cl=35.5.",
      71,
      "2×35.5=71. Cl is chlorine, not C followed by another element.",
      "One chemical symbol can have two letters.",
    ),
    n(
      "p-lino3",
      "Transfer to another nitrate",
      "Calculate Mᵣ of LiNO₃. Supplied Aᵣ: Li=7, N=14, O=16.",
      69,
      "7+14+3×16=69.",
      "There is no outside bracket multiplier.",
    ),
    n(
      "p-potassium",
      "Count a metal subscript",
      "Calculate Mᵣ of K₂SO₄. Supplied Aᵣ: K=39, S=32, O=16.",
      174,
      "2×39+32+4×16=174.",
      "The 2 applies to K.",
    ),
    n(
      "p-peroxide",
      "Distinguish a different formula",
      "Calculate Mᵣ of H₂O₂. Supplied Aᵣ: H=1, O=16.",
      34,
      "2×1+2×16=34. H₂O₂ is a different formula from H₂O.",
      "Both H and O have subscript two.",
    ),
    parts(
      "p-total-atoms",
      "Read a coefficient independently",
      "For 2H₂O, complete the total H and O atom counts represented.",
      [
        ["h", "Total H count", 4],
        ["o", "Total O count", 2],
      ],
      "Two complete molecules each contain H₂O.",
      "Multiply each per-molecule count by the coefficient.",
    ),
    n(
      "p-per-formula",
      "Retain per-formula relative mass",
      "For 2H₂O, calculate Mᵣ of one H₂O formula. Supplied Aᵣ: H=1, O=16.",
      18,
      "The coefficient changes quantity; one H₂O formula remains 2×1+16=18.",
      "Calculate for one formula.",
    ),
    c(
      "p-units",
      "Distinguish relative from actual mass",
      "A student writes Mᵣ of water =18 g. What correction is needed?",
      "Remove g: Mᵣ is dimensionless",
      {
        "Change to 18 kg": "That is still actual mass.",
        "Replace the formula by H₁₈O":
          "The result does not change atom counts.",
      },
      "Mᵣ is a mass ratio, not a weighed sample.",
      "Separate the calculated relative value from a sample mass.",
    ),
    c(
      "p-ionic",
      "Avoid invented salt molecules",
      "Why is relative formula mass an appropriate term for MgCl₂?",
      "Its ionic formula gives a ratio, without an isolated MgCl₂ molecule",
      {
        "Every salt is made of separate covalent molecules":
          "Ionic structures are extended.",
        "The formula has no useful composition":
          "It gives the numbers used for summation.",
      },
      "Formula ratios can be used for relative mass calculations.",
      "Use the ionic structure correctly.",
    ),
    n(
      "p-ca-mr",
      "Calculate calcium hydroxide",
      "Calculate Mᵣ of Ca(OH)₂. Supplied Aᵣ: Ca=40, O=16, H=1.",
      74,
      "40+2×16+2×1=74.",
      "Apply the bracket to O and H.",
    ),
    n(
      "p-ca-nitrate",
      "Keep the nitrate multiplier",
      "Calculate Mᵣ of Ca(NO₃)₂. Supplied Aᵣ: Ca=40, N=14, O=16.",
      164,
      "40+2×14+6×16=164.",
      "Two nitrate groups.",
    ),
    n(
      "p-balanced-quantity",
      "Compare balanced quantities",
      "For 2Mg + O₂ → 2MgO, supplied Aᵣ Mg=24 and O=16. What is the sum of relative masses on either side, using the shown quantities?",
      80,
      "2×24+32=80 and 2×(24+16)=80. This represents balanced quantities, not Mᵣ of one MgO formula.",
      "Apply coefficients to complete formulas.",
    ),
    {
      ...c(
        "p-explain-brackets",
        "Explain a bracket error",
        "A student calculates Mᵣ of Ca(OH)₂ as 40+16+2=58. Explain the error and correct it. Supplied Aᵣ Ca=40, O=16, H=1.",
        "The outside 2 multiplies both O and H. The oxygen contribution is 32, not 16; 40+32+2=74.",
        {},
        "The bracket multiplier applies to every atom inside.",
        "Compare O and H contributions.",
      ),
      options: undefined,
      rubric: [
        "Identifies the missing doubling of O.",
        "Applies the outside multiplier to both O and H.",
        "Gives 40+32+2=74 without units on Mᵣ.",
      ],
    },
    {
      ...c(
        "p-explain-coefficient",
        "Explain coefficient and formula",
        "Explain why 3H₂O represents six H and three O atoms but does not change Mᵣ of one water formula. Supplied Aᵣ H=1, O=16.",
        "The coefficient represents three complete molecules. Each retains H₂O, so total atoms scale to H6 and O3, while per-formula Mᵣ remains 2×1+16=18.",
        {},
        "Complete formula copies change quantity, not the per-formula value.",
        "Separate per-formula and total counts.",
      ),
      options: undefined,
      rubric: [
        "Three complete H₂O molecules are represented.",
        "Total H=6 and O=3.",
        "Per-formula Mᵣ=18 has no units; the coefficient does not change the formula.",
      ],
    },
  ],
  checkForms: [
    [
      n(
        "ca-methane",
        "Calculate new molecular data",
        "Calculate Mᵣ of CH₄. Supplied Aᵣ: C=12, H=1.",
        16,
        "12+4×1=16.",
        "Count every H.",
      ),
      n(
        "ca-sodium",
        "Calculate new ionic data",
        "Calculate Mᵣ of Na₂O. Supplied Aᵣ: Na=23, O=16.",
        62,
        "2×23+16=62.",
        "Read the sodium subscript.",
      ),
      n(
        "ca-barium",
        "Transfer bracket calculation",
        "Calculate Mᵣ of Ba(NO₃)₂. Supplied Aᵣ: Ba=137, N=14, O=16.",
        261,
        "137+2×14+6×16=261.",
        "Two nitrate groups.",
      ),
      parts(
        "ca-coefficient",
        "Separate quantity and formula",
        "For 2NH₃, supplied Aᵣ N=14 and H=1. Give total represented N and H counts, and Mᵣ of one NH₃ formula.",
        [
          ["n", "Total N count", 2],
          ["h", "Total H count", 6],
          ["mr", "Mᵣ of one NH₃", 17],
        ],
        "Two complete molecules give N₂H₆ in total; one formula has Mᵣ 14+3=17.",
        "Keep total and per-formula quantities separate.",
      ),
      c(
        "ca-units",
        "Check units independently",
        "Which statement correctly reports a calculated Mᵣ?",
        "A dimensionless number",
        {
          "A number measured in grams": "That is sample mass.",
          "Always a number of molecules":
            "Relative mass is not a molecule count.",
        },
        "Mᵣ has no units.",
        "Remember it is relative.",
      ),
    ],
    [
      n(
        "cb-so2",
        "Use a new oxide",
        "Calculate Mᵣ of SO₂. Supplied Aᵣ S=32 and O=16.",
        64,
        "32+2×16=64.",
        "Two O atoms.",
      ),
      n(
        "cb-fecl",
        "Use new decimal contributions",
        "Calculate Mᵣ of FeCl₃. Supplied Aᵣ Fe=56 and Cl=35.5.",
        162.5,
        "56+3×35.5=162.5.",
        "Keep the chlorine multiplier.",
      ),
      parts(
        "cb-phosphate",
        "Count another bracketed ratio",
        "Complete the atom counts specified by Ca₃(PO₄)₂.",
        [
          ["ca", "Ca count", 3],
          ["p", "P count", 2],
          ["o", "O count", 8],
        ],
        "Ca₃ remains three; two phosphate groups give P₂O₈.",
        "Separate outer calcium and bracket contents.",
      ),
      n(
        "cb-quantity",
        "Check per-formula reasoning",
        "For 3CO₂, calculate Mᵣ of one CO₂ formula. Supplied Aᵣ C=12 and O=16.",
        44,
        "Each CO₂ has Mᵣ 44; the coefficient changes quantity.",
        "Calculate one formula.",
      ),
      c(
        "cb-ionic",
        "Check the ionic term",
        "Why use relative formula mass for Na₂O?",
        "Its formula expresses ionic composition ratios rather than a discrete molecule",
        {
          "It has no ions": "Na₂O is ionic.",
          "Its formula cannot be used in a sum":
            "The counts determine the relative formula mass.",
        },
        "The ionic formula can be summed without claiming a molecule.",
        "Distinguish ratio from molecular structure.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-h2s",
        "Retrieve count and sum",
        "Calculate Mᵣ of H₂S. Supplied Aᵣ H=1 and S=32.",
        34,
        "2×1+32=34.",
        "Include both H.",
      ),
      n(
        "ra-hydroxide",
        "Retrieve group counting",
        "How many O atoms are specified by Al(OH)₃ per formula ratio?",
        3,
        "Three OH groups each contain one O.",
        "Multiply the whole group.",
      ),
      c(
        "ra-coefficient",
        "Retrieve the coefficient distinction",
        "Does 4H₂O change the per-formula Mᵣ of water?",
        "No; it represents four complete molecules",
        {
          "Yes; each H becomes four different elements":
            "A coefficient does not change chemical identity.",
          "Yes; each water formula has four O": "The formula remains H₂O.",
        },
        "Quantity changes, per-formula value does not.",
        "Read the number in front separately.",
      ),
    ],
    [
      n(
        "rb-nh3",
        "Retrieve another molecular sum",
        "Calculate Mᵣ of NH₃. Supplied Aᵣ N=14 and H=1.",
        17,
        "14+3×1=17.",
        "Three H atoms.",
      ),
      n(
        "rb-nitrate",
        "Retrieve nitrate scope",
        "How many O atoms are specified by Al(NO₃)₃ per formula ratio?",
        9,
        "Three nitrate groups each have three O: 3×3=9.",
        "Multiply internal and outside subscripts.",
      ),
      c(
        "rb-units",
        "Retrieve relative units",
        "A correct calculation gives Mᵣ=60. Which unit should be added?",
        "None",
        { g: "That indicates actual mass.", nm: "That indicates length." },
        "Relative formula mass is dimensionless.",
        "It is a ratio.",
      ),
    ],
  ],
};
for (const q of [
  ...formulaMassJourney.warmup,
  ...formulaMassJourney.refresher,
  ...guided,
  ...formulaMassJourney.practice,
])
  q.followUp =
    q.id.includes("coefficient") ||
    q.id.includes("quantity") ||
    q.id.includes("per-formula") ||
    q.id.includes("total-atoms")
      ? "fm-v1-r-coefficient"
      : q.id.includes("bracket") ||
          q.id.includes("nitrate") ||
          q.id.includes("sulfate") ||
          q.id.includes("ammonium") ||
          q.id.includes("ca-count")
        ? "fm-v1-r-bracket"
        : q.id.includes("units")
          ? "fm-v1-r-units"
          : q.id.includes("ionic")
            ? "fm-v1-r-ionic"
            : q.id.includes("count") ||
                q.id.includes("symbol") ||
                q.id.includes("subscript")
              ? "fm-v1-r-subscript"
              : "fm-v1-r-working";
