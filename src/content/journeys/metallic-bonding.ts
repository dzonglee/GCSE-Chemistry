import { extendMetallicWriting } from "./metallic-writing";
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
    `mb-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Metallic structure and property reasoning: ${id}.`,
  );
const attraction = q(
  "g-attraction",
  "Which interaction holds this giant metal structure together?",
  "Attraction between positive cores and delocalised electrons",
  {
    "Attraction between two positive cores": "Like charges repel.",
    "Weak forces between separate neutral molecules":
      "A metal is a giant structure with delocalised electrons, not a collection of small molecules.",
  },
  "Strong electrostatic attraction between the positive cores and delocalised negative electrons gives metallic bonding.",
  "Name both interacting particles and their charges.",
);
attraction.model = {
  kind: "metallic-properties",
  mode: "attraction",
  instruction: "Choose the attracting particles.",
};
attraction.title = "Metallic attraction";
const conduction = q(
  "g-conduction",
  "Which particles carry charge through a solid metal?",
  "Delocalised electrons moving through the structure",
  {
    "Positive cores flowing through the solid":
      "Cores remain in lattice positions during conduction.",
    "Neutral molecules drifting through a liquid":
      "This is a solid metal, not a molecular liquid.",
  },
  "Delocalised electrons are charged and can move through the metal. Positive cores do not move through the solid to carry current.",
  "Follow charged carriers, not the whole structure.",
);
conduction.model = {
  kind: "metallic-properties",
  mode: "conduction",
  instruction:
    "Predict the carriers, then compare electron drift with fixed cores.",
};
conduction.title = "Trace charge through a solid";
const layers = q(
  "g-layers",
  "A pure metal is shaped by moving a layer. What happens to its metallic bonding?",
  "Attraction to delocalised electrons remains as layers slide",
  {
    "Every metallic attraction disappears":
      "That would not explain the metal remaining held together.",
    "The atoms must form separate neutral molecules":
      "Shaping does not turn a giant metal into molecular units.",
  },
  "Layers can change position while positive cores remain attracted to delocalised electrons. This allows the metal to be bent and shaped.",
  "Look for an attraction that still acts after displacement.",
);
layers.model = {
  kind: "metallic-properties",
  mode: "layers",
  instruction:
    "Displace a pure-metal layer and predict what happens to bonding.",
};
layers.title = "Move a layer, retain attraction";
const alloy = q(
  "g-alloy",
  "Why is this illustrated alloy harder than the pure metal?",
  "Different-sized atoms distort layers, making sliding more difficult",
  {
    "Different shapes create a molecule in every layer":
      "The required structural difference is atom size, not shape.",
    "All the electrons disappear when metals are mixed":
      "Metallic bonding and delocalised electrons remain.",
  },
  "Different-sized atoms disturb the regular layers. The layers cannot slide as easily, so the alloy is harder.",
  "Compare atom sizes, layer regularity and sliding.",
);
alloy.model = {
  kind: "metallic-properties",
  mode: "alloy",
  instruction:
    "Compare the samples; predict atom-size difference and layer sliding.",
};
alloy.title = "Compare pure metal and alloy";
const writing: LearningTask = {
  id: "mb-v1-p-explain",
  title: "Explain solid-metal conduction",
  prompt:
    "Explain how a solid metal conducts electricity. Include the charge carriers, what they carry and how they travel; explain why positive cores are not the carriers here.",
  answer:
    "Delocalised electrons carry electrical charge as they move through the metal structure. Positive cores remain in their solid lattice positions during conduction.",
  rubric: [
    "Identify delocalised electrons.",
    "State that the electrons carry electrical charge.",
    "State that they move through the metal structure.",
    "Distinguish this from positive cores moving through the solid.",
  ],
  explanation:
    "Naming electrons alone leaves the charge and mobility steps unstated. Compare each causal point separately.",
  hint: "Particle → electrical charge → movement through the structure.",
  purpose: "Independent constructed mechanism; self-review only.",
};
const alloyWriting: LearningTask = {
  id: "mb-v1-p-alloy-explain",
  title: "Explain hardness without losing conduction",
  prompt:
    "Explain why an alloy with different-sized atoms can be harder than a pure metal while still conducting electricity.",
  answer:
    "Different-sized atoms distort the regular layers so they slide less easily. Delocalised electrons remain and can carry electrical charge through the structure, although electron movement can be more restricted than in the corresponding pure metal.",
  rubric: [
    "Different-sized atoms distort regular layers.",
    "More difficult sliding explains greater hardness.",
    "Delocalised electrons remain available as charge carriers.",
    "Do not claim the alloy cannot conduct or infer its melting point from hardness.",
  ],
  explanation:
    "Hardness concerns layer sliding; electrical conduction concerns mobile charged electrons. Use separate causal explanations.",
  hint: "Separate the mechanical property from charge-carrier availability.",
  purpose: "Constructed explanation across two properties; self-review only.",
};
const atomPercent = number(
  "mb-v1-p-percent",
  "An illustrated alloy contains 25 copper atoms and 5 zinc atoms. What percentage of these atoms are zinc? Give one decimal place.",
  16.7,
  "%",
  "There are 30 atoms in total: 5 ÷ 30 × 100 = 16.666…%, rounded to 16.7%.",
  "Use ALL atoms in the denominator; this is an atom percentage, not a mass percentage.",
  "Interpret alloy composition with an explicit rounding demand.",
  {
    "20": "Five divided by twenty-five compares zinc with copper, not with all atoms.",
  },
);
atomPercent.rounding = { kind: "decimal-places", digits: 1 };
export const metallicBondingJourney: LessonJourney = {
  version: 1,
  introduction:
    "Connect positive cores and delocalised electrons to strong bonding, solid conduction and layer movement, then explain what changes in an alloy.",
  scopeNote:
    "Common Foundation/combined metallic bonding and properties. Charges and diagrams are illustrative; alloy conductivity transfer uses supplied evidence, not a universal numerical rule.",
  outcomes: [
    "Explain strong metallic attraction and solid electron conduction.",
    "Explain malleability and alloy hardness using layers.",
    "Interpret given alloy composition and property data.",
  ],
  warmup: [
    q(
      "w-attraction",
      "Which charges attract electrostatically?",
      "Positive and negative",
      {
        "Positive and positive": "Like charges repel.",
        "Negative and negative": "Like charges repel.",
      },
      "Metallic bonding needs opposite-charge attraction.",
      "Recall attraction versus repulsion.",
    ),
    q(
      "w-carrier",
      "Can a fixed charged particle carry current through a solid by staying in place?",
      "No: charge carriers must be able to move through it",
      {
        "Yes: charge alone is sufficient": "Movement is also required.",
        "No: any solid has no electrons":
          "Metals contain mobile delocalised electrons.",
      },
      "Both charge and movement through the substance are needed.",
      "Recall the ionic solid comparison.",
    ),
    q(
      "w-giant",
      "A metal's structure extends through the sample. Is it made of separate small metal molecules?",
      "No: it has a giant metallic structure",
      {
        "Yes: every pair of atoms is a molecule":
          "Electrons are shared through the giant structure.",
        "No: it must therefore be an ionic salt":
          "Giant structure does not by itself mean an ionic salt.",
      },
      "Different giant structures have different bonding and carriers.",
      "Distinguish structure extent from bond type.",
    ),
  ],
  refresher: [
    q(
      "r-core",
      "What does a positive core in this metallic model contain?",
      "A nucleus and inner electrons",
      {
        "Only a bare nucleus with every electron removed":
          "The delocalised electrons are outer contributions, not every atomic electron.",
        "A neutral molecule of two metal atoms":
          "This is not a small molecular structure.",
      },
      "The positive core includes the nucleus and retained inner electrons; outer electrons are delocalised.",
      "Separate outer electrons from all electrons.",
    ),
    q(
      "r-electrons",
      "What does delocalised mean here?",
      "Electrons can move through the whole metal structure",
      {
        "Electrons are fixed between one pair of atoms only":
          "That is not delocalisation through the metal.",
        "Electrons cease to carry charge":
          "Electrons remain negatively charged.",
      },
      "Shared outer electrons are not confined to one atom or one covalent pair.",
      "Recall local versus through the structure.",
    ),
    q(
      "r-charge",
      "What do moving delocalised electrons carry in an electrical conductor?",
      "Electrical charge",
      {
        "Only metal atoms": "They are electrons, not atoms.",
        "No charge because the whole metal is neutral":
          "Overall neutrality does not prevent mobile internal charged carriers.",
      },
      "Electrons carry negative charge through an overall neutral metal.",
      "Distinguish overall charge from carrier charge.",
    ),
    q(
      "r-layers",
      "Why can pure-metal layers slide while the metal remains held together?",
      "Attraction to delocalised electrons remains",
      {
        "Every bond must disappear permanently":
          "That would not retain the structure.",
        "All positive cores become negative":
          "Shaping does not reverse particle charges.",
      },
      "Metallic attraction is maintained during layer displacement.",
      "What still attracts the cores?",
    ),
    q(
      "r-alloy",
      "What structural feature commonly makes the illustrated alloy's layers less regular?",
      "Atoms of different sizes",
      {
        "Atoms of different square shapes":
          "Atom size, not invented shape, distorts the layers.",
        "No delocalised electrons at all":
          "Alloys retain metallic bonding and electrons.",
      },
      "Different sizes distort regular layers, making sliding more difficult.",
      "Use size → distortion → sliding.",
    ),
    q(
      "r-energy",
      "Why do most metals have relatively high melting points?",
      "Strong metallic attractions need much energy to overcome",
      {
        "The atoms form weak separate molecules":
          "This confuses metal and molecular structures.",
        "Every metal has exactly the same high melting point":
          "Melting points vary; some metals are exceptions.",
      },
      "Strong bonding provides an energy explanation, while most is a qualified trend.",
      "Connect bonding strength to energy demand.",
    ),
  ],
  guided: [attraction, conduction, layers, alloy],
  practice: [
    q(
      "p-bond",
      "Which description identifies metallic bonding rather than ionic or molecular bonding?",
      "Positive cores attracted to delocalised electrons through a giant structure",
      {
        "Positive and negative ions alternating in a salt lattice":
          "That is ionic bonding.",
        "Weak attractions between separate neutral molecules":
          "That is a molecular bulk interaction.",
      },
      "The negative particles in metallic bonding are delocalised electrons, not negative ions.",
      "Identify the negative particle.",
    ),
    q(
      "p-carrier",
      "Repair: 'solid copper conducts because copper ions flow through it.'",
      "Delocalised electrons carry charge through the solid; cores remain in lattice positions",
      {
        "Keep the claim: all charged cores must flow":
          "Fixed solid cores are not the current carriers.",
        "Copper has no charged particles":
          "The structure includes electrons and positive cores.",
      },
      "Name electrons, charge and movement through the solid.",
      "Separate electron conduction from ion conduction in a molten salt.",
    ),
    q(
      "p-pure",
      "A pure metal bends instead of breaking apart. Which structural explanation fits?",
      "Layers slide while attraction to delocalised electrons remains",
      {
        "The metal changes into neutral gas molecules":
          "Bending is not vaporisation.",
        "Only weak molecular attractions hold it together":
          "Metallic bonds are strong.",
      },
      "Malleability concerns layer movement with maintained metallic bonding.",
      "Explain both movement and continued attraction.",
    ),
    q(
      "p-size",
      "Repair: 'an alloy is harder because its atoms have different shapes.'",
      "Different sizes distort layers so they slide less easily",
      {
        "Different colours stop movement":
          "Diagram colours are representation choices.",
        "Harder means all electrons are removed":
          "Hardness does not imply loss of charge carriers.",
      },
      "The exam-relevant structural difference is atom size.",
      "Name size, distortion and sliding.",
    ),
    number(
      "mb-v1-p-neutral",
      "This illustrative fragment has twelve +1 cores and twelve −1 delocalised electrons. What is its net charge?",
      0,
      "elementary charges",
      "+12 + (−12) = 0, despite charged particles inside.",
      "Add both signed totals.",
      "Distinguish neutral bulk metal from internally charged carriers.",
      {
        "12": "This ignores the negative electron contribution.",
        "-12": "This ignores the positive core contribution.",
      },
    ),
    {
      ...number(
        "mb-v1-p-diagram-percent",
        "From this illustrated alloy, what percentage of the positive cores are X? Count core labels, not delocalised electrons.",
        25,
        "%",
        "Three of the twelve positive cores are X: 3 ÷ 12 × 100 = 25%. Electron markers are not extra metal atoms.",
        "Use both core types in the total; exclude electrons from an atom-count denominator.",
        "Independently interpret actual alloy diagram composition.",
        {
          "12.5":
            "This counts the twelve electron markers as twelve additional metal atoms. Only the twelve positive cores represent metal atoms here.",
          "33.3":
            "Three divided by nine compares X with M, not X with the total twelve cores.",
        },
      ),
      metallicDiagram: { alloy: true },
    },
    atomPercent,
    q(
      "p-mass",
      "An alloy has twenty percent of its atoms of element X. Is twenty percent also necessarily its mass percentage?",
      "No: atom masses may differ",
      {
        "Yes: atom fraction always equals mass fraction":
          "Different elements can have different atomic masses.",
        "No: atom fractions cannot be calculated":
          "They can be calculated from supplied counts.",
      },
      "Count percentages and mass percentages use different quantities.",
      "Think about what the denominator measures.",
    ),
    q(
      "p-thermal",
      "How do delocalised electrons help a metal conduct thermal energy?",
      "They transfer energy through the metal from hotter to cooler regions",
      {
        "They carry only electrical charge and cannot transfer energy":
          "They also contribute to energy transfer.",
        "All positive cores must flow from hot to cold":
          "Thermal conduction does not require the solid cores to flow through the sample.",
      },
      "Delocalised electrons transfer thermal energy. This does not claim they are the only contribution to heat transfer.",
      "Distinguish transferring energy from moving whole metal layers.",
    ),
    q(
      "p-exception",
      "Mercury is a metal that is liquid at room temperature. What does this show?",
      "Most metals have high melting points, but there are exceptions",
      {
        "Mercury cannot be a metal": "A qualified trend permits exceptions.",
        "All metals must have low melting points":
          "One exception does not reverse the broad trend.",
      },
      "Use most, not all, when describing the metal melting trend.",
      "Keep the qualification.",
    ),
    q(
      "p-conductivity",
      "Supplied tests show alloy Y conducts less well than the corresponding pure metal, but still conducts. Which explanation is consistent?",
      "Distortion can restrict delocalised-electron movement; carriers remain",
      {
        "All electrons disappear in the alloy":
          "This would not explain continued conduction.",
        "Harder alloys must be perfect insulators":
          "Hardness does not imply no conduction.",
      },
      "Use the supplied comparison and retained charge carriers, not an absolute no-conduction claim.",
      "Explain the reduction and continued conduction separately.",
    ),
    q(
      "p-evidence",
      "X conducts as a solid and can be bent; Y is brittle and conducts only after melting. Which comparison fits?",
      "X is metallic; Y is ionic",
      {
        "X is ionic; Y is metallic":
          "Solid metal conduction and malleability fit X.",
        "Both must be small molecular":
          "Mobile ions after melting and solid metal conduction require different carriers.",
      },
      "Combine mechanical and conduction evidence instead of using one property alone.",
      "Ask what carries charge in each state.",
    ),
    q(
      "p-limits",
      "Does a flat drawing of twelve metal cores mean a metal contains only twelve particles in one layer?",
      "No: it is a finite projection of a giant three-dimensional structure",
      {
        "Yes: diagrams always show the whole physical sample":
          "A fragment is not the whole sample.",
        "No: it must represent twelve separate molecules":
          "The giant metal is not separate molecular groups.",
      },
      "Number, depth, radii and positions are representation limits.",
      "Separate drawing extent from structure extent.",
    ),
    writing,
    alloyWriting,
  ],
  checkForms: [
    [
      q(
        "ca-carrier",
        "How does solid aluminium carry electric charge?",
        "Delocalised electrons move through its structure",
        {
          "Positive cores flow through the solid":
            "That is not solid-metal conduction.",
          "Neutral molecules carry the charge":
            "Neutral molecules are not the carriers.",
        },
        "Electrons are charged and mobile through the metal.",
        "Recall the full mechanism.",
      ),
      q(
        "ca-bond",
        "What attracts in metallic bonding?",
        "Positive cores and delocalised negative electrons",
        {
          "Only positive cores and positive cores": "Like charges repel.",
          "Separate neutral metal molecules": "The structure is giant.",
        },
        "Strong electrostatic attraction holds the structure together.",
        "Name both charges.",
      ),
      q(
        "ca-hardness",
        "An alloy contains different-sized atoms. Why can it be harder?",
        "Distorted layers slide less easily",
        {
          "Every electron is removed": "Alloys retain electrons.",
          "The atoms change shape into cubes":
            "Size distortion is the relevant model.",
        },
        "Different sizes → distorted layers → more difficult sliding.",
        "Retrieve the chain.",
      ),
      number(
        "mb-v1-ca-percent",
        "An alloy diagram contains 32 atoms of A and 8 atoms of B. What percentage of its atoms are B?",
        20,
        "%",
        "8 ÷ 40 × 100 = 20%.",
        "Use total atoms.",
        "Reserved atom-percentage inference.",
      ),
      q(
        "ca-heat",
        "What can delocalised electrons transfer during thermal conduction?",
        "Energy through the metal",
        {
          "Only positive core positions": "This is not flow of the cores.",
          "New atomic nuclei": "Conduction is not a nuclear reaction.",
        },
        "Electron energy transfer contributes to thermal conduction.",
        "Recall thermal versus electrical quantities.",
      ),
    ],
    [
      q(
        "cb-neutral",
        "A metal is overall neutral. Can its delocalised electrons still carry current?",
        "Yes: internal charged electrons can move through the structure",
        {
          "No: neutral means no charged particles inside":
            "Positive and negative totals can balance.",
          "Yes: only neutral atoms carry charge":
            "Atoms with zero net charge are not these carriers.",
        },
        "Overall neutrality and mobile internal charge carriers are compatible.",
        "Separate bulk and carrier charge.",
      ),
      q(
        "cb-slide",
        "What remains while layers in a pure metal slide during shaping?",
        "Attraction between positive cores and delocalised electrons",
        {
          "No metallic bonding at all":
            "Maintained attraction holds the metal together.",
          "A network of neutral molecules":
            "This is still a giant metal structure.",
        },
        "Layer movement permits malleability with retained bonding.",
        "Recall movement plus attraction.",
      ),
      q(
        "cb-alloy-conduction",
        "A supplied alloy conducts, but less well than a pure-metal comparison. Which claim must be rejected?",
        "Alloys contain no delocalised electrons",
        {
          "Electron movement may be more restricted":
            "This is consistent with the supplied reduced conduction.",
          "The alloy has a metallic structure":
            "This is consistent with continued conduction.",
        },
        "Continued electrical conduction requires retained mobile carriers.",
        "Use the supplied observation.",
      ),
      number(
        "mb-v1-cb-percent",
        "A diagram contains 18 atoms of C and 6 atoms of D. What percentage of the atoms are D?",
        25,
        "%",
        "6 ÷ 24 × 100 = 25%.",
        "Find the total first.",
        "Separate reserved atom-percentage calculation.",
      ),
      q(
        "cb-high-melting",
        "Most metals need much energy to melt because…",
        "Their metallic attractions are strong",
        {
          "Their covalent molecules are small":
            "Metals are not collections of small covalent molecules.",
          "They have no electrons":
            "Delocalised electrons are central to metallic bonding.",
        },
        "Strong electrostatic attraction supplies the energy explanation; exceptions exist.",
        "Retrieve force strength and energy.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-current",
        "Retrieve all parts of solid-metal conduction.",
        "Delocalised electrons carry charge through the structure",
        {
          "Positive cores flow through the solid":
            "The cores remain in lattice positions.",
          "Neutral molecules move between layers":
            "Those are not the carriers.",
        },
        "Particle, charge and through-structure movement all matter.",
        "Retrieve the three steps.",
      ),
      q(
        "ra-alloy",
        "Retrieve why different-sized atoms can make an alloy harder.",
        "They distort layers and make sliding more difficult",
        {
          "They remove all electrons": "Metallic electrons remain.",
          "They make all melting points identical":
            "Hardness is not a melting-point rule.",
        },
        "Use structural distortion, not absent carriers.",
        "Retrieve size → layers → sliding.",
      ),
      q(
        "ra-limit",
        "Retrieve what positive metal cores include.",
        "Nuclei and inner electrons",
        {
          "Only bare nuclei with no electrons":
            "Outer contributions are delocalised; inner electrons remain.",
          "Only paired neutral molecules": "The structure is giant metallic.",
        },
        "A positive core is not a bare nucleus.",
        "Retrieve the representation limit.",
      ),
    ],
    [
      q(
        "rb-bond",
        "Retrieve the particles attracted in metallic bonding.",
        "Positive cores and delocalised electrons",
        {
          "Two positive cores only": "They repel.",
          "Separate neutral molecules only": "That is not metallic bonding.",
        },
        "Opposite charges attract through the giant structure.",
        "Recall both charges.",
      ),
      q(
        "rb-slide",
        "Retrieve how a pure metal can be shaped while remaining bonded.",
        "Layers slide while electron attraction remains",
        {
          "All metallic attractions disappear":
            "The metal would not remain held together.",
          "Atoms become charged gas molecules": "Shaping is not atomisation.",
        },
        "Malleability combines displacement and continued attraction.",
        "Retrieve what moves and what remains.",
      ),
      q(
        "rb-energy",
        "Retrieve why most metals have high melting points.",
        "Strong metallic attractions require much energy to overcome",
        {
          "There are only weak intermolecular forces":
            "Metals have a giant metallic structure.",
          "Every metal must melt at the same temperature":
            "Different metals have different melting points.",
        },
        "Use the qualified force/energy explanation.",
        "Retrieve most, not all.",
      ),
    ],
  ],
};
for (const task of [
  ...metallicBondingJourney.guided,
  ...metallicBondingJourney.practice,
])
  task.followUp =
    task.id.includes("alloy") || task.id.includes("size")
      ? "mb-v1-r-alloy"
      : task.id.includes("layer") || task.id.includes("pure")
        ? "mb-v1-r-layers"
        : task.id.includes("energy") || task.id.includes("exception")
          ? "mb-v1-r-energy"
          : "mb-v1-r-electrons";

metallicBondingJourney.practice.find(
  (q) => q.id === "mb-v1-p-bond",
)!.metallicDiagram = true;
metallicBondingJourney.practice.find(
  (q) => q.id === "mb-v1-p-limits",
)!.metallicDiagram = true;
const practiceTitles: Record<string, string> = {
  "p-bond": "Recognise metallic bonding",
  "p-carrier": "Repair the carrier claim",
  "p-pure": "Explain why a metal bends",
  "p-size": "Size, shape and hardness",
  "p-neutral": "Balance the fragment’s charge",
  "p-diagram-percent": "Read the alloy composition",
  "p-percent": "Calculate an atom percentage",
  "p-mass": "Atoms versus mass",
  "p-thermal": "Explain thermal conduction",
  "p-exception": "Qualify the melting trend",
  "p-conductivity": "Interpret the alloy result",
  "p-evidence": "Combine material evidence",
  "p-limits": "Look beyond the fragment",
};
for (const task of metallicBondingJourney.practice)
  task.title ??= practiceTitles[task.id.replace("mb-v1-", "")];

extendMetallicWriting(metallicBondingJourney);
