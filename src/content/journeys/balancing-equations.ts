import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
import { extendEquationWriting } from "./equation-writing";
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
    `be-v1-${id}`,
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
  explanation: string,
  hint: string,
): LearningTask => ({
  ...number(`be-v1-${id}`, prompt, answer, "", explanation, hint, title),
  title,
});
function coefficients(
  id: string,
  title: string,
  prompt: string,
  formulas: string[],
  values: number[],
  explanation: string,
  hint: string,
): LearningTask {
  const parts = formulas.map((f, i) => ({
    id: `c${i}`,
    label: `Coefficient of ${f}`,
    answer: values[i],
  }));
  return {
    id: `be-v1-${id}`,
    title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(parts.map((p) => [p.id, String(p.answer)])),
    ),
    parts,
    partLegend: "Enter every coefficient, including 1",
    explanation,
    hint,
    purpose:
      "Requires every coefficient for the supplied formula skeleton; complete equation writing is assessed separately.",
  };
}
const guided = [
  c(
    "g-ledger",
    "Conserve every element",
    "Balance H₂ + O₂ → H₂O. Keep formulas fixed.",
    "2H₂ + O₂ → 2H₂O",
    {
      "H₂ + O₂ → H₂O": "Hydrogen matches, but oxygen does not.",
      "H₂ + O₂ → H₂O₂": "This changes water into a different compound.",
    },
    "Two water molecules contain four H and two O atoms. Two H₂ and one O₂ supply those atoms.",
    "Adjust the coefficient of a complete formula.",
    {
      kind: "equation-balancing",
      mode: "ledger",
      instruction: "Use whole-number coefficients; check every element.",
    },
  ),
  c(
    "g-molecules",
    "Count complete molecules",
    "For initial methane combustion, balance CH₄ + O₂ → CO₂ + H₂O.",
    "CH₄ + 2O₂ → CO₂ + 2H₂O",
    {
      "CH₄ + O₂ → CO₂ + 2H₂O":
        "Products contain four O atoms, but reactants contain two.",
      "CH₄ + 2O₂ → CO₂ + H₂O":
        "Hydrogen and oxygen are both short on the product side.",
    },
    "Balance C, then H, then total O across both product formulas. Molecule numbers can change while each element’s atom total stays fixed.",
    "Count oxygen in both carbon dioxide and water.",
    {
      kind: "equation-balancing",
      mode: "molecules",
      instruction:
        "Change complete-molecule amounts. Compare methane and ethane, retaining all element counts; fractional amounts are an intermediate step only.",
    },
  ),
  c(
    "g-identity",
    "Preserve the named substance",
    "A student changes H₂O to H₂O₂ to make the all-one equation conserve atoms. Why is that not a valid balance of the reaction forming water?",
    "It changes the specified product from water to hydrogen peroxide",
    {
      "It never conserves atom counts":
        "H₂ + O₂ → H₂O₂ does conserve H and O counts. The product identity is wrong.",
      "All formulas can be changed when counts match":
        "Subscripts specify the substance.",
    },
    "Conservation is necessary, and the correct substances must also be retained. Restore H₂O and change coefficients.",
    "Check both identity and atom counts.",
    {
      kind: "equation-balancing",
      mode: "identity",
      instruction:
        "Inspect a tempting atom-balanced formula change. Restore the specified water and explain why identity matters.",
    },
  ),
  c(
    "g-words",
    "Write formulas before balancing",
    "Potassium reacts with water to form potassium hydroxide and hydrogen. Select the correct product formulas and balance the equation.",
    "2K + 2H₂O → 2KOH + H₂",
    {
      "K + H₂O → KO + H₂": "Potassium hydroxide is KOH, not KO.",
      "K + H₂O → KOH + H":
        "Hydrogen gas is H₂; all H atoms must be accounted for.",
    },
    "Correct formulas first, coefficients second: two K, two O and four H atoms occur on each side.",
    "Use KOH and H₂, then recount all three elements.",
    {
      kind: "equation-balancing",
      mode: "words",
      instruction:
        "Translate named products into formulas, then construct the complete coefficient ratio.",
    },
  ),
];
guided[0].openingHint = true;
export const balancingJourney: LessonJourney = {
  version: 1,
  introduction:
    "Preserve each substance, change whole-formula amounts and verify every element on both sides.",
  scopeNote:
    "Common GCSE symbol-equation construction and atom conservation. State symbols describe supplied physical states; they do not multiply atoms. Moles from masses, ionic equations and half equations have separate later lessons. Molecular models are schematic counting representations, not a reaction mechanism.",
  outcomes: [
    "Count coefficient × formula subscript for every element.",
    "Balance complete equations without altering substances.",
    "Recognise balanced multiples and write a smallest whole-number ratio when requested.",
    "Translate supplied word reactions and interpret state symbols separately.",
  ],
  warmup: [
    n(
      "w-count",
      "Recall a whole-formula multiplier",
      "How many H atoms are represented by 3H₂O?",
      6,
      "Each of three water molecules has two H atoms: 3×2=6.",
      "The coefficient multiplies the complete formula.",
    ),
    n(
      "w-bracket",
      "Recall a bracket multiplier",
      "How many O atoms occur in one Ca(OH)₂ formula unit?",
      2,
      "The outside 2 multiplies both O and H in the bracket.",
      "Do not multiply calcium by the bracket subscript.",
    ),
  ],
  refresher: [
    c(
      "r-count",
      "Multiply complete formulas",
      "How many O atoms are represented by 2CO₂ + 3H₂O?",
      "7",
      {
        "5": "There are two O per CO₂ and one O per water.",
        "10": "Each subscript belongs only to its own element.",
      },
      "2×2 + 3×1 = 7 O atoms. Add contributions from every formula containing oxygen.",
      "Sum both oxygen contributions.",
    ),
    c(
      "r-identity",
      "Keep formula identities",
      "When balancing a supplied reaction, which can be changed?",
      "Coefficients before complete formulas",
      {
        "Subscripts inside formulas": "That changes the substances.",
        "Element symbols":
          "That replaces elements rather than rearranging atoms.",
      },
      "The substances stay fixed; coefficients change their relative amounts.",
      "Distinguish 2H₂O from H₂O₂.",
    ),
    c(
      "r-every",
      "Verify every element",
      "If H counts match but O counts do not, is the equation balanced?",
      "No; each element must match",
      {
        "Yes; matching any element is enough":
          "All elements must be conserved.",
        "Yes; the total number of molecules must match":
          "Molecule numbers need not be equal.",
      },
      "A separate count is required for every element.",
      "Use an element-by-element ledger.",
    ),
    c(
      "r-ratio",
      "Scale the complete ratio",
      "Why is 4H₂ + 2O₂ → 4H₂O balanced?",
      "It doubles every coefficient of the balanced 2:1:2 ratio",
      {
        "It doubles only the oxygen subscript": "Subscripts are unchanged.",
        "It balances despite losing hydrogen atoms":
          "Eight H occur on both sides.",
      },
      "Whole multiples conserve every element. Divide all coefficients by a common factor for the smallest ratio.",
      "Scale every term together.",
    ),
    c(
      "r-formulas",
      "Use named-product formulas",
      "Hydrogen gas is supplied as a product. Which formula is appropriate here?",
      "H₂",
      {
        H: "Hydrogen gas is diatomic.",
        "H₂O": "That is water, a different substance.",
      },
      "Choose the specified substance’s formula before balancing.",
      "Do not use a single H atom for hydrogen gas.",
    ),
  ],
  guided,
  practice: [
    n(
      "p-water",
      "Complete a missing coefficient",
      "In 2H₂ + O₂ → □H₂O, enter the missing coefficient.",
      2,
      "Four H and two O give two water molecules.",
      "Count H and O separately.",
    ),
    coefficients(
      "p-magnesium",
      "Construct a complete oxide equation",
      "Balance Mg + O₂ → MgO using the smallest whole-number coefficients.",
      ["Mg", "O₂", "MgO"],
      [2, 1, 2],
      "2Mg + O₂ → 2MgO conserves two Mg and two O.",
      "Keep oxygen diatomic.",
    ),
    coefficients(
      "p-aluminium",
      "Find a common oxygen total",
      "Balance Al + O₂ → Al₂O₃ using the smallest whole-number coefficients.",
      ["Al", "O₂", "Al₂O₃"],
      [4, 3, 2],
      "4Al + 3O₂ → 2Al₂O₃ gives four Al and six O on each side.",
      "Use six as a common oxygen total, then match Al.",
    ),
    coefficients(
      "p-ammonia",
      "Balance nitrogen and hydrogen",
      "Balance N₂ + H₂ → NH₃ using the smallest whole-number coefficients.",
      ["N₂", "H₂", "NH₃"],
      [1, 3, 2],
      "N₂ + 3H₂ → 2NH₃ conserves two N and six H.",
      "Match N before H.",
    ),
    coefficients(
      "p-methane",
      "Count oxygen across two products",
      "Balance CH₄ + O₂ → CO₂ + H₂O using the smallest whole-number coefficients.",
      ["CH₄", "O₂", "CO₂", "H₂O"],
      [1, 2, 1, 2],
      "CH₄ + 2O₂ → CO₂ + 2H₂O gives one C, four H and four O on both sides.",
      "Balance C and H before summing product O.",
    ),
    coefficients(
      "p-ethane",
      "Remove a fractional intermediate",
      "Balance C₂H₆ + O₂ → CO₂ + H₂O using the smallest whole-number coefficients.",
      ["C₂H₆", "O₂", "CO₂", "H₂O"],
      [2, 7, 4, 6],
      "2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O. One ethane gives a balanced 1:3.5:2:3 intermediate; doubling every coefficient gives whole numbers.",
      "Multiply the entire provisional equation, not only oxygen.",
    ),
    coefficients(
      "p-decomposition",
      "Keep a one-to-one decomposition",
      "Balance CaCO₃ → CaO + CO₂ using the smallest whole-number coefficients.",
      ["CaCO₃", "CaO", "CO₂"],
      [1, 1, 1],
      "Ca, C and three O atoms already match; all coefficients are 1.",
      "A balanced equation need not contain a coefficient greater than 1.",
    ),
    coefficients(
      "p-brackets",
      "Multiply an entire hydroxide group",
      "Balance Ca(OH)₂ + HCl → CaCl₂ + H₂O using the smallest whole-number coefficients.",
      ["Ca(OH)₂", "HCl", "CaCl₂", "H₂O"],
      [1, 2, 1, 2],
      "Ca(OH)₂ + 2HCl → CaCl₂ + 2H₂O conserves Ca1, O2, H4 and Cl2.",
      "Count the H in both reactants.",
    ),
    coefficients(
      "p-potassium",
      "Construct from named substances",
      "Potassium + water → potassium hydroxide + hydrogen. Supplied formulas K, H₂O, KOH, H₂. Enter the smallest whole-number coefficients in this order.",
      ["K", "H₂O", "KOH", "H₂"],
      [2, 2, 2, 1],
      "2K + 2H₂O → 2KOH + H₂; all K, O and H counts match.",
      "The H₂ product accounts for the hydrogen not in KOH.",
    ),
    n(
      "p-oxygen",
      "Count a complete product side",
      "How many O atoms are represented on the product side of CH₄ + 2O₂ → CO₂ + 2H₂O?",
      4,
      "CO₂ gives two O and two water molecules give two more.",
      "Add both formulas’ contributions.",
    ),
    n(
      "p-hydrogen",
      "Apply a coefficient to a bracketed formula",
      "How many H atoms are represented by 3Ca(OH)₂?",
      6,
      "3×2 H = 6; the coefficient multiplies the entire bracketed formula.",
      "Multiply formula count by coefficient.",
    ),
    c(
      "p-multiple",
      "Distinguish balanced from simplest",
      "4H₂ + 2O₂ → 4H₂O is described as unbalanced because its coefficients have a common factor. Evaluate this.",
      "It is balanced, but 2:1:2 is the smallest whole-number ratio",
      {
        "It is unbalanced because any common factor loses atoms":
          "Counts match on both sides.",
        "Only divide the water coefficient by 2":
          "That would break atom conservation.",
      },
      "Eight H and four O occur on each side. Dividing every coefficient by two preserves the ratio.",
      "Check conservation separately from simplification.",
    ),
    c(
      "p-fraction",
      "Evaluate a fractional intermediate",
      "C₂H₆ + 3.5O₂ → 2CO₂ + 3H₂O has matching atom counts. What gives its smallest whole-number form?",
      "Multiply all four coefficients by 2",
      {
        "Multiply only 3.5 by 2": "Oxygen would no longer match.",
        "Change O₂ to O₇": "That changes the supplied oxygen substance.",
      },
      "The whole equation becomes 2:7:4:6. Fractional coefficients can be intermediate ratios; the requested final form uses whole numbers.",
      "Keep the relative amounts unchanged.",
    ),
    c(
      "p-identity",
      "Reject an identity-changing repair",
      "Why does H₂ + O₂ → H₂O₂ fail to represent hydrogen and oxygen forming water?",
      "H₂O₂ is hydrogen peroxide rather than water",
      {
        "Its atom counts never match":
          "They do match; the substance is the problem.",
        "Coefficients must change the product subscript":
          "Coefficients multiply formulas without altering them.",
      },
      "Conservation alone does not establish the correct reaction.",
      "Identify the named product.",
    ),
    c(
      "p-molecules",
      "Separate atom and molecule counts",
      "For 2H₂ + O₂ → 2H₂O, three reactant molecules form two product molecules. Does this violate atom conservation?",
      "No; four H and two O atoms are retained",
      {
        "Yes; molecule numbers must always match":
          "Molecules regroup during reaction.",
        "Yes; an oxygen atom disappears": "There are two O on both sides.",
      },
      "Atoms of each element are conserved; molecules can regroup and their total number can change.",
      "Count elements, not only molecules.",
    ),
    c(
      "p-states",
      "Interpret state symbols",
      "In CaCO₃(s) → CaO(s) + CO₂(g), what does (g) change in the atom count?",
      "Nothing; it indicates the supplied gas state",
      {
        "It multiplies carbon dioxide by g":
          "State symbols are not coefficients.",
        "It removes oxygen atoms from the equation":
          "Gas atoms are still accounted for.",
      },
      "State symbols describe physical states separately from formula counts.",
      "Use coefficients and subscripts for counting.",
    ),
    c(
      "p-formulas",
      "Choose formulas from words",
      "Magnesium burns in oxygen to form magnesium oxide. Which supplied formula sequence preserves the named substances?",
      "Mg + O₂ → MgO",
      {
        "Mg + O → MgO₂": "Oxygen gas is O₂ and the specified oxide is MgO.",
        "Mg₂ + O₂ → MgO": "The metal is represented by Mg in this equation.",
      },
      "Choose correct species first, then balance 2:1:2.",
      "Do not alter formulas just to match counts.",
    ),
    c(
      "p-open",
      "Account for an escaping gas",
      "An open vessel shows less mass after CaCO₃ forms CaO and CO₂. Which is consistent with conservation?",
      "CO₂ leaves the measured vessel, but its atoms still exist",
      {
        "The reaction destroys carbon atoms":
          "Atoms are rearranged, not destroyed.",
        "The equation should omit CO₂ because it escapes":
          "The gas is still a reaction product.",
      },
      "The measured vessel is an open boundary; include the gas when accounting for all reaction products.",
      "Distinguish the vessel’s contents from all products.",
    ),
    n(
      "p-total",
      "Use complete system mass",
      "In a closed system, 12 g of one reactant combines completely with 8 g of another, with no material entering or leaving. What total product mass results?",
      20,
      "All 20 g remains within the closed system.",
      "Add both complete reactant masses.",
    ),
    c(
      "p-verify",
      "Reject a one-element check",
      "A proposed equation matches carbon counts. What must happen before declaring it balanced?",
      "Check every other element independently",
      {
        "Ignore H and O if carbon matches": "Every element must be conserved.",
        "Count only the largest coefficient":
          "A coefficient alone is not an atom total.",
      },
      "Carbon matching does not guarantee hydrogen or oxygen matching.",
      "Use one ledger row per element.",
    ),
    {
      ...c(
        "p-explain",
        "Explain the coefficient and subscript",
        "Explain why 2H₂O and H₂O₂ are different, using atom counts and substance identity.",
        "2H₂O represents two water molecules, with four H and two O atoms. H₂O₂ is one hydrogen peroxide molecule, with two H and two O atoms. A coefficient multiplies the complete formula; changing a subscript changes the substance.",
        {},
        "Compare complete-molecule amounts with a changed formula.",
        "Count H and O and name the substances.",
      ),
      options: undefined,
      rubric: [
        "Identifies two water molecules versus one hydrogen peroxide molecule.",
        "Gives H4/O2 versus H2/O2.",
        "Explains whole-formula coefficient versus identity-changing subscript.",
      ],
    },
    {
      ...c(
        "p-evaluate",
        "Explain a faulty combustion ledger",
        "A student balances methane combustion as CH₄ + O₂ → CO₂ + 2H₂O and says oxygen matches because CO₂ contains two O. Explain the mistake and correct the equation.",
        "The student omits the two O atoms in two water molecules. Products contain four O altogether, so two O₂ are needed: CH₄ + 2O₂ → CO₂ + 2H₂O. Carbon and hydrogen must also be checked.",
        {},
        "Include every product containing the element.",
        "Count oxygen in both product formulas.",
      ),
      options: undefined,
      rubric: [
        "Includes O2 from CO₂ and O2 from the two waters.",
        "Uses coefficient 2 for O₂ with unchanged formulas.",
        "Checks C and H as well as O.",
      ],
    },
  ],
  checkForms: [
    [
      coefficients(
        "ca-iron",
        "Construct a new oxide equation",
        "Balance Fe + O₂ → Fe₂O₃ using the smallest whole-number coefficients.",
        ["Fe", "O₂", "Fe₂O₃"],
        [4, 3, 2],
        "4Fe + 3O₂ → 2Fe₂O₃ gives Fe4 and O6.",
        "Use a common oxygen total.",
      ),
      coefficients(
        "ca-neutralisation",
        "Construct a new neutralisation equation",
        "Balance Mg(OH)₂ + HNO₃ → Mg(NO₃)₂ + H₂O using the smallest whole-number coefficients.",
        ["Mg(OH)₂", "HNO₃", "Mg(NO₃)₂", "H₂O"],
        [1, 2, 1, 2],
        "1:2:1:2 gives Mg1, N2, H4 and O8 on each side.",
        "Retain bracketed formulas and count all O and H.",
      ),
      n(
        "ca-count",
        "Count a new multiplied formula",
        "How many oxygen atoms are represented by 4Al₂O₃?",
        12,
        "4×3 = 12 O atoms.",
        "Apply the coefficient to formula oxygen count.",
      ),
      c(
        "ca-multiple",
        "Evaluate a scaled equation",
        "2N₂ + 6H₂ → 4NH₃ is balanced. Which is its smallest whole-number ratio?",
        "1:3:2",
        {
          "2:3:4": "That changes only one coefficient.",
          "1:6:2": "That does not divide every coefficient by two.",
        },
        "Divide all three coefficients by 2.",
        "Keep the full ratio.",
      ),
      c(
        "ca-state",
        "Separate state from count",
        "What does (aq) mean in a supplied balanced equation?",
        "The substance is dissolved in water",
        {
          "Its atom count is doubled": "A state symbol is not a multiplier.",
          "It is molten without a solvent":
            "Molten is liquid; aqueous is dissolved in water.",
        },
        "Aqueous describes the supplied state; coefficients still determine relative amounts.",
        "Use the state-symbol meaning.",
      ),
    ],
    [
      coefficients(
        "cb-sodium",
        "Construct another new equation",
        "Balance Na + Cl₂ → NaCl using the smallest whole-number coefficients.",
        ["Na", "Cl₂", "NaCl"],
        [2, 1, 2],
        "2Na + Cl₂ → 2NaCl conserves Na2 and Cl2.",
        "Keep chlorine as Cl₂.",
      ),
      coefficients(
        "cb-propane",
        "Construct another combustion equation",
        "Balance C₃H₈ + O₂ → CO₂ + H₂O using the smallest whole-number coefficients.",
        ["C₃H₈", "O₂", "CO₂", "H₂O"],
        [1, 5, 3, 4],
        "1:5:3:4 gives C3, H8 and O10.",
        "Balance C, H, then total O.",
      ),
      n(
        "cb-count",
        "Add contributions across formulas",
        "How many oxygen atoms are represented by 3CO₂ + 4H₂O?",
        10,
        "3×2 + 4×1 = 10.",
        "Sum every oxygen-containing term.",
      ),
      c(
        "cb-identity",
        "Check identity as well as counts",
        "A reaction specified to produce water is changed to produce H₂O₂ so counts match. What is wrong?",
        "The specified substance has changed",
        {
          "Nothing; atom balance alone proves the specified reaction":
            "Correct substances are required as well.",
          "It must lose oxygen atoms": "The altered equation can match counts.",
        },
        "Subscripts fix the substance identity.",
        "Name water and hydrogen peroxide.",
      ),
      c(
        "cb-molecules",
        "Check what is conserved",
        "Which must be equal across a balanced chemical equation?",
        "The number of atoms of each element",
        {
          "The total number of molecules": "Molecules can regroup.",
          "Every individual coefficient":
            "Different species can have different coefficients.",
        },
        "Element counts are conserved, not necessarily molecule numbers.",
        "Use element-by-element counts.",
      ),
    ],
  ],
  reviewForms: [
    [
      coefficients(
        "ra-hcl",
        "Retrieve a fresh equation",
        "Balance H₂ + Cl₂ → HCl using the smallest whole-number coefficients.",
        ["H₂", "Cl₂", "HCl"],
        [1, 1, 2],
        "H₂ + Cl₂ → 2HCl conserves two H and two Cl.",
        "Keep both elemental gases diatomic.",
      ),
      n(
        "ra-count",
        "Retrieve a group contribution",
        "How many H atoms are represented by 2(NH₄)₂SO₄?",
        16,
        "2×2×4=16 H atoms.",
        "Use outside coefficient, group multiplier and H subscript.",
      ),
      c(
        "ra-ratio",
        "Retrieve whole-equation scaling",
        "If all coefficients of a balanced equation are multiplied by 3, what happens?",
        "Atom balance is retained with a scaled ratio",
        {
          "The substances change": "Formulas are unchanged.",
          "Only products triple": "All terms were scaled.",
        },
        "Both sides scale every element equally.",
        "Scale the full equation.",
      ),
    ],
    [
      coefficients(
        "rb-carbon",
        "Retrieve another equation",
        "Balance C + O₂ → CO₂ using the smallest whole-number coefficients.",
        ["C", "O₂", "CO₂"],
        [1, 1, 1],
        "One C and two O atoms already match.",
        "All coefficients may be one.",
      ),
      n(
        "rb-count",
        "Retrieve another oxygen sum",
        "How many O atoms are represented by 2CO₂ + 5H₂O?",
        9,
        "4+5=9 O atoms.",
        "Add complete formula contributions.",
      ),
      c(
        "rb-subscript",
        "Retrieve the identity rule",
        "Why keep subscripts fixed when balancing a supplied reaction?",
        "They specify the substances involved",
        {
          "They only indicate total sample mass":
            "They specify formula composition.",
          "Coefficients cannot change":
            "Coefficients are precisely what can change.",
        },
        "Changing a subscript changes the substance.",
        "Separate amount from formula identity.",
      ),
    ],
  ],
};
for (const q of [
  ...balancingJourney.warmup,
  ...balancingJourney.refresher,
  ...guided,
  ...balancingJourney.practice,
])
  q.followUp =
    q.id.includes("identity") || q.id.includes("explain")
      ? "be-v1-r-identity"
      : q.id.includes("multiple") ||
          q.id.includes("fraction") ||
          q.id.includes("ethane")
        ? "be-v1-r-ratio"
        : q.id.includes("formulas") || q.id.includes("potassium")
          ? "be-v1-r-formulas"
          : q.id.includes("count") ||
              q.id.includes("oxygen") ||
              q.id.includes("bracket") ||
              q.id.includes("hydrogen")
            ? "be-v1-r-count"
            : "be-v1-r-every";
extendEquationWriting(balancingJourney);
