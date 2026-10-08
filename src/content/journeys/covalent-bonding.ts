import { extendCovalentWriting } from "./covalent-writing";
import type { LearningTask, LessonJourney } from "../types";
import { covalentMolecules, type CovalentMolecule } from "@/lib/covalent";
import { choice } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  choice(
    `cb-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Covalent electron, diagram and representation reasoning: ${id}.`,
  );
const guided = (
  id: string,
  title: string,
  molecule: CovalentMolecule,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask => ({
  ...q(id, prompt, answer, errors, explanation, hint),
  title,
  model: {
    kind: "covalent-share",
    molecule,
    instruction: `Construct ${molecule}: place outer electrons from BOTH atoms into each bond region.`,
  },
});
export function covalentConstruction(
  id: string,
  molecule: CovalentMolecule,
  title: string,
  prompt: string,
): LearningTask {
  const spec = covalentMolecules[molecule],
    parts = [
      {
        id: "unsharedCentre",
        label: `Unshared ${spec.centre.symbol} dots`,
        answer: spec.centre.outer - spec.orders.reduce((a, b) => a + b, 0),
      },
      ...spec.partners.flatMap((atom, i) => [
        {
          id: `centre${i}`,
          label: `Bond ${i + 1}: ${spec.centre.symbol} dots`,
          answer: spec.orders[i],
        },
        {
          id: `partner${i}`,
          label: `Bond ${i + 1}: ${atom.symbol} crosses`,
          answer: spec.orders[i],
        },
        {
          id: `unsharedPartner${i}`,
          label: `${atom.symbol} ${i + 1}: unshared crosses`,
          answer: atom.outer - spec.orders[i],
        },
      ]),
    ];
  return {
    id: `cb-v1-${id}`,
    title,
    prompt,
    parts,
    answer: JSON.stringify(
      Object.fromEntries(parts.map((p) => [p.id, String(p.answer)])),
    ),
    drawCovalent: { molecule },
    tolerance: 0,
    explanation: `Shared pairs per bond: ${spec.orders.join(", ")}. Unshared reference ${spec.centre.symbol} electrons: ${parts[0].answer}; partner unshared counts: ${spec.partners.map((a, i) => a.outer - spec.orders[i]).join(", ")}. Dots/crosses identify consistent origins; all electrons are the same kind of particle.`,
    hint: "Count outer electrons, preserve one from each atom in each shared pair, then place the remaining unshared electrons. Hydrogen has two around it; the other selected atoms have eight.",
    purpose: `Independently construct every outer-electron origin and unshared count for ${molecule}, preserving the learner's own diagram.`,
  };
}
const h2 = guided(
  "g-h2",
  "Share one pair",
  "H2",
  "Two hydrogen atoms each start with one outer electron. What completes both first shells?",
  "One shared pair, with one electron from each H",
  {
    "Transfer both electrons to one H":
      "Covalent bonding shares a pair between both atoms.",
    "Give each H eight outer electrons":
      "Hydrogen's first shell fills with two.",
  },
  "H₂ has one shared pair. Both atoms count the same two electrons around them; the molecule has two outer electrons in total.",
  "Place one electron from each H into their overlap.",
);
h2.openingHint = true;
const chlorine = guided(
  "g-cl2",
  "Keep chlorine's lone pairs",
  "Cl2",
  "After forming Cl₂'s single bond, how many unshared electrons remain on EACH Cl?",
  "Six: three lone pairs",
  {
    "Zero: all seven electrons are shared":
      "Only one from each atom makes the shared pair.",
    "Seven: the bond adds a new electron to the inventory":
      "Sharing rearranges the existing electrons; it does not create them.",
  },
  "Each Cl contributes one of seven outer electrons to the bond; six remain unshared. Each counts eight around it including the pair.",
  "Keep both seven-electron inventories intact.",
);
const hcl = guided(
  "g-hcl",
  "Different atoms, one pair",
  "HCl",
  "In HCl, where are the six non-bonding outer electrons?",
  "On chlorine, with none on hydrogen",
  {
    "Three on each atom": "Hydrogen starts with one electron and shares it.",
    "On hydrogen, with none on chlorine":
      "That breaks the selected filled-shell counts.",
  },
  "Cl contributes one and H one to a shared pair; chlorine retains six unshared electrons. The molecule has eight outer electrons total.",
  "Use chlorine's seven and hydrogen's one.",
);
const oxygen = guided(
  "g-o2",
  "Build a double bond",
  "O2",
  "How many pairs do two oxygen atoms share in O₂?",
  "Two pairs: four shared electrons",
  {
    "One pair: two shared electrons":
      "That leaves only seven around each oxygen.",
    "Two pairs: two shared electrons": "Every pair contains two electrons.",
  },
  "Each O supplies two electrons to the double bond; each retains four unshared electrons. Each counts eight around itself; twelve electrons exist in the outer inventory.",
  "Distinguish pair count from electron count.",
);
const nitrogen = guided(
  "g-n2",
  "Build a triple bond",
  "N2",
  "How many unshared outer electrons remain on each N in N₂?",
  "Two: one lone pair",
  {
    Zero: "Each N begins with five and supplies three to the triple bond.",
    "Six: three lone pairs": "That would exceed the conserved outer inventory.",
  },
  "Three shared pairs contain six electrons. Each N supplies three of its five; two remain unshared.",
  "Subtract the electrons supplied by EACH nitrogen.",
);
const water = guided(
  "g-water",
  "Complete water's oxygen",
  "H2O",
  "After forming two O–H bonds, what remains on oxygen?",
  "Four unshared electrons: two lone pairs",
  {
    None: "Oxygen begins with six and supplies one to each of two bonds.",
    "Four unshared electrons on the hydrogens":
      "Hydrogen supplies its only electron to a shared pair.",
  },
  "Oxygen contributes two outer electrons to two separate shared pairs and retains four. Both H atoms have two around them; oxygen has eight.",
  "Track oxygen's six and both one-electron hydrogens.",
);
const ammonia = guided(
  "g-ammonia",
  "Three bonds and a lone pair",
  "NH3",
  "What is nitrogen's outer-electron arrangement in NH₃?",
  "Three shared pairs and one lone pair",
  {
    "Four shared pairs and no lone pair":
      "Ammonia has three H atoms, not four.",
    "One shared pair and three lone pairs":
      "This does not satisfy the three N–H bonds.",
  },
  "Nitrogen contributes three of its five electrons to three N–H shared pairs; two remain as one lone pair.",
  "Build all three bonds without losing the other two N electrons.",
);
const methane = guided(
  "g-methane",
  "Account for methane's four bonds",
  "CH4",
  "How many unshared outer electrons remain on carbon in CH₄?",
  "Zero: its four contribute to four shared pairs",
  {
    "Four: each H adds its electron without carbon sharing":
      "A shared pair here includes one from carbon and one from H.",
    "Two: one carbon lone pair": "Carbon's four already supply the four bonds.",
  },
  "Four C–H pairs use all four carbon outer electrons and four hydrogen electrons. Eight outer electrons remain in the whole molecule.",
  "Build all four C–H regions.",
);
const dioxide = guided(
  "g-co2",
  "Two separate double bonds",
  "CO2",
  "What bond pattern gives the selected filled outer shells in CO₂?",
  "Two C=O double bonds",
  {
    "Two C–O single bonds only":
      "That leaves incomplete outer counts in this neutral example.",
    "One triple bond and one single bond":
      "This does not supply the correct counts to both oxygen atoms.",
  },
  "Carbon supplies two electrons to each bond region. Each O supplies two and retains four unshared electrons; carbon has no unshared outer electrons.",
  "Distribute carbon's four across both oxygen atoms.",
);
const wrongChlorine = q(
  "p-origin",
  "This proposed Cl₂ diagram preserves fourteen outer electrons. Why is its shared region still wrong?",
  "Both shared electrons come from one Cl instead of one from each",
  {
    "Fourteen electrons proves every placement correct":
      "Conservation alone does not establish the required pair origins.",
    "Dots and crosses are different kinds of electron":
      "They identify origins, not particle types.",
  },
  "The proposed two-dot/zero-cross region leaves seven around one Cl and nine around the other. Return and redistribute one shared electron.",
  "Check origin and filled-shell counts, not just the total.",
);
wrongChlorine.title = "Conservation is not the whole check";
wrongChlorine.covalentDiagram = {
  molecule: "Cl2",
  own: [2],
  other: [0],
  unshared: 5,
  partnerUnshared: [7],
};
const wrongWater = q(
  "p-lone",
  "The proposed water diagram has its two bonding pairs but only two non-bonding electrons on oxygen. What is missing?",
  "Two more unshared oxygen electrons",
  {
    "Two unshared hydrogen electrons":
      "Hydrogen should have no unshared electron in this completed example.",
    "Another oxygen atom":
      "The atom count already describes one water molecule.",
  },
  "Oxygen requires four unshared outer electrons in addition to its two O–H shared pairs.",
  "Account for all six original oxygen electrons.",
);
wrongWater.title = "Keep the missing lone pair visible";
wrongWater.covalentDiagram = {
  molecule: "H2O",
  own: [1, 1],
  other: [1, 1],
  unshared: 2,
  partnerUnshared: [0, 0],
};
const modelFormula: LearningTask = {
  id: "cb-v1-p-formula",
  title: "Read a formula from a model",
  prompt: "Deduce the molecular formula from this atom-and-bond model.",
  answer: "CO2",
  chemicalFormula: true,
  inputMode: "text",
  covalentModel: { molecule: "CO2" },
  explanation:
    "There is one carbon atom and two oxygen atoms: CO₂. The two double bonds do not mean two carbon atoms.",
  hint: "Count atom symbols; do not count bond lines as atoms.",
  purpose:
    "Translate a separately presented molecular model into a chemical formula.",
};
const written: LearningTask = {
  id: "cb-v1-p-explain",
  title: "Explain nitrogen's shared and lone pairs",
  prompt:
    "Explain how two nitrogen atoms, each with five outer electrons, form N₂. Account for shared pairs, lone pairs and the conserved total.",
  answer:
    "Each nitrogen shares three electrons, forming three shared pairs between the atoms. Each retains two unshared electrons as one lone pair. Each atom counts eight around it, but the molecule has ten outer electrons total because shared electrons count only once in the inventory.",
  explanation:
    "Link three pairs to six shared electrons, one lone pair on each atom and a ten-electron conserved inventory. Do not add the two eight-around counts as sixteen separate electrons.",
  hint: "Separate each atom's around-count from the whole-molecule inventory.",
  purpose:
    "Construct a causal explanation distinguishing shared-pair bookkeeping from duplicated particles.",
  rubric: [
    "Each N supplies three of its five outer electrons",
    "Three shared pairs make a triple bond",
    "Two unshared electrons remain on each N as one lone pair",
    "Eight around each N, but ten outer electrons total because sharing does not duplicate electrons",
  ],
};
export const covalentBondingJourney: LessonJourney = {
  version: 1,
  introduction:
    "Construct shared electron pairs while retaining every unshared outer electron. Use independent drawings, bond models and actual 3D assets to distinguish electrons, atoms and representations.",
  warmup: [
    q(
      "w-pair",
      "How many electrons are in one pair?",
      "Two",
      {
        One: "One electron is not a pair.",
        Four: "Four electrons make two pairs.",
      },
      "One pair contains two electrons.",
      "Retrieve the count.",
    ),
    q(
      "w-h",
      "How many electrons fill hydrogen's first shell?",
      "Two",
      {
        Eight: "Eight is not the first-shell capacity.",
        Zero: "A filled shell contains electrons.",
      },
      "Hydrogen's filled first shell has two electrons.",
      "Recall the first-shell exception.",
    ),
    q(
      "w-share",
      "What distinguishes covalent bonding from the earlier ionic formation model?",
      "Sharing pairs between atoms",
      {
        "Transferring electrons to form opposite ions":
          "That is the ionic formation model.",
        "Sharing protons between nuclei":
          "Covalent bonding involves electrons, not moving protons.",
      },
      "Covalent bonds share electron pairs between atoms.",
      "Name the particles and what they do.",
    ),
  ],
  refresher: [
    q(
      "r-pairs",
      "What does a double bond represent?",
      "Two shared pairs, four electrons",
      {
        "Two shared electrons": "That is one pair.",
        "Two extra atoms": "Bond count is not atom count.",
      },
      "Two lines/pairs correspond to four shared electrons.",
      "Two electrons per pair.",
    ),
    q(
      "r-lone",
      "What is a lone pair?",
      "Two outer electrons not used in a bond",
      {
        "One electron moving alone": "A pair contains two.",
        "Two atoms without a bond": "The term describes electrons.",
      },
      "Lone pairs are unshared electron pairs.",
      "Separate atom and electron counts.",
    ),
    q(
      "r-inventory",
      "H₂ has two electrons around each H. How many outer electrons are in the whole molecule?",
      "Two, counted once in the inventory",
      {
        "Four, because each atom counts two":
          "The shared pair is counted around both, not duplicated.",
        "One, because both atoms share":
          "The pair still contains two electrons.",
      },
      "Both atoms use the same shared pair.",
      "Sharing does not create another copy.",
    ),
    q(
      "r-origins",
      "What do dots and crosses mean in a stated-origin diagram?",
      "Electron origins, not different kinds of electron",
      {
        "Different electron charges":
          "Every electron has the same negative charge.",
        "Dots are protons": "The diagram uses both markers for electrons.",
      },
      "Consistent markers track which atom supplied an electron.",
      "Read the legend.",
    ),
    q(
      "r-strong",
      "Are covalent bonds between atoms in a molecule weak?",
      "No: the covalent bonds are strong",
      {
        "Yes: every small molecule has weak covalent bonds":
          "Weak intermolecular forces are a separate property lesson.",
        "No: they are bonds between separate ionic crystals":
          "This is a molecular electron-sharing example.",
      },
      "Shared electrons are attracted to both positively charged nuclei, holding atoms together in strong covalent bonds. Do not confuse these bonds with forces between molecules.",
      "Distinguish within and between molecules.",
    ),
    q(
      "r-extent",
      "Does covalent bonding always mean separate small molecules?",
      "No: giant covalent structures and polymers also occur",
      {
        "Yes: diamond must be tiny separate molecules":
          "Diamond is a giant covalent structure.",
        "No: covalent bonding always forms ions":
          "Covalent bonding shares electrons.",
      },
      "Covalent bonding occurs in small molecules, large polymer molecules and giant structures.",
      "Separate bond type from structural extent.",
    ),
  ],
  guided: [
    h2,
    chlorine,
    hcl,
    oxygen,
    nitrogen,
    water,
    ammonia,
    methane,
    dioxide,
  ],
  practice: [
    covalentConstruction(
      "p-h2",
      "H2",
      "Draw hydrogen",
      "Construct the outer-electron diagram for H₂. Each H has one original electron.",
    ),
    covalentConstruction(
      "p-cl2",
      "Cl2",
      "Draw chlorine, including lone pairs",
      "Construct Cl₂'s outer-electron diagram. Each Cl starts with seven outer electrons.",
    ),
    covalentConstruction(
      "p-hcl",
      "HCl",
      "Draw hydrogen chloride",
      "Construct HCl's outer-electron diagram. Use Cl as the reference atom (seven outer electrons) and H as its partner (one).",
    ),
    covalentConstruction(
      "p-o2",
      "O2",
      "Draw oxygen's double bond",
      "Construct O₂'s outer-electron diagram. Each O starts with six outer electrons.",
    ),
    covalentConstruction(
      "p-n2",
      "N2",
      "Draw nitrogen's triple bond",
      "Construct N₂'s outer-electron diagram. Each N starts with five outer electrons.",
    ),
    covalentConstruction(
      "p-water",
      "H2O",
      "Draw water's complete outer electrons",
      "Construct H₂O, with oxygen as the reference atom. O starts with six outer electrons; each H with one.",
    ),
    covalentConstruction(
      "p-ammonia",
      "NH3",
      "Draw ammonia's lone pair",
      "Construct NH₃, with N as the reference atom. N starts with five outer electrons; each H with one.",
    ),
    covalentConstruction(
      "p-methane",
      "CH4",
      "Draw all four methane bonds",
      "Construct CH₄, with C as the reference atom. C starts with four outer electrons; each H with one.",
    ),
    covalentConstruction(
      "p-dioxide",
      "CO2",
      "Draw both carbon dioxide double bonds",
      "Construct CO₂, with C as the reference atom. C starts with four outer electrons; each O with six.",
    ),
    wrongChlorine,
    wrongWater,
    q(
      "p-line",
      "A single line between two atom symbols represents what?",
      "One shared pair of two electrons",
      {
        "One electron only": "The line represents a pair.",
        "Two atoms added to the molecule":
          "The symbols already identify the atoms.",
      },
      "A single line is a single covalent bond.",
      "Translate lines into shared pairs.",
    ),
    modelFormula,
    q(
      "p-giant",
      "A diagram shows a repeating carbon network continuing beyond its edges. Does covalent bonding require interpreting it as small separate molecules?",
      "No: a giant covalent structure can extend through the substance",
      {
        "Yes: every four bonds makes a separate methane molecule":
          "Atom identity and structure matter; bonds alone do not imply methane.",
        "No: carbon networks are necessarily ionic":
          "Covalent bonds can form giant networks.",
      },
      "Structural extent differs from a small molecule despite covalent bonds in both.",
      "Read whether the network repeats or ends as a molecule.",
    ),
    written,
  ],
  checkForms: [
    [
      covalentConstruction(
        "ca-hcl",
        "HCl",
        "Construct an independent HCl diagram",
        "Draw all outer electrons of one HCl molecule; Cl has seven original outer electrons, H one. Cl is the reference atom.",
      ),
      q(
        "ca-double",
        "How many electrons are shared in one double bond?",
        "Four",
        {
          Two: "Two make only one shared pair.",
          Eight: "That exceeds two pairs.",
        },
        "Two pairs give four shared electrons.",
        "Two per pair.",
      ),
      q(
        "ca-total",
        "A proposed H₂ picture counts four distinct outer electrons. What is wrong?",
        "It has duplicated the shared pair",
        {
          "Hydrogen needs eight each": "Hydrogen fills with two.",
          "H₂ contains four atoms": "Its formula indicates two hydrogen atoms.",
        },
        "The molecule contains two outer electrons total.",
        "Distinguish around-counts and inventory.",
      ),
      q(
        "ca-lone",
        "Where are the six non-bonding electrons in a correct HCl outer-electron diagram?",
        "On chlorine",
        {
          "On hydrogen": "H contributes its only electron to the shared pair.",
          "As three extra atoms": "Electrons are not atoms.",
        },
        "The remaining chlorine outer electrons are unshared.",
        "Use original electron counts.",
      ),
      q(
        "ca-strong",
        "What should a ball-and-stick molecular representation's connector mean?",
        "A strong covalent bond between atoms",
        {
          "A measured rigid rod between actual spheres":
            "The stick is a visual representation.",
          "A necessarily weak covalent bond":
            "Covalent bonds within molecules are strong.",
        },
        "The connector represents a covalent bond: shared electrons are attracted to both positive nuclei. It is not a physical rod or a drawing of every electron.",
        "State the representation's meaning and limit.",
      ),
    ],
    [
      covalentConstruction(
        "cb-water",
        "H2O",
        "Construct an independent water diagram",
        "Draw all outer electrons in H₂O. O is the reference atom with six original outer electrons; each H has one.",
      ),
      q(
        "cb-triple",
        "How many shared pairs make a triple bond?",
        "Three",
        {
          Six: "Six is the electron count, not pair count.",
          One: "That makes a single bond.",
        },
        "Three pairs contain six electrons.",
        "Distinguish pairs and electrons.",
      ),
      q(
        "cb-water-total",
        "How many outer electrons are conserved in H₂O?",
        "Eight: six from O and one from each H",
        {
          "Twelve: add eight around O and two around each H":
            "That double-counts the shared electrons.",
          "Six: ignore the hydrogens":
            "Both hydrogen electrons also belong to the molecule.",
        },
        "Count each original electron once.",
        "Sum the original inventories.",
      ),
      q(
        "cb-lone",
        "Which outer electrons remain unshared on N in NH₃?",
        "Two, forming one lone pair",
        {
          None: "N supplies only three of its five to the three bonds.",
          Six: "That exceeds nitrogen's original outer inventory.",
        },
        "Five minus three leaves two.",
        "Subtract nitrogen's supplied electrons.",
      ),
      {
        id: "cb-v1-cb-formula",
        title: "Deduce a model's molecular formula",
        prompt:
          "Write the molecular formula shown by this atom-and-bond model.",
        answer: "CH4",
        chemicalFormula: true,
        inputMode: "text",
        covalentModel: { molecule: "CH4" },
        explanation: "One carbon atom is bonded to four hydrogen atoms: CH₄.",
        hint: "Count atom symbols, not electron pairs.",
        purpose:
          "Independently deduce molecular formula from a reserved bond-model representation.",
      },
    ],
  ],
  reviewForms: [
    [
      covalentConstruction(
        "ra-oxygen",
        "O2",
        "Retrieve oxygen's electron diagram",
        "Reconstruct O₂ from its two six-outer-electron oxygen atoms.",
      ),
      q(
        "ra-total",
        "Retrieve why adding both Cl₂ eight-around counts does not give sixteen distinct outer electrons.",
        "The shared pair is counted around both atoms",
        {
          "Sharing creates two extra electrons":
            "The inventory remains fourteen.",
          "Both Cl atoms lose every electron": "Six remain unshared on each.",
        },
        "The shared pair is not duplicated in the molecule.",
        "Retrieve the count-once rule.",
      ),
      q(
        "ra-extent",
        "Retrieve a limit of a dot-and-cross diagram.",
        "It does not show a measured 3D molecular shape",
        {
          "It proves all molecules are flat":
            "A flat diagram does not prove a flat molecule.",
          "It shows electron paths exactly": "Markers are schematic positions.",
        },
        "The representation omits measured spatial detail.",
        "Separate representation from molecule.",
      ),
    ],
    [
      covalentConstruction(
        "rb-chlorine",
        "Cl2",
        "Retrieve chlorine's lone pairs",
        "Reconstruct Cl₂ from two chlorine atoms, each with seven outer electrons.",
      ),
      q(
        "rb-lone",
        "Retrieve water's unshared oxygen count.",
        "Four electrons, two lone pairs",
        {
          "Two electrons, two lone pairs": "Two electrons make one pair.",
          "No unshared electrons":
            "Only two of oxygen's six are supplied to bonds.",
        },
        "Oxygen retains four unshared outer electrons.",
        "Retrieve pair versus electron count.",
      ),
      q(
        "rb-bond",
        "Retrieve what a single covalent bond represents.",
        "A shared pair of electrons between atoms",
        {
          "A transferred proton":
            "Bonding does not move protons between nuclei.",
          "A single shared electron": "A pair contains two.",
        },
        "One shared pair makes a single bond.",
        "Retrieve the particles and count.",
      ),
    ],
  ],
};
for (const task of [
  ...covalentBondingJourney.guided,
  ...covalentBondingJourney.practice,
])
  task.followUp =
    task.id.includes("lone") ||
    task.id.includes("water") ||
    task.id.includes("ammonia")
      ? "cb-v1-r-lone"
      : task.id.includes("origin")
        ? "cb-v1-r-origins"
        : task.id.includes("giant")
          ? "cb-v1-r-extent"
          : task.id.includes("h2") || task.id.includes("explain")
            ? "cb-v1-r-inventory"
            : "cb-v1-r-pairs";

extendCovalentWriting(covalentBondingJourney, covalentConstruction);
