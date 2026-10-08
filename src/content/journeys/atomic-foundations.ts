import type { LearningTask, LessonJourney, TaskModel } from "@/content/types";
import { choice as c, number as n } from "@/content/journeys/helpers";

type FoundationTask = LearningTask;
const prefix = "atom-found-v1-";
function choice(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
  elementReference = false,
): FoundationTask {
  return {
    ...c(prefix + id, prompt, answer, errors, explanation, hint, title, model),
    title,
    ...(elementReference ? { elementReference: true as const } : {}),
  };
}
function counts(
  id: string,
  title: string,
  prompt: string,
  entries: [string, string, number][],
  explanation: string,
): FoundationTask {
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    parts: entries.map(([id, label, answer]) => ({
      id,
      label,
      answer,
      inputMode: "numeric",
    })),
    answer: JSON.stringify(
      Object.fromEntries(entries.map(([id, , answer]) => [id, String(answer)])),
    ),
    partLegend: "Atom counts and types",
    explanation,
    hint: "An unwritten subscript means one atom. Repeated atoms do not add new element types.",
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): FoundationTask {
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    rubric,
    hint: "Separate a change of state from a change of chemical identity.",
  };
}

export const atomicFoundations = {
  warmup: [
    choice(
      "w-unit",
      "What an atom represents",
      "What is the smallest part of an element that can exist?",
      "An atom",
      {
        "A molecule":
          "A molecule contains atoms joined together. Some elements exist as molecules, but the individual atoms are the smaller units of that element.",
        "An electron":
          "An electron is a subatomic particle. It is not an atom of an element.",
      },
      "All substances are made from atoms. An atom is the smallest part of an element that can exist; it contains smaller subatomic particles.",
      "Distinguish an atom from the smaller particles inside it.",
    ),
    choice(
      "w-element",
      "One element, one atom type",
      "What makes a substance an element?",
      "It contains only one type of atom",
      {
        "Every particle must be a single unjoined atom":
          "An elemental molecule can contain two or more atoms of the same element, such as N₂.",
        "It must contain just one atom in the whole sample":
          "A large sample can contain many atoms and still be one element.",
      },
      "An element contains one atom type. Each element has its own chemical symbol, and the periodic table lists the elements. There are roughly a hundred different elements, not just the twenty in the supplied short reference.",
      "Count atom types, not the total number of atoms.",
    ),
  ],
  refresher: [
    choice(
      "r-symbol",
      "Read a chemical symbol",
      "Use the first 20 reference. Which symbol represents sodium?",
      "Na",
      {
        N: "N represents nitrogen. Sodium uses the two-letter symbol Na.",
        NA: "Chemical capitals matter: sodium is Na, with only its first letter capitalised.",
      },
      "Sodium is Na; nitrogen is N. In a two-letter chemical symbol the first letter is capital and the second is lower-case.",
      "Look up the name and keep the exact capitals.",
      undefined,
      true,
    ),
    choice(
      "r-state",
      "Keep water's identity",
      "Pure liquid water is boiled. What are its particles in the water vapour?",
      "H₂O molecules",
      {
        "Hydrogen and oxygen gases":
          "Boiling is a change of state. It does not decompose H₂O into the elements.",
        "Separate H and O atoms":
          "The atoms remain chemically joined in water molecules during the supplied physical change.",
      },
      "Water vapour still contains H₂O molecules. Boiling changes state without making hydrogen or oxygen; decomposition into elements requires a chemical reaction.",
      "Ask whether a new substance is made.",
    ),
    choice(
      "r-element",
      "Elemental molecules",
      "Helium contains separate He atoms; nitrogen contains N₂ molecules. Which sample must be a compound?",
      "Neither: each contains one element",
      {
        "Nitrogen, because it has joined atoms":
          "Joined atoms of the same element form an elemental molecule, not a compound.",
        "Both, because each sample has many atoms":
          "Many atoms do not imply different element types. Each complete sample contains one element.",
      },
      "An element contains one atom type. Helium's particles are individual atoms; nitrogen's particles are N₂ molecules. Neither contains different elements chemically combined.",
      "Count different atom types in each sample.",
    ),
    choice(
      "r-count",
      "Count element types",
      "How many element types are in H₂O?",
      "2",
      {
        "3": "Three atoms are present, but the two H atoms belong to the same element.",
        "1": "Hydrogen and oxygen are two different elements.",
      },
      "One H₂O molecule has three atoms but two element types: hydrogen and oxygen. Count each exact symbol once when counting types, and read its subscript when counting atoms.",
      "Separate the number of atoms from the number of different symbols.",
      {
        kind: "formula-mass",
        mode: "count",
        instruction: "Predict H and O atom counts.",
      },
    ),
  ],
  guided: [
    choice(
      "g-symbol",
      "Identify the atom",
      "Use the reference: 11 protons, mass number 23, neutral atom. Which symbol?",
      "Na",
      {
        N: "The reference gives nitrogen atomic number 7. Eleven protons identify sodium.",
        Ne: "Neon has ten protons. An atom with eleven protons is sodium.",
      },
      "Atomic number 11 identifies sodium, Na. Its requested neutral atom has 11 protons, 12 neutrons and 11 electrons. Changing model counts chooses a different representation; it is not a real chemical conversion.",
      "Use the proton number to look up the element.",
      {
        kind: "atom-build",
        initial: [10, 10, 10],
        target: [11, 12, 11],
        instruction: "Set 11 protons, mass number 23 and charge 0.",
      },
      true,
    ),
    choice(
      "g-ratio",
      "Fixed atom proportions",
      "Inspect H₂O and CO₂. For water, what is the H:O atom ratio?",
      "2:1",
      {
        "1:2":
          "The 2 follows H, so it counts two hydrogen atoms, not two oxygen atoms.",
        "1:1":
          "H₂O contains two H atoms and one O atom. An unwritten subscript means one.",
      },
      "A water molecule contains two H atoms chemically joined with one O atom: H:O is 2:1. More water molecules multiply both counts and retain that ratio. CO₂ is a different compound with one C and two O atoms. A compound contains different elements chemically combined in fixed proportions.",
      "Return to H₂O and count the two atom types separately.",
      {
        kind: "formula-mass",
        mode: "count",
        instruction: "Compare H₂O and CO₂; predict water's counts.",
      },
    ),
    choice(
      "g-decompose",
      "Decompose a compound",
      "How could water be separated into its elements?",
      "A chemical reaction that decomposes water",
      {
        "Filtering water":
          "Ordinary filtration does not split the chemically joined atoms in H₂O.",
        "Boiling then condensing water":
          "Distillation can collect water from a mixture. The collected water is still H₂O, not its separate elements.",
      },
      "Water's H and O atoms are chemically combined, not supplied as an uncombined mixture of the elements. Physical separation preserves substances; separating a compound into its elements requires a chemical reaction.",
      "Distinguish recovering a compound from decomposing it.",
      {
        kind: "formula-mass",
        mode: "count",
        instruction: "Inspect H₂O's joined atoms.",
      },
    ),
  ],
  practice: [
    choice(
      "p-element",
      "An elemental molecule",
      "The complete sample contains N₂ molecules only. N represents nitrogen. What is supplied?",
      "One element",
      {
        "A compound":
          "Both atoms in N₂ are nitrogen. A compound contains different elements chemically combined.",
        "A mixture of two elements":
          "Two nitrogen atoms in a molecule are not two different elements or two uncombined substances.",
      },
      "N₂ molecules contain one atom type: nitrogen. An element can have molecular particles without being a compound.",
      "Count element identities, not the atoms in one particle.",
    ),
    choice(
      "p-symbol",
      "Keep two-letter symbols intact",
      "Use the first 20 reference. Which symbol represents silicon?",
      "Si",
      {
        S: "S is sulfur. Silicon has the two-letter symbol Si.",
        SI: "Silicon is Si. Two capital letters are not its two-letter symbol.",
      },
      "Silicon is Si, while sulfur is S. Treat a two-letter symbol as one element identity and preserve its capitals.",
      "Look up silicon, then copy its exact symbol.",
      undefined,
      true,
    ),
    counts(
      "p-count",
      "Atoms versus types",
      "One NO₂ molecule (N = nitrogen, O = oxygen). Count atoms and element types.",
      [
        ["nitrogen", "Nitrogen atoms", 1],
        ["oxygen", "Oxygen atoms", 2],
        ["types", "Different element types", 2],
      ],
      "NO₂ has one N and two O atoms: three atoms altogether, but only two different element types. It is one compound, not three substances.",
    ),
    choice(
      "p-reaction",
      "Recognise a new substance",
      "A supplied reaction forms water from hydrogen and oxygen. Which account distinguishes this reaction from merely mixing the gases?",
      "Atoms are chemically rearranged to form a new substance",
      {
        "Hydrogen atoms change into oxygen atoms":
          "Chemical reactions rearrange atoms; they do not change one element's atoms into another element's atoms.",
        "The gases remain chemically unchanged, just closer together":
          "That describes an unreacted mixture, not the stated formation of water.",
      },
      "Water is a new compound formed by a chemical reaction. Its atoms retain their element identities but are joined in a different chemical arrangement. An energy change often accompanies a reaction; temperature change by itself does not prove new substances formed.",
      "Use the stated formation of water as the evidence.",
    ),
    written(
      "p-boiling",
      "Boiling and identity",
      "Does boiling pure water produce H₂ and O₂? Explain using composition and type of change.",
      "Water contains H and O atoms chemically combined in a fixed 2:1 atom ratio. Boiling changes liquid water into water vapour, whose molecules are still H₂O; no hydrogen or oxygen gas is formed by that physical change. Producing the elements from the compound would require a chemical reaction.",
      [
        "Different elements chemically combined in water, with H:O = 2:1.",
        "Boiling changes state while the particles remain H₂O molecules.",
        "The physical change does not make the elemental gases.",
        "A chemical reaction is required to decompose a compound into its elements.",
      ],
    ),
  ],
  check: [
    choice(
      "ca-unit",
      "Identify the elemental unit",
      "O₂ has two oxygen atoms. Which is the smallest part of the oxygen element that can exist?",
      "One oxygen atom",
      {
        "The complete O₂ molecule":
          "The molecule contains two smaller oxygen atoms.",
        "One electron from an oxygen atom":
          "An electron is a subatomic particle, not an atom of the oxygen element.",
      },
      "One oxygen atom is the smallest part of that element. An O₂ molecule contains two oxygen atoms; an electron is a smaller subatomic particle, not an elemental atom.",
      "Separate atom, molecule and subatomic particle.",
    ),
    choice(
      "ca-table",
      "Use the supplied element reference",
      "Use the reference: which symbol identifies an atom with three protons?",
      "Li",
      {
        He: "Helium has two protons. Three protons identify lithium.",
        Be: "Beryllium has four protons. Use the atomic number three.",
      },
      "Proton number is atomic number. The reference gives atomic number 3 as lithium, Li.",
      "Use atomic number, not a relative mass.",
      undefined,
      true,
    ),
    counts(
      "ca-count",
      "Read a new molecular formula",
      "Count atoms and types in one NH₃ molecule. N is nitrogen; H is hydrogen.",
      [
        ["nitrogen", "Nitrogen atoms", 1],
        ["hydrogen", "Hydrogen atoms", 3],
        ["types", "Different element types", 2],
      ],
      "NH₃ contains one nitrogen atom and three hydrogen atoms: four atoms but two element types in each molecule.",
    ),
    choice(
      "ca-mixture",
      "Classify a complete composition",
      "CH₄ and CO₂ molecules form a complete sample without reaction. Classify it.",
      "A mixture of two compounds",
      {
        "One compound because both contain carbon":
          "CH₄ and CO₂ are different chemical substances. Sharing an element does not make them one compound.",
        "One element because all particles are molecules":
          "Each formula contains different element types chemically combined. Molecular particles can belong to compounds.",
      },
      "CH₄ and CO₂ are two different compounds supplied together without chemical combination. The complete sample is a mixture; both constituent identities remain unchanged.",
      "Count substances separately from the element types inside each molecule.",
    ),
    written(
      "ca-state",
      "Transfer the distinction to another compound",
      "Model: pure liquid HCl is vaporised. Do H₂ and Cl₂ form? Explain why.",
      "HCl contains H and Cl chemically combined in a fixed 1:1 atom ratio. Vaporisation changes state: the model's gas still contains HCl molecules. It does not produce hydrogen and chlorine as new substances. Separating the compound into its elements would require a chemical reaction.",
      [
        "H and Cl are different elements chemically combined in HCl, in a 1:1 atom ratio.",
        "The change is vaporisation, so chemical identity remains HCl.",
        "Elemental hydrogen and chlorine are not products of this physical change.",
        "Decomposition into elements requires a chemical reaction.",
      ],
    ),
  ],
  review: [
    choice(
      "ra-element",
      "Retrieve molecule versus element",
      "N₂ (nitrogen) molecules only: classify this complete sample.",
      "An element",
      {
        "A compound": "Each molecule contains just one element type: nitrogen.",
        "A mixture":
          "The complete sample contains only one chemical substance.",
      },
      "Two nitrogen atoms can form one elemental molecule. The complete sample is one element because there is just one atom type.",
      "Count distinct element types, not the number of joined atoms.",
    ),
    choice(
      "ra-table",
      "Use a new atomic number",
      "An atom has 12 protons. Which symbol?",
      "Mg",
      {
        Na: "Sodium has atomic number 11, not 12.",
        Al: "Aluminium has atomic number 13, not 12.",
      },
      "Atomic number 12 is magnesium, Mg. The reference's atomic number is proton count.",
      "Look up twelve in the atomic-number column.",
      undefined,
      true,
    ),
    {
      ...n(
        prefix + "ra-count",
        "Three CO₂ molecules: how many oxygen atoms?",
        6,
        "oxygen atoms",
        "Each CO₂ molecule contains two oxygen atoms, so three complete molecules represent 3 × 2 = 6 oxygen atoms. Their per-molecule composition stays fixed.",
        "Multiply the molecule count by the O atoms in one molecule.",
        "Retrieve formula counts without changing the compound.",
      ),
      title: "Scale a molecular count",
    },
  ],
};

