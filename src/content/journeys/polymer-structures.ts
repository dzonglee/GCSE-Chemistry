import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const q = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  purpose: string,
  model?: TaskModel,
) => ({
  ...choice(
    `ps-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    purpose,
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
  purpose: string,
  errors: Record<string, string> = {},
) => ({
  ...number(
    `ps-v1-${id}`,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    purpose,
    errors,
  ),
  title,
});
const chain = q(
  "g-chain",
  "Inspect a large molecule",
  "How are the shown repeat units connected in the polymer?",
  "They form part of one very large covalently linked molecule",
  {
    "They are separate small molecules touching":
      "The carbon backbone links through the units.",
    "They are an extended diamond-like covalent network":
      "These are distinct very large chain molecules, not diamond.",
  },
  "Strong covalent bonds link atoms within the polymer molecule. The short section and omitted ends are not a complete molecular formula.",
  "Follow the connected backbone and distinguish one molecule from a bulk network.",
  "Large-molecule classification with whole-unit growth.",
  {
    kind: "polymer-properties",
    mode: "chain",
    instruction: "Classify the connected chain, then grow the shown section.",
  },
);
const repeat = q(
  "g-repeat",
  "Construct a repeat unit",
  "Which drawing represents the poly(ethene) repeat unit?",
  "Two singly linked carbons, two H each, continued through brackets with n",
  {
    "A C=C bond and no bonds through the brackets":
      "That does not represent the joined polymer backbone.",
    "One hydrogen per carbon and an uppercase N":
      "Check the hydrogen contribution and repeat-count notation.",
  },
  "The usual poly(ethene) repeat unit is –CH2–CH2– inside brackets with continuing single bonds and a large-number n. The ethene monomer and its double bond are different.",
  "Count C and H, then inspect both bracket crossings and the count marker.",
  "Specific bracketed repeat representation.",
  {
    kind: "polymer-properties",
    mode: "repeat",
    instruction: "Build your proposed poly(ethene) repeat drawing.",
  },
);
const separation = q(
  "g-separation",
  "Separate intact molecules",
  "When the unchanged polymer molecules move apart, which interactions are overcome?",
  "Between-molecule forces; chain covalent bonds remain intact",
  {
    "The backbone breaks into small units":
      "That would change the molecular connectivity.",
    "Hydrogen atoms leave every carbon":
      "Physical separation does not remove the hydrogens.",
  },
  "Attractions between polymer molecules are different from the strong covalent links within each chain. This model preserves both intact molecular sections.",
  "Locate the dashed between-chain attractions.",
  "Within-versus-between distinction.",
  {
    kind: "polymer-properties",
    mode: "separation",
    instruction:
      "Predict interactions and internal bonds before separating chains.",
  },
);
const phase = q(
  "g-phase",
  "Explain a room-temperature state",
  "Methane is a gas and poly(ethene) a solid at room temperature. Which explanation follows the supplied evidence?",
  "Larger polymer molecules have stronger intermolecular forces needing more energy",
  {
    "Methane has weak covalent bonds that break at room temperature":
      "Both have strong internal covalent bonds; these do not explain the physical state difference.",
    "Poly(ethene) has smaller molecules and weaker attractions":
      "Its molecules are much larger with stronger intermolecular forces.",
  },
  "Much larger molecules → stronger between-molecule forces → more energy to overcome them → higher state-change temperature. The supplied poly(ethene) is solid at room temperature, without breaking its internal covalent bonds.",
  "Build the molecular-size, force and energy chain.",
  "Actual exam causal sequence.",
  {
    kind: "polymer-properties",
    mode: "phase",
    instruction: "Predict molecule size, intermolecular forces and energy.",
  },
);
function drawing(id: string, title: string, prompt: string): LearningTask {
  return {
    id: `ps-v1-${id}`,
    title,
    prompt,
    answer: JSON.stringify({
      bondOrder: "1",
      hydrogens: "2",
      continuation: "1",
      countMark: "1",
    }),
    parts: [
      { id: "bondOrder", label: "Joining carbon bond", answer: 1 },
      { id: "hydrogens", label: "Hydrogens at each carbon", answer: 2 },
      { id: "continuation", label: "Bonds crossing bracket sides", answer: 1 },
      { id: "countMark", label: "Outside repeat-count marker", answer: 1 },
    ],
    polymerRepeatDrawing: true,
    explanation:
      "Two single-bonded carbons each carry two hydrogens. Continuing single bonds cross both bracket sides, and lower-case n indicates many repeat units.",
    hint: "Check the backbone bond, H count, both outside bonds and lower-case n.",
    purpose:
      "Independent construction of an exam-relevant bracketed repeat diagram.",
  };
}
const explain: LearningTask = {
  id: "ps-v1-p-explain",
  title: "Explain methane and poly(ethene)",
  prompt:
    "Methane is a gas and poly(ethene) a solid at room temperature. Explain the difference using molecular size, interactions and energy. State whether internal covalent bonds break in the physical change.",
  answer:
    "Poly(ethene) has much larger molecules than methane. Its intermolecular forces are stronger, so more energy is needed to overcome them, giving a higher state-change temperature and the supplied room-temperature solid state. Covalent bonds within molecules remain intact during the physical change.",
  rubric: [
    "Poly(ethene) has much larger molecules.",
    "Intermolecular forces between its molecules are stronger.",
    "More energy is needed to overcome those forces, producing a higher state-change temperature.",
    "Internal covalent bonds remain intact; the explanation does not use weaker/broken covalent bonds.",
  ],
  explanation:
    "The linked molecular-size → force → energy → state sequence follows the actual exam demand.",
  hint: "Name forces between molecules, rather than bonds within them.",
  purpose: "Written causal explanation; self-review only.",
};
const compare: LearningTask = {
  id: "ps-v1-p-compare",
  title: "Compare three covalent structures",
  prompt:
    "Compare a methane molecule, a poly(ethene) molecule and diamond. Explain why sharing strong covalent bonding does not make their molecular structures or state-change explanations identical.",
  answer:
    "Methane has small separate molecules; poly(ethene) has very large separate chain molecules. Their physical state changes involve intermolecular forces while covalent bonds within molecules remain intact. Diamond is a giant covalent network, whose high melting-point explanation involves strong covalent bonds through the structure and much energy.",
  rubric: [
    "Small methane molecules versus very large polymer chain molecules.",
    "Polymers are not an extended diamond-like network merely because they are large.",
    "Between-molecule interactions for the molecular materials.",
    "Strong network covalent bonds and much energy for diamond.",
  ],
  explanation:
    "Structure extent and relevant interactions must be identified before explaining properties.",
  hint: "Separate small molecules, very large molecules and a giant covalent network.",
  purpose: "Written structural comparison; self-review only.",
};
export const polymerStructureJourney: LessonJourney = {
  version: 1,
  introduction:
    "Inspect very large chain molecules, construct repeat-unit drawings and distinguish internal bonds from between-molecule forces.",
  scopeNote:
    "Common Foundation/combined polymer structures and properties, using poly(ethene). Atomic geometry and molecular separation are schematic. Organic polymerisation mechanisms and crosslinked-material chemistry remain later separate lessons.",
  outcomes: [
    "Recognise distinct very large covalently linked polymer molecules.",
    "Read and construct a bracketed poly(ethene) repeat unit with continuing bonds and n.",
    "Distinguish internal covalent bonds from intermolecular forces.",
    "Explain the methane/poly(ethene) state comparison through molecular size, forces and energy.",
  ],
  warmup: [
    q(
      "w-covalent",
      "Recall a covalent bond",
      "What forms a covalent bond?",
      "A shared pair of electrons",
      {
        "A transferred proton":
          "Protons are not transferred in this bonding model.",
        "An attraction only between separate molecules":
          "That is not the internal shared-electron bond.",
      },
      "Covalent bonds link atoms inside molecules.",
      "Recall the earlier bonding lesson.",
      "Prerequisite shared-pair retrieval.",
    ),
    q(
      "w-between",
      "Recall a physical change",
      "When unchanged methane molecules move farther apart, what remains intact?",
      "Covalent bonds within each methane molecule",
      {
        "Every C–H bond breaks": "That would change the methane molecules.",
        "Every carbon nucleus loses protons":
          "Physical separation does not change nuclei.",
      },
      "Between-molecule attractions differ from internal covalent bonds.",
      "Locate within and between interactions.",
      "Prerequisite molecular-change retrieval.",
    ),
  ],
  refresher: [
    q(
      "r-chain",
      "Large molecule or giant network?",
      "How should a poly(ethene) chain be classified?",
      "A very large molecule containing covalently linked carbon-chain units",
      {
        "An extended diamond-like network":
          "The chain is a distinct very large molecule.",
        "Disconnected small ethene molecules":
          "The polymer backbone joins through repeat units.",
      },
      "A polymer molecule can be very large without becoming diamond’s giant covalent structure.",
      "Follow the connected chain and omitted continuation.",
      "Targeted molecular extent recovery.",
    ),
    q(
      "r-repeat",
      "Read the bracketed repeat",
      "What does the bracketed poly(ethene) repeat unit show?",
      "Two single-bonded carbons, two H each, continuation and n",
      {
        "An isolated double-bonded ethene monomer":
          "The polymer repeat has a single-bonded backbone and continuing bonds.",
        "Nitrogen atoms labelled n": "Lower-case n is the number of repeats.",
      },
      "The displayed unit contributes C2H4; n is a large number of joined repeats.",
      "Count atoms and inspect brackets.",
      "Targeted repeat notation recovery.",
    ),
    q(
      "r-forces",
      "Locate the interaction",
      "Which interactions act between separate polymer molecules?",
      "Intermolecular forces",
      {
        "The same internal backbone covalent bonds":
          "Within-chain and between-chain interactions are different.",
        "Only forces inside carbon nuclei":
          "Nuclear interactions are not the relevant model.",
      },
      "Relatively strong intermolecular forces help explain polymer solids at room temperature.",
      "Locate the space between chains.",
      "Targeted interaction recovery.",
    ),
    q(
      "r-phase",
      "Build the state explanation",
      "Why is the supplied poly(ethene) solid while methane is a gas at room temperature?",
      "Its much larger molecules have stronger intermolecular forces requiring more energy",
      {
        "Its covalent bonds are weaker than methane’s":
          "The comparison does not use weaker covalent bonds.",
        "Its molecules are smaller and easier to separate":
          "This reverses the supplied molecular-size reasoning.",
      },
      "Larger molecule → stronger between-molecule forces → more energy → higher state-change temperature.",
      "Keep covalent bonds within the molecules intact.",
      "Targeted causal state recovery.",
    ),
    q(
      "r-count",
      "Count repeat contributions",
      "One two-carbon poly(ethene) repeat contributes how many hydrogen atoms?",
      "Four",
      {
        Two: "Each of two carbons has two hydrogens.",
        Six: "That would not match this continuing repeat unit.",
      },
      "The contribution is C2H4, not the complete formula of every polymer molecule.",
      "Count both carbons’ hydrogens.",
      "Targeted atom ledger recovery.",
    ),
  ],
  guided: [chain, repeat, separation, phase],
  practice: [
    q(
      "p-recognise",
      "Recognise a polymer section",
      "What describes the supplied connected chain drawing?",
      "Part of a very large polymer molecule",
      {
        "Many separate small methane molecules":
          "A carbon backbone continues through the drawing.",
        "A diamond network in all directions":
          "The supplied representation is a distinct chain section.",
      },
      "A polymer has very large molecules with covalently linked repeating structure.",
      "Follow connectivity, not simply the number of circles.",
      "Independent structure recognition.",
    ),
    q(
      "p-bond",
      "Identify internal bonds",
      "Which bonds link atoms within a poly(ethene) chain?",
      "Strong covalent bonds",
      {
        "Only intermolecular attractions": "Those act between molecules.",
        "Metallic bonding from a positive-ion lattice":
          "Poly(ethene) is not this metal structure.",
      },
      "Atoms within the molecule share electron pairs in covalent bonds.",
      "Locate links inside one chain.",
      "Independent internal bonding.",
    ),
    n(
      "p-carbon",
      "Count one repeat",
      "How many carbon atoms are shown in the usual two-carbon poly(ethene) repeat unit?",
      2,
      "carbons",
      "The usual bracketed unit contains two carbons.",
      "Count C symbols inside one pair of brackets.",
      "Independent repeat carbon ledger.",
    ),
    n(
      "p-hydrogen",
      "Count repeat hydrogens",
      "How many hydrogen atoms accompany the two carbons in the shown repeat unit?",
      4,
      "hydrogens",
      "Each of two carbons has two hydrogens: 2 × 2 = 4.",
      "Count H symbols, not bonds outside brackets.",
      "Independent repeat hydrogen ledger.",
      {
        "2": "Two is the H count at one carbon, not the whole two-carbon repeat.",
      },
    ),
    q(
      "p-n",
      "Interpret lower-case n",
      "What does n outside the repeat-unit brackets mean?",
      "A large number of joined repeat units",
      {
        "A nitrogen atom bonded to the last carbon":
          "Nitrogen’s element symbol is uppercase N, not this repeat marker.",
        "Exactly one disconnected small molecule":
          "n represents many joined repeats.",
      },
      "n counts repeat units in a very large chain molecule.",
      "Read position and letter case.",
      "Independent count-marker interpretation.",
    ),
    q(
      "p-crossing",
      "Inspect bracket crossings",
      "Why are bonds drawn crossing both sides of the repeat-unit brackets?",
      "The backbone continues to neighbouring repeat units",
      {
        "Brackets physically cut the chain into separate molecules":
          "Brackets describe a repeated section.",
        "The outside lines are electron shells":
          "They represent continuing covalent bonds.",
      },
      "Outside bonds show that the unit joins through the polymer chain.",
      "Trace the backbone through the bracket edges.",
      "Independent continuation reasoning.",
    ),
    drawing(
      "p-draw",
      "Construct the polymer repeat",
      "Construct the usual bracketed poly(ethene) repeat unit: choose the C–C bond, H count, continuing bonds and repeat-count marker.",
    ),
    n(
      "p-total-carbon",
      "Count many repeat contributions",
      "100 of these two-carbon repeat units contribute how many carbon atoms?",
      200,
      "carbons",
      "100 × 2 = 200 carbons in the repeated contribution. End-group composition is not supplied.",
      "Multiply repeat count by carbon count per repeat.",
      "Independent repeat-to-chain carbon calculation.",
      { "100": "There are two carbons per usual repeat." },
    ),
    n(
      "p-total-hydrogen",
      "Count many hydrogen contributions",
      "100 of these repeat units contribute how many hydrogen atoms?",
      400,
      "hydrogens",
      "100 × 4 = 400 hydrogens in the repeated contribution; no complete end-group formula is claimed.",
      "Multiply the whole repeat’s H contribution.",
      "Independent repeat-to-chain hydrogen calculation.",
      { "200": "There are four H per two-carbon repeat, not two." },
    ),
    q(
      "p-separation",
      "Keep molecular bonds intact",
      "During physical separation of unchanged poly(ethene) molecules, what happens?",
      "Intermolecular forces are overcome while chain covalent bonds remain intact",
      {
        "The carbon backbone splits into monomers":
          "That changes the molecular connectivity.",
        "Hydrogen atoms disappear":
          "Atoms are not deleted by physical separation.",
      },
      "Within-molecule bonding and between-molecule attractions play different roles.",
      "Locate the interaction being overcome.",
      "Independent molecular separation mechanism.",
    ),
    q(
      "p-state",
      "Complete the state chain",
      "Which reasoning explains the supplied room-temperature solid poly(ethene)?",
      "Much larger molecules → stronger intermolecular forces → more energy needed",
      {
        "Weaker C–H bonds → easy covalent bond breaking":
          "That is not the physical-state explanation.",
        "Fewer electrons → stronger nuclear bonds":
          "That is not the relevant force model.",
      },
      "The higher energy requirement produces a higher state-change temperature than methane’s.",
      "Include size, between-molecule forces and energy.",
      "Independent complete state reasoning.",
    ),
    q(
      "p-physical",
      "Distinguish melting and cutting",
      "Why is cutting covalent chain bonds different from melting a supplied thermoplastic without decomposition?",
      "Cutting changes molecules; melting preserves chains while intermolecular arrangement changes",
      {
        "Both necessarily create exactly the same monomers":
          "Physical melting need not split the chain.",
        "Melting removes every carbon atom": "Atoms are conserved.",
      },
      "Breaking backbone connectivity is a chemical change; the specified physical melt keeps molecular chains intact.",
      "Compare connectivity before and after.",
      "Independent physical/chemical distinction.",
    ),
    q(
      "p-limits",
      "Bound the property claim",
      "Does a short poly(ethene) drawing establish that every polymer has the same melting temperature, strength and conductivity?",
      "No: polymer structure and whole-material properties differ",
      {
        "Yes: the word polymer fixes every property":
          "Polymer materials vary in structure and interactions.",
        "No: polymers have no internal covalent bonds":
          "Their atoms are covalently linked.",
      },
      "The supplied example supports its own structural explanation, not identical properties for all polymers.",
      "Separate a structural family from a universal numerical constant.",
      "Independent evidence limit.",
    ),
    q(
      "p-compound",
      "Read composition",
      "Poly(ethene) contains carbon and hydrogen chemically joined. Is it an element or a compound?",
      "A compound",
      {
        "An element because its name starts with poly":
          "Composition determines the classification.",
        "A mixture merely because it has repeat units":
          "Atoms within each chain are chemically bonded.",
      },
      "More than one element is chemically joined in poly(ethene).",
      "Count element types, not repeat units.",
      "Independent composition classification.",
    ),
    explain,
    compare,
  ],
  checkForms: [
    [
      q(
        "ca-type",
        "Retrieve polymer extent",
        "Which structure describes a simple polymer?",
        "Very large covalently linked molecules",
        {
          "Always an extended diamond-like network":
            "Large molecular chains differ from that network.",
          "Only unjoined small molecules": "The repeat units are linked.",
        },
        "Polymers consist of very large molecules.",
        "Distinguish molecule size from extended network extent.",
        "Reserved molecular classification.",
      ),
      n(
        "ca-count",
        "Calculate a repeat contribution",
        "150 two-carbon repeat units contribute how many carbon atoms?",
        300,
        "carbons",
        "150 × 2 = 300.",
        "Multiply by two carbons per unit.",
        "Reserved atom-count transfer.",
      ),
      q(
        "ca-n",
        "Retrieve bracket notation",
        "What does lower-case n beside repeat-unit brackets indicate?",
        "The number of joined repeat units",
        {
          "A nitrogen atom": "Element N is a different uppercase symbol.",
          "An electron shell": "It counts repeats, not shells.",
        },
        "n is a large repeat count.",
        "Read the marker position and case.",
        "Reserved repeat notation.",
      ),
      q(
        "ca-force",
        "Retrieve between-molecule forces",
        "Which forces explain interactions between polymer molecules?",
        "Intermolecular forces",
        {
          "Only backbone covalent bonds between all chains":
            "Backbone bonds are within molecules.",
          "Metallic bonds in a sea of positive carbon ions":
            "This is not the supplied structure.",
        },
        "Identify within and between interactions separately.",
        "Locate the molecules.",
        "Reserved force location.",
      ),
      q(
        "ca-state",
        "Retrieve causal state reasoning",
        "Compared with methane, why can the supplied poly(ethene) be solid at room temperature?",
        "Larger molecules have stronger intermolecular forces needing more energy",
        {
          "Methane’s weak covalent bonds break":
            "Internal covalent bonds are strong in both substances.",
          "The polymer has no covalent bonds":
            "Its chain is covalently linked.",
        },
        "Size → force → energy → higher state-change temperature.",
        "State the between-molecule interaction.",
        "Reserved full causal explanation.",
      ),
    ],
    [
      drawing(
        "cb-draw",
        "Construct a reserved repeat",
        "Construct the usual poly(ethene) repeat diagram with its continuing bonds and repeat-count marker.",
      ),
      q(
        "cb-recognise",
        "Recognise a new chain section",
        "Which description fits the supplied connected carbon-and-hydrogen drawing?",
        "A section of one very large polymer molecule",
        {
          "A graphite stack of hexagonal carbon-only sheets":
            "The diagram shows a carbon/hydrogen chain.",
          "Separate small methane molecules":
            "The carbon backbone joins through the section.",
        },
        "Recognise the repeating connected chain.",
        "Follow the carbon backbone.",
        "Alternative reserved diagram recognition.",
      ),
      n(
        "cb-hydrogen",
        "Calculate a new contribution",
        "75 two-carbon poly(ethene) repeat units contribute how many hydrogen atoms?",
        300,
        "hydrogens",
        "75 × 4 = 300.",
        "Use four H per usual repeat.",
        "Alternative reserved repeat ledger.",
      ),
      q(
        "cb-change",
        "Separate two changes",
        "A polymer sample melts without decomposition. What remains intact?",
        "Covalent bonds within its molecules",
        {
          "Every carbon backbone breaks into monomers":
            "That is not the stated physical change.",
          "Every nucleus breaks apart": "Nuclear changes are unrelated.",
        },
        "Between-molecule arrangement changes without cutting the chains.",
        "Use the unchanged-molecule condition.",
        "Alternative reserved physical change.",
      ),
      q(
        "cb-limit",
        "Bound the model formula",
        "Does a six-carbon chain crop establish the complete molecular formula of the polymer?",
        "No: chain continuation and end groups are omitted",
        {
          "Yes: the crop must be the whole chain":
            "It is an explicitly short section.",
          "No: hydrogen cannot bond to carbon":
            "Hydrogen is covalently bonded in the chain.",
        },
        "Repeat contributions can be counted, but complete end-group composition is not supplied.",
        "Distinguish crop counts from a full molecule.",
        "Alternative reserved model boundary.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-type",
        "Retrieve after the delay",
        "What kind of entities form a simple polymer material?",
        "Very large covalently linked molecules",
        {
          "Only isolated repeat units": "The backbone links through units.",
          "Carbon nuclei with no electrons": "That is not polymer bonding.",
        },
        "Each polymer molecule contains many joined repeats.",
        "Recall molecular extent.",
        "Delayed classification retrieval.",
      ),
      q(
        "ra-n",
        "Retrieve the marker",
        "What does n outside polymer repeat brackets mean?",
        "A large number of joined repeat units",
        {
          "An extra nitrogen atom": "Uppercase N is nitrogen.",
          "A fixed melting temperature":
            "The marker does not supply a temperature.",
        },
        "n counts repetitions.",
        "Read letter case and position.",
        "Delayed notation retrieval.",
      ),
      q(
        "ra-state",
        "Retrieve the state sequence",
        "What links large poly(ethene) molecules to its supplied solid state at room temperature?",
        "Stronger intermolecular forces and more energy needed to overcome them",
        {
          "Weaker internal covalent bonds":
            "That does not explain the physical state.",
          "Deletion of hydrogens": "Atoms do not disappear.",
        },
        "The relevant interaction is between molecules.",
        "Recall the size/force/energy sequence.",
        "Delayed causal retrieval.",
      ),
    ],
    [
      n(
        "rb-carbon",
        "Retrieve repeat counting",
        "60 usual two-carbon repeat units contribute how many carbons?",
        120,
        "carbons",
        "60 × 2 = 120.",
        "Count carbons per unit first.",
        "Alternative delayed atom ledger.",
      ),
      q(
        "rb-separation",
        "Retrieve intact-chain reasoning",
        "What is overcome when unchanged polymer molecules separate physically?",
        "Between-molecule attractions",
        {
          "Every chain covalent bond": "That would change the molecules.",
          "All forces inside nuclei": "Those are unrelated.",
        },
        "Internal covalent links remain intact.",
        "Distinguish within from between.",
        "Alternative delayed physical mechanism.",
      ),
      q(
        "rb-network",
        "Retrieve extent distinction",
        "Why is a very large poly(ethene) molecule different from diamond?",
        "It is a distinct chain molecule rather than an extended covalent network",
        {
          "It has no covalent bonds":
            "The chain is strongly covalently linked.",
          "It contains only carbon atoms in tetrahedral diamond sites":
            "Poly(ethene) also contains hydrogen and has a chain structure.",
        },
        "Large molecule and giant covalent structure are different classifications.",
        "Compare extent and composition.",
        "Alternative delayed structural contrast.",
      ),
    ],
  ],
};
const learning = [
  ...polymerStructureJourney.warmup,
  ...polymerStructureJourney.refresher,
  ...polymerStructureJourney.guided,
  ...polymerStructureJourney.practice,
];
for (const task of learning) {
  if (
    task.id.includes("draw") ||
    task.id.includes("repeat") ||
    task.id.includes("crossing") ||
    task.id === "ps-v1-p-n"
  )
    task.followUp = "ps-v1-r-repeat";
  else if (
    task.id.includes("count") ||
    task.id.includes("carbon") ||
    task.id.includes("hydrogen")
  )
    task.followUp = "ps-v1-r-count";
  else if (
    task.id.includes("phase") ||
    task.id.includes("state") ||
    task.id.includes("explain")
  )
    task.followUp = "ps-v1-r-phase";
  else if (
    task.id.includes("separation") ||
    task.id.includes("physical") ||
    task.id.includes("forces")
  )
    task.followUp = "ps-v1-r-forces";
  else task.followUp = "ps-v1-r-chain";
}
for (const task of [
  ...polymerStructureJourney.refresher,
  ...polymerStructureJourney.practice,
  ...polymerStructureJourney.checkForms.flat(),
]) {
  if (
    ["ps-v1-r-chain", "ps-v1-p-recognise", "ps-v1-cb-recognise"].includes(
      task.id,
    )
  )
    task.polymerChainDiagram = true;
  if (
    [
      "ps-v1-r-repeat",
      "ps-v1-p-carbon",
      "ps-v1-p-hydrogen",
      "ps-v1-p-n",
      "ps-v1-p-crossing",
    ].includes(task.id)
  )
    task.polymerRepeatDiagram = true;
}

import { extendPolymerWriting } from "./polymer-writing";
extendPolymerWriting(polymerStructureJourney);
