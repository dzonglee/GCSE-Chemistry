import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    `bm-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
): LearningTask => ({
  ...number(`bm-v1-${id}`, prompt, answer, unit, explanation, hint, title),
  title,
});
const parts = (
  id: string,
  title: string,
  prompt: string,
  fields: { id: string; label: string; answer: number }[],
  explanation: string,
  hint: string,
): LearningTask => ({
  ...c(
    id,
    title,
    prompt,
    JSON.stringify(
      Object.fromEntries(fields.map((f) => [f.id, String(f.answer)])),
    ),
    {},
    explanation,
    hint,
  ),
  options: undefined,
  partLegend: title,
  parts: fields,
});
const guided = [
  c(
    "g-amounts",
    "Find the mol ratio",
    "4.8 g Mg + 3.2 g O₂ → 8 g MgO. Find smallest coefficients. M:24,32,40 g/mol.",
    "2:1:2",
    {
      "3:2:5":
        "That simplifies the gram ratio without accounting for different molar masses.",
      "4:2:4":
        "Atom-balanced, but not the requested smallest whole-number form.",
    },
    "Amounts .2:.1:.2 mol; divide every entry by .1 to obtain 2:1:2. Check Mg and O atoms on both sides.",
    "Mass→mol for each named substance; then simplify.",
    {
      kind: "balancing-masses",
      mode: "amounts",
      instruction: "Predict mol, divisor and ratio.",
    },
  ),
  c(
    "g-candidates",
    "Test measured product evidence",
    "Measured products: 2.54 g Cu and 0.72 g H₂O. M values: 63.5,18 g/mol. Decide between CuO + H₂ → Cu + H₂O and Cu₂O + H₂ → 2 Cu + H₂O.",
    "CuO equation",
    {
      "Cu₂O equation":
        "It requires twice as many mol Cu as mol water; these products have equal mol.",
      "Either; both are atom-balanced":
        "Only one balanced candidate matches the measured product amounts.",
    },
    "2.54/63.5=.04 mol Cu and .72/18=.04 mol H₂O. Ratio 1:1 matches CuO. Supplied copper value is 63.5, not an unstated rounded replacement.",
    "Compare named product mol, not gram values.",
    {
      kind: "balancing-masses",
      mode: "candidates",
      instruction:
        "Predict each product amount, then select the matching candidate.",
    },
  ),
  c(
    "g-fraction",
    "Clear the fractional ratio",
    "Reacted ethane data gives 0.1 mol C₂H₆,0.35 mol O₂,0.2 mol CO₂ and 0.3 mol H₂O. Derive the smallest whole-number coefficients.",
    "2:7:4:6",
    {
      "1:3:2:3": "Rounding 3.5 to 3 breaks oxygen balance.",
      "1:4:2:3": "Rounding 3.5 to 4 also breaks oxygen balance.",
      "4:14:8:12": "Balanced, but all entries still share a factor 2.",
    },
    "Divide all by .1:1:3.5:2:3. Multiply all entries by 2:2:7:4:6. Check C4,H12,O14 on each side.",
    "Clear a fraction by multiplying the entire ratio.",
    {
      kind: "balancing-masses",
      mode: "fraction",
      instruction:
        "Predict the fractional entry, multiplier and all four final coefficients.",
    },
  ),
  c(
    "g-consumed",
    "Exclude unreacted excess",
    "Initial 6 g Mg and 10 g O₂ give 10 g MgO with 6 g O₂ remaining. M values:24,32,40 g/mol. Use reacted amounts to derive the smallest coefficients.",
    "2:1:2",
    {
      "4:5:4":
        "Using all initial oxygen gives .25:.3125:.25 mol; not all oxygen reacted.",
      "4:2:4": "Balanced, but not smallest.",
    },
    "Reacted oxygen=10−6=4 g. Mol .25:.125:.25 gives 2:1:2. Total mass 16 g remains as 10 g oxide plus 6 g oxygen; residual oxygen is excluded only from the reaction ratio.",
    "Subtract the measured remaining oxygen first.",
    {
      kind: "balancing-masses",
      mode: "consumed",
      instruction: "Predict reacted oxygen, all amounts and the ratio.",
    },
  ),
];
guided[0].openingHint = true;
export const balancingMassesJourney: LessonJourney = {
  version: 1,
  introduction:
    "Derive stoichiometry from measured reacted masses, compare candidate equations and preserve fractional ratios until all coefficients can be whole.",
  scopeNote:
    "Higher scope AQA4.3.2.3 and Trilogy equivalent; Pearson 1.53. Formulas and molar masses are supplied; deriving unknown empirical formulas is a separate lesson. Use masses actually consumed or produced, with any measured residual material excluded from the reaction ratio but retained in total-mass accounting. Candidate equations are necessary context when only product amounts are given. Reported precision does not justify indiscriminate rounding of measured ratios. These original data tasks give no home experiment instructions.",
  outcomes: [
    "Convert every reacted mass to mol before deriving coefficients.",
    "Simplify all amount ratios together and clear fractional entries without rounding them away.",
    "Verify the resulting equation conserves each element.",
    "Use measured products to distinguish balanced candidates and subtract stated unreacted residues.",
  ],
  warmup: [
    n(
      "w-amount",
      "Recall molecular molar mass",
      "Find O₂ amount in 3.2 g. M(O₂)=32 g/mol.",
      0.1,
      "mol",
      "3.2/32=.1 mol O₂.",
      "Use the molecule's molar mass, not O's atomic mass.",
    ),
    n(
      "w-ratio",
      "Recall shared scaling",
      "Divide each entry in 0.2:0.1:0.2 by 0.1. What is the first resulting entry?",
      2,
      "",
      ".2/.1=2; all entries become 2:1:2.",
      "Apply the same divisor to every entry.",
    ),
  ],
  refresher: [
    c(
      "r-mass",
      "Choose what to simplify",
      "Why must reacted masses be converted to mol before finding coefficients?",
      "Different substances have different mass per mol",
      {
        "Coefficients directly describe grams":
          "Coefficients describe mol ratios.",
        "All substances have the same molar mass":
          "Molar mass depends on the stated formula.",
      },
      "Divide each mass by its own molar mass so the ratio describes chemical amounts.",
      "Separate grams from mol.",
    ),
    c(
      "r-formula",
      "Keep the supplied identity",
      "When deriving coefficients for Mg + O₂ → MgO, what may change?",
      "Numbers before whole formulas",
      {
        "Change MgO to MgO₂ to fit a gram ratio":
          "That changes product identity.",
        "Change O₂ to O because O has atomic mass 16":
          "The supplied reactant is oxygen molecules.",
      },
      "Coefficients scale complete entities; subscripts identify substances.",
      "Keep formulas fixed.",
    ),
    c(
      "r-whole",
      "Preserve a fractional intermediate",
      "A mol ratio simplifies to 1:3.5:2:3. How should it become whole?",
      "Multiply every entry by 2",
      {
        "Round only 3.5 to 4": "This changes the ratio and atom balance.",
        "Multiply only 3.5 by 2": "Every entry must receive the same factor.",
      },
      "1:3.5:2:3 becomes 2:7:4:6 with all proportions retained.",
      "Scale the whole ratio.",
    ),
    c(
      "r-leftover",
      "Use consumed material",
      "Initial oxygen includes a measured unreacted residue. Which oxygen mass belongs in the reaction ratio?",
      "Initial mass minus unreacted residue",
      {
        "All initial oxygen": "Some of it did not undergo the reaction.",
        "Only the residue": "That is precisely the amount that did not react.",
      },
      "Reacted mass excludes unreacted material; total mass accounting still includes the residue.",
      "Distinguish consumed amount from starting inventory.",
    ),
    c(
      "r-precision",
      "Review real measurements",
      "A measured ratio is near, but not exactly, a small whole-number ratio. What should justify treating it as that ratio?",
      "Stated precision, uncertainty and chemical evidence",
      {
        "Always round every entry to the nearest integer":
          "A genuine half-integer could be destroyed.",
        "Replace the masses until the expected answer fits":
          "Measured data must not be silently changed.",
      },
      "Assess precision and uncertainty and verify atom conservation. Do not apply blanket rounding or force a hoped-for formula.",
      "Use the data's limits and the equation's invariants.",
    ),
  ],
  guided,
  practice: [
    parts(
      "p-amounts",
      "Construct mol amounts",
      "Reacted 7.2 g Mg,4.8 g O₂ and 12 g MgO. M:24,32,40 g/mol. Enter their amounts in that order.",
      [
        { id: "mg", label: "Mg / mol", answer: 0.3 },
        { id: "oxygen", label: "O₂ / mol", answer: 0.15 },
        { id: "oxide", label: "MgO / mol", answer: 0.3 },
      ],
      "7.2/24=.3;4.8/32=.15;12/40=.3 mol.",
      "Use each formula's molar mass.",
    ),
    parts(
      "p-ratio",
      "Construct all coefficients",
      "Amounts .3 mol Mg,.15 mol O₂,.3 mol MgO. Enter smallest coefficients for Mg + O₂ → MgO.",
      [
        { id: "mg", label: "Mg coefficient", answer: 2 },
        { id: "oxygen", label: "O₂ coefficient", answer: 1 },
        { id: "oxide", label: "MgO coefficient", answer: 2 },
      ],
      "Divide all by .15:2:1:2.",
      "Scale all three entries together.",
    ),
    n(
      "p-divisor",
      "Find the common amount unit",
      "Amounts .06:.18:.12 mol for N₂:H₂:NH₃. What is the smallest positive amount used to normalize this ratio?",
      0.06,
      "mol",
      "Divide each amount by .06 to get 1:3:2.",
      "Use the smallest amount, not the smallest mass.",
    ),
    parts(
      "p-ammonia",
      "Derive coefficients from different masses",
      "Reacted masses N₂ 5.6 g,H₂ 1.2 g,NH₃ 6.8 g. M:28,2,17 g/mol. Enter smallest coefficients in that order.",
      [
        { id: "nitrogen", label: "N₂ coefficient", answer: 1 },
        { id: "hydrogen", label: "H₂ coefficient", answer: 3 },
        { id: "ammonia", label: "NH₃ coefficient", answer: 2 },
      ],
      "Mol .2:.6:.4;divide by .2→1:3:2. Each side has N2,H6 per equation event.",
      "Convert each mass before simplifying.",
    ),
    parts(
      "p-water",
      "Derive a different three-part equation",
      "Reacted masses H₂ 0.4 g,O₂ 3.2 g,H₂O 3.6 g. M:2,32,18 g/mol. Enter smallest coefficients in that order.",
      [
        { id: "hydrogen", label: "H₂ coefficient", answer: 2 },
        { id: "oxygen", label: "O₂ coefficient", answer: 1 },
        { id: "water", label: "H₂O coefficient", answer: 2 },
      ],
      "Mol .2:.1:.2→2:1:2.",
      "Use O₂ molar mass 32.",
    ),
    parts(
      "p-decomposition",
      "Derive a decomposition ratio",
      "CaCO₃ 10 g gives CaO 5.6 g and CO₂ 4.4 g. M:100,56,44 g/mol. Enter smallest coefficients in that order.",
      [
        { id: "carbonate", label: "CaCO₃ coefficient", answer: 1 },
        { id: "oxide", label: "CaO coefficient", answer: 1 },
        { id: "gas", label: "CO₂ coefficient", answer: 1 },
      ],
      "Each amount=.1 mol, so 1:1:1. Atom balance includes both oxygen-containing products.",
      "Compare chemical amounts, not 5.6 versus 4.4 grams.",
    ),
    n(
      "p-copper",
      "Use the supplied copper value",
      "Measured 7.62 g Cu; supplied M(Cu)=63.5 g/mol. Find its amount.",
      0.12,
      "mol",
      "7.62/63.5=.12 mol. Do not silently replace 63.5 with 64.",
      "Use the stated molar mass.",
    ),
    n(
      "p-water-amount",
      "Calculate the matching product amount",
      "Measured 2.16 g H₂O; M=18 g/mol. Find its amount.",
      0.12,
      "mol",
      "2.16/18=.12 mol.",
      "Use mass divided by M.",
    ),
    c(
      "p-candidate",
      "Distinguish balanced candidates",
      "An oxide reduced by H₂ gives 7.62 g Cu and 2.16 g water. M:63.5,18 g/mol. Which supplied candidate matches: CuO + H₂ →Cu +H₂O, or Cu₂O +H₂ →2 Cu +H₂O?",
      "CuO candidate",
      {
        "Cu₂O candidate":
          "The measured Cu and water each have .12 mol; Cu₂O needs 2:1.",
        "Both because both are balanced":
          "Atom balance alone does not show which fits the measured amounts.",
      },
      ".12:.12=1:1;CuO candidate matches.",
      "Compare product mol ratios.",
    ),
    c(
      "p-candidate-two",
      "Use evidence for the other candidate",
      "An oxide reduced by H₂ gives 10.16 g Cu and 1.44 g water. M:63.5,18 g/mol. Which candidate matches?",
      "Cu₂O +H₂ →2 Cu +H₂O",
      {
        "CuO +H₂ →Cu +H₂O": "Cu .16 mol and water .08 mol have 2:1, not 1:1.",
        "Neither because gram masses differ":
          "Different product masses do not imply unequal molar ratios of the expected size.",
      },
      "10.16/63.5=.16;1.44/18=.08;ratio 2:1.",
      "Each balanced candidate predicts a different Cu:water ratio.",
    ),
    n(
      "p-oxygen-fraction",
      "Retain the half-integer",
      "Amounts C₂H₆ .2 mol,O₂ .7 mol,CO₂ .4 mol,H₂O .6 mol. Divide all by .2. Enter the oxygen entry before clearing fractions.",
      3.5,
      "",
      ".7/.2=3.5;do not round this to 3 or 4.",
      "Preserve the exact ratio.",
    ),
    parts(
      "p-ethane",
      "Construct all whole coefficients",
      "From ratio 1:3.5:2:3 for C₂H₆:O₂:CO₂:H₂O, enter smallest whole coefficients in that order.",
      [
        { id: "ethane", label: "C₂H₆ coefficient", answer: 2 },
        { id: "oxygen", label: "O₂ coefficient", answer: 7 },
        { id: "carbon", label: "CO₂ coefficient", answer: 4 },
        { id: "water", label: "H₂O coefficient", answer: 6 },
      ],
      "Multiply every entry by 2. C4,H12,O14 on both sides.",
      "Scale all four entries, not just oxygen.",
    ),
    c(
      "p-rounding",
      "Reject a rounded equation",
      "A learner uses C₂H₆ +4 O₂ →2 CO₂ +3 H₂O after rounding 3.5 to 4. Which ledger disproves it?",
      "Oxygen:8 atoms before,7 after",
      {
        "Carbon:2 before,2 after":
          "Carbon is balanced, so it does not expose this error.",
        "Hydrogen:6 before,6 after": "Hydrogen is also balanced.",
      },
      "Oxygen before 4×2=8;after 2×2+3=7.",
      "Check every element separately.",
    ),
    c(
      "p-multiple",
      "Distinguish balanced from simplest",
      "4 C₂H₆ +14 O₂ →8 CO₂ +12 H₂O is atom-balanced. Why simplify it to 2:7:4:6?",
      "All four coefficients share a factor 2",
      {
        "Only oxygen should be divided by 2":
          "All entries must change together.",
        "It is not atom-balanced":
          "It is balanced; its common factor makes it non-minimal.",
      },
      "Divide all coefficients by 2;same stoichiometry, smallest conventional whole-number form.",
      "Do not confuse a non-minimal balanced equation with an unbalanced one.",
    ),

    {
      ...parts(
        "p-apparatus",
        "Interpret measured container data",
        "Use the supplied mass table. The same container is used and all Mg becomes pure MgO with no loss. Enter Mg mass, MgO mass and the mass of oxygen incorporated, all in grams.",
        [
          { id: "metal", label: "Mg mass / g", answer: 6 },
          { id: "oxide", label: "MgO mass / g", answer: 10 },
          { id: "oxygen", label: "O added / g", answer: 4 },
        ],
        "Mg=46−40=6 g;MgO=50−40=10 g;incorporated oxygen=10−6=4 g. The 40 g container is not a reacting substance.",
        "Subtract the same empty-container mass before comparing substances.",
      ),
      massReadings: [
        { label: "Empty container", grams: 40 },
        { label: "Container + Mg before", grams: 46 },
        { label: "Container + pure MgO at constant mass after", grams: 50 },
      ],
    },
    n(
      "p-consumed",
      "Subtract a measured residue",
      "A supplied record has 9.6 g initial O₂ and 3.2 g unreacted O₂. Find reacted oxygen mass.",
      6.4,
      "g",
      "9.6−3.2=6.4 g.",
      "Use initial minus remaining.",
    ),
    parts(
      "p-consumed-amount",
      "Construct reacted oxygen working",
      "Initial 9.6 g O₂ with 3.2 g remaining. M=32 g/mol. Enter reacted mass in g and reacted amount in mol.",
      [
        { id: "mass", label: "Reacted O₂ / g", answer: 6.4 },
        { id: "amount", label: "Reacted O₂ / mol", answer: 0.2 },
      ],
      "Reacted 6.4 g;6.4/32=.2 mol.",
      "Subtract before converting to mol.",
    ),
    c(
      "p-total",
      "Retain leftovers in total mass",
      "6 g Mg +10 g O₂ gives 10 g MgO with 6 g oxygen unreacted. Why exclude the 6 g residue from the reaction ratio but include it in total mass?",
      "It did not react, but still remains in the closed inventory",
      {
        "The unreacted mass disappeared": "It is still present.",
        "Reaction coefficients include every starting amount":
          "They relate quantities consumed/produced, not arbitrary excess.",
      },
      "Reacted 6+4=10 g;whole inventory 6+10=10+6=16 g.",
      "Use different questions for reaction stoichiometry and whole-system mass.",
    ),
    c(
      "p-identity",
      "Keep formulas fixed",
      "Measured reacting masses suggest a ratio but a proposed Mg +O₂ →MgO₂ changes the supplied product MgO. Is that acceptable?",
      "No; changing the formula changes the named substance",
      {
        "Yes if the new equation balances":
          "Balance cannot justify substituting a different product.",
        "Yes because subscripts and coefficients mean the same":
          "Subscripts define entity composition; coefficients scale entities.",
      },
      "Keep MgO and derive coefficient 2:1:2 from reacted mol.",
      "Respect the specified chemical identities.",
    ),
    {
      ...c(
        "p-explain",
        "Explain why masses are not coefficients",
        "Explain how 4.8 g Mg,3.2 g O₂ and 8 g MgO lead to 2:1:2, rather than the simplified mass ratio 3:2:5. M:24,32,40 g/mol.",
        "Divide each reacted mass by its own M:4.8/24=.2,3.2/32=.1,8/40=.2 mol. Divide all by .1→2:1:2. Coefficients represent mol ratios, while different substances have different grams per mol.2 Mg +O₂ →2 MgO conserves Mg 2 and O2 on each side.",
        {},
        "Review quantities, shared scaling and atom balance.",
        "Show both conversions and the element ledger.",
      ),
      options: undefined,
      rubric: [
        "Uses all three correct molar masses.",
        "Obtains .2:.1:.2 and scales all to 2:1:2.",
        "Explains mol/gram distinction and verifies Mg/O conservation.",
      ],
    },
    {
      ...c(
        "p-justify",
        "Explain fractional and measured ratios",
        "Explain why 1:3.5:2:3 must be multiplied throughout by 2 rather than rounding 3.5, and why a noisy measured ratio needs precision/uncertainty evidence before assigning a whole-number equation.",
        "Multiplying every entry by 2 preserves the relative mol amounts and gives 2:7:4:6. Rounding only 3.5 changes the ratio and breaks atom balance. For noisy real data, inspect stated precision, uncertainty and chemical identities and verify atom conservation; do not indiscriminately round or alter the measurements.",
        {},
        "Review preservation of ratios and the limits of measurements.",
        "Separate clearing an exact half-integer from judging uncertain data.",
      ),
      options: undefined,
      rubric: [
        "Scales every entry by 2.",
        "Explains that rounding changes proportions/atom balance.",
        "Requires precision/uncertainty evidence for approximate measured ratios.",
      ],
    },
  ],
  checkForms: [
    [
      parts(
        "ca-amounts",
        "Calculate fresh reacted amounts",
        "Reacted 3.6 g Mg,2.4 g O₂ and 6 g MgO. M:24,32,40 g/mol. Enter their mol amounts.",
        [
          { id: "mg", label: "Mg / mol", answer: 0.15 },
          { id: "oxygen", label: "O₂ / mol", answer: 0.075 },
          { id: "oxide", label: "MgO / mol", answer: 0.15 },
        ],
        "Divide each mass by M: .15:.075:.15 mol.",
        "Name each substance as you divide.",
      ),
      parts(
        "ca-fraction",
        "Derive conventional coefficients",
        "Measured reacting amounts .04:.14:.08:.12 mol for C₂H₆:O₂:CO₂:H₂O. Enter smallest whole coefficients.",
        [
          { id: "ethane", label: "C₂H₆ coefficient", answer: 2 },
          { id: "oxygen", label: "O₂ coefficient", answer: 7 },
          { id: "carbon", label: "CO₂ coefficient", answer: 4 },
          { id: "water", label: "H₂O coefficient", answer: 6 },
        ],
        "Divide by .04→1:3.5:2:3;×2→2:7:4:6.",
        "Clear the fraction throughout.",
      ),
      parts(
        "ca-candidates",
        "Construct fresh candidate evidence",
        "Products 6.35 g Cu and 1.8 g H₂O. M:63.5,18 g/mol. Enter Cu mol,water mol and the ratio Cu mol divided by water mol.",
        [
          { id: "copper", label: "Cu / mol", answer: 0.1 },
          { id: "water", label: "H₂O / mol", answer: 0.1 },
          { id: "ratio", label: "Cu:water factor", answer: 1 },
        ],
        "Both .1 mol;ratio 1. Among CuO/Cu₂O reduction candidates, CuO matches.",
        "Convert both measured masses.",
      ),
      parts(
        "ca-consumed",
        "Use fresh residual oxygen data",
        "Initial 14.4 g O₂ with 4.8 g unreacted. M=32 g/mol. Enter reacted oxygen mass in g and amount in mol.",
        [
          { id: "mass", label: "Reacted O₂ / g", answer: 9.6 },
          { id: "amount", label: "Reacted O₂ / mol", answer: 0.3 },
        ],
        "14.4−4.8=9.6 g;9.6/32=.3 mol.",
        "Subtract the residue before dividing.",
      ),
      c(
        "ca-round",
        "Preserve a half-integer ratio",
        "A normalized ratio has an exact entry 3.5. What preserves it while obtaining whole coefficients?",
        "Multiply every ratio entry by 2",
        {
          "Round 3.5 alone to 4": "That changes the ratios.",
          "Multiply only that entry by 2":
            "Other relative proportions would change.",
        },
        "Apply the same factor to every entry.",
        "Preserve the entire ratio.",
      ),
    ],
    [
      parts(
        "cb-amounts",
        "Calculate fresh molecular amounts",
        "Reacted masses N₂ 4.48 g,H₂ .96 g,NH₃ 5.44 g. M:28,2,17 g/mol. Enter mol amounts in that order.",
        [
          { id: "nitrogen", label: "N₂ / mol", answer: 0.16 },
          { id: "hydrogen", label: "H₂ / mol", answer: 0.48 },
          { id: "ammonia", label: "NH₃ / mol", answer: 0.32 },
        ],
        "4.48/28=.16;.96/2=.48;5.44/17=.32 mol.",
        "Use each named molar mass.",
      ),
      parts(
        "cb-fraction",
        "Derive a changed-scale equation",
        "Amounts .06:.21:.12:.18 mol for C₂H₆:O₂:CO₂:H₂O. Enter smallest whole coefficients.",
        [
          { id: "ethane", label: "C₂H₆ coefficient", answer: 2 },
          { id: "oxygen", label: "O₂ coefficient", answer: 7 },
          { id: "carbon", label: "CO₂ coefficient", answer: 4 },
          { id: "water", label: "H₂O coefficient", answer: 6 },
        ],
        "Divide by .06 then multiply throughout by 2.",
        "Keep ratios unchanged.",
      ),
      parts(
        "cb-candidates",
        "Construct evidence for the other candidate",
        "Products 9.525 g Cu and 1.35 g H₂O. M:63.5,18 g/mol. Enter Cu mol,water mol and the ratio Cu mol divided by water mol.",
        [
          { id: "copper", label: "Cu / mol", answer: 0.15 },
          { id: "water", label: "H₂O / mol", answer: 0.075 },
          { id: "ratio", label: "Cu:water factor", answer: 2 },
        ],
        ".15 mol Cu and .075 mol water;2:1 matches the Cu₂O candidate.",
        "Compare mol rather than grams.",
      ),
      parts(
        "cb-consumed",
        "Calculate changed initial/residual amounts",
        "Initial 20 g O₂ with 12 g remaining. M=32 g/mol. Enter reacted mass and amount.",
        [
          { id: "mass", label: "Reacted O₂ / g", answer: 8 },
          { id: "amount", label: "Reacted O₂ / mol", answer: 0.25 },
        ],
        "20−12=8 g;8/32=.25 mol.",
        "Exclude unreacted excess from the reaction ratio.",
      ),
      c(
        "cb-inventory",
        "Keep leftover mass accounted for",
        "Unreacted excess is excluded from a reaction's mol ratio. What happens to it in a closed-system mass total?",
        "It remains included",
        {
          "It is deleted from the system mass": "It has not disappeared.",
          "It is counted as product":
            "It remains the unreacted starting substance.",
        },
        "Consumed/produced stoichiometry differs from whole-system inventory.",
        "Conserve total mass.",
      ),
    ],
  ],
  reviewForms: [
    [
      parts(
        "ra-moles",
        "Retrieve mass-to-mol conversion",
        "Reacted masses H₂ .12 g,O₂ .96 g,H₂O 1.08 g. M:2,32,18 g/mol. Enter mol amounts.",
        [
          { id: "hydrogen", label: "H₂ / mol", answer: 0.06 },
          { id: "oxygen", label: "O₂ / mol", answer: 0.03 },
          { id: "water", label: "H₂O / mol", answer: 0.06 },
        ],
        ".06:.03:.06 mol;ratio 2:1:2.",
        "Convert each mass separately.",
      ),
      n(
        "ra-residue",
        "Retrieve consumed oxygen",
        "Initial 8 g O₂ with 4.8 g remaining. M=32 g/mol. Find reacted O₂ mol.",
        0.1,
        "mol",
        "(8−4.8)/32=.1 mol.",
        "Subtract before dividing.",
      ),
      n(
        "ra-factor",
        "Retrieve fractional normalization",
        "Amounts .03:.105:.06:.09 mol for ethane:oxygen:carbon dioxide:water. Divide all by .03. Enter oxygen's ratio value before clearing the fraction.",
        3.5,
        "",
        ".105/.03=3.5.",
        "Do not round away the half.",
      ),
    ],
    [
      parts(
        "rb-copper",
        "Retrieve candidate-product evidence",
        "Products 3.175 g Cu and .45 g H₂O. M:63.5,18 g/mol. Enter both mol amounts.",
        [
          { id: "copper", label: "Cu / mol", answer: 0.05 },
          { id: "water", label: "H₂O / mol", answer: 0.025 },
        ],
        ".05:.025=2:1;Cu₂O candidate matches.",
        "Use the supplied copper mass per mol.",
      ),
      n(
        "rb-residue",
        "Retrieve different residual data",
        "Initial 16 g O₂ with 9.6 g remaining. M=32 g/mol. Find reacted O₂ mol.",
        0.2,
        "mol",
        "(16−9.6)/32=.2 mol.",
        "Use consumed mass.",
      ),
      n(
        "rb-divisor",
        "Retrieve shared normalization",
        "Amounts .08:.24:.16 mol for N₂:H₂:NH₃. Enter the smallest amount used to normalize all entries.",
        0.08,
        "mol",
        "Divide all by .08→1:3:2.",
        "Use the same divisor throughout.",
      ),
    ],
  ],
};
balancingMassesJourney.practice.find(
  (q) => q.id === "bm-v1-p-rounding",
)!.followUp = "bm-v1-r-whole";
balancingMassesJourney.practice.find(
  (q) => q.id === "bm-v1-p-total",
)!.followUp = "bm-v1-r-leftover";
