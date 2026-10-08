import type { LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";
import { extendAtomicFoundations } from "./atomic-foundations";
const build = (
  initial: [number, number, number],
  target: [number, number, number],
  instruction: string,
): TaskModel => ({ kind: "atom-build", initial, target, instruction });
export const atomicJourneys: Record<string, LessonJourney> = {
  "inside-an-atom": {
    version: 1,
    introduction:
      "Locate the particles first. Then build a neutral atom, keeping proton number, mass number and charge as three different quantities.",
    outcomes: [
      "Identify particle locations, relative charges and relative masses. Use atomic number and mass number to calculate all three counts for a neutral atom. Read a nuclear symbol and explain mass distribution.",
    ],
    scopeNote:
      "Isotopes, ion formation and detailed electron arrangements belong to later lessons.",
    warmup: [
      c(
        "atom-v2-w-location",
        "Which two particles are found in the nucleus?",
        "Protons and neutrons",
        {
          "Protons and electrons":
            "Electrons are outside the nucleus, in shells.",
          "Neutrons and electrons": "Protons belong in the nucleus too.",
        },
        "The nucleus contains protons and neutrons; electrons occupy shells around it.",
        "Separate the central nucleus from the surrounding shells.",
        "Checks particle location before counting.",
      ),
      n(
        "atom-v2-w-charge",
        "One proton has relative charge +1 and one electron −1. What is their total relative charge?",
        0,
        "",
        "+1 + (−1) = 0. Opposite charges cancel.",
        "Add the signed charges.",
        "Checks signed addition needed for neutrality.",
        {
          "2": "The electron charge is negative, so these charges cancel rather than add to +2.",
        },
      ),
    ],
    refresher: [
      c(
        "atom-v2-r-particles",
        "Place each particle in its correct region. Which particle has no relative charge?",
        "Neutron",
        {
          Electron: "An electron has relative charge −1.",
          Proton: "A proton has relative charge +1.",
        },
        "A neutron is neutral and lies in the nucleus. Protons are +1; electrons are −1.",
        "The word neutron is linked to neutral.",
        "Reconnects location and charge with a particle sorting task.",
        { kind: "particles" },
      ),
    ],
    guided: [
      {
        ...c(
          "atom-v2-g-place",
          "Place the three particle types. Which region contains almost all the mass of an atom?",
          "The nucleus",
          {
            "The electron shells":
              "An electron has about 1/1836 of a proton's mass; the heavy particles are in the nucleus.",
            "Both regions contain equal mass":
              "Protons and neutrons each have relative mass about 1, far greater than an electron.",
          },
          "Protons and neutrons each have relative mass about 1. Electron mass is very small, so almost all atomic mass is in the nucleus.",
          "The two heavy particle types go in the nucleus.",
          "Links the spatial model to relative mass rather than a memorised label.",
          { kind: "particles" },
        ),
        openingHint: true,
      },
      n(
        "atom-v2-g-neutral",
        "Build neutral carbon-12: atomic number 6, mass number 12. How many electrons does it need?",
        6,
        "electrons",
        "Six protons require six electrons for neutrality. Six neutrons make the mass number 12.",
        "Neutral means equal positive and negative charges.",
        "Requires balancing charge independently of mass number.",
        {
          "12": "12 counts nuclear particles, not electrons. Use the proton number for a neutral atom.",
        },
        build(
          [6, 6, 0],
          [6, 6, 6],
          "Build neutral carbon-12 without changing its six protons.",
        ),
      ),
      n(
        "atom-v2-g-mass",
        "Build neutral aluminium-27 with atomic number 13. How many neutrons are needed?",
        14,
        "neutrons",
        "27 = 13 protons + 14 neutrons. The 13 electrons do not contribute to mass number.",
        "Subtract proton number from mass number.",
        "Uses A − Z after support fades; distinguishes nucleons from all particles.",
        {
          "27": "27 includes protons as well as neutrons.",
          "13": "13 is the proton number. Subtract it from 27.",
        },
        build(
          [13, 13, 13],
          [13, 14, 13],
          "Adjust the nucleus to aluminium-27; keep the atom neutral.",
        ),
      ),
    ],
    practice: [
      n(
        "atom-v2-p-neon",
        "A neutral neon atom has atomic number 10 and mass number 22. How many neutrons?",
        12,
        "neutrons",
        "22 − 10 = 12 neutrons.",
        "Mass number = protons + neutrons.",
        "Transfers neutron calculation to an unfamiliar isotope.",
        { "10": "10 is the proton number; neutron number can be different." },
        build([10, 10, 10], [10, 12, 10], "Build neutral neon-22."),
      ),
      n(
        "atom-v2-p-sulfur",
        "A neutral sulfur atom has 16 protons and 18 neutrons. What is its mass number?",
        34,
        "",
        "16 + 18 = 34. Its 16 electrons are excluded from mass number.",
        "Add only the two types of nuclear particle.",
        "Reverses the calculation and catches adding electrons.",
        {
          "50": "50 also includes electrons. Mass number counts only protons and neutrons.",
        },
        build(
          [16, 16, 16],
          [16, 18, 16],
          "Build the sulfur atom described in the question.",
        ),
      ),
      c(
        "atom-v2-p-error",
        "Lee says a neutral atom with 9 protons must have 9 neutrons. Which correction is sound?",
        "It must have 9 electrons; neutron number may differ",
        {
          "It must have 18 electrons":
            "Nine protons are balanced by nine electrons.",
          "It must have no neutrons":
            "Neutrality tells us nothing about neutron number.",
        },
        "Neutrality relates protons to electrons. It does not fix neutron number.",
        "Which particles carry opposite charges?",
        "Challenges the equality-of-all-particles misconception.",
      ),
      n(
        "atom-v2-p-inverse",
        "A neutral atom has 19 electrons and mass number 39. How many protons?",
        19,
        "protons",
        "A neutral atom has equal proton and electron numbers, so there are 19 protons and 20 neutrons.",
        "Use neutrality before the mass number.",
        "Infers atomic number from electron count, not A − electrons.",
        { "20": "39 − 19 gives neutrons, not protons." },
      ),
    ],
    checkForms: [
      [
        n(
          "atom-v2-ca-neutrons",
          "A neutral boron atom has atomic number 5 and mass number 11. How many neutrons?",
          6,
          "neutrons",
          "11 − 5 = 6.",
          "Use A − Z.",
          "Checks neutron inference without the model.",
        ),
        n(
          "atom-v2-ca-electrons",
          "A neutral phosphorus atom has 15 protons and 16 neutrons. How many electrons?",
          15,
          "electrons",
          "Fifteen electrons balance fifteen protons.",
          "Use neutrality.",
          "Separates neutron information from electron count.",
        ),
        c(
          "atom-v2-ca-mass",
          "Why does the nucleus contain almost all atomic mass?",
          "Protons and neutrons are much heavier than electrons",
          {
            "Electrons have no charge": "Electrons are negatively charged.",
            "The nucleus fills most of the atom's volume":
              "The nucleus is very small compared with the atom.",
          },
          "Heavy nuclear particles occupy a tiny central region; most atomic volume is outside it.",
          "Compare particle masses, not diagram sizes.",
          "Checks mass versus size explanation.",
        ),
      ],
      [
        n(
          "atom-v2-cb-neutrons",
          "A neutral potassium atom has atomic number 19 and mass number 41. How many neutrons?",
          22,
          "neutrons",
          "41 − 19 = 22.",
          "Use A − Z.",
          "Alternate neutron inference with unequal counts.",
        ),
        n(
          "atom-v2-cb-mass",
          "An atom contains 7 protons, 8 neutrons and 7 electrons. What is its mass number?",
          15,
          "",
          "7 + 8 = 15; electrons are excluded.",
          "Count nuclear particles.",
          "Alternate check reverses neutron calculation.",
        ),
        c(
          "atom-v2-cb-neutral",
          "Which statement explains why a neutral atom has zero overall charge?",
          "Equal numbers of protons and electrons have opposite charges",
          {
            "Every particle has zero charge":
              "Protons and electrons carry charge individually.",
            "Protons cancel neutrons": "Neutrons have no charge to cancel.",
          },
          "Each +1 proton is balanced by a −1 electron.",
          "Identify the charged particles.",
          "Checks the mechanism of neutrality.",
        ),
      ],
    ],
    reviewForms: [
      [
        n(
          "atom-v2-ra-inverse",
          "A neutral atom has 12 electrons and 13 neutrons. What is its mass number?",
          25,
          "",
          "Neutrality gives 12 protons; 12 + 13 = 25.",
          "Find protons first.",
          "Delayed two-step transfer.",
        ),
        c(
          "atom-v2-ra-location",
          "Which description puts all three particle types correctly?",
          "Protons and neutrons in the nucleus; electrons in shells",
          {
            "Electrons and neutrons in the nucleus; protons in shells":
              "Electrons occupy shells; protons belong in the nucleus.",
            "All three particles in the nucleus":
              "Electrons lie outside the nucleus.",
          },
          "The two nucleon types are central; electrons occupy shells.",
          "Recall nuclear particles.",
          "Delayed structural retrieval.",
        ),
      ],
      [
        n(
          "atom-v2-rb-number",
          "An atom has 14 protons, 15 neutrons and 14 electrons. What is its atomic number?",
          14,
          "",
          "Atomic number counts protons only.",
          "Distinguish atomic number and mass number.",
          "Delayed discrimination of Z and A.",
        ),
        n(
          "atom-v2-rb-neutrons",
          "A neutral fluorine atom has mass number 19 and 9 electrons. How many neutrons?",
          10,
          "neutrons",
          "It has 9 protons, so 19 − 9 = 10.",
          "Use neutrality to find Z first.",
          "Alternate delayed inverse calculation.",
        ),
      ],
    ],
  },
};
for (const journey of Object.values(atomicJourneys)) {
  for (const task of [
    ...journey.warmup,
    ...journey.guided,
    ...journey.practice,
  ])
    task.followUp = journey.refresher[0].id;
}

const sample = atomicJourneys["inside-an-atom"];
const particleTable = (
  id: string,
  symbol: string,
  z: number,
  a: number,
  purpose: string,
) => ({
  ...n(
    id,
    `Complete the counts for this neutral ${symbol} atom.`,
    0,
    "",
    `${z} protons; ${a} − ${z} = ${a - z} neutrons; neutrality gives ${z} electrons.`,
    "Atomic number gives protons; mass number minus atomic number gives neutrons; a neutral atom has equal protons and electrons.",
    purpose,
  ),
  notation: { symbol, atomicNumber: z, massNumber: a },
  parts: [
    { id: "p", label: "Protons", answer: z },
    { id: "n", label: "Neutrons", answer: a - z },
    { id: "e", label: "Electrons", answer: z },
  ],
  answer: JSON.stringify({ p: String(z), n: String(a - z), e: String(z) }),
});
sample.practice.push(
  {
    ...particleTable(
      "atom-v2-p-symbol",
      "Ar",
      18,
      40,
      "Transfers counts to a nuclear symbol and a three-part exam-style table.",
    ),
    model: build(
      [18, 18, 18],
      [18, 22, 18],
      "Build the neutral argon-40 atom shown by the symbol.",
    ),
    followUp: sample.refresher[0].id,
  },
  {
    id: "atom-v2-p-explain",
    prompt:
      "Almost all the mass of an atom is in its nucleus. Explain why, using particle locations and relative masses.",
    answer: "A response to compare with the marking points",
    explanation:
      "Protons and neutrons are in the nucleus and each has relative mass about 1. Electrons are outside the nucleus and have very small relative mass (about 1/1836), so they contribute little to the atom's mass.",
    hint: "Name the particles in each region, compare their masses, then connect that comparison to the conclusion.",
    purpose:
      "Practises a written causal explanation, with explicit self-review rather than a machine-awarded mark.",
    rubric: [
      "Protons and neutrons are in the nucleus; electrons are outside it.",
      "Protons and neutrons each have relative mass about 1; an electron has a much smaller relative mass, about 1/1836.",
      "Therefore the nuclear particles contribute almost all atomic mass, while the electrons contribute very little.",
    ],
    followUp: sample.refresher[0].id,
  },
);
sample.checkForms[0][0] = particleTable(
  "atom-v2-ca-neutrons",
  "B",
  5,
  11,
  "Independent nuclear-symbol reading with all three particle counts.",
);
sample.checkForms[1][0] = particleTable(
  "atom-v2-cb-neutrons",
  "K",
  19,
  41,
  "Alternate independent nuclear-symbol reading; unequal proton and neutron counts.",
);

sample.refresher.push(
  n(
    "atom-v2-r-neutral",
    "Repair this neutral oxygen-16 atom. How many electrons should match its eight protons?",
    8,
    "electrons",
    "Eight negative electrons balance eight positive protons. Neutrons do not affect charge.",
    "Match the proton and electron counts to make charge zero.",
    "Repairs neutrality without conflating neutron count with electron count.",
    { "16": "Mass number counts protons and neutrons, not electrons." },
    build(
      [8, 8, 7],
      [8, 8, 8],
      "Restore neutral oxygen-16; keep both nuclear counts unchanged.",
    ),
  ),
  n(
    "atom-v2-r-mass",
    "Build neutral lithium-7 with atomic number 3. How many neutrons are needed?",
    4,
    "neutrons",
    "Mass number 7 includes three protons, leaving 7 − 3 = 4 neutrons.",
    "Mass number = protons + neutrons. Keep three protons and adjust only neutrons.",
    "Repairs A − Z using a small count model.",
    { "7": "Seven is the total of protons and neutrons." },
    build(
      [3, 3, 3],
      [3, 4, 3],
      "Make mass number seven without changing proton number or neutrality.",
    ),
  ),
);
const recovery: Record<string, string> = {
  "atom-v2-w-charge": "atom-v2-r-neutral",
  "atom-v2-g-neutral": "atom-v2-r-neutral",
  "atom-v2-g-mass": "atom-v2-r-mass",
  "atom-v2-p-neon": "atom-v2-r-mass",
  "atom-v2-p-sulfur": "atom-v2-r-mass",
  "atom-v2-p-error": "atom-v2-r-neutral",
  "atom-v2-p-inverse": "atom-v2-r-neutral",
  "atom-v2-p-symbol": "atom-v2-r-mass",
};
for (const task of [...sample.warmup, ...sample.guided, ...sample.practice])
  if (recovery[task.id]) task.followUp = recovery[task.id];
sample.guided[1].notation = {
  symbol: "C",
  atomicNumber: 6,
  massNumber: 12,
  annotated: true,
};
sample.guided[2].notation = {
  symbol: "Al",
  atomicNumber: 13,
  massNumber: 27,
  annotated: true,
};
sample.guided[0].title = "Where is an atom’s mass?";
sample.guided[1].title = "Build a neutral atom";
sample.guided[2].title = "Find the neutron number";
extendAtomicFoundations(sample);
