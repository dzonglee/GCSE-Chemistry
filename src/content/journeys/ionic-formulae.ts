import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
) =>
  choice(
    `if-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Ionic name and whole-ion formula reasoning: ${id}.`,
  );
const formula = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  explanation: string,
  hint: string,
  errors: Record<string, string> = {},
  model?: TaskModel,
): LearningTask => ({
  id: `if-v1-${id}`,
  title,
  prompt,
  answer,
  explanation,
  hint,
  misconceptions: errors,
  chemicalFormula: true,
  inputMode: "text",
  purpose: `Construct a neutral simplest whole-ion formula: ${id}.`,
  model,
});
const sodium = formula(
  "g-sulfate",
  "Balance whole sulfate ions",
  "Given Na⁺ and SO₄²⁻, construct the simplest formula for sodium sulfate.",
  "Na2SO4",
  "Two Na⁺ ions balance one SO₄²⁻ ion: +2 and −2. The sulfate ion stays SO₄, giving Na₂SO₄.",
  "Change numbers of whole ions; do not change sulfate's four oxygen atoms.",
  {
    NaSO4: "One Na⁺ cannot balance one 2− sulfate ion.",
    Na2SO2:
      "Changing sulfate's internal oxygen count changes the ion, not its amount.",
  },
  {
    kind: "ionic-formula",
    compound: "sodiumSulfate",
    instruction: "Balance the given +1 and −2 ions, keeping sulfate whole.",
  },
);
sodium.openingHint = true;
const hydroxide = formula(
  "g-hydroxide",
  "Keep hydroxide together",
  "Given Mg²⁺ and OH⁻, construct the simplest formula for magnesium hydroxide.",
  "Mg(OH)2",
  "One Mg²⁺ needs two OH⁻ ions. Parentheses keep the whole hydroxide group together: Mg(OH)₂ contains two O and two H atoms.",
  "A subscript outside parentheses multiplies the entire ion group.",
  {
    MgOH2:
      "OH₂ contains one oxygen and two hydrogen atoms; two OH groups require (OH)₂.",
    Mg2OH: "Two 2+ magnesium ions do not balance one 1− hydroxide.",
  },
  {
    kind: "ionic-formula",
    compound: "magnesiumHydroxide",
    instruction: "Balance Mg²⁺ with whole OH⁻ ions; inspect both atom counts.",
  },
);
const nitrate = formula(
  "g-nitrate",
  "Repeat a nitrate group",
  "Given Ca²⁺ and NO₃⁻, construct the simplest formula for calcium nitrate.",
  "Ca(NO3)2",
  "One Ca²⁺ needs two nitrate ions. Ca(NO₃)₂ has two nitrogen and six oxygen atoms; the nitrate formula stays NO₃.",
  "Put a repeated polyatomic ion inside parentheses.",
  {
    CaNO32:
      "The outside 2 must multiply the whole NO₃ group, not follow an unbracketed oxygen count.",
    CaNO3: "One nitrate supplies only one negative charge.",
  },
  {
    kind: "ionic-formula",
    compound: "calciumNitrate",
    instruction: "Use whole nitrate ions; balance the given charges.",
  },
);
const aluminium = formula(
  "g-aluminium",
  "Find the smallest charge balance",
  "Given Al³⁺ and SO₄²⁻, construct the simplest formula for aluminium sulfate.",
  "Al2(SO4)3",
  "Two Al³⁺ give +6; three SO₄²⁻ give −6. Al₂(SO₄)₃ preserves three sulfate groups, containing three S and twelve O atoms.",
  "Find the smallest equal positive and negative charge totals.",
  {
    "Al3(SO4)2":
      "Three 3+ ions give +9 and two 2− groups give −4, so the totals do not cancel.",
    "Al4(SO4)6":
      "That ratio balances charge but can be reduced to two aluminium ions and three sulfate ions.",
  },
  {
    kind: "ionic-formula",
    compound: "aluminiumSulfate",
    instruction: "Balance +3 with −2 in the simplest whole-ion ratio.",
  },
);
const written: LearningTask = {
  id: "if-v1-p-explain",
  title: "Explain the formula, not a trick",
  prompt:
    "Explain why Mg²⁺ and OH⁻ give Mg(OH)₂ rather than MgOH₂ or Mg₂(OH)₄ as the simplest formula.",
  answer:
    "One Mg2+ balances two OH− ions. Parentheses multiply the whole OH group, giving two O and two H atoms. Two Mg ions and four OH ions are neutral but reduce to the simplest 1:2 ion ratio.",
  explanation:
    "Link charge balance, unchanged whole-ion groups, parentheses and simplest ratio. A crossed-number shortcut alone does not explain why these alternatives fail.",
  hint: "State the positive and negative totals, then compare atom counts and common factors.",
  purpose:
    "Construct a causal explanation of charge neutrality, bracket meaning and simplest formula ratio.",
  rubric: [
    "One Mg²⁺ balances two OH⁻: +2 and −2",
    "Each hydroxide group remains one O plus one H",
    "(OH)₂ gives two O and two H; OH₂ gives one O and two H",
    "Mg₂(OH)₄ is neutral but the 2:4 ion ratio reduces to 1:2",
  ],
};
export const ionicFormulaeJourney: LessonJourney = {
  version: 1,
  introduction:
    "Use given ions to write neutral formulas in the simplest whole-ion ratio. Preserve polyatomic groups and learn what names and parentheses mean.",
  warmup: [
    q(
      "w-neutral",
      "What must the total charge of a neutral ionic compound be?",
      "Zero",
      {
        "Always +1":
          "A compound formula must balance positive and negative charge.",
        "Always −1": "A charged ion is not the same as the neutral compound.",
      },
      "Positive and negative ion charges sum to zero in the neutral compound.",
      "Add signed charges, not just ion counts.",
    ),
    q(
      "w-subscripts",
      "What does the 3 in NO₃⁻ count?",
      "Three oxygen atoms within one nitrate ion",
      {
        "Three separate nitrate ions":
          "The subscript belongs to oxygen inside the group.",
        "A charge of 3−":
          "The charge is the superscript minus, not the subscript 3.",
      },
      "Subscripts count atoms; the whole nitrate group has charge 1−.",
      "Separate the inside atom count from whole-ion charge.",
    ),
  ],
  refresher: [
    q(
      "r-balance",
      "How do +2 and −1 ions balance?",
      "One +2 ion with two −1 ions",
      {
        "Two +2 ions with one −1 ion": "That gives +3 overall.",
        "One of each": "That gives +1 overall.",
      },
      "+2 and two −1 charges sum to zero.",
      "Use charge totals.",
    ),
    q(
      "r-group",
      "May you change NO₃⁻ to NO₂⁻ just to balance a compound formula?",
      "No: change the number of whole nitrate ions",
      {
        "Yes: both are nitrate":
          "Changing the internal oxygen count changes the ion.",
        "Yes: atom subscripts are charge labels":
          "Subscripts count atoms, not charge.",
      },
      "The given ion's internal formula is fixed.",
      "Keep the group intact.",
    ),
    q(
      "r-brackets",
      "What atoms does (OH)₂ contain?",
      "Two oxygen and two hydrogen atoms",
      {
        "One oxygen and two hydrogen atoms":
          "That describes OH₂, without multiplying oxygen.",
        "Two oxygen and one hydrogen atom":
          "The outside 2 multiplies both symbols.",
      },
      "Two complete OH groups give O₂H₂ atom counts.",
      "Multiply everything inside the parentheses.",
    ),
    q(
      "r-smallest",
      "A charge-balanced ratio of four +1 ions to two −2 ions simplifies to what?",
      "Two positive ions to one negative ion",
      {
        "Four to two is already simplest": "Both counts share a factor of two.",
        "One to two": "That reverses the ratio.",
      },
      "Divide both whole-ion counts by the same factor.",
      "Simplify without altering either ion.",
    ),
    q(
      "r-name",
      "What is the chloride ion's role in naming sodium chloride?",
      "It supplies the anion name after the metal name",
      {
        "It turns sodium into chlorine":
          "Both elements retain their identities.",
        "It means the compound contains oxygen":
          "Chloride is Cl⁻, without oxygen.",
      },
      "Binary ionic names use metal first and the non-metal anion ending, such as chloride.",
      "Use the given anion name.",
    ),
    q(
      "r-oxygen",
      "Do all compound names containing oxygen end in -ate?",
      "No: oxide and hydroxide are counterexamples",
      {
        "Yes: oxygen always means -ate":
          "Na₂O and NaOH are oxide and hydroxide.",
        "No: nitrate contains no oxygen": "Nitrate is NO₃⁻.",
      },
      "Nitrate, carbonate and sulfate are common oxygen-containing -ate ions, but not every oxygen-containing compound follows that ending.",
      "Learn the supplied ions rather than an absolute shortcut.",
    ),
  ],
  guided: [sodium, hydroxide, nitrate, aluminium],
  practice: [
    formula(
      "p-oxide",
      "Balance oxide ions",
      "Given Mg²⁺ and O²⁻, write the simplest magnesium oxide formula.",
      "MgO",
      "One of each balances +2 and −2; Mg₂O₂ reduces to MgO.",
      "Equal charge magnitudes need equal ion counts, then simplify.",
      {
        Mg2O2: "Neutral, but not the simplest 1:1 ratio.",
        MgO2: "One +2 does not balance two −2 ions.",
      },
    ),
    formula(
      "p-halide",
      "Write a halide formula",
      "Given Ca²⁺ and Cl⁻, write calcium chloride's simplest formula.",
      "CaCl2",
      "Two chloride ions balance one calcium ion: CaCl₂.",
      "Balance +2 with two −1 ions.",
      { Ca2Cl: "Two calcium ions give +4; one chloride gives −1." },
    ),
    formula(
      "p-single-group",
      "Know when parentheses are unnecessary",
      "Given Na⁺ and OH⁻, write sodium hydroxide's simplest formula.",
      "NaOH",
      "One Na⁺ and one OH⁻ balance. A single hydroxide group needs no outside subscript or parentheses.",
      "Use one of each; retain O and H together.",
      { NaOH2: "That changes the hydroxide group's internal atom count." },
    ),
    formula(
      "p-potassium-nitrate",
      "Use a nitrate ion",
      "Given K⁺ and NO₃⁻, write potassium nitrate's simplest formula.",
      "KNO3",
      "One potassium and one nitrate ion balance: KNO₃.",
      "Do not remove nitrate's internal oxygen subscript.",
      { KNO: "Nitrate contains three oxygen atoms, not one." },
    ),
    formula(
      "p-carbonate",
      "Write a carbonate formula",
      "Given Na⁺ and CO₃²⁻, write sodium carbonate's simplest formula.",
      "Na2CO3",
      "Two sodium ions balance one carbonate ion. CO₃ stays unchanged.",
      "Balance one 2− group with +1 ions.",
      { NaCO3: "The total charge is −1, not zero." },
    ),
    formula(
      "p-aluminium-oxide",
      "Balance given unequal charges",
      "Given Al³⁺ and O²⁻, write aluminium oxide's simplest formula.",
      "Al2O3",
      "Two 3+ ions and three 2− ions give +6 and −6.",
      "Find the smallest common charge total.",
      { Al3O2: "That gives +9 and −4; the charges do not balance." },
    ),
    formula(
      "p-ammonium",
      "Repeat a positive polyatomic ion",
      "Given NH₄⁺ (ammonium) and SO₄²⁻, write ammonium sulfate's simplest formula.",
      "(NH4)2SO4",
      "Two whole ammonium ions balance one sulfate ion. Parentheses multiply the entire NH₄ group: two N and eight H atoms.",
      "A repeated positive group also needs parentheses.",
      {
        NH42SO4:
          "Without parentheses, the 2 does not repeat the whole NH₄ ion.",
      },
    ),
    formula(
      "p-iron",
      "Use the specified metal charge",
      "Given Fe³⁺ and NO₃⁻, write iron(III) nitrate's simplest formula.",
      "Fe(NO3)3",
      "One given Fe³⁺ needs three nitrate ions. The (III) names the specified 3+ iron charge, not three iron atoms.",
      "Use the given charge; preserve each NO₃ group.",
      { Fe3NO3: "Three iron ions do not balance one nitrate ion." },
    ),
    q(
      "p-name-sulfate",
      "Given sulfate is SO₄²⁻, what is the name of CaSO₄?",
      "Calcium sulfate",
      {
        "Calcium sulfide": "Sulfide is S²⁻; sulfate includes oxygen.",
        "Calcium oxide": "The anion is sulfate, not just oxide.",
      },
      "Name the calcium cation first, then the supplied sulfate anion.",
      "Use the entire anion, not one atom within it.",
    ),
    q(
      "p-ending",
      "Which given formula/name pair disproves 'oxygen always means -ate'?",
      "NaOH: sodium hydroxide",
      {
        "KNO₃: potassium nitrate":
          "That is an oxygen-containing -ate example, not a counterexample.",
        "Na₂SO₄: sodium sulfate": "That is another -ate example.",
      },
      "Hydroxide contains oxygen but its name ends in -ide.",
      "Look for an oxygen-containing -ide name.",
    ),
    q(
      "p-atom-counts",
      "How many N and O atoms are represented in Ca(NO₃)₂?",
      "Two N and six O",
      {
        "One N and six O": "The outside 2 multiplies nitrogen too.",
        "Two N and three O":
          "It multiplies the three oxygen atoms in each group.",
      },
      "Two whole nitrate groups supply N₂O₆ atom counts.",
      "Multiply every internal subscript by the number outside parentheses.",
    ),
    formula(
      "p-reduce",
      "Reduce a neutral proposed formula",
      "Mg₂Cl₄ is charge-balanced using Mg²⁺ and Cl⁻. Write its simplest formula.",
      "MgCl2",
      "The 2:4 whole-ion ratio reduces to 1:2, giving MgCl₂.",
      "Divide both counts by two without changing an ion.",
      { Mg2Cl4: "Neutrality alone does not establish the simplest ratio." },
    ),
    q(
      "p-capitals",
      "Which symbol correctly identifies sodium in a formula?",
      "Na",
      {
        NA: "A chemical symbol has one initial capital and, here, a lowercase a.",
        na: "The first letter of an element symbol is capitalised.",
      },
      "Correct chemical capitalisation is meaningful, not a cosmetic style choice.",
      "Use the periodic-table symbol.",
    ),
    written,
  ],
  checkForms: [
    [
      formula(
        "ca-halide",
        "Construct a halide",
        "Given Mg²⁺ and Cl⁻, write the simplest formula.",
        "MgCl2",
        "One Mg²⁺ balances two Cl⁻ ions.",
        "Balance opposite charges.",
      ),
      formula(
        "ca-nitrate",
        "Construct a nitrate",
        "Given Na⁺ and NO₃⁻, write the simplest formula.",
        "NaNO3",
        "One of each given ion balances charge.",
        "Preserve the nitrate group.",
      ),
      formula(
        "ca-carbonate",
        "Construct a carbonate",
        "Given Ca²⁺ and CO₃²⁻, write the simplest formula.",
        "CaCO3",
        "Equal charge magnitudes balance one ion of each.",
        "Simplify the whole-ion ratio.",
      ),
      formula(
        "ca-hydroxide",
        "Construct a repeated group",
        "Given Al³⁺ and OH⁻, write the simplest formula.",
        "Al(OH)3",
        "Three whole hydroxide ions balance one aluminium ion.",
        "Repeat the whole group using parentheses.",
      ),
      q(
        "ca-name",
        "Given SO₄²⁻ is sulfate, name Na₂SO₄.",
        "Sodium sulfate",
        {
          "Sodium sulfide": "Sulfide is a different anion.",
          "Sodium oxide": "The whole anion is sulfate.",
        },
        "Name the cation then the given anion.",
        "Identify both ions.",
      ),
    ],
    [
      formula(
        "cb-oxide",
        "Construct an oxide",
        "Given K⁺ and O²⁻, write the simplest formula.",
        "K2O",
        "Two potassium ions balance one oxide ion.",
        "Match charge totals.",
      ),
      formula(
        "cb-sulfate",
        "Construct a sulfate",
        "Given Mg²⁺ and SO₄²⁻, write the simplest formula.",
        "MgSO4",
        "One of each ion balances the charges.",
        "Preserve sulfate's internal formula.",
      ),
      formula(
        "cb-hydroxide",
        "Construct a hydroxide",
        "Given Ca²⁺ and OH⁻, write the simplest formula.",
        "Ca(OH)2",
        "Two complete hydroxide ions balance calcium.",
        "Parentheses repeat the whole group.",
      ),
      formula(
        "cb-nitrate",
        "Construct three nitrate groups",
        "Given Al³⁺ and NO₃⁻, write the simplest formula.",
        "Al(NO3)3",
        "Three nitrate groups balance one aluminium ion.",
        "Keep every NO₃ group unchanged.",
      ),
      q(
        "cb-name",
        "Name KCl, given K⁺ is potassium and Cl⁻ is chloride.",
        "Potassium chloride",
        {
          "Potassium chlorate":
            "Chlorate is an oxygen-containing ion, not the given Cl⁻.",
          "Chlorine potassium":
            "Use the metal name first and the anion name second.",
        },
        "The name is potassium chloride.",
        "Use cation followed by anion.",
      ),
    ],
  ],
  reviewForms: [
    [
      formula(
        "ra-carbonate",
        "Retrieve a carbonate ratio",
        "Given K⁺ and CO₃²⁻, write the simplest formula.",
        "K2CO3",
        "Two potassium ions balance one carbonate ion.",
        "Use whole-ion charge balance.",
      ),
      q(
        "ra-brackets",
        "Retrieve why a repeated polyatomic ion uses parentheses.",
        "The outside subscript multiplies the whole ion group",
        {
          "It changes only the final atom":
            "Every atom inside the group is multiplied.",
          "It changes the ion's charge": "The ion charge stays fixed.",
        },
        "Parentheses preserve the repeated unit.",
        "Think of repeated whole groups.",
      ),
    ],
    [
      formula(
        "rb-nitrate",
        "Retrieve a magnesium nitrate formula",
        "Given Mg²⁺ and NO₃⁻, write the simplest formula.",
        "Mg(NO3)2",
        "Two nitrate groups balance one magnesium ion.",
        "Repeat the entire NO₃ group.",
      ),
      q(
        "rb-ending",
        "Retrieve a limit of the oxygen/-ate naming shortcut.",
        "Oxide and hydroxide contain oxygen but end in -ide",
        {
          "Every oxygen-containing anion must end in -ate":
            "The counterexamples show this is too broad.",
          "Nitrate contains no oxygen": "NO₃⁻ contains oxygen.",
        },
        "Learn common named ions with bounded patterns.",
        "Recall the counterexamples.",
      ),
    ],
  ],
};
for (const task of [
  ...ionicFormulaeJourney.guided,
  ...ionicFormulaeJourney.practice,
])
  task.followUp =
    task.id.includes("name") ||
    task.id.includes("ending") ||
    task.id.includes("capitals")
      ? "if-v1-r-name"
      : task.id.includes("reduce")
        ? "if-v1-r-smallest"
        : task.id.includes("group") ||
            task.id.includes("hydroxide") ||
            task.id.includes("nitrate") ||
            task.id.includes("ammonium") ||
            task.id.includes("atom-counts") ||
            task.id.includes("explain")
          ? "if-v1-r-brackets"
          : "if-v1-r-balance";
const titles: Record<string, string> = {
  "p-name-sulfate": "Name the whole ion",
  "p-ending": "Test a naming shortcut",
  "p-atom-counts": "Read the outside subscript",
  "p-capitals": "Preserve chemical symbols",
};
for (const task of ionicFormulaeJourney.practice)
  task.title ??= titles[task.id.replace("if-v1-", "")];
