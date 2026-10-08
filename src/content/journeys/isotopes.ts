import type { LessonJourney, LearningTask, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";

const transform = (
  operation: "isotope" | "ion",
  initial: [number, number, number],
  target: [number, number, number],
  instruction: string,
): TaskModel => ({
  kind: "atom-transform",
  operation,
  initial,
  target,
  instruction,
});
const table = (
  id: string,
  symbol: string,
  z: number,
  a: number,
  charge: number,
  purpose: string,
): LearningTask => ({
  ...n(
    id,
    `Complete the particle counts for this ${symbol} ion.`,
    0,
    "",
    `${z} protons; ${a} − ${z} = ${a - z} neutrons; ${z} − (${charge}) = ${z - charge} electrons.`,
    "Read atomic number and mass number first. For an ion, charge = protons − electrons.",
    purpose,
  ),
  notation: { symbol, atomicNumber: z, massNumber: a, charge },
  parts: [
    { id: "p", label: "Protons", answer: z },
    { id: "n", label: "Neutrons", answer: a - z },
    { id: "e", label: "Electrons", answer: z - charge },
  ],
  answer: JSON.stringify({
    p: String(z),
    n: String(a - z),
    e: String(z - charge),
  }),
});

export const isotopeJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare what changes and what stays fixed. Isotopes differ in neutron number. An atom forms an ion by gaining or losing electrons, leaving its nucleus unchanged.",
  outcomes: [
    "Identify isotopes from proton and neutron counts, and calculate missing particle counts from nuclear notation.",
    "Explain why neutral isotopes have the same electron arrangement and chemical properties in the GCSE model.",
    "Predict ion charge after electron gain or loss, read charged nuclear symbols and explain why the element remains the same.",
  ],
  scopeNote:
    "Relative atomic mass and isotope abundance, detailed electron arrangements, ionic bonding and nuclear decay require separate lessons. This model does not assess those outcomes.",
  warmup: [
    c(
      "iso-v1-w-element",
      "Atom X has 8 protons and 8 neutrons. Atom Y has 8 protons and 10 neutrons. Are they the same element?",
      "Yes: both have 8 protons",
      {
        "No: their neutron counts differ":
          "Neutrons can differ within an element; proton number defines it.",
        "Not enough information without electron counts":
          "Proton number determines element identity, independently of electron count.",
      },
      "Both have atomic number 8 and are oxygen. Neutron number does not define the element.",
      "Use the number that defines an element.",
      "Checks element identity before isotope comparison.",
    ),
    n(
      "iso-v1-w-charge",
      "A particle contains 10 protons and 10 electrons. What is its overall relative charge?",
      0,
      "",
      "10 − 10 = 0. Equal opposite charges cancel.",
      "Charge = number of protons − number of electrons.",
      "Checks signed charge arithmetic before ion formation.",
      {
        "20": "The electron charges are negative; they cancel the proton charges.",
      },
    ),
    n(
      "iso-v1-w-neutrons",
      "A neutral atom has atomic number 6 and mass number 13. How many neutrons?",
      7,
      "neutrons",
      "13 − 6 = 7 neutrons.",
      "Mass number counts protons plus neutrons.",
      "Checks the A − Z prerequisite for isotope notation.",
      { "13": "13 counts both protons and neutrons." },
    ),
  ],
  refresher: [
    n(
      "iso-v1-r-neutrons",
      "Compare neutral boron-10 with boron-11. Both have 5 protons. How many neutrons does boron-11 have?",
      6,
      "neutrons",
      "11 − 5 = 6. Both remain boron; only neutron number differs.",
      "Keep protons and electrons fixed; change neutrons.",
      "Repairs isotope counting with a small nucleus.",
      { "5": "Five is the proton count, not the boron-11 neutron count." },
      transform(
        "isotope",
        [5, 5, 5],
        [5, 6, 5],
        "Compare boron-10 with boron-11; keep both atoms neutral.",
      ),
    ),
    n(
      "iso-v1-r-positive",
      "A neutral lithium atom loses one electron. What is its ion charge?",
      1,
      "",
      "Three protons and two electrons give 3 − 2 = +1. Removing a negative particle makes the charge positive.",
      "Subtract electrons from protons.",
      "Repairs the sign of charge after electron loss.",
      { "-1": "Losing negative charge leaves positive charge." },
      transform(
        "ion",
        [3, 4, 3],
        [3, 4, 2],
        "Remove one electron from neutral lithium-7; keep the nucleus fixed.",
      ),
    ),
    n(
      "iso-v1-r-negative",
      "A neutral fluorine atom gains one electron. What is its ion charge?",
      -1,
      "",
      "Nine protons and ten electrons give 9 − 10 = −1. The nucleus is unchanged.",
      "Gaining a negative particle makes charge negative.",
      "Repairs the sign of charge after electron gain.",
      { "1": "Gaining an electron adds negative charge." },
      transform(
        "ion",
        [9, 10, 9],
        [9, 10, 10],
        "Add one electron to neutral fluorine-19; keep the nucleus fixed.",
      ),
    ),
  ],
  guided: [
    {
      ...c(
        "iso-v1-g-carbon",
        "Compare neutral carbon-12 with carbon-13. What makes them isotopes of the same element?",
        "Same proton number, different neutron numbers",
        {
          "Different proton numbers, same electron number":
            "Changing proton number would change the element.",
          "Same neutron number, different electron numbers":
            "That describes a change in charge, not the defining isotope difference.",
        },
        "Both have six protons. Carbon-12 has six neutrons and carbon-13 has seven. Their neutral electron counts are both six.",
        "Keep the element fixed and compare the nuclear particles.",
        "Makes isotope identity and the neutron difference visible.",
        transform(
          "isotope",
          [6, 6, 6],
          [6, 7, 6],
          "Change carbon-12 to a comparison with carbon-13. Only neutrons can change.",
        ),
      ),
      title: "Same element, different nucleus",
      openingHint: true,
    },
    {
      ...n(
        "iso-v1-g-chlorine",
        "Compare chlorine-35 and chlorine-37. Both neutral atoms have atomic number 17. How many neutrons are in chlorine-37?",
        20,
        "neutrons",
        "37 − 17 = 20. Chlorine-35 has 18 neutrons. Both atoms have 17 protons and 17 electrons; electron arrangement is unchanged.",
        "Use mass number minus atomic number, not the difference between the two isotope masses.",
        "Transfers isotope comparison to unequal proton/neutron counts with faded support.",
        {
          "2": "Two is the extra neutron count compared with chlorine-35, not the total in chlorine-37.",
          "37": "37 counts protons and neutrons together.",
        },
        transform(
          "isotope",
          [17, 18, 17],
          [17, 20, 17],
          "Compare chlorine-35 with chlorine-37, keeping both atoms neutral.",
        ),
      ),
      title: "Read the isotope numbers",
    },
    {
      ...n(
        "iso-v1-g-sodium",
        "A neutral sodium-23 atom loses one electron. What is the resulting ion's relative charge?",
        1,
        "",
        "11 protons and 10 electrons give +1. The 12 neutrons are unchanged; it remains sodium with mass number 23.",
        "Removing a negative electron leaves an excess positive charge.",
        "Introduces electron loss as a distinct operation that leaves the nucleus unchanged.",
        {
          "-1": "An electron is negative, so losing one makes the ion positive.",
          "12": "12 is the neutron count; neutrons carry no charge.",
        },
        transform(
          "ion",
          [11, 12, 11],
          [11, 12, 10],
          "Remove one electron from neutral sodium-23; keep its nucleus unchanged.",
        ),
      ),
      title: "Lose an electron, predict the charge",
      openingHint: true,
    },
    {
      ...n(
        "iso-v1-g-chloride",
        "A neutral chlorine-35 atom gains one electron. What is the resulting ion's relative charge?",
        -1,
        "",
        "17 protons and 18 electrons give −1. It remains chlorine; mass number remains 35.",
        "Calculate protons minus electrons after the gain.",
        "Contrasts electron gain with loss after the ion hint fades.",
        {
          "1": "Gaining a negative particle makes the overall charge negative.",
          "18": "18 is the new electron count, not the overall charge.",
        },
        transform(
          "ion",
          [17, 18, 17],
          [17, 18, 18],
          "Add one electron to neutral chlorine-35; keep its nucleus unchanged.",
        ),
      ),
      title: "Gain an electron, predict the charge",
    },
  ],
  practice: [
    c(
      "iso-v1-p-pair",
      "Which pair describes isotopes of the same element?",
      "X: 12 protons, 12 neutrons; Y: 12 protons, 13 neutrons",
      {
        "X: 12 protons, 12 neutrons; Y: 13 protons, 12 neutrons":
          "The second atom is a different element because its proton number differs.",
        "X: 12 protons, 12 neutrons; Y: 12 protons, 12 neutrons":
          "This pair has no neutron difference, so it does not show different isotopes.",
      },
      "Both atoms have atomic number 12, but their neutron counts differ.",
      "An isotope comparison needs both the same proton number and different neutron numbers.",
      "Requires two-part classification, including a same-isotope distractor.",
    ),
    n(
      "iso-v1-p-silicon",
      "Silicon-30 has atomic number 14. How many neutrons does it contain?",
      16,
      "neutrons",
      "30 − 14 = 16. Atomic number remains 14 for every silicon isotope.",
      "Subtract atomic number from mass number.",
      "Transfers isotope counting without a default model.",
      {
        "14": "14 is the proton count; not every isotope has equal proton and neutron counts.",
      },
      transform(
        "isotope",
        [14, 14, 14],
        [14, 16, 14],
        "Compare neutral silicon-28 and silicon-30.",
      ),
    ),
    n(
      "iso-v1-p-magnesium",
      "A magnesium ion has 12 protons and 10 electrons. Calculate its relative charge.",
      2,
      "",
      "12 − 10 = +2. It has two more protons than electrons.",
      "Subtract the electron count from the proton count.",
      "Extends charge balance beyond singly charged ions.",
      {
        "-2": "There are fewer negative electrons than positive protons, so the ion is positive.",
      },
      transform(
        "ion",
        [12, 12, 12],
        [12, 12, 10],
        "Remove two electrons from neutral magnesium-24.",
      ),
    ),
    n(
      "iso-v1-p-sulfide",
      "A sulfur ion has 16 protons and 18 electrons. Calculate its relative charge.",
      -2,
      "",
      "16 − 18 = −2. Two extra electrons give a doubly negative ion.",
      "Keep the subtraction in proton-minus-electron order.",
      "Extends the negative-charge calculation and diagnoses reversed subtraction.",
      { "2": "18 − 16 reverses the required charge calculation." },
      transform(
        "ion",
        [16, 16, 16],
        [16, 16, 18],
        "Add two electrons to neutral sulfur-32.",
      ),
    ),
    {
      ...n(
        "iso-v1-p-inverse",
        "How many electrons are in the sodium ion shown?",
        10,
        "electrons",
        "Atomic number gives 11 protons. For a +1 ion, electrons = 11 − 1 = 10.",
        "A positive ion has fewer electrons than protons.",
        "Requires inverse reasoning from charged nuclear notation.",
        {
          "11": "Eleven electrons would make this sodium atom neutral.",
          "12": "An extra electron would make its charge negative.",
        },
      ),
      notation: { symbol: "Na", atomicNumber: 11, massNumber: 23, charge: 1 },
    },
    table(
      "iso-v1-p-table",
      "Mg",
      12,
      24,
      2,
      "Combines nuclear notation and ion charge in three separate particle counts.",
    ),
    c(
      "iso-v1-p-chemistry",
      "Why do neutral chlorine-35 and chlorine-37 have the same chemical properties in the GCSE model?",
      "They have the same electron arrangement",
      {
        "Their nuclei have the same mass":
          "Their neutron numbers and mass numbers differ.",
        "Neutrons carry the charges involved in bonding":
          "Neutrons have no charge. Chemical behaviour depends on electrons.",
      },
      "Both have 17 protons and 17 electrons, including the same outer-shell arrangement. The neutron difference does not alter this arrangement.",
      "Chemical reactions involve electrons; compare the two neutral atoms' electrons.",
      "Requires a causal chemical-property explanation rather than repeating the isotope definition.",
    ),
    {
      id: "iso-v1-p-explanation",
      prompt:
        "Rin says a positive ion forms when an atom gains a proton. Explain what is wrong and how an atom forms a positive ion instead.",
      answer: "A response to compare with the marking points",
      explanation:
        "Gaining a proton changes atomic number and therefore the element. A positive ion forms when an atom loses one or more electrons: its proton count then exceeds its electron count. The nucleus is unchanged.",
      hint: "Separate element identity, electron transfer and overall charge.",
      purpose:
        "Requires written correction of a mechanism, without machine-awarding correctness from keywords.",
      rubric: [
        "Changing proton number changes atomic number and element identity.",
        "An atom forms a positive ion by losing one or more negative electrons.",
        "There are then more protons than electrons, while proton and neutron counts remain unchanged.",
      ],
    },
  ],
  checkForms: [
    [
      c(
        "iso-v1-ca-pair",
        "Two neutral atoms have these counts: X has 8 protons and 8 neutrons; Y has 8 protons and 9 neutrons. Which description is correct?",
        "They are different isotopes of oxygen",
        {
          "They are different elements": "Their proton numbers are equal.",
          "Y is a negative ion because it has an extra neutron":
            "Neutrons carry no charge; both atoms are specified as neutral.",
        },
        "Both have atomic number 8, with different neutron counts.",
        "Compare proton and neutron numbers separately.",
        "Independently distinguishes isotope identity from element and ion identity.",
      ),
      n(
        "iso-v1-ca-electrons",
        "A calcium ion has 20 protons and charge +2. How many electrons?",
        18,
        "electrons",
        "20 − 18 = +2, so it contains 18 electrons.",
        "Use electrons = protons − charge.",
        "Independent inverse electron calculation for a doubly charged ion.",
      ),
      table(
        "iso-v1-ca-table",
        "Cl",
        17,
        37,
        -1,
        "Independent charged-symbol table with unequal nuclear counts.",
      ),
      c(
        "iso-v1-ca-gain",
        "Which change forms a negative ion from a neutral atom while leaving the element unchanged?",
        "Gaining electrons",
        {
          "Gaining neutrons":
            "Neutron gain changes isotope identity, not the charge.",
          "Losing electrons": "Electron loss creates positive charge.",
        },
        "Adding negative electrons makes charge negative while proton number remains fixed.",
        "Identify which particle transfers charge.",
        "Independent discrimination of electron-gain and neutron-change mechanisms.",
      ),
    ],
    [
      c(
        "iso-v1-cb-pair",
        "Neutral atoms P and Q each have 11 protons. P has 12 neutrons and Q has 13. What is the relationship between them?",
        "Different isotopes of the same element",
        {
          "Different elements because their mass numbers differ":
            "Element identity depends on proton number, which is equal.",
          "Different ions because neutron counts differ":
            "Both atoms are neutral; neutrons do not carry charge.",
        },
        "They share atomic number 11 but have mass numbers 23 and 24.",
        "Apply both parts of the isotope definition.",
        "Alternate independent classification using mass and charge distractors.",
      ),
      n(
        "iso-v1-cb-electrons",
        "A potassium ion has 19 protons and charge +1. How many electrons?",
        18,
        "electrons",
        "19 − 18 = +1.",
        "Subtract the positive charge from proton number.",
        "Alternate inverse calculation for a singly charged ion.",
      ),
      table(
        "iso-v1-cb-table",
        "Al",
        13,
        27,
        3,
        "Alternate charged-symbol table requiring a triply positive charge.",
      ),
      c(
        "iso-v1-cb-loss",
        "Why does electron loss make an initially neutral atom positively charged?",
        "It leaves more protons than electrons",
        {
          "Each remaining electron becomes positively charged":
            "Electrons retain negative charge.",
          "Neutrons gain positive charge":
            "Neutrons do not gain charge during electron transfer.",
        },
        "The nucleus remains unchanged; removing negative electrons leaves excess positive charge.",
        "Compare positive and negative particle counts.",
        "Independent explanation of the mechanism, not just the sign.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "iso-v1-ra-neutrons",
        "Nitrogen-15 has 7 protons. How many neutrons?",
        8,
        "neutrons",
        "15 − 7 = 8.",
        "Count the nuclear particles.",
        "Delayed isotope-count retrieval with a new element.",
      ),
      n(
        "iso-v1-ra-electrons",
        "An ion has 12 protons and charge +2. How many electrons?",
        10,
        "electrons",
        "12 − 10 = +2.",
        "Use the signed charge relation.",
        "Delayed inverse charge retrieval.",
      ),
      c(
        "iso-v1-ra-chemistry",
        "What feature explains the shared chemical properties of two neutral isotopes of the same element?",
        "The same electron arrangement",
        {
          "The same neutron number":
            "Different isotopes have different neutron numbers.",
          "A zero mass number":
            "An atom's mass number counts its nuclear particles; it is not zero.",
        },
        "Equal proton counts in neutral atoms give equal electron arrangements.",
        "Recall the particles involved in chemical reactions.",
        "Delayed causal reasoning about isotope chemistry.",
      ),
    ],
    [
      n(
        "iso-v1-rb-neutrons",
        "Sulfur-34 has atomic number 16. How many neutrons?",
        18,
        "neutrons",
        "34 − 16 = 18.",
        "Mass number minus atomic number.",
        "Alternate delayed isotope-count retrieval.",
      ),
      n(
        "iso-v1-rb-electrons",
        "An oxygen ion contains 8 protons and has charge −2. How many electrons?",
        10,
        "electrons",
        "8 − 10 = −2.",
        "A negative ion has more electrons than protons.",
        "Alternate delayed inverse reasoning with a negative charge.",
      ),
      c(
        "iso-v1-rb-element",
        "If proton number changes, what necessarily changes?",
        "The element",
        {
          "Only the isotope": "Isotopes retain proton number.",
          "Only the ion charge":
            "Changing proton number changes atomic number, not just ion charge.",
        },
        "Proton number determines atomic number and element identity.",
        "Recall the definition of atomic number.",
        "Delayed distinction between nuclear identity and ordinary ion formation.",
      ),
    ],
  ],
};

const recovery: Record<string, string> = {
  "iso-v1-w-charge": "iso-v1-r-positive",
  "iso-v1-g-sodium": "iso-v1-r-positive",
  "iso-v1-g-chloride": "iso-v1-r-negative",
  "iso-v1-p-magnesium": "iso-v1-r-positive",
  "iso-v1-p-sulfide": "iso-v1-r-negative",
  "iso-v1-p-inverse": "iso-v1-r-positive",
  "iso-v1-p-explanation": "iso-v1-r-positive",
};
for (const task of [
  ...isotopeJourney.warmup,
  ...isotopeJourney.guided,
  ...isotopeJourney.practice,
])
  task.followUp = recovery[task.id] ?? "iso-v1-r-neutrons";
