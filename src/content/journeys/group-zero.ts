import { extendGroupZeroWriting } from "./group-zero-writing";
import type { LearningTask, LessonJourney } from "../types";
import { choice, number } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  choice(
    `g0-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Noble-gas reasoning: ${id}.`,
  );
const he = q(
  "g-he",
  "Build neutral helium (atomic number 2). Why is its shell full?",
  "The first shell is full with two electrons",
  {
    "It needs six more electrons": "The first shell holds two, not eight.",
    "It has zero electrons because it is in Group 0":
      "Group 0 is a group label, not a neutral atom's electron count.",
  },
  "A neutral helium atom has two electrons in its only occupied shell. This is a stable full arrangement; helium is the exception to the eight-outer-electron description.",
  "Place both electrons in shell 1.",
);
he.title = "Helium's full shell";
he.openingHint = true;
he.model = {
  kind: "shell-place",
  atomicNumber: 2,
  initial: [0, 0, 0, 0],
  instruction: "Build helium: two electrons fill shell 1.",
};
const ar = q(
  "g-ar",
  "Build neutral argon, atomic number 18. What connects its electrons to its low chemical reactivity?",
  "A full outer shell; it does not easily transfer or share electrons",
  {
    "It has no electrons": "Neutral argon has 18 electrons.",
    "It must lose all eight outer electrons in ordinary reactions":
      "A stable full arrangement does not readily transfer or share electrons.",
  },
  "Argon has arrangement 2,8,8. The outer shell is full and stable, so its atoms do not readily gain, lose or share electrons under ordinary conditions.",
  "Build 2,8,8, then identify the outer occupied shell.",
);
ar.title = "Explain argon's inertness";
ar.model = {
  kind: "shell-place",
  atomicNumber: 18,
  initial: [2, 8, 7, 0],
  instruction:
    "Repair argon's electron arrangement; connect the full shell to chemical behaviour.",
};
const balloon = q(
  "g-balloon",
  "A balloon must provide lift and contain a gas that does not burn. Which gas meets BOTH requirements?",
  "Helium",
  {
    Hydrogen: "Hydrogen is light but flammable.",
    Argon: "Argon does not burn but is denser than air.",
  },
  "Helium is less dense than air, providing lift, and non-flammable. These are distinct properties: inertness alone does not explain lift.",
  "Choose the gas and the reason that meets both requirements.",
);
balloon.title = "Two requirements for a balloon";
balloon.model = {
  kind: "noble-use",
  use: "balloon",
  initial: ["hydrogen", "density"],
  instruction:
    "Select a lifting gas that does not burn. Justify both requirements.",
};
const filament = q(
  "g-filament",
  "A manufacturer replaces air around a hot filament with argon. Which property explains protection from oxidation?",
  "Chemical inertness",
  {
    "Low density":
      "Argon is denser than air; density does not explain this protection.",
    "It has no atoms": "Argon consists of individual atoms.",
  },
  "An argon atmosphere replaces surrounding oxygen. Argon is very unreactive under these conditions, so it does not oxidise the hot filament. Other appropriate inert gases can also be used.",
  "Use argon and select the property that prevents a chemical reaction.",
);
filament.title = "Match the property to the use";
filament.model = {
  kind: "noble-use",
  use: "filament",
  initial: ["argon", "nonflammable"],
  instruction:
    "Use the specified argon supply. Explain why replacing air protects the hot filament.",
};
const predict = number(
  "g0-v1-p-predict",
  "Supplied boiling points: argon −186 °C, xenon −108 °C. Krypton lies between them in Group 0. Predict a boiling point consistent with the increasing trend.",
  -150,
  "°C",
  "A trend-consistent prediction lies strictly between −186 and −108 °C. The supplied information does not determine one exact value.",
  "On a negative number line, −150 is higher than −186.",
  "Use a bounded prediction, not an exact recalled measurement.",
);
predict.acceptedRange = { min: -186, max: -108, exclusive: true };
const written: LearningTask = {
  id: "g0-v1-p-explain",
  prompt:
    "A student says: 'Argon cannot react because Group 0 atoms have no electrons.' Explain the error and connect argon's actual electron arrangement to its ordinary chemical behaviour.",
  answer:
    "Neutral argon has 18 electrons arranged 2,8,8. Its full outer shell is stable, so it does not easily gain, lose or share electrons under ordinary conditions. Group 0 is a group label, not zero electrons.",
  explanation:
    "Compare your explanation with the electron count, stable full arrangement and transfer/sharing mechanism. This written explanation is self-reviewed, not automatically awarded exam marks.",
  hint: "State 2,8,8, then explain what a stable full outer shell means for transfer or sharing.",
  purpose:
    "Construct a causal explanation rather than repeat the word unreactive.",
  rubric: [
    "Give neutral argon's 18 electrons and arrangement 2,8,8.",
    "Identify the stable full outer shell.",
    "Connect stability to not easily transferring or sharing electrons under ordinary conditions.",
    "Correct Group 0 as a label, not zero electrons.",
  ],
};
export const groupZeroJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build full electron shells, distinguish individual atoms from molecules, and use property evidence to explain noble-gas uses and trends.",
  outcomes: [
    "Explain helium's two-electron exception and argon's stable full outer shell.",
    "Recognise monatomic noble gases and predict increasing boiling points.",
    "Match inertness, density and non-flammability to the relevant use.",
  ],
  scopeNote:
    "AQA/Trilogy Group 0 with Pearson's stated uses. Shell construction is limited to helium, neon and argon in the first 20 elements. Very unreactive under ordinary conditions does not mean no noble-gas compounds can ever exist. Written explanations are self-reviewed.",
  warmup: [
    q(
      "w-neutral",
      "A neutral neon atom has atomic number 10. How many electrons does it have?",
      "10",
      {
        "0": "A neutral atom has as many electrons as protons.",
        "20": "Do not double the atomic number.",
      },
      "Ten protons balance ten electrons in a neutral neon atom.",
      "Neutral means equal positive and negative charges.",
    ),
    q(
      "w-shell",
      "What is neutral neon's arrangement?",
      "2,8",
      {
        "2,7": "This totals nine electrons, not ten.",
        "8,2": "Fill the first shell with two before filling the second.",
      },
      "Neon's ten electrons fill the first two shells: 2,8.",
      "Start at the shell nearest the nucleus.",
    ),
  ],
  refresher: [
    q(
      "r-full",
      "Which statement describes a full first electron shell?",
      "Two electrons",
      {
        "Eight electrons":
          "Eight applies to the next shells in this first-20 model.",
        "Zero electrons": "An empty shell is not a full occupied shell.",
      },
      "Helium has a full first shell with two electrons.",
      "Recall the first-shell capacity.",
    ),
    q(
      "r-transfer",
      "A stable full outer shell makes ordinary chemical reactions less likely because atoms do not easily…",
      "Transfer or share electrons",
      {
        "Lose their nuclei": "Chemical reactions do not remove nuclei.",
        Move: "Unreactive gases still have moving particles.",
      },
      "Chemical bonding involves electron transfer or sharing; a full stable arrangement resists these changes.",
      "Separate chemistry from particle motion.",
    ),
    q(
      "r-single",
      "What does monatomic mean?",
      "Separate individual atoms",
      {
        "Pairs of bonded atoms": "That is diatomic.",
        "Single electrons with no nuclei":
          "An atom includes a nucleus and electrons.",
      },
      "Noble gases ordinarily occur as individual atoms, not bonded pairs like Cl₂.",
      "Mono means one; count atoms per particle.",
    ),
    q(
      "r-negative",
      "Which temperature is higher?",
      "−108 °C",
      {
        "−186 °C": "Further below zero is colder.",
        "They are equal because both are negative":
          "Negative numbers have different magnitudes.",
      },
      "−108 is closer to zero and higher than −186.",
      "Place both temperatures on a number line.",
    ),
    q(
      "r-properties",
      "Why can a gas's low density alone fail the stated balloon requirements?",
      "A light gas may still be flammable",
      {
        "Every light gas is inert": "Hydrogen is a counterexample.",
        "Density and flammability are identical":
          "They describe different properties.",
      },
      "Hydrogen is less dense than air but burns; helium meets both low-density and non-flammability requirements.",
      "Test hydrogen against each separate requirement.",
    ),
  ],
  guided: [he, ar, balloon, filament],
  practice: [
    q(
      "p-neon",
      "Which description explains neon's ordinary low chemical reactivity?",
      "Stable full outer shell with eight electrons",
      {
        "Zero electrons": "Neon has ten total electrons.",
        "Exactly eight total electrons":
          "Eight is the outer count; two more occupy the first shell.",
      },
      "Neutral neon is 2,8: its outer shell is full and stable.",
      "Distinguish total and outer counts.",
    ),
    q(
      "p-he",
      "Which claim needs correction?",
      "All noble gases have eight outer electrons",
      {
        "Helium has a full first shell": "That statement is correct.",
        "Argon has a stable full outer shell": "That statement is correct.",
      },
      "Helium has two outer electrons. A full stable shell is the common idea, not always eight.",
      "Check helium.",
    ),
    q(
      "p-particle",
      "Which formula describes ordinary elemental argon particles?",
      "Ar",
      {
        "Ar₂": "Argon is monatomic under ordinary conditions.",
        "Ar⁻": "That is a charged ion, not ordinary neutral argon gas.",
      },
      "Separate neutral argon atoms are represented by Ar.",
      "Do not copy halogens' diatomic formulas.",
    ),
    q(
      "p-count",
      "A drawing has five separate neon atoms. How many neon atoms and molecules does it represent?",
      "Five atoms; no bonded molecules",
      {
        "Ten atoms; five molecules": "No pairs are bonded in the drawing.",
        "Five electrons; no atoms": "The described particles are atoms.",
      },
      "Each separate monatomic particle is one neon atom.",
      "Count the specified atoms, not imagined pairs.",
    ),
    q(
      "p-boil",
      "Supplied boiling points are He −269, Ne −246, Ar −186 °C. What is the down-group trend?",
      "Boiling point increases",
      {
        "Boiling point decreases": "−186 is higher than −246 and −269.",
        "Chemical reactivity must increase too":
          "A physical boiling trend does not imply a matching reaction trend.",
      },
      "The boiling points increase as relative atomic mass increases down Group 0; values remain below ordinary room temperature.",
      "Compare signed numbers.",
    ),
    predict,
    q(
      "p-room",
      "Using the supplied boiling points He −269, Ne −246, Ar −186 °C, what are their states at 20 °C at the reference pressure?",
      "All gases",
      {
        "All liquids": "20 °C is above every supplied boiling point.",
        "Helium is solid because it has two electrons":
          "Electron count alone does not determine a state at a specified temperature.",
      },
      "20 °C is above these boiling points, so all three are gases under the supplied conditions.",
      "Compare 20 with each boiling point.",
    ),
    q(
      "p-boiling",
      "When liquid neon boils, what happens to its particles?",
      "Individual neon atoms separate further; no covalent molecules are split",
      {
        "Ne₂ molecules split into atoms": "Ordinary neon is monatomic.",
        "Neon atoms lose all electrons":
          "Boiling does not turn neutral atoms into stripped nuclei.",
      },
      "Boiling overcomes attractions between atoms, not covalent bonds inside imagined Ne₂ molecules.",
      "Keep physical change distinct from chemical bonding.",
    ),
    q(
      "p-lift",
      "Why is argon's inertness insufficient to make it a lifting gas for an ordinary balloon?",
      "Argon is denser than air",
      {
        "Unreactive gases cannot move":
          "Chemical inactivity is not lack of movement.",
        "Argon always burns":
          "Argon is non-flammable under ordinary conditions.",
      },
      "Low density is required for lift; inertness describes chemical behaviour.",
      "Identify the physical requirement.",
    ),
    q(
      "p-light",
      "A neon sign glows when an electrical discharge transfers energy to the gas. Does this contradict chemical inertness?",
      "No: energy transfer and light emission are not evidence of compound formation",
      {
        "Yes: every glow proves a chemical reaction":
          "Light emission alone does not establish chemical reaction.",
        "Yes: neon must gain a full new nucleus":
          "A light source does not replace nuclei.",
      },
      "Electrical excitation can produce light without creating chemical compounds. Inertness concerns ordinary chemical reactivity, not an inability to interact with energy.",
      "Ask whether a new chemical substance has been shown.",
    ),
    written,
  ],
  checkForms: [
    [
      q(
        "ca-he",
        "Helium's only occupied shell contains two electrons. Why is helium normally unreactive?",
        "Its first shell is full and stable",
        {
          "It is missing six electrons": "The first shell is full at two.",
          "Its atom has no nucleus": "Helium has a nucleus.",
        },
        "Two fills the first shell; the stable arrangement does not readily change.",
        "Identify the first-shell capacity.",
      ),
      q(
        "ca-atom",
        "Which elemental particle is monatomic under ordinary conditions?",
        "Ne",
        {
          "Cl₂": "Chlorine has diatomic molecules.",
          "H₂": "Hydrogen has diatomic molecules.",
        },
        "Neon ordinarily consists of separate atoms.",
        "Count atoms in one particle.",
      ),
      q(
        "ca-trend",
        "Down Group 0, what happens to boiling points as relative atomic mass increases?",
        "They increase",
        {
          "They decrease": "The specified trend is increasing.",
          "They stay exactly zero": "Group 0 is not a temperature value.",
        },
        "Boiling points increase down the group.",
        "Retrieve the physical trend.",
      ),
      q(
        "ca-use",
        "A gas must lift a balloon and not burn. Which paired properties justify helium?",
        "Less dense than air and non-flammable",
        {
          "More dense than air and reactive":
            "These do not meet the requirements.",
          "Inert, therefore it has zero mass":
            "Inertness does not mean zero mass.",
        },
        "Density explains lift; non-flammability meets the second requirement.",
        "Match each requirement separately.",
      ),
    ],
    [
      q(
        "cb-ar",
        "Neutral argon is 2,8,8. What best explains its ordinary low chemical reactivity?",
        "A stable full outer shell; electron transfer or sharing is difficult",
        {
          "No electrons in the atom": "The arrangement totals 18.",
          "Eight protons vanish": "Chemical behaviour does not remove protons.",
        },
        "A stable full outer shell is not easily changed by transferring or sharing electrons.",
        "Connect structure to mechanism.",
      ),
      q(
        "cb-symbol",
        "Which notation represents an ordinary neutral helium atom?",
        "He",
        {
          "He₂": "Ordinary helium is monatomic.",
          "He²⁺": "This is a charged particle, not neutral helium gas.",
        },
        "He denotes one neutral helium atom.",
        "Distinguish atom, molecule and ion.",
      ),
      q(
        "cb-compare",
        "Two supplied boiling points are −153 °C and −108 °C. Which is higher?",
        "−108 °C",
        {
          "−153 °C": "It is further below zero.",
          "Neither because both are negative":
            "Negative values can still be ordered.",
        },
        "−108 is greater than −153.",
        "Use the signed number line.",
      ),
      q(
        "cb-protect",
        "Which argon property matters when replacing oxygen around a hot filament?",
        "Chemical inertness",
        {
          "Low density":
            "Argon is not less dense than air; density does not explain preventing oxidation.",
          Flammability: "Argon does not burn.",
        },
        "Inert argon replaces reactive oxygen around the filament.",
        "Identify what prevents a chemical change.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-he",
        "Does helium need eight electrons to have a full first shell?",
        "No: two fill its first shell",
        {
          "Yes: all shells require eight": "First-shell capacity is two.",
          "No: full means empty": "An empty shell is not full.",
        },
        "Helium's two-electron shell is full and stable.",
        "Recall the exception.",
      ),
      q(
        "ra-density",
        "Why does hydrogen fail a requirement for a non-flammable lifting gas?",
        "It burns despite being less dense than air",
        {
          "It is heavier than air": "Hydrogen is less dense than air.",
          "All low-density gases are noble gases":
            "Low density does not identify a noble gas.",
        },
        "Lightness and flammability are separate properties.",
        "Retrieve the counterexample.",
      ),
    ],
    [
      q(
        "rb-pair",
        "Does ordinary argon gas consist of bonded Ar₂ pairs?",
        "No: it is monatomic",
        {
          "Yes: all gases are diatomic":
            "Gas describes state, not atoms per molecule.",
          "No: it contains only electrons": "Argon gas contains whole atoms.",
        },
        "Separate atoms make up ordinary argon gas.",
        "Separate state from particle identity.",
      ),
      q(
        "rb-boil",
        "Which trend describes Group 0 boiling points down the group?",
        "Increasing boiling point",
        {
          "Decreasing boiling point": "This reverses the trend.",
          "Increasing ordinary reactivity like Group 1":
            "Noble-gas chemistry differs from alkali-metal chemistry.",
        },
        "Group 0 boiling points increase down the group.",
        "Retrieve the physical trend.",
      ),
    ],
  ],
};
for (const task of [...groupZeroJourney.guided, ...groupZeroJourney.practice])
  task.followUp =
    task.id.includes("boil") ||
    task.id.includes("predict") ||
    task.id.includes("room")
      ? "g0-v1-r-negative"
      : task.id.includes("balloon") ||
          task.id.includes("lift") ||
          task.id.includes("filament")
        ? "g0-v1-r-properties"
        : task.id.includes("particle") || task.id.includes("count")
          ? "g0-v1-r-single"
          : "g0-v1-r-transfer";

extendGroupZeroWriting(groupZeroJourney);
