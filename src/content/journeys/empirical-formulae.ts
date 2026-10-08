import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
): LearningTask => ({
  ...number(`ef-v1-${id}`, prompt, answer, unit, explanation, hint, title),
  title,
});
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask => ({
  ...choice(`ef-v1-${id}`, prompt, answer, errors, explanation, hint, title),
  title,
});
const p = (
  id: string,
  title: string,
  prompt: string,
  parts: { id: string; label: string; answer: number }[],
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  id: `ef-v1-${id}`,
  title,
  prompt,
  parts,
  partLegend: title,
  answer: JSON.stringify(
    Object.fromEntries(parts.map((p) => [p.id, String(p.answer)])),
  ),
  explanation,
  hint,
  purpose: title,
  model,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  explanation: string,
  rubric: string[],
): LearningTask => ({
  id: `ef-v1-${id}`,
  title,
  prompt,
  answer: explanation,
  explanation,
  rubric,
  hint: "Name each quantity and explain why the same scaling applies to every element.",
  purpose: title,
});
const m = (
  mode: "masses" | "fraction" | "percent" | "molecular" | "experiment",
  instruction: string,
): TaskModel => ({ kind: "empirical-formulae", mode, instruction });
export const empiricalFormulaeJourney: LessonJourney = {
  version: 1,
  introduction:
    "Use measured composition to build the simplest atom ratio, then distinguish it from a whole molecule.",
  scopeNote:
    "Pearson GCSE Chemistry and Combined Science 1.44–1.46 include empirical and molecular formulae in shared Foundation content; the old Higher/Chemistry-only label is corrected. AQA has related ionic-formula and Higher measured-mass ratio demands, but this is not a claim that every board has identical requirements. Ar and Mr are relative masses without units. With every element mass in the same unit, mass divided by Ar gives relative amounts proportional to the numbers of atoms. Only their ratio is used here; defining moles or using Avogadro's constant is not required. Ar remains a relative mass without units. Divide every element amount by the same smallest amount, then multiply every part to clear genuine fractions and reduce to smallest whole numbers. Do not directly use gram or percentage ratios as atom ratios. A 100 g percentage sample is a convenient calculation basis, not a required experiment. Rounded measurement ratios close to integers may be justified by the supplied precision; 1.5 cannot simply be rounded to 2. A molecular formula requires additional molecular Mr and a positive whole-number multiple of every empirical subscript. Empirical ratios do not imply discrete molecules for ionic solids. The optional 3D example is one intact ethane molecule C2H6; CH3 labels its simplest ratio, not a separate molecule. Magnesium-oxide data come from a supervised school experiment; this lesson interprets supplied readings and reasons about measurement, not instructions for unsupervised practical work. Constant mass supports completion but does not alone prove purity or absence of product loss. Written explanations remain self-reviewed and cannot earn automatic correctness.",
  outcomes: [
    "Convert each element mass using its own relative atomic mass.",
    "Scale all ratio parts together, including halves and thirds.",
    "Use percentage composition with an explicit convenient mass basis.",
    "Use molecular Mr to scale the entire empirical formula.",
    "Subtract apparatus and infer oxygen gain while judging the evidence.",
  ],
  warmup: [
    n(
      "w-ratio",
      "Recall a simplest ratio",
      "Simplify 8:12. Enter the first part of the simplest ratio.",
      2,
      "ratio part",
      "8:12 = 2:3 after dividing both parts by 4.",
      "Use the same divisor for both parts.",
    ),
    n(
      "w-mass",
      "Recall an element amount",
      "A sample contains 6.0 g C with Ar 12. Calculate its relative amount using mass ÷ Ar.",
      0.5,
      "relative amount",
      "6.0/12 = 0.50, a relative amount used to compare atom counts.",
      "Divide the carbon mass by its own Ar.",
    ),
  ],
  refresher: [
    c(
      "r-meaning",
      "Read an empirical formula",
      "What does empirical CH2 state?",
      "The simplest C:H atom ratio is 1:2",
      {
        "Every molecule has exactly one C and two H":
          "That requires a molecular formula; several multiples share this ratio.",
        "The C:H mass ratio is 1:2":
          "Atom counts and masses have different ratios.",
      },
      "Empirical formula gives the smallest whole-number ratio of atoms.",
      "Read the quantity represented by the subscripts.",
    ),
    n(
      "r-amount",
      "Convert oxygen mass",
      "A compound contains 4.8 g oxygen, with Ar O=16. Calculate the relative oxygen amount using mass ÷ Ar.",
      0.3,
      "relative amount",
      "4.8/16 = 0.30 relative amount. This compares constituent O atoms, not a separate O2 gas sample.",
      "Use the constituent element, not the oxygen-gas molecular mass.",
    ),
    c(
      "r-fraction",
      "Preserve a half ratio",
      "A normalised atom ratio is Al:O = 1:1.5. Choose the smallest whole ratio.",
      "2:3",
      {
        "1:2": "Rounding changes the ratio.",
        "2:1.5": "Both parts must be multiplied.",
      },
      "Multiply every part by 2: 1:1.5 becomes 2:3.",
      "Clear the fraction by common scaling.",
    ),
    c(
      "r-percent",
      "Choose a percentage basis",
      "A composition is given as mass percentages. Which convenient starting sample is valid?",
      "100 g, so each percentage becomes the same numerical mass in grams",
      {
        "100 atoms, so percentages are atom counts":
          "These percentages describe mass, not atom counts.",
        "One gram of every element": "That changes the supplied composition.",
      },
      "A 100 g calculation basis preserves the stated composition; convert each element mass separately afterwards.",
      "Choose a mass basis, not an atom basis.",
    ),
    c(
      "r-molecular",
      "Identify missing information",
      "An empirical formula is CH2. What additional information determines the molecular formula?",
      "The relative molecular mass",
      {
        "The number of bonds drawn only":
          "The formula does not supply that structure.",
        "The mass of any sample only":
          "Without molecule amount or molecular mass, multiples remain possible.",
      },
      "Molecular Mr divided by the empirical formula mass gives the common integer multiplier.",
      "A whole molecule may contain several empirical ratios.",
    ),
  ],
  guided: [
    p(
      "g-masses",
      "Masses to relative amounts",
      "Initial record: 4.8 g Mg and 3.2 g O in a compound. Ar Mg=24, O=16. Calculate mass ÷ Ar for each element.",
      [
        { id: "mg", label: "Mg: mass ÷ Ar", answer: 0.2 },
        { id: "o", label: "O: mass ÷ Ar", answer: 0.2 },
      ],
      "Mg: 4.8/24 = 0.20; O: 3.2/16 = 0.20 relative amount. Ratio 1:1 gives MgO, although the gram masses differ.",
      "Divide each mass by its own Ar.",
      m(
        "masses",
        "Compare a scaled sample and kg/g expression while preserving the simplest atom ratio.",
      ),
    ),
    p(
      "g-fraction",
      "Clear the fractional ratio",
      "Initial record: Al:O element amounts 0.4:0.6. Find the smallest whole-number Al and O subscripts.",
      [
        { id: "al", label: "Al subscript", answer: 2 },
        { id: "o", label: "O subscript", answer: 3 },
      ],
      "Divide both amounts by 0.4 to obtain 1:1.5. Multiply both by 2 to obtain Al2O3.",
      "Do not round 1.5; multiply every part.",
      m(
        "fraction",
        "Preserve the exact ratio through halves and thirds, then demand smallest whole subscripts.",
      ),
    ),
    p(
      "g-percent",
      "Percentages to three elements",
      "Initial record: 37.5% C, 12.5% H, 50.0% O by mass. Ar values C=12, H=1, O=16. Find the smallest C, H and O subscripts.",
      [
        { id: "c", label: "C subscript", answer: 1 },
        { id: "h", label: "H subscript", answer: 4 },
        { id: "o", label: "O subscript", answer: 1 },
      ],
      "On a 100 g basis, amounts are 37.5/12 = 3.125, 12.5/1 = 12.5 and 50/16 = 3.125. Divide all by 3.125: 1:4:1 gives CH4O.",
      "A percentage mass is not already an atom count.",
      m(
        "percent",
        "Compare a 100 g basis, a proportional 200 g sample and appropriately rounded measurement data.",
      ),
    ),
    p(
      "g-molecular",
      "Build a whole molecule",
      "Initial record: empirical CH3 and molecular Mr 30. Ar C=12, H=1. Find the multiplier and C/H atom counts in a molecule.",
      [
        { id: "k", label: "Multiplier", answer: 2 },
        { id: "c", label: "C atoms", answer: 2 },
        { id: "h", label: "H atoms", answer: 6 },
      ],
      "Empirical mass = 12+3 = 15; multiplier = 30/15 = 2. Multiply both subscripts: C2H6. The 3D asset depicts one intact ethane molecule.",
      "Scale every subscript by the same positive whole number.",
      m(
        "molecular",
        "Check whole molecular multiples, a changed empirical formula and inconsistent exact supplied masses.",
      ),
    ),
    p(
      "g-experiment",
      "Separate metal and oxygen",
      "Initial supervised Mg-oxidation data: crucible 20.00 g; crucible+Mg 20.48 g; final cooled crucible+oxide readings 20.80 and 20.80 g. Find the Mg mass and oxygen mass in the oxide.",
      [
        { id: "mg", label: "Mg mass / g", answer: 0.48 },
        { id: "o", label: "O mass / g", answer: 0.32 },
      ],
      "Mg = 20.48−20.00 = 0.48 g. Oxygen gain = 20.80−20.48 = 0.32 g. Amounts 0.48/24 and 0.32/16 both equal 0.020 in the same relative units: MgO. Stable cooled readings support this analysis, with the stated pure-product assumptions.",
      "Use the initial metal reading for Mg and the mass gain for oxygen.",
      m(
        "experiment",
        "Distinguish apparatus from contents and a provisional changing-mass ratio from a completed measurement.",
      ),
    ),
  ],
  practice: [
    c(
      "p-ethane",
      "Simplify molecular counts",
      "A molecule is C2H6. Choose its empirical formula.",
      "CH3",
      {
        C2H6: "The ratio 2:6 has a common factor of 2.",
        CH2: "That changes the hydrogen-to-carbon ratio.",
      },
      "C:H = 2:6 simplifies to 1:3.",
      "Divide every subscript by the greatest common factor.",
    ),
    c(
      "p-glucose",
      "Simplify three elements",
      "A molecule is C6H12O6. Choose its empirical formula.",
      "CH2O",
      {
        C6H12O6: "All three counts share a factor of 6.",
        CHO: "H has twice the relative count of C and O.",
      },
      "6:12:6 divided by 6 gives 1:2:1.",
      "The common divisor must apply to every element.",
    ),
    c(
      "p-peroxide",
      "Keep the empirical ratio",
      "A molecule is H2O2. Choose its empirical formula.",
      "HO",
      {
        H2O: "That changes the H:O ratio.",
        H2O2: "This ratio is not yet simplest.",
      },
      "H:O = 2:2 simplifies to 1:1, written HO. It does not claim an isolated HO molecule.",
      "An omitted subscript means one.",
    ),
    c(
      "p-magnesium",
      "Use masses, not their raw ratio",
      "A compound contains 7.2 g Mg and 4.8 g O. Ar Mg=24, O=16. Choose its empirical formula.",
      "MgO",
      {
        Mg3O2: "3:2 is the gram ratio, not the atom ratio.",
        Mg2O3: "This reverses an unsupported raw-mass ratio.",
      },
      "Amounts 7.2/24 = 0.30 and 4.8/16 = 0.30 give 1:1.",
      "Different elements have different masses per atom.",
    ),
    c(
      "p-aluminium",
      "Multiply a half ratio",
      "A compound contains 10.8 g Al and 9.6 g O. Ar Al=27, O=16. Choose its empirical formula.",
      "Al2O3",
      {
        AlO2: "1:1.5 cannot be rounded to 1:2.",
        AlO: "The element amounts are not equal.",
      },
      "Amounts 0.4:0.6 normalise to 1:1.5, then scale to 2:3.",
      "Multiply every part by 2.",
    ),
    c(
      "p-iron",
      "Clear a third",
      "A compound contains 16.8 g Fe and 6.4 g O. Ar Fe=56, O=16. Choose its empirical formula.",
      "Fe3O4",
      {
        FeO: "The amounts 0.30 and 0.40 are not equal.",
        FeO2: "Rounding 1.333… to 2 changes the ratio.",
      },
      "Amounts 0.30:0.40 give 3:4. The normalised 1:4/3 ratio needs common multiplication by 3.",
      "Retain the fractional ratio before choosing a multiplier.",
    ),
    n(
      "p-oxygen-gain",
      "Recover oxygen mass",
      "A pure Mg sample has mass 0.72 g; the resulting pure oxide has mass 1.20 g. Find the oxygen mass gained.",
      0.48,
      "g",
      "Oxygen = 1.20−0.72 = 0.48 g. The product mass contains both elements.",
      "Subtract the original metal mass from oxide mass.",
    ),
    c(
      "p-percent-two",
      "Infer from percentage masses",
      "A compound is 80.0% C and 20.0% H by mass. Ar C=12, H=1. Choose its empirical formula.",
      "CH3",
      { C4H: "4:1 is the mass ratio.", CH4: "100 g gives 80/12:20/1 = 1:3." },
      "On a 100 g basis, amounts 6.666…:20 simplify to 1:3.",
      "Convert the two percentage masses before comparing.",
    ),
    c(
      "p-percent-three",
      "Use all three elements",
      "A compound is 40.0% C, 6.7% H and 53.3% O by mass, rounded to one decimal place. Ar 12, 1, 16. Choose the supported empirical formula.",
      "CH2O",
      {
        CHO: "Hydrogen relative amount is close to 2, not 1.",
        C40H7O53: "Those rounded mass percentages are not atom subscripts.",
      },
      "On a 100 g basis, amounts are 3.333…, 6.7 and 3.33125. Normalised ratios are about 1.001:2.011:1, consistent with 1:2:1 at this supplied measurement precision.",
      "Small measurement deviations differ from an exact half-integer ratio.",
    ),
    c(
      "p-basis",
      "Scale the sample without changing composition",
      "A pure compound has empirical CH4O. What happens to its empirical formula when the analysed sample mass doubles?",
      "It stays CH4O",
      {
        "It becomes C2H8O2":
          "Those counts describe an unsimplified equivalent ratio, not a changed empirical formula.",
        "The hydrogen subscript doubles only":
          "Every element amount scales together.",
      },
      "All element masses and amounts double; their simplest ratio stays 1:4:1.",
      "Sample amount and composition are different quantities.",
    ),
    n(
      "p-empirical-mass",
      "Construct the whole empirical mass",
      "Empirical C2H3O2 uses Ar C=12, H=1, O=16. Find its relative empirical formula mass.",
      59,
      "relative mass",
      "2×12+3×1+2×16 = 59.",
      "Include every subscript-weighted element contribution.",
    ),
    n(
      "p-multiplier",
      "Find a molecular multiplier",
      "A compound has empirical CH2O and molecular Mr 150. Ar C=12, H=1, O=16. Find the multiplier.",
      5,
      "multiplier",
      "Empirical mass = 30; 150/30 = 5. Every subscript must be multiplied by 5.",
      "Compare like relative formula masses.",
    ),
    c(
      "p-molecular-ch2",
      "Scale all molecular subscripts",
      "Empirical CH2, molecular Mr 70, Ar C=12, H=1. Choose the molecular formula.",
      "C5H10",
      {
        CH10: "Carbon must also scale by 5.",
        C5H2: "Hydrogen must also scale by 5.",
      },
      "Empirical mass 14; 70/14 = 5; molecular C5H10.",
      "Multiply every empirical subscript.",
    ),
    c(
      "p-molecular-cho",
      "Keep oxygen in the multiplier",
      "Empirical CH2O, molecular Mr 90, Ar 12, 1, 16. Choose the molecular formula.",
      "C3H6O3",
      {
        C3H6O: "Oxygen must also multiply by 3.",
        CH2O: "The molecular mass is three empirical masses.",
      },
      "Empirical mass 30; multiplier 3; counts 3:6:3.",
      "A subscript omitted in the empirical formula still means one to scale.",
    ),
    c(
      "p-inconsistent",
      "Reject incompatible exact data",
      "Exact supplied data: empirical CH2 and molecular Mr 35, Ar C=12, H=1. Which conclusion follows?",
      "The supplied data are inconsistent with a whole molecular multiple",
      {
        "C2.5H5 is the molecular formula": "A molecule has whole atom counts.",
        "Round the multiplier to 3 and use C3H6":
          "Its relative molecular mass would be 42, not the exact supplied 35.",
      },
      "35/14 = 2.5, not a positive whole multiple. Recheck the data; do not invent fractional atoms or silently round exact masses.",
      "The molecular multiplier must be a positive whole number.",
    ),
    p(
      "p-crucible",
      "Subtract the apparatus",
      "Supervised Mg-oxide data: empty crucible 18.40 g; crucible+Mg 19.00 g; final cooled crucible+oxide 19.40 g. Find Mg mass and oxygen gain.",
      [
        { id: "mg", label: "Mg mass / g", answer: 0.6 },
        { id: "o", label: "O mass / g", answer: 0.4 },
      ],
      "Mg = 19.00−18.40 = 0.60 g; O = 19.40−19.00 = 0.40 g. Both relative amounts are 0.025 using Ar Mg=24 and O=16.",
      "Apparatus belongs in neither element mass.",
    ),
    c(
      "p-constant",
      "Judge whether the readings are final",
      "After successive supervised treatments and cooling, crucible+oxide readings are 25.60, 25.64 and 25.68 g. What can be concluded?",
      "The changing mass does not yet support a final composition",
      {
        "Use 25.68 g as proven final mass":
          "It is the latest reading, but mass is still changing.",
        "The compound must have fractional atoms":
          "Unfinished measurement is not a molecular atom count.",
      },
      "Constant-mass evidence is missing. A provisional calculation is not proof of the final oxide composition.",
      "Look for stability, not simply the largest reading.",
    ),
    c(
      "p-loss",
      "Predict the effect of lost product",
      "In a supervised Mg-oxide experiment, some oxide escapes before weighing. The initial Mg mass is unchanged. What happens to the calculated oxygen gain?",
      "It is underestimated",
      {
        "It is overestimated": "Loss reduces the final weighed product mass.",
        "It stays exact because mass is conserved":
          "Matter outside the weighed boundary is missing from the measurement.",
      },
      "Final weighed mass is too low, so final mass minus initial metal mass underestimates oxygen uptake.",
      "Keep the measured apparatus boundary explicit.",
    ),
    c(
      "p-not-molecule",
      "Respect ionic structure",
      "Does empirical MgO mean a piece of magnesium oxide consists of separate covalent MgO molecules?",
      "No: it gives the 1:1 ion ratio in the ionic structure",
      {
        "Yes: every ionic compound has discrete molecules":
          "An ionic lattice extends beyond a separate molecule.",
        "No: there is no fixed composition":
          "The simplest ion ratio is still fixed.",
      },
      "MgO is an ionic empirical formula; it states the composition without inventing isolated MgO molecules.",
      "Formula ratios do not determine the type of bonding structure.",
    ),
    w(
      "p-proof",
      "Explain why equal masses do not imply equal counts",
      "A mixture contains equal masses of carbon and hydrogen; Ar C=12 and H=1. Explain why C:H constituent atom counts are not 1:1, find their ratio, and explain why it does not establish a pure compound formula.",
      "For equal masses m, amounts are m/12 and m/1. Dividing by m/12 gives C:H = 1:12. A hydrogen atom contributes far less mass than a carbon atom, so equal masses imply more H atoms. A mixture is not thereby a pure compound. The constituent count ratio does not establish a compound formula.",
      [
        "Convert both equal masses using their own element mass.",
        "Give the relative count ratio 1:12.",
        "Distinguish a mixture constituent ratio from a pure compound formula.",
      ],
    ),
    w(
      "p-structure",
      "Explain empirical and molecular evidence",
      "An intact ethane molecule is C2H6, with molecular Mr 30 and Ar C=12, H=1. Explain why its empirical formula is CH3, why CH3 alone does not specify the whole molecule, and how Mr resolves the counts.",
      "The counts 2:6 simplify to 1:3, hence empirical CH3. That ratio can describe several whole-number multiples and does not mean the ethane molecule has only one C and three H. Empirical mass is 15; 30/15 = 2, giving C2H6. Formula counts alone do not establish molecular geometry or connectivity.",
      [
        "Simplify 2:6 to 1:3.",
        "Distinguish simplest ratio from whole molecule counts.",
        "Use 30/15 = 2 and scale both subscripts.",
      ],
    ),
  ],
  checkForms: [
    [
      p(
        "ca-masses",
        "Independent element conversion",
        "A pure compound contains 14.56 g Fe and 6.24 g O. Ar Fe=56, O=16. Calculate mass ÷ Ar for each element.",
        [
          { id: "fe", label: "Fe: mass ÷ Ar", answer: 0.26 },
          { id: "o", label: "O: mass ÷ Ar", answer: 0.39 },
        ],
        "14.56/56 = 0.26 for Fe; 6.24/16 = 0.39 for O. Their ratio is 2:3.",
        "Convert each element separately.",
      ),
      c(
        "ca-counts",
        "Independent molecular simplification",
        "A molecule is C3H6. Choose its empirical formula.",
        "CH2",
        {
          C3H6: "Both counts have a common factor of 3.",
          CH3: "That changes the ratio.",
        },
        "3:6 simplifies to 1:2.",
        "Use a common divisor.",
      ),
      c(
        "ca-fraction",
        "Independent fractional amounts",
        "A pure compound has N:O element amounts 0.18:0.45. Choose its empirical formula.",
        "N2O5",
        {
          NO3: "1:2.5 cannot be rounded away.",
          N3O5: "Both amounts must undergo the same scaling.",
        },
        "Divide by 0.18: 1:2.5; multiply both by 2: 2:5.",
        "Retain the fraction and scale all parts.",
      ),
      n(
        "ca-molecular",
        "Independent changed molecular mass",
        "Empirical CH2, molecular Mr 84, Ar C=12, H=1. How many carbon atoms are in a molecule?",
        6,
        "C atoms",
        "Empirical mass 14; multiplier 84/14 = 6; carbon count 1×6 = 6.",
        "Find the common whole multiplier.",
      ),
      w(
        "ca-proof",
        "Independent measurement judgment",
        "Supervised Mg-oxide readings: empty crucible 22.00 g; crucible+Mg 22.36 g; cooled final readings 22.60 and 22.60 g. Ar Mg=24, O=16. Explain the element masses, empirical formula and one limitation of constant mass.",
        "Mg = 0.36 g; O = 22.60−22.36 = 0.24 g. Amounts 0.36/24 and 0.24/16 both equal 0.015, hence MgO under the pure-product assumptions. Stable cooled readings support completion, but do not prove absence of product loss or contamination.",
        [
          "Subtract tare for Mg and initial metal reading for oxygen.",
          "Find equal element amounts and MgO.",
          "Explain one reason constant mass alone does not prove correct pure-product composition.",
        ],
      ),
    ],
    [
      p(
        "cb-masses",
        "Independent changed elements",
        "A pure compound contains 13.00 g Cr and 6.00 g O. Ar Cr=52, O=16. Calculate mass ÷ Ar for each element.",
        [
          { id: "cr", label: "Cr: mass ÷ Ar", answer: 0.25 },
          { id: "o", label: "O: mass ÷ Ar", answer: 0.375 },
        ],
        "13/52 = 0.25 for Cr; 6/16 = 0.375 for O. Smallest ratio 2:3.",
        "Use each supplied Ar.",
      ),
      c(
        "cb-counts",
        "Independent changed molecule",
        "A molecule is C4H8O2. Choose its empirical formula.",
        "C2H4O",
        {
          CH2O: "The oxygen count would then have the wrong proportion.",
          C4H8O2: "The ratio still has a common divisor of 2.",
        },
        "4:8:2 divided by 2 gives 2:4:1; no larger common divisor applies to all three.",
        "Every element must share the same divisor.",
      ),
      c(
        "cb-percent",
        "Independent changed composition",
        "A pure compound is 63.6% N and 36.4% O by mass, rounded to one decimal place. Ar N=14, O=16. Choose the supported empirical formula.",
        "N2O",
        {
          N7O4: "A percentage-mass ratio is not an atom ratio.",
          NO: "The relative nitrogen amount is close to twice the oxygen amount.",
        },
        "On a 100 g basis: 63.6/14 = 4.542857… and 36.4/16 = 2.275. The normalised ratio is about 1.997:1, consistent with 2:1 at the supplied precision.",
        "Convert percentage masses and judge near integers using the stated precision.",
      ),
      n(
        "cb-molecular",
        "Independent oxygen multiplier",
        "Empirical C2H4O and molecular Mr 132. Ar C=12, H=1, O=16. How many oxygen atoms are in a molecule?",
        3,
        "O atoms",
        "Empirical mass 44; 132/44 = 3; oxygen count 1×3 = 3.",
        "Scale an omitted subscript of one too.",
      ),
      w(
        "cb-proof",
        "Independent empirical evidence",
        "A compound has empirical CH2. Explain why this alone does not determine a molecular formula, and use molecular Mr 112 with Ar C=12, H=1 to determine its molecular formula. Does that formula alone specify the structure?",
        "Empirical CH2 gives the simplest C:H ratio 1:2, leaving possible positive whole-number multiples. Empirical mass is 14; 112/14 = 8, giving C8H16 by scaling both subscripts. Molecular formula gives atom counts, not a unique bonding arrangement, geometry or substance identity. Additional structural evidence is needed.",
        [
          "Distinguish the ratio from whole molecule counts.",
          "Use 112/14 = 8 and scale both subscripts.",
          "Explain why counts alone do not determine a unique structure.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-ratio",
        "Retrieve simplest molecular counts",
        "A molecule is N2O4. Choose its empirical formula.",
        "NO2",
        {
          N2O4: "Both counts divide by 2.",
          NO: "The oxygen-to-nitrogen ratio is 2, not 1.",
        },
        "2:4 simplifies to 1:2.",
        "Use the greatest shared divisor.",
      ),
      n(
        "ra-gain",
        "Retrieve oxygen mass gain",
        "A supervised pure-metal oxidation sample starts at 1.08 g and finishes as 1.80 g oxide. Find the oxygen mass gained.",
        0.72,
        "g",
        "1.80−1.08 = 0.72 g oxygen.",
        "Subtract initial metal mass from product mass.",
      ),
      n(
        "ra-molecular",
        "Retrieve whole-subscript scaling",
        "Empirical CH2O, molecular Mr 120 and Ar 12, 1, 16. How many H atoms are in a molecule?",
        8,
        "H atoms",
        "Empirical mass 30; multiplier 4; H count = 2×4 = 8.",
        "An empirical subscript may already exceed one.",
      ),
    ],
    [
      c(
        "rb-ratio",
        "Retrieve a changed three-element ratio",
        "A molecule is C2H4O2. Choose its empirical formula.",
        "CH2O",
        {
          C2H4O2: "The ratio has common factor 2.",
          CH4O: "Only hydrogen cannot be left unscaled.",
        },
        "2:4:2 divided by 2 gives 1:2:1.",
        "Reduce all three subscripts together.",
      ),
      n(
        "rb-gain",
        "Retrieve apparatus subtraction",
        "Supervised data: crucible 12.40 g; crucible+metal 13.30 g; crucible+oxide 13.90 g. Find the oxygen mass gained.",
        0.6,
        "g",
        "Oxygen gain = 13.90−13.30 = 0.60 g. The apparatus mass cancels.",
        "Use the difference between product and initial metal readings.",
      ),
      n(
        "rb-molecular",
        "Retrieve a changed empirical multiplier",
        "Empirical C2H3O2, molecular Mr 118, Ar C=12, H=1, O=16. How many carbon atoms are in a molecule?",
        4,
        "C atoms",
        "Empirical mass 59; multiplier 118/59 = 2; C count 2×2 = 4.",
        "Construct the complete empirical mass first.",
      ),
    ],
  ],
};
empiricalFormulaeJourney.guided[0].openingHint = true;
empiricalFormulaeJourney.practice.find(
  (q) => q.id === "ef-v1-p-aluminium",
)!.followUp = "ef-v1-r-fraction";
empiricalFormulaeJourney.practice.find(
  (q) => q.id === "ef-v1-p-percent-three",
)!.followUp = "ef-v1-r-percent";
