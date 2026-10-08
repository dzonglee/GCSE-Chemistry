import type { LearningTask, LessonJourney } from "../types";
import { choice, number } from "./helpers";
import { extendTransitionCompounds } from "./transition-compounds";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask => {
  const task = choice(
    `tm-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Transition-metal reasoning: ${id}.`,
  );
  const titles: Record<string, string> = {
    "p-data": "Compare supplied data",
    "p-react": "Compare reactivity",
    "p-location": "Classify the metal",
    "p-colour": "Coloured compounds",
    "p-table": "Compare reaction runs",
  };
  if (titles[id]) task.title = titles[id];
  return task;
};
const physical = q(
  "g-compare",
  "Which pair gives two physical comparisons with Group 1?",
  "Generally denser and harder",
  {
    "Forms coloured compounds and different ion charges":
      "These describe characteristic chemistry, not the requested physical comparisons of elements.",
    "Generally less dense and softer": "This reverses the general comparison.",
  },
  "The selected transition-metal examples generally have higher density and hardness than Group 1 metals. Melting point and strength are other distinct physical comparisons. Read the type of property requested.",
  "Choose two different physical properties, with the direction stated.",
);
physical.title = "Physical comparisons";
physical.openingHint = true;
physical.model = {
  kind: "transition-compare",
  initial: ["colour", "charge"],
  instruction: "Choose two distinct physical comparisons.",
};
const fe2 = q(
  "g-fe2",
  "Neutral iron has 26 electrons. Build Fe²⁺. How many remain?",
  "24",
  {
    "28": "Adding electrons would give negative charge.",
    "26": "This is neutral iron, not Fe²⁺.",
  },
  "Losing two electrons leaves 24 electrons against 26 protons: net charge 2+. The nucleus and element identity remain unchanged.",
  "Remove two electrons from the neutral count.",
);
fe2.title = "Make iron(II)";
fe2.model = {
  kind: "transition-ion",
  initialElectrons: 26,
  targetCharge: 2,
  instruction: "Keep 26 protons fixed.",
};
const fe3 = q(
  "g-fe3",
  "Fe²⁺ loses one electron. Which ion forms?",
  "Fe³⁺",
  {
    "Fe⁺": "Losing another negative electron makes positive charge larger.",
    "Co³⁺": "Changing electrons does not change iron into cobalt.",
  },
  "The new particle has 26 protons and 23 electrons: net charge 3+. Iron(II) and iron(III) are different charges of the same element.",
  "Compare fixed positive charge with the new negative charge.",
);
fe3.title = "One more electron lost";
fe3.model = {
  kind: "transition-ion",
  initialElectrons: 24,
  targetCharge: 3,
  instruction: "Start from Fe²⁺. Remove one electron.",
};
const catalyst = q(
  "g-catalyst",
  "Read the supplied completed runs. What does the catalyst change?",
  "More product at 20 s; the same final product amount",
  {
    "More product at every time, including completion":
      "Both supplied completed runs finish at 24 cm³.",
    "It becomes the extra product": "The catalyst is not consumed overall.",
  },
  "At 20 s, 22 cm³ with catalyst exceeds 14 cm³ without. Both completed runs give 24 cm³ from identical reactants. Faster reaction does not create more final product in this case.",
  "Compare a fixed early time and completion separately.",
);
catalyst.title = "Rate and final amount";
catalyst.model = {
  kind: "transition-catalyst",
  initial: ["same", "greater"],
  instruction: "Predict early and final amounts.",
};
const written: LearningTask = {
  id: "tm-v1-p-explain",
  prompt:
    "For physical differences: ‘compound colours; ion charges.’ Explain the error and give two comparisons with Group 1.",
  answer:
    "The given features describe characteristic compound formation and ion chemistry, rather than the requested physical comparisons of the elements. Transition metals generally have higher melting points and densities than Group 1; greater hardness or strength would also be suitable distinct comparisons.",
  explanation:
    "Compare the type of property and two distinct directional comparisons. This explanation is self-reviewed and does not receive automatic exam marks.",
  hint: "Specify the transition-metal versus Group 1 direction for two of melting point, density, hardness and strength.",
  purpose:
    "Respond precisely to a physical-property request instead of recalling unrelated facts.",
  rubric: [
    "Identify that the request is for physical comparisons of the elements.",
    "Give a first distinct physical property and the correct comparison direction.",
    "Give a second distinct physical property and the correct comparison direction.",
    "Use general comparisons, avoiding an absolute statement that every metal has identical properties.",
  ],
};
written.title = "Physical comparisons";
export const transitionMetalsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare physical evidence with Group 1, build different iron-ion charges and interpret catalyst data without confusing reaction rate with final amount.",
  outcomes: [
    "Compare melting point, density, hardness, strength and reactivity with Group 1.",
    "Recognise characteristic variable charges, coloured compounds and catalytic activity.",
    "Use fixed proton counts and supplied data to justify a chemical conclusion.",
  ],
  scopeNote:
    "Separate Chemistry: AQA 4.1.3 and Pearson 5.1C. Chromium, manganese, iron, cobalt, nickel and copper illustrate general properties. Shell arrangements beyond the first 20 elements, advanced coordination chemistry and full rates/equilibrium teaching are outside this lesson. Written explanations are self-reviewed.",
  warmup: [
    q(
      "w-group1",
      "Which describes typical Group 1 metals?",
      "Soft and reactive with cold water",
      {
        "Very hard and always unreactive":
          "This does not describe the first-three Group 1 examples.",
        "All gases at room temperature":
          "Lithium, sodium and potassium are solids at room temperature.",
      },
      "Group 1 provides the reference for the comparison, not a rule for every metal.",
      "Recall the lithium, sodium and potassium evidence.",
    ),
    q(
      "w-charge",
      "An atom loses two electrons with its nucleus unchanged. What charge results?",
      "2+",
      {
        "2−": "Losing negative electrons gives positive charge.",
        "0": "The charges no longer balance.",
      },
      "Two fewer electrons leave two excess positive charges.",
      "Track the charge that leaves.",
    ),
  ],
  refresher: [
    q(
      "r-physical",
      "Which is a physical property of an element?",
      "Density",
      {
        "Forming ions with different charges": "This describes ion chemistry.",
        "Reaction with water": "This describes chemical reactivity.",
      },
      "Density compares mass per unit volume; it does not describe a reaction.",
      "Distinguish measurement from chemical change.",
    ),
    q(
      "r-direction",
      "How should a comparison answer be phrased?",
      "Transition metals are generally harder than Group 1 metals",
      {
        Hardness:
          "Naming a property alone does not give its comparison direction.",
        "All metals have identical hardness":
          "This is an unsupported absolute.",
      },
      "Name both groups and the direction, with generally for a typical comparison.",
      "Say harder or softer, and than what.",
    ),
    q(
      "r-charge",
      "Why can electron loss change ion charge without changing element identity?",
      "Proton number stays fixed",
      {
        "Electron number defines the element":
          "Proton number defines the element.",
        "Neutrons become protons": "This is not ordinary electron loss.",
      },
      "Electron loss changes charge, not the fixed nucleus.",
      "Recall the atomic-number definition.",
    ),
    q(
      "r-compound",
      "What is meant by transition metals often forming coloured compounds?",
      "Many compounds formed from these metals are coloured",
      {
        "Every pure transition metal must be brightly coloured":
          "The statement concerns compounds, not pure-metal appearance.",
        "Every compound of every transition metal has one identical colour":
          "Colour depends on the particular compound and conditions.",
      },
      "Many is not all. A metal and a compound containing it are different substances.",
      "Identify the substance being described.",
    ),
    q(
      "r-catalyst",
      "A catalyst increases reaction rate and is…",
      "Not consumed overall",
      {
        "A source of extra limiting reactant":
          "It does not supply additional reactant product stoichiometry.",
        "Always the same substance for every reaction":
          "Different reactions require different catalysts.",
      },
      "A catalyst provides a lower-activation-energy pathway and is not used up overall.",
      "Separate catalyst from reactant.",
    ),
  ],
  guided: [physical, fe2, fe3, catalyst],
  practice: [
    q(
      "p-data",
      "Na: 98 °C, 0.968 g cm⁻³. Cu: 1085 °C, 8.96 g cm⁻³. Compare melting point and density.",
      "Copper has higher melting point and density",
      {
        "Copper has lower melting point and density":
          "Both supplied copper values are larger.",
        "Copper must react more vigorously with cold water":
          "These physical values do not establish that chemical claim.",
      },
      "Compare each physical measurement directly. A chemical-reactivity conclusion needs reaction evidence.",
      "Compare like measurements.",
    ),
    q(
      "p-hard",
      "Compared with sodium, copper is generally…",
      "Harder and less reactive",
      {
        "Softer and more reactive": "Both general directions are reversed.",
        "Less dense and a gas at room temperature":
          "Copper is a dense solid under ordinary conditions.",
      },
      "Hardness is a physical comparison; lower reactivity is a chemical comparison. Both may be requested when the question does not restrict the property type.",
      "Keep physical and chemical differences distinct.",
    ),
    q(
      "p-react",
      "Selected transition metals are less reactive than Group 1 with water, oxygen and halogens. Does that mean no reaction?",
      "They can still react; conditions and the named metal matter",
      {
        "They can never form oxides or halides":
          "Transition metals can form these compounds.",
        "They always react vigorously with cold water":
          "This reverses the typical Group 1 comparison.",
      },
      "Lower reactivity is not zero reactivity. Heating can be required for reactions with oxygen or halogens; distinguish the reactant and comparable conditions.",
      "Do not turn less reactive into impossible.",
    ),
    q(
      "p-location",
      "X forms X²⁺, X³⁺ and coloured compounds. Which classification fits this evidence?",
      "A transition-metal candidate",
      {
        "Definitely a Group 1 metal with only +1 ions":
          "The observed multiple charges disagree with that Group 1 pattern.",
        "Definitely a noble gas because it has no compounds":
          "Compounds and charged ions were observed.",
      },
      "Several characteristic observations support a transition-metal candidate. These are evidence for classification, not a unique element identity.",
      "Combine the observations rather than use one feature alone.",
    ),
    number(
      "tm-v1-p-electrons",
      "Iron has atomic number 26. How many electrons are in Fe³⁺?",
      23,
      "electrons",
      "Three fewer electrons than protons gives 26 − 3 = 23.",
      "Keep 26 protons fixed.",
      "Calculate an electron count independently.",
    ),
    q(
      "p-formula",
      "An Fe³⁺ ion combines with chloride ions, Cl⁻. Which neutral formula balances the charges?",
      "FeCl₃",
      {
        "FeCl₂": "One 3+ and two 1− charges leave net 1+.",
        "Fe₃Cl": "Three 3+ charges and one 1− charge do not balance.",
      },
      "One Fe³⁺ requires three Cl⁻ ions for total charge zero. Iron(III) means charge 3+, not three iron atoms.",
      "Balance positive and negative charge.",
    ),
    q(
      "p-colour",
      "Supplied hydroxides: iron(II) green; iron(III) brown; copper(II) blue. What follows?",
      "Transition metals can form coloured compounds",
      {
        "All transition-metal compounds have the same colour":
          "The supplied colours differ.",
        "The pure iron metal is a green hydroxide":
          "A compound is not the pure metal.",
      },
      "Different compounds containing transition metals provide examples of coloured compounds. Do not identify a whole class by one colour.",
      "Use the supplied names and observations, not metal appearance.",
    ),
    q(
      "p-haber",
      "What is iron's role in the Haber process?",
      "A catalyst",
      {
        "The source of nitrogen atoms":
          "Nitrogen is a reactant, not supplied by the iron catalyst.",
        "A reactant consumed to make ammonia": "Iron is not consumed overall.",
      },
      "Iron catalyses the nitrogen–hydrogen reaction. The full process conditions and equilibrium trade-offs are taught separately.",
      "Separate reaction participant from catalyst.",
    ),
    q(
      "p-table",
      "At 15 s: catalysed 12 cm³, uncatalysed 5 cm³. Both completed runs: 18 cm³. Which conclusion fits?",
      "Greater early rate; the same final amount",
      {
        "A greater final amount because 12 exceeds 5":
          "The early-time comparison is not the completed amount.",
        "No effect on reaction rate":
          "More product in the same early time supports an increased rate.",
      },
      "The fixed-time and completed-run observations answer different questions. These completed identical-reactant runs have the same final amount.",
      "Compare at the same time, then separately at completion.",
    ),
    written,
  ],
  checkForms: [
    [
      q(
        "ca-physical",
        "Which pair gives two distinct physical comparisons with Group 1?",
        "Generally higher density and greater strength",
        {
          "Forms coloured compounds and different ion charges":
            "This is not the requested pair of physical comparisons.",
          "Generally lower density and lower strength":
            "These reverse the general directions.",
        },
        "Density and strength are distinct physical comparisons, with directions stated.",
        "Match the property type requested.",
      ),
      number(
        "tm-v1-ca-fe2",
        "Neutral iron has 26 electrons. How many remain in Fe²⁺?",
        24,
        "electrons",
        "Losing two gives 26 − 2 = 24.",
        "Use the 2+ charge.",
        "Independent iron-ion charge accounting.",
      ),
      q(
        "ca-colour",
        "Which supplied substance provides a coloured-compound example?",
        "Blue copper(II) hydroxide",
        {
          "Pure sodium metal":
            "This is an element, not the given coloured compound.",
          "Neutral helium gas": "This is not a transition-metal compound.",
        },
        "Copper(II) hydroxide is the specified coloured compound.",
        "Distinguish element from compound.",
      ),
      q(
        "ca-rate",
        "Two completed runs with identical reactants give the same product amount; one finishes sooner using a catalyst. What changed?",
        "Reaction rate",
        {
          "The final amount from those reactants":
            "The supplied final amounts are equal.",
          "The product becomes catalyst atoms":
            "A catalyst does not supply product atoms this way.",
        },
        "Finishing sooner indicates a greater rate, with equal completed amounts.",
        "Separate time and amount.",
      ),
      q(
        "ca-react",
        "Which is a typical copper-versus-sodium chemical comparison?",
        "Copper is less reactive",
        {
          "Copper always reacts more violently with cold water":
            "This reverses the general comparison.",
          "Copper has higher density":
            "Density is physical, not the requested chemical comparison.",
        },
        "The question asks for chemistry, not density.",
        "Read the property type.",
      ),
    ],
    [
      q(
        "cb-physical",
        "Which answer gives a physical comparison with its direction?",
        "Transition metals generally have higher melting points than Group 1",
        {
          "Melting point": "This does not give a direction.",
          "Transition metals form ions with multiple charges":
            "This describes characteristic ion chemistry.",
        },
        "State which group has the higher melting point.",
        "Complete the comparison.",
      ),
      number(
        "tm-v1-cb-loss",
        "A particle with 26 protons and 23 electrons is formed from neutral iron. How many electrons were lost?",
        3,
        "electrons",
        "Neutral iron has 26 electrons; 26 − 23 = 3 lost.",
        "Use the neutral electron count.",
        "Inverse ion-charge transfer.",
      ),
      q(
        "cb-variable",
        "Fe²⁺ and Fe³⁺ show that iron can…",
        "Form ions with different charges",
        {
          "Change its proton number by losing electrons":
            "Electron loss does not alter protons.",
          "Only form +1 ions like sodium":
            "These examples directly show other charges.",
        },
        "The same element has more than one ionic charge.",
        "Read superscripts as charge.",
      ),
      q(
        "cb-catalyst",
        "Which explains how a catalyst increases rate?",
        "An alternative pathway with lower activation energy",
        {
          "It raises the energy barrier":
            "A higher barrier does not explain the catalytic increase.",
          "It is consumed as extra reactant":
            "A catalyst is not consumed overall.",
        },
        "A lower-activation-energy pathway increases rate without overall consumption.",
        "Identify the energy-barrier change.",
      ),
      q(
        "cb-evidence",
        "A metal is dense and hard but no reaction or compound data is supplied. What is justified?",
        "Those physical observations support a comparison, but do not uniquely identify the element",
        {
          "It is definitely copper": "Several metals can be dense and hard.",
          "It must have only +1 ions":
            "Physical observations do not establish that ion charge.",
        },
        "Use evidence for the conclusion it supports; avoid claiming a unique identity.",
        "Separate classification evidence from certainty.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-fixed",
        "Fe²⁺ loses another electron to form Fe³⁺. What stays unchanged?",
        "Proton number",
        {
          "Electron count": "An electron was lost.",
          "Ion charge": "The charge increased from 2+ to 3+.",
        },
        "Iron retains 26 protons in both ions.",
        "Retrieve the invariant quantity.",
      ),
      q(
        "ra-physical",
        "When asked for a physical comparison, which is suitable?",
        "Generally greater hardness than Group 1",
        {
          "Formation of different ion charges": "This concerns ion chemistry.",
          "Catalytic activity alone":
            "This is not the requested physical element comparison.",
        },
        "Hardness compares physical properties of the elements.",
        "Match the request.",
      ),
    ],
    [
      q(
        "rb-catalyst",
        "Does more early product with a catalyst prove more final product in the completed identical-reactant runs?",
        "No: compare the final amounts separately",
        {
          "Yes: faster always means more at completion":
            "Rate and final amount are different.",
          "No: catalysts always slow reactions":
            "Catalysts increase rate through a lower-energy pathway.",
        },
        "A faster completed reaction can have the same final amount.",
        "Retrieve the early/final distinction.",
      ),
      q(
        "rb-compound",
        "A coloured transition-metal compound means…",
        "A compound containing the metal can have a colour",
        {
          "The pure metal and compound are the same substance":
            "Compounds differ from their constituent elements.",
          "Every compound of every metal has that same colour":
            "The property is general, not a universal identical colour.",
        },
        "Keep compound identity and typical behaviour explicit.",
        "Retrieve the substance distinction.",
      ),
    ],
  ],
};
for (const t of [
  ...transitionMetalsJourney.guided,
  ...transitionMetalsJourney.practice,
])
  t.followUp =
    t.id.includes("fe") || t.id.includes("electron") || t.id.includes("formula")
      ? "tm-v1-r-charge"
      : t.id.includes("catalyst") ||
          t.id.includes("haber") ||
          t.id.includes("table")
        ? "tm-v1-r-catalyst"
        : t.id.includes("colour") || t.id.includes("location")
          ? "tm-v1-r-compound"
          : "tm-v1-r-physical";
extendTransitionCompounds(transitionMetalsJourney);