const aliases = [
  ["w-unit", "ca-unit"],
  ["r-symbol", "g-symbol"],
  ["r-state", "g-decompose", "p-boiling"],
  ["p-element", "ra-element", "r-element"],
];
const all = [
  ...atomicFoundations.warmup,
  ...atomicFoundations.refresher,
  ...atomicFoundations.guided,
  ...atomicFoundations.practice,
  ...atomicFoundations.check,
  ...atomicFoundations.review,
];
for (const family of aliases) {
  const ids = family.map((id) => prefix + id);
  for (const task of all)
    if (ids.includes(task.id))
      task.exposureAliases = ids.filter((id) => id !== task.id);
}
const recovery: Record<string, string> = {
  "w-unit": "w-unit",
  "w-element": "w-element",
  "r-symbol": "r-symbol",
  "r-state": "r-state",
  "g-symbol": "r-symbol",
  "g-ratio": "r-count",
  "g-decompose": "r-state",
  "p-element": "r-element",
  "p-symbol": "r-symbol",
  "p-count": "r-count",
  "p-reaction": "r-state",
  "p-boiling": "r-state",
};
for (const task of [
  ...atomicFoundations.warmup,
  ...atomicFoundations.guided,
  ...atomicFoundations.practice,
]) {
  const target = recovery[task.id.slice(prefix.length)];
  if (target && prefix + target !== task.id) task.followUp = prefix + target;
}

export function extendAtomicFoundations(journey: LessonJourney) {
  journey.introduction =
    "All substances are made from atoms. An atom is the smallest part of an element that can exist, and contains smaller subatomic particles. Locate those particles, then use element symbols and molecule models to distinguish element identity, chemical composition and particle counts.";
  (journey.outcomes ??= []).push(
    "Use a supplied first-twenty element reference; distinguish atoms, elemental molecules, compounds and mixtures without confusing atom totals with element types.",
    "Explain fixed compound composition and why physical separation cannot decompose a compound into its elements.",
  );
  journey.warmup.push(...atomicFoundations.warmup);
  journey.refresher.push(...atomicFoundations.refresher);
  journey.guided.push(...atomicFoundations.guided);
  journey.practice.push(...atomicFoundations.practice);
  // Preserve every original task position and the two original sealed forms.
  journey.checkForms.push(atomicFoundations.check);
  journey.reviewForms.push(atomicFoundations.review);
}
