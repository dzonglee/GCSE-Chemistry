import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { DisplacementMode } from "../../lib/displacement-redox";
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
    "disp-v1-" + id,
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
  model?: TaskModel,
): LearningTask => ({
  ...number(
    "disp-v1-" + id,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask => ({
  id: "disp-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (
  mode: DisplacementMode,
  instruction: string,
  record?: string,
): TaskModel => ({
  record,
  kind: "displacement-redox",
  mode,
  instruction,
});
export const displacementJourney: LessonJourney = {
  version: 1,
  introduction:
    "Scale whole half-equations, cancel unchanged terms and check both atoms and charge.",
  scopeNote:
    "Higher/shared: AQA 4.4.1.4 and electron-transfer redox; limited Pearson Combined 4.2 comparison. This lesson extends the earlier Half equations and redox lesson rather than counting the same net equations as new evidence. Multiply EVERY term in a half-equation by the same factor. Equal electron totals cancel only after the halves are added. Unless a question explicitly asks for least whole coefficients, a balanced whole-number multiple is valid. In full ionic equations, dissolved strong ionic salts are represented by separate ions; supplied solids, gases and molecular water remain intact. Cancel only identical species with the same formula, charge and physical state on opposite sides, and only the available number of each. Unchanged spectator ions remain physically in the mixture after their terms are omitted. Count each element and total signed charge independently. Equal charge does not require zero charge: Cu + 2Ag⁺ → Cu²⁺ + 2Ag has +2 on both sides. A balanced equation does not prove that the proposed reaction actually occurs; apply supplied reactivity evidence and conditions. Aluminium examples explicitly supply conditions where reaction occurs, or an oxide surface blocking detectable change; no universal rate is inferred. The actual 3D reference retains Cu1Ag2N2O6 and two intact nitrate spectators before and after. The before copper atom and after silver atoms are representative constituents of metal, not isolated bulk metal vapours. Hydration, solvent and metal lattices are omitted; displayed positions are schematic and are not a kinetic mechanism. Nitrate connectivity is planar with three equal directions, deduced from reviewed nitrate resonance structure and VSEPR, not assessed as compulsory GCSE geometry. Equal rods indicate connectivity, not three localised single bonds or a fixed double bond. Electron transfer is represented in the equation ledger, not as free electron atoms in aqueous solution. AQA 2022 Higher 04.5/04.6 question and mark scheme were actually read: the net zinc/copper equation and electron-loss explanation are separate demands; oxygen wording does not answer electron redox. Original tasks below do not reproduce official papers or certify complete board alignment, practical competence, grades or exam readiness. Written responses stay self-reviewed; independent and delayed forms defer marking.",
  outcomes: [
    "Scale all terms to match electron loss and gain.",
    "Cancel identical unchanged species without removing physical ions.",
    "Check atom counts and total signed charge separately.",
    "Use supplied reactivity evidence to judge a proposed displacement.",
  ],
  warmup: [
    n(
      "w-multiple",
      "Find the shared transfer",
      "One supplied half transfers 2 electrons; another transfers 3. What is the least common electron total?",
      6,
      "electrons",
      "The first transfers 2×3; the second 3×2: six electrons.",
      "List multiples of both counts.",
    ),
    c(
      "w-charge",
      "Read signed ionic charge",
      "What total charge do two NO₃⁻ ions contribute?",
      "−2",
      {
        "−1": "There are two ions.",
        "+2": "Each nitrate ion has negative charge.",
      },
      "2 × (−1) = −2.",
      "Multiply charge per ion by the number of ions.",
    ),
  ],
  refresher: [
    c(
      "r-scale",
      "Scale every term",
      "Scale Ag⁺ + e⁻ → Ag by 2. Which result is correct?",
      "2Ag⁺ + 2e⁻ → 2Ag",
      {
        "Ag⁺ + 2e⁻ → Ag": "Scaling only electrons changes charge balance.",
        "2Ag⁺ + e⁻ → 2Ag": "The electron term must also scale.",
      },
      "Every term is multiplied by two.",
      "Treat the entire half-equation as one ratio.",
      m(
        "combine",
        "Set the two half multipliers; every term changes together.",
      ),
    ),
    n(
      "r-charge",
      "Sum ionic charge",
      "In Cu + 2Ag⁺ → Cu²⁺ + 2Ag, what is the total charge on the LEFT?",
      2,
      "charge units",
      "Neutral Cu contributes zero; two Ag⁺ contribute +2.",
      "Add coefficient × signed charge.",
      m(
        "ledger",
        "Change coefficients while checking atoms and charge separately.",
      ),
    ),
    c(
      "r-spectators",
      "Identify unchanged terms",
      "Cu + 2Ag⁺ + 2NO₃⁻ → Cu²⁺ + 2NO₃⁻ + 2Ag. Which ion terms cancel?",
      "2NO₃⁻ on each side",
      {
        "Ag⁺ and Ag": "Charge and state differ.",
        "Cu and Cu²⁺": "These are different species.",
      },
      "Nitrate has identical identity and amount on both sides.",
      "Match formula, charge and state.",
      m("cancel", "Select the unchanged spectator terms to omit."),
    ),
    c(
      "r-dissolved",
      "Represent a dissolved salt",
      "How is supplied dissolved silver nitrate represented in a full ionic equation?",
      "Ag⁺(aq) and NO₃⁻(aq)",
      {
        "AgNO₃ molecules":
          "This dissolved strong ionic salt has separate ions.",
        "Ag(s) and nitrate": "Silver metal is a different product.",
      },
      "The dissolved salt is written as separate aqueous ions.",
      "Keep dissolved ions distinct from solid metal.",
      m(
        "representation",
        "Decide which supplied species split and explain why.",
      ),
    ),
    c(
      "r-solid",
      "Keep a solid term",
      "A supplied precipitation equation contains AgCl(s). Which representation keeps that stated product?",
      "AgCl(s)",
      {
        "Ag⁺(aq) + Cl⁻(aq)":
          "This changes the stated solid into dissolved ions.",
        "Ag(s) + Cl₂(g)": "These are different chemical products.",
      },
      "The solid formula term is not split into aqueous ions.",
      "Use the stated physical state.",
      m("representation", "Contrast dissolved salts with a supplied solid."),
    ),
    c(
      "r-feasible",
      "Check more than balance",
      "Zn is above Cu. Does the balanced proposal Cu + Zn²⁺ → Cu²⁺ + Zn follow that ordering?",
      "No",
      {
        "Yes, because atoms match": "Balance does not establish feasibility.",
        "Yes, because charge matches":
          "Charge conservation alone does not rank reactivity.",
      },
      "Copper cannot displace the more reactive zinc in this supplied comparison.",
      "The displacing metal must be more reactive.",
      m("feasibility", "Use the supplied ordering rather than balance alone."),
    ),
  ],
  guided: [
    n(
      "g-combine",
      "Equalise electron transfer",
      "Given Al → Al³⁺ + 3e⁻ and Cu²⁺ + 2e⁻ → Cu under conditions where reaction occurs: what is the least multiplier of the AL half?",
      2,
      "multiplier",
      "Six electrons require 2 × the aluminium half and 3 × the copper half.",
      "Find a shared electron total, then divide by three.",
      m(
        "combine",
        "Choose the aluminium/copper record and scale each whole half.",
        "aluminium",
      ),
    ),
    n(
      "g-cancel",
      "Track omitted nitrate",
      "The full Cu/AgNO₃ equation contains 2NO₃⁻ on each side. After their terms cancel, how many of those nitrate ions remain represented physically in the mixture?",
      2,
      "ions",
      "They are unchanged spectators, not removed particles.",
      "Cancellation shortens an equation.",
      m(
        "cancel",
        "Compare the full and net equation; retain physical spectators.",
      ),
    ),
    n(
      "g-ledger",
      "Check atom and charge ledgers",
      "Given Al/Cu²⁺ reaction occurs: 2Al + 3Cu²⁺ → 2Al³⁺ + 3Cu. What total charge is on EACH side?",
      6,
      "charge units",
      "Left 3×(+2)=+6; right 2×(+3)=+6.",
      "Count ions with their coefficients.",
      m(
        "ledger",
        "Find coefficients that balance both independent ledgers.",
        "aluminium",
      ),
    ),
    c(
      "g-representation",
      "Keep molecular water",
      "The product H₂O(l) appears in a supplied strong-acid/hydroxide equation. Should that product be rewritten as H⁺ + OH⁻?",
      "No; retain H₂O(l)",
      {
        "Yes; split every formula":
          "Water is a molecular product, not a dissolved strong ionic salt.",
        "Remove it as a spectator":
          "It was formed, not unchanged on both sides.",
      },
      "Splitting the water product would erase the represented neutralisation.",
      "Distinguish reacting ions from the molecule formed.",
      m(
        "representation",
        "Use both particle description and stated phase.",
        "water",
      ),
    ),
    c(
      "g-feasibility",
      "Respect supplied conditions",
      "Al is above Cu, but its oxide surface prevents detectable change during the supplied short observation. What is justified?",
      "A surface barrier can block detectable change",
      {
        "Al must be below Cu": "The observation does not reverse the ordering.",
        "The balanced equation proves fast reaction":
          "Balance contains no rate information.",
      },
      "Surface conditions affect observation without changing the supplied ordering.",
      "Separate thermodynamic ordering from the stated observation.",
      m(
        "feasibility",
        "Use the observation and surface condition together.",
        "passivation",
      ),
    ),
  ],
  practice: [
    n(
      "p-cu-factor",
      "Scale the reduction half",
      "Cu → Cu²⁺ + 2e⁻; Ag⁺ + e⁻ → Ag. What is the least multiplier of the SILVER half?",
      2,
      "multiplier",
      "Two silver ions each gain one electron.",
      "Match the copper half's two electrons.",
    ),
    n(
      "p-al-cu-factor",
      "Scale the copper half",
      "Given Al/Cu²⁺ reaction occurs, with electron counts 3 and 2: what is the least multiplier of the COPPER half?",
      3,
      "multiplier",
      "2×3 lost = 3×2 gained = 6.",
      "Divide the shared transfer by two.",
    ),
    n(
      "p-al-ag-factor",
      "Scale silver for aluminium",
      "Given Al/Ag⁺ reaction occurs: Al loses 3 electrons and each Ag⁺ gains 1. What is the least multiplier of the SILVER half?",
      3,
      "multiplier",
      "Three silver-ion halves accept the three transferred electrons.",
      "Scale the entire silver half.",
    ),
    c(
      "p-no-free-electrons",
      "Remove internal transfer",
      "After correctly adding and cancelling a pair of displacement halves, what remains of the matched electron terms?",
      "No electron term in the net equation",
      {
        "Electrons remain on both sides": "Identical matched terms cancel.",
        "Electrons become new atoms": "Electrons are not atoms.",
      },
      "The matching transfer is internal to the combined redox process.",
      "Add first, then cancel matching terms.",
    ),
    c(
      "p-multiple",
      "Accept a valid multiple",
      "Cu + 2Ag⁺ → Cu²⁺ + 2Ag is balanced. A question does NOT require least coefficients. Is 2Cu + 4Ag⁺ → 2Cu²⁺ + 4Ag valid?",
      "Yes",
      {
        "No, only least coefficients balance":
          "All terms scaled together still conserve atoms and charge.",
        "No, coefficients change substances":
          "Whole-formula coefficients change quantities, not identities.",
      },
      "The doubled equation is a valid balanced multiple.",
      "Check the stated instruction before demanding simplest coefficients.",
    ),
    c(
      "p-only-electrons",
      "Spot an invalid scaling",
      "Which change is NOT valid scaling of Cu → Cu²⁺ + 2e⁻?",
      "Cu → Cu²⁺ + 4e⁻",
      {
        "2Cu → 2Cu²⁺ + 4e⁻": "Every term has been doubled.",
        "3Cu → 3Cu²⁺ + 6e⁻": "Every term has been tripled.",
      },
      "Only the electron term changed, breaking charge conservation.",
      "The multiplier must apply to every term.",
    ),
    n(
      "p-chloride",
      "Count spectator chloride",
      "Zn + Cu²⁺ + 2Cl⁻ → Zn²⁺ + 2Cl⁻ + Cu. How many chloride-ion terms' coefficient units cancel from EACH side?",
      2,
      "ions",
      "Both sides contain two unchanged chloride ions.",
      "Match identical aqueous chloride terms.",
    ),
    c(
      "p-sulfate",
      "Keep sulfate intact",
      "Fe + Cu²⁺ + SO₄²⁻ → Fe²⁺ + SO₄²⁻ + Cu. What cancels?",
      "SO₄²⁻ on both sides",
      {
        "Fe and Fe²⁺": "Their charges differ.",
        "Only the oxygen atoms":
          "The unchanged species is the intact sulfate ion.",
      },
      "The entire unchanged sulfate ion term cancels.",
      "Match species, not isolated element names.",
    ),
    n(
      "p-two-spectators",
      "Count neutralisation spectators",
      "H⁺ + Cl⁻ + Na⁺ + OH⁻ → Na⁺ + Cl⁻ + H₂O. How many DIFFERENT spectator ion species cancel?",
      2,
      "species",
      "Na⁺ and Cl⁻ each appear unchanged.",
      "Different species count is not a summed charge.",
    ),
    c(
      "p-phase",
      "Use physical state",
      "H₂O(l) and H₂O(g) occur on opposite sides of a supplied equation. Can they cancel as identical species?",
      "No; the physical states differ",
      {
        "Yes, formula alone is enough":
          "Cancellation also requires the same stated state.",
        "Yes, both are neutral":
          "Equal charge does not make their states identical.",
      },
      "A liquid-to-gas change remains represented.",
      "Match formula, charge and state.",
    ),
    n(
      "p-net-charge",
      "Allow nonzero charge",
      "After removing chloride spectators from Zn + Cu²⁺ + 2Cl⁻ → Zn²⁺ + 2Cl⁻ + Cu, what total signed charge is on EACH remaining side?",
      2,
      "charge units",
      "The full equation has zero charge; the net equation has +2 on each side.",
      "Removing equal negative charge changes both totals equally.",
    ),
    c(
      "p-atoms-not-charge",
      "Keep checks separate",
      "Cu + Ag⁺ → Cu²⁺ + Ag has one Cu and one Ag on each side. Is it balanced overall?",
      "No; +1 on the left differs from +2 on the right",
      {
        "Yes, atoms are enough": "Charge must also be conserved.",
        "No, copper atoms disappear": "Copper atom counts already match.",
      },
      "Atom conservation is satisfied; charge conservation is not.",
      "Check two separate ledgers.",
    ),
    n(
      "p-al-charge",
      "Scale signed charge",
      "Given 2Al + 3Cu²⁺ → 2Al³⁺ + 3Cu under reaction conditions, what total charge do the two Al³⁺ ions contribute?",
      6,
      "charge units",
      "2 × (+3) = +6.",
      "Multiply the coefficient by the ion charge.",
    ),
    c(
      "p-spectator-physical",
      "Keep spectators present",
      "Nitrate terms are absent from the net copper/silver equation. What follows about nitrate ions?",
      "They remain unchanged in the mixture",
      {
        "They were destroyed":
          "Equation cancellation is not chemical destruction.",
        "They were filtered out":
          "No filtration follows from writing a net equation.",
      },
      "The net equation records changed species and omits spectators.",
      "Distinguish notation from physical operations.",
    ),
    c(
      "p-reverse",
      "Reject a reverse displacement",
      "Cu is below Zn. The proposal Cu + Zn²⁺ → Cu²⁺ + Zn balances. Is balance enough to establish this displacement?",
      "No; the supplied ordering opposes it",
      {
        "Yes; conservation guarantees reaction":
          "Conservation is necessary but does not establish occurrence.",
        "Yes; both ions have +2":
          "Ion charge does not determine this ordering.",
      },
      "The more reactive zinc is not displaced by copper here.",
      "Apply the supplied metal ranking.",
    ),
    c(
      "p-unknown",
      "Recognise missing evidence",
      "M + X²⁺ → M²⁺ + X balances. Neither relative reactivity nor reaction evidence is supplied. What is established?",
      "Conservation, but not occurrence",
      {
        "The reaction certainly occurs": "There is no feasibility evidence.",
        "The reaction certainly cannot occur":
          "Absence of ordering is not proof of impossibility.",
      },
      "Balanced atoms and charge alone leave feasibility open.",
      "Ask what evidence is missing.",
    ),
    w(
      "p-explain-scale",
      "Explain whole-half scaling",
      "Explain why changing only electron coefficients is not enough when combining half-equations.",
      "The multiplier must apply to every species in each half. This preserves the half's atom and charge conservation. Choose multipliers giving equal numbers of electrons lost and gained, add the scaled halves and cancel matched electrons.",
      [
        "Multiply every term.",
        "Match electron transfer.",
        "Add and cancel only the matched terms.",
      ],
    ),
    w(
      "p-explain-cancel",
      "Explain spectator omission",
      "Explain why cancelling nitrate terms does not mean nitrate ions disappear.",
      "The nitrate ions have the same formula, charge and state before and after. They are unchanged spectators, so their equal terms can be omitted to show the net change; the physical ions remain in the mixture.",
      [
        "Match identical nitrate species.",
        "Describe unchanged spectators.",
        "Distinguish an omitted term from a removed ion.",
      ],
    ),
    w(
      "p-explain-feasible",
      "Explain a balanced reverse proposal",
      "Zn is above Cu. Explain why Cu + Zn²⁺ → Cu²⁺ + Zn being balanced does not establish the reaction.",
      "Its atoms and total charge balance, but those checks do not establish occurrence. Copper is less reactive than zinc, so the supplied ordering does not support copper displacing zinc.",
      [
        "Check conservation.",
        "Use the supplied relative reactivity.",
        "Give the direction supported by that ordering.",
      ],
    ),
  ],
  checkForms: [
    [
      n(
        "a-factor",
        "Independent transfer",
        "Given A → A³⁺ + 3e⁻ and B²⁺ + 2e⁻ → B under conditions where reaction occurs: what is the least multiplier of the B half?",
        3,
        "multiplier",
        "The least transfer is six electrons, requiring three B halves.",
        "Find a common electron total.",
      ),
      n(
        "a-charge",
        "Independent signed ledger",
        "For the supplied balanced 2A + 3B²⁺ → 2A³⁺ + 3B, what total charge is on the RIGHT?",
        6,
        "charge units",
        "Two A³⁺ contribute +6.",
        "Use each coefficient and ion charge.",
      ),
      c(
        "a-solid",
        "Independent representation",
        "A full ionic equation forms BaSO₄(s). Which product term preserves the stated solid?",
        "BaSO₄(s)",
        {
          "Ba²⁺(aq) + SO₄²⁻(aq)":
            "This changes the stated solid into dissolved ions.",
          "Ba(s) + sulfur + oxygen": "These are different products.",
        },
        "A solid product remains its solid formula term.",
        "Use the supplied phase.",
      ),
      c(
        "a-order",
        "Independent feasibility",
        "X is above Y. Which direction does that ordering support?",
        "X + Y²⁺ → X²⁺ + Y",
        {
          "Y + X²⁺ → Y²⁺ + X": "Y is the less reactive metal.",
          "Both because both balance":
            "Balance alone does not make both directions feasible.",
        },
        "The more reactive X displaces Y.",
        "Use the given ordering.",
      ),
      w(
        "a-explain",
        "Independent spectator explanation",
        "A full ionic equation has the same two chloride ions on each side. Explain what cancelling those terms means physically.",
        "Both unchanged chloride terms are omitted from the net equation. The chloride ions remain in the mixture; no ion destruction or removal is implied.",
        [
          "Identify unchanged ions.",
          "State that omission shortens the equation.",
          "Keep physical ions present.",
        ],
      ),
    ],
    [
      n(
        "b-factor",
        "Independent scale",
        "Given A → A³⁺ + 3e⁻ and B⁺ + e⁻ → B where reaction occurs: what is the least multiplier of the B half?",
        3,
        "multiplier",
        "Three one-electron halves match one three-electron half.",
        "Match loss with gain.",
      ),
      n(
        "b-cancel",
        "Independent cancellation quantity",
        "A supplied full equation has 3NO₃⁻(aq) on each side. How many nitrate coefficient units cancel from EACH side?",
        3,
        "ions",
        "Three identical nitrate terms cancel from each side.",
        "Count the shared unchanged quantity.",
      ),
      c(
        "b-phase",
        "Independent phase comparison",
        "A species Q(aq) and Q(s), with the same formula and charge, occur on opposite sides. Can they cancel as identical terms?",
        "No; the states differ",
        {
          "Yes, their formulas match":
            "Formula and charge alone are insufficient.",
          "Yes, aqueous species always cancel":
            "They must be identical on opposite sides.",
        },
        "The phase change must remain represented.",
        "Check physical state as well.",
      ),
      c(
        "b-evidence",
        "Independent evidence limit",
        "A proposed displacement conserves atoms and charge. No ordering or experimental evidence is given. What is justified?",
        "Its occurrence is not established",
        {
          "It must occur": "Balance is not feasibility evidence.",
          "It is impossible": "Missing evidence is not proof of impossibility.",
        },
        "Conservation leaves occurrence open.",
        "Separate necessity from evidence of occurrence.",
      ),
      w(
        "b-explain",
        "Independent charge explanation",
        "Explain why a net ionic equation can have +3 on both sides and still conserve charge.",
        "Conservation requires the total signed charge on the two sides to be equal, not zero. Equal unchanged spectator contributions may be omitted from both sides, leaving the same nonzero charge on each side.",
        [
          "Compare total signed charges.",
          "Do not require zero.",
          "Explain equal spectator omission.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "d-a-transfer",
        "Delayed transfer",
        "Given 2 electrons lost per metal atom and 3 gained per ion, what is the least COMMON electron total?",
        6,
        "electrons",
        "The least common multiple of two and three is six.",
        "Find shared multiples.",
      ),
      c(
        "d-a-water",
        "Delayed molecular product",
        "Which product term retains molecular water in a supplied neutralisation equation?",
        "H₂O(l)",
        {
          "H⁺(aq) + OH⁻(aq)": "These are reacting ions, not the water product.",
          "H₂(g) + O₂(g)": "These are different substances.",
        },
        "The water molecule remains intact.",
        "Do not split every formula.",
      ),
      w(
        "d-a-explain",
        "Delayed scaling explanation",
        "Explain why matching electron totals must be accompanied by scaling every atom-containing term.",
        "Scale every term in each half by one multiplier so that atom counts and charge remain conserved. Matching electron loss and gain then permits cancellation when the halves are added.",
        [
          "Scale every term.",
          "Keep atoms and charge balanced.",
          "Match and cancel electron transfer.",
        ],
      ),
    ],
    [
      n(
        "d-b-charge",
        "Delayed charge",
        "A supplied net equation has two A³⁺ ions and neutral metal on its RIGHT. What is its total right-hand charge?",
        6,
        "charge units",
        "2 × (+3) = +6.",
        "Neutral metal adds zero charge.",
      ),
      c(
        "d-b-reverse",
        "Delayed ordering",
        "P is below Q. Which proposal is not supported by that ordering?",
        "P displacing Q from Q²⁺ solution",
        {
          "Q displacing P from P²⁺ solution": "Q is more reactive.",
          "Q losing electrons to P²⁺":
            "This agrees with Q being more reactive.",
        },
        "Less reactive P does not displace Q in the supplied ordering.",
        "Identify the more reactive metal.",
      ),
      w(
        "d-b-explain",
        "Delayed spectator explanation",
        "Explain why equal sulfate terms may be omitted while the sulfate ions remain physically present.",
        "The sulfate ions are unchanged species with identical formula, charge and state on both sides. Equal terms cancel from the equation to show the net change, while the ions remain in the mixture.",
        [
          "Match identity and amount.",
          "Omit notation rather than ions.",
          "Keep the physical spectators.",
        ],
      ),
    ],
  ],
};
displacementJourney.guided[0].openingHint = true;
for (const q of displacementJourney.practice)
  q.followUp =
    "disp-v1-r-" +
    (q.id.includes("factor") ||
    q.id.includes("scale") ||
    q.id.includes("electrons") ||
    q.id.includes("multiple")
      ? "scale"
      : q.id.includes("charge") || q.id.includes("atoms")
        ? "charge"
        : q.id.includes("reverse") ||
            q.id.includes("unknown") ||
            q.id.includes("feasible")
          ? "feasible"
          : "spectators");
const repeated = [
  ["disp-v1-g-representation", "disp-v1-d-a-water"],
  ["disp-v1-r-feasible", "disp-v1-p-reverse", "disp-v1-p-explain-feasible"],
  ["disp-v1-w-multiple", "disp-v1-d-a-transfer"],
  [
    "disp-v1-g-ledger",
    "disp-v1-p-al-charge",
    "disp-v1-a-charge",
    "disp-v1-d-b-charge",
  ],
  ["disp-v1-p-al-cu-factor", "disp-v1-a-factor"],
  ["disp-v1-p-al-ag-factor", "disp-v1-b-factor"],
  ["disp-v1-r-solid", "disp-v1-a-solid"],
  ["disp-v1-p-phase", "disp-v1-b-phase"],
  ["disp-v1-p-unknown", "disp-v1-b-evidence"],
  ["disp-v1-p-explain-scale", "disp-v1-d-a-explain"],
  ["disp-v1-p-explain-cancel", "disp-v1-a-explain", "disp-v1-d-b-explain"],
];
const all = [
  ...displacementJourney.warmup,
  ...displacementJourney.refresher,
  ...displacementJourney.guided,
  ...displacementJourney.practice,
  ...displacementJourney.checkForms.flat(),
  ...displacementJourney.reviewForms.flat(),
];
for (const group of repeated)
  for (const q of all)
    if (group.includes(q.id))
      q.exposureAliases = group.filter((id) => id !== q.id);

for (const q of all)
  if (["disp-v1-p-sulfate", "disp-v1-d-b-explain"].includes(q.id))
    q.exposureAliases = [...(q.exposureAliases ?? []), "he-v1-r-spectator"];
