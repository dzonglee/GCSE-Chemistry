import { extendIonicBondingWriting } from "./ionic-bonding-writing";
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
    `ib-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Ionic-bonding reasoning: ${id}.`,
  );
const nacl = q(
  "g-nacl",
  "Form Na⁺ and Cl⁻ from neutral atoms. How many electrons transfer?",
  "One, from sodium to chlorine",
  {
    "One, from chlorine to sodium":
      "Sodium loses and chlorine gains an electron.",
    "One proton, from sodium to chlorine":
      "The nuclei do not change in electron transfer.",
  },
  "Sodium loses one outer electron and chlorine gains it. Na⁺ is 2,8; Cl⁻ is 2,8,8. The oppositely charged ions attract electrostatically. Transfer forms the ions; attraction is the ionic bond.",
  "Transfer one electron from Na to Cl.",
);
nacl.title = "Transfer one electron";
nacl.openingHint = true;
nacl.model = {
  kind: "ionic-transfer",
  compound: "NaCl",
  instruction: "Transfer one electron from Na to Cl.",
};
const mgcl = q(
  "g-mgcl",
  "Magnesium has two outer electrons. Each chlorine atom needs one. Which formula follows from the required ion ratio?",
  "MgCl₂",
  {
    MgCl: "One chlorine atom cannot use both transfers to form the required Cl⁻ ion.",
    "Mg₂Cl": "This reverses the required 1:2 ratio.",
  },
  "One Mg atom loses two electrons, one to each of two Cl atoms. Mg²⁺ and two Cl⁻ ions balance total charge zero: MgCl₂ is the simplest ratio, not a separate molecule.",
  "Distribute one electron to each chlorine atom.",
);
mgcl.title = "Distribute the two transfers";
mgcl.model = {
  kind: "ionic-transfer",
  compound: "MgCl2",
  instruction:
    "Transfer one electron to EACH chlorine atom; keep the magnesium nucleus fixed.",
};
const mgo = q(
  "g-mgo",
  "Magnesium transfers two electrons to oxygen. What ions result?",
  "Mg²⁺ and O²⁻",
  {
    "Mg⁻ and O⁺":
      "The metal loses and the non-metal gains electrons; these signs are reversed.",
    "Mg²⁺ and O⁻": "Oxygen gains two electrons, not one.",
  },
  "Magnesium loses two electrons; oxygen gains two. Both resulting ions have arrangement 2,8, with unchanged proton numbers 12 and 8. Opposite 2+ and 2− charges attract.",
  "Oxygen starts with six outer electrons and needs two more.",
);
mgo.title = "Two electrons to one oxygen";
mgo.model = {
  kind: "ionic-transfer",
  compound: "MgO",
  instruction: "Transfer both magnesium outer electrons to oxygen.",
};
const na2o = q(
  "g-na2o",
  "Each sodium atom supplies one outer electron. Oxygen needs two. What is the required sodium:oxygen ratio?",
  "2:1",
  {
    "1:1": "One sodium supplies only one of the two needed electrons.",
    "1:2": "Two oxygen atoms would need four electrons.",
  },
  "Two sodium atoms each lose one electron to one oxygen atom. Two Na⁺ ions balance one O²⁻: Na₂O. This formula is an ion ratio in a giant lattice, not a molecule.",
  "Use one transfer from each sodium atom.",
);
na2o.title = "Two donors for one acceptor";
na2o.model = {
  kind: "ionic-transfer",
  compound: "Na2O",
  instruction: "Each sodium supplies one electron to the same oxygen atom.",
};
const wrongOrigin = q(
  "p-origin",
  "This proposed Cl⁻ diagram was meant to show one electron transferred from sodium. Its outer total is eight. What needs correction?",
  "The origins: seven original dots and one transferred cross",
  {
    "Nothing: a correct total proves every detail is correct":
      "Eight is correct, but chlorine originally had seven outer electrons and sodium supplied one.",
    "Replace the brackets with a shared bond":
      "This is an ion, not a shared electron pair.",
  },
  "The diagram shows six dots and two crosses. For Cl⁻ formed by one sodium transfer, it must show seven original chlorine dots and one sodium cross. Correct total alone does not establish correct origin markers.",
  "Compare the original seven outer electrons with the one transferred electron.",
);
wrongOrigin.ionDotCross = {
  symbol: "Cl",
  charge: -1,
  dots: 6,
  crosses: 2,
  proposed: true,
};
const missingCharge = q(
  "p-brackets",
  "A proposed sodium diagram represents ten electrons, but has no ion brackets or charge. What must be added for Na⁺?",
  "Square brackets and a + charge",
  {
    "A − charge": "Ten electrons against eleven protons gives +1.",
    "A second sodium nucleus": "Ion formation does not add nuclei.",
  },
  "Na⁺ has eleven protons and ten electrons. Ionic dot-and-cross diagrams need the ion brackets and correct charge as well as electron counts.",
  "Compare positive and negative charges.",
);
missingCharge.ionDotCross = {
  symbol: "Na",
  charge: 0,
  dots: 0,
  crosses: 0,
  proposed: true,
  shellsOmitted: true,
};
const coldO = number(
  "ib-v1-ca-diagram",
  "This proposed O²⁻ outer-shell diagram shows six original dots and one transferred cross. How many ADDITIONAL crosses are needed for the intended ion?",
  1,
  "cross",
  "Oxygen needs two transferred electrons in total; one is already drawn, so add one. The charge label alone does not make the diagram correct.",
  "Compare the seven drawn electrons with the required eight.",
  "Inspect an uncorrected independent proposed diagram.",
);
coldO.ionDotCross = {
  symbol: "O",
  charge: -2,
  dots: 6,
  crosses: 1,
  proposed: true,
};
const coldCl = q(
  "cb-diagram",
  "This proposed Cl⁻ diagram was meant to track an electron from sodium. What is wrong with its markers?",
  "It needs seven original dots and one transferred cross",
  {
    "Its eight original dots correctly show the transferred electron":
      "Chlorine originally has seven outer electrons, not eight.",
    "It should show a proton transferred from sodium":
      "The transfer concerns an electron.",
  },
  "A correct outer total does not replace correct origin markers. Show seven chlorine dots and one sodium cross.",
  "Check which electron was transferred.",
);
coldCl.ionDotCross = {
  symbol: "Cl",
  charge: -1,
  dots: 8,
  crosses: 0,
  proposed: true,
};
const written: LearningTask = {
  id: "ib-v1-p-explain",
  prompt:
    "Describe what happens to electrons when a magnesium atom forms magnesium oxide with an oxygen atom, and explain what holds the resulting ions together.",
  answer:
    "Magnesium loses two outer electrons and oxygen gains those two electrons. Mg²⁺ and O²⁻ ions form with full outer shells. Their nuclei stay unchanged. Strong electrostatic attraction between the oppositely charged ions is the ionic bond; the electrons are transferred, not shared as a pair.",
  explanation:
    "Compare the separate loss, gain, two-electron count, resulting ion signs and attractive force. This explanation is self-reviewed, not automatically given exam marks.",
  hint: "State who loses, who gains, how many, which ions and which force.",
  purpose:
    "Build a causal electron-transfer explanation and distinguish it from the bond itself.",
  rubric: [
    "Magnesium loses outer electrons.",
    "Oxygen gains the transferred electrons.",
    "Two electrons transfer, giving Mg²⁺ and O²⁻ with full outer shells.",
    "Identify strong electrostatic attraction between opposite charges as the ionic bond.",
    "Keep nuclei unchanged; do not describe a shared pair.",
  ],
};
export const ionicBondingJourney: LessonJourney = {
  version: 1,
  introduction:
    "Move electrons between specified atoms, build charged dot-and-cross diagrams and deduce the simplest ion ratio. Distinguish forming ions from the force that holds them together.",
  outcomes: [
    "Explain electron loss/gain and ion charges for Groups 1, 2, 6 and 7.",
    "Represent transferred electrons, full outer shells, ion brackets and charges.",
    "Deduce simple ion ratios and identify electrostatic attraction as ionic bonding.",
  ],
  scopeNote:
    "AQA/Trilogy ionic formation and Pearson 1.21–1.24, with simple charge-balanced formulas. Shells use first-20 examples only. Dot/cross markers identify origins, not different electron types. Given Al³⁺ formula transfer is extension data, not a Group 1/2 charge prediction. Giant lattices, conductivity and broader polyatomic naming/formulas have their own following lessons. Written explanations are self-reviewed.",
  warmup: [
    q(
      "w-ion",
      "A neutral atom loses one electron. Its ion is…",
      "Positive",
      {
        Negative: "Removing negative charge leaves a positive excess.",
        "A different element": "The proton number is unchanged.",
      },
      "Electron loss produces a positive ion without changing element identity.",
      "Track the negative charge removed.",
    ),
    q(
      "w-full",
      "Neutral oxygen is 2,6. How many electrons would it gain for a full outer shell in this model?",
      "Two",
      {
        Six: "Six is its current outer count.",
        Eight: "Eight is the final outer count, not the amount gained.",
      },
      "6 + 2 = 8; two electrons are gained.",
      "Compare current and final counts.",
    ),
  ],
  refresher: [
    q(
      "r-sign",
      "Which direction is correct for simple ionic formation?",
      "Metal loses; non-metal gains",
      {
        "Metal gains; non-metal loses":
          "This reverses the usual transfer for these examples.",
        "Both atoms lose the same electron":
          "The transferred electron is conserved.",
      },
      "The metal becomes positive and the non-metal negative.",
      "Connect loss/gain to charge.",
    ),
    q(
      "r-group",
      "What simple charges follow for a Group 2 metal and Group 6 non-metal?",
      "2+ and 2−",
      {
        "2− and 6+":
          "Group 6 needs two electrons to reach eight; the signs are also reversed.",
        "Both 0": "These are the resulting ions, not neutral atoms.",
      },
      "The metal loses two; the non-metal gains two.",
      "Use the full-outer-shell target.",
    ),
    q(
      "r-origin",
      "What do dots and crosses distinguish?",
      "The atoms the electrons originally came from",
      {
        "Different kinds of electron":
          "All electrons are the same kind of particle.",
        "Protons and neutrons": "The markers represent electrons.",
      },
      "Origin markers make a transfer visible; they do not change the electron itself.",
      "Read the diagram legend.",
    ),
    q(
      "r-bond",
      "What is the ionic bond itself?",
      "Strong electrostatic attraction between oppositely charged ions",
      {
        "The electron transfer alone":
          "Transfer forms the ions; attraction is the bond.",
        "A shared pair of electrons": "That describes covalent bonding.",
      },
      "Charged ions attract. The force, rather than the transfer event alone, is the ionic bond.",
      "Separate the cause of charge from the binding force.",
    ),
    q(
      "r-ratio",
      "Which condition must a neutral ionic formula satisfy?",
      "Equal total positive and negative charges",
      {
        "Equal numbers of ions in every compound":
          "Different charges can require unequal counts.",
        "Zero charge on each individual ion":
          "The individual ions are charged.",
      },
      "Total charge balances even when ion counts differ.",
      "Add the charges across all ions.",
    ),
    q(
      "r-core",
      "What stays unchanged when atoms transfer electrons?",
      "Their proton numbers",
      {
        "Every electron count": "Electron counts change.",
        "Their ion charges": "Charge changes as electrons move.",
      },
      "Fixed nuclei preserve element identities during ordinary chemical formation.",
      "Identify the invariant quantity.",
    ),
  ],
  guided: [nacl, mgcl, mgo, na2o],
  practice: [
    q(
      "p-direction",
      "Sodium and chlorine form Na⁺ and Cl⁻. Which account is correct?",
      "One sodium electron transfers to chlorine",
      {
        "One chlorine proton transfers to sodium": "The nuclei do not change.",
        "A shared pair remains between neutral atoms":
          "That is not this ionic electron-transfer account.",
      },
      "The metal loses and the non-metal gains one electron; their ions attract.",
      "Use the two ion signs.",
    ),
    number(
      "ib-v1-p-electrons",
      "Chlorine has atomic number 17. How many electrons does Cl⁻ contain?",
      18,
      "electrons",
      "A 1− ion has one more electron than protons: 17 + 1 = 18.",
      "The negative sign means an electron gained.",
      "Calculate an anion count independently.",
    ),
    q(
      "p-distribution",
      "One Mg atom transfers both outer electrons to only one of two Cl atoms. Total electrons are conserved. Has the intended MgCl₂ ion formation been represented correctly?",
      "No: each chlorine must gain one electron",
      {
        "Yes: total conservation proves the intended ions formed":
          "Distribution must also give one Cl⁻ per chlorine atom.",
        "No: magnesium must lose two protons instead":
          "Electron transfer does not remove protons.",
      },
      "Conservation is necessary but not enough. Two separate chlorine atoms each need one electron for Cl⁻.",
      "Inspect each recipient, not only the grand total.",
    ),
    wrongOrigin,
    missingCharge,
    q(
      "p-group",
      "A Group 1 metal reacts with a Group 6 non-metal. Which simple ion ratio balances their usual charges?",
      "Two 1+ ions for one 2− ion",
      {
        "One 1+ ion for two 2− ions": "This gives net negative charge.",
        "One neutral metal atom for each negative ion":
          "The metal forms a positive ion.",
      },
      "2 × (+1) + (−2) = 0, giving a 2:1 ratio.",
      "Balance total charge.",
    ),
    q(
      "p-formula",
      "Using Ca²⁺ and F⁻, which neutral formula is correct?",
      "CaF₂",
      {
        CaF: "One fluoride balances only one of the two positive charges.",
        "Ca₂F": "Two calcium ions give four positive charges, not one.",
      },
      "One Ca²⁺ requires two F⁻ ions. The formula is the simplest ion ratio.",
      "Count total positive and negative charge.",
    ),
    q(
      "p-given",
      "Given Al³⁺ and O²⁻, which smallest neutral formula balances their charges?",
      "Al₂O₃",
      { AlO: "3+ and 2− leave net 1+.", "Al₃O₂": "9+ and 4− do not balance." },
      "Two 3+ ions give +6; three 2− ions give −6. These ion charges are supplied, not inferred using the Group 1/2 formation rule.",
      "Find equal positive and negative totals.",
    ),
    q(
      "p-neon",
      "Na⁺ and Ne each have ten electrons arranged 2,8. Are they the same element?",
      "No: sodium has 11 protons and neon has 10",
      {
        "Yes: electron arrangements alone define elements":
          "Proton number defines element identity.",
        "Yes: losing an electron removes one proton too":
          "Electron transfer leaves the nucleus unchanged.",
      },
      "The electron structures match, but different proton numbers keep the identities distinct.",
      "Compare the nuclei, not only the electrons.",
    ),
    q(
      "p-pairs",
      "Why does the formula MgCl₂ not mean an isolated three-ion molecule in an ionic solid?",
      "It gives the simplest ratio in a giant repeating lattice",
      {
        "The compound has no attractions": "Ions attract strongly.",
        "Every solid contains only one magnesium and two chlorine particles":
          "Macroscopic solids contain many repeating ions.",
      },
      "The formula describes an ion ratio, not a separate molecule. The following structure lesson examines the lattice.",
      "Separate ratio from physical arrangement.",
    ),
    q(
      "p-names",
      "What is the negative ion formed from a chlorine atom called?",
      "Chloride",
      {
        Sodium: "That is a different element.",
        Chlorate:
          "Chlorate is an oxygen-containing ion, not the simple Cl⁻ ion.",
      },
      "Chlorine gains one electron to form the chloride ion, Cl⁻. The broader –ide/–ate naming distinction is developed separately.",
      "Distinguish the element name from the simple ion name.",
    ),
    written,
  ],
  checkForms: [
    [
      q(
        "ca-transfer",
        "A Group 1 metal and Group 7 non-metal form their usual simple ions. Which transfer is correct?",
        "One electron from metal to non-metal",
        {
          "One electron from non-metal to metal": "This reverses loss/gain.",
          "One proton from metal to non-metal":
            "Chemical ion formation does not transfer nuclei.",
        },
        "The metal loses one and the non-metal gains one.",
        "Use the group-specific outer counts.",
      ),
      number(
        "ib-v1-ca-mg",
        "Magnesium has 12 protons. How many electrons are in Mg²⁺?",
        10,
        "electrons",
        "12 − 2 = 10 electrons.",
        "Positive charge means fewer electrons.",
        "Independent cation arithmetic.",
      ),
      coldO,
      q(
        "ca-force",
        "Which phrase names the ionic bond?",
        "Strong electrostatic attraction between opposite ion charges",
        {
          "A shared electron pair": "This is covalent bonding.",
          "The movement of one neutron": "This is not ionic bonding.",
        },
        "The force binds the oppositely charged ions.",
        "Name the attractive force.",
      ),
      q(
        "ca-ratio",
        "Which charge balance explains MgCl₂?",
        "One 2+ ion and two 1− ions",
        {
          "Two 2+ ions and one 1− ion": "This is not neutral.",
          "One 2+ ion and one 1− ion": "This leaves net 1+.",
        },
        "+2 − 1 − 1 = 0.",
        "Sum all charges.",
      ),
    ],
    [
      q(
        "cb-transfer",
        "A Group 2 metal and Group 6 non-metal form usual simple ions. Which account is correct?",
        "Two electrons transfer from the metal to the non-metal",
        {
          "Six electrons transfer because the group is 6":
            "Six is the initial outer count, not the gain.",
          "Two protons transfer": "The nuclei remain unchanged.",
        },
        "The metal loses two; the non-metal gains two.",
        "Reach a full outer shell.",
      ),
      number(
        "ib-v1-cb-oxide",
        "Oxygen has atomic number 8. How many electrons are in O²⁻?",
        10,
        "electrons",
        "8 + 2 = 10 electrons.",
        "A 2− ion has two extra electrons.",
        "Independent anion arithmetic.",
      ),
      coldCl,
      q(
        "cb-ratio",
        "Which simplest ratio balances Na⁺ and O²⁻?",
        "2:1 sodium ions to oxide ions",
        {
          "1:2 sodium ions to oxide ions": "The charges do not balance.",
          "1:1 sodium ions to oxide ions": "The net charge is −1.",
        },
        "Two positive charges balance one double negative charge.",
        "Sum charges rather than require equal ion numbers.",
      ),
      q(
        "cb-identity",
        "A metal atom loses electrons during ionic formation. Why is it still the same element?",
        "Its proton number is unchanged",
        {
          "Its electron count is unchanged": "Electrons were lost.",
          "It has changed into a noble-gas element":
            "A matching electron structure does not change element identity.",
        },
        "Proton number fixes the element.",
        "Recall the invariant nucleus.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-bond",
        "Electron transfer creates ions. What holds them together?",
        "Electrostatic attraction between opposite charges",
        {
          "A shared pair between neutral atoms":
            "That is a different bonding account.",
          "An exchange of nuclei": "The nuclei are unchanged.",
        },
        "Attraction is the ionic bond.",
        "Retrieve the event-versus-force distinction.",
      ),
      q(
        "ra-marker",
        "In Cl⁻ formed using one sodium electron, how should eight outer electrons be marked?",
        "Seven original dots and one transferred cross",
        {
          "Eight original dots and no transferred marker":
            "This loses the transfer origin.",
          "Six original dots and two transferred crosses":
            "Only one electron transfers to this chlorine.",
        },
        "The legend preserves original and transferred counts.",
        "Retrieve the two origins.",
      ),
      q(
        "ra-ratio",
        "Why are two chloride ions needed for one Mg²⁺ ion?",
        "Two 1− charges balance one 2+ charge",
        {
          "All ionic formulas must have equal ion counts":
            "Neutrality depends on charge, not equal counts.",
          "One chlorine needs two electrons": "Each chlorine needs one.",
        },
        "+2 +2(−1) = 0.",
        "Balance the full unit.",
      ),
    ],
    [
      q(
        "rb-direction",
        "Which atoms gain electrons in the simple formation examples?",
        "The non-metal atoms",
        {
          "The metal atoms": "The metal loses outer electrons.",
          "Every nucleus": "Electrons are not nuclei.",
        },
        "Gain gives negative ions.",
        "Retrieve the charge direction.",
      ),
      q(
        "rb-origin",
        "Are dots and crosses different types of electron?",
        "No: they track different origins",
        {
          "Yes: crosses have positive charge":
            "All electrons have negative charge.",
          "Yes: dots are neutrons": "Both markers stand for electrons.",
        },
        "The marker style is representational.",
        "Retrieve what the legend means.",
      ),
      q(
        "rb-lattice",
        "An ionic formula represents…",
        "The simplest ion ratio in a giant structure",
        {
          "One isolated molecule for every ionic compound":
            "Ionic solids are giant lattices.",
          "A charge-free single atom": "The compound contains charged ions.",
        },
        "The formula ratio does not specify an isolated molecule.",
        "Retrieve ratio versus arrangement.",
      ),
    ],
  ],
};
const drawChloride: LearningTask = {
  id: "ib-v1-p-draw-chloride",
  prompt:
    "Construct the outer-electron diagram for the chloride ion formed by one sodium-to-chlorine electron transfer. Choose its origin markers, charge and brackets.",
  answer: '{"dots":"7","crosses":"1","charge":"-1","brackets":"1"}',
  purpose: "Independently construct a diagram rather than only recognise one.",
  explanation:
    "Chlorine's seven original outer electrons are dots; the one sodium electron is a cross. Draw square brackets and charge 1−. All eight are electrons, not different particle types.",
  hint: "Recall chlorine's original seven outer electrons and one gained negative electron.",
  parts: [
    { id: "dots", label: "Original non-metal electrons (dots)", answer: 7 },
    {
      id: "crosses",
      label: "Transferred metal electrons (crosses)",
      answer: 1,
    },
    { id: "charge", label: "Ion charge", answer: -1 },
    { id: "brackets", label: "Draw square brackets", answer: 1 },
  ],
  drawDotCross: { symbol: "Cl" },
};
const drawOxide: LearningTask = {
  id: "ib-v1-p-draw-oxide",
  prompt:
    "Construct the outer-electron diagram for the oxide ion formed when magnesium transfers its outer electrons to oxygen.",
  answer: '{"dots":"6","crosses":"2","charge":"-2","brackets":"1"}',
  purpose:
    "Construct the two-electron non-metal ion with correct charge and origins.",
  explanation:
    "Six original oxygen electrons are dots and two magnesium electrons are crosses. The oxide ion is bracketed with charge 2−; its outer total is eight.",
  hint: "Oxygen starts with six outer electrons and gains two negative electrons.",
  parts: [
    { id: "dots", label: "Original non-metal electrons (dots)", answer: 6 },
    {
      id: "crosses",
      label: "Transferred metal electrons (crosses)",
      answer: 2,
    },
    { id: "charge", label: "Ion charge", answer: -2 },
    { id: "brackets", label: "Draw square brackets", answer: 1 },
  ],
  drawDotCross: { symbol: "O" },
};
ionicBondingJourney.practice.splice(5, 0, drawChloride, drawOxide);
ionicBondingJourney.checkForms[0].push({
  ...drawChloride,
  id: "ib-v1-ca-draw",
  prompt:
    "Magnesium forms MgCl₂ by transferring electrons to two chlorine atoms. Construct the outer-electron diagram for ONE resulting chloride ion.",
  purpose: "Reserved independent construction in a different donor context.",
  explanation:
    "Chlorine's seven original outer electrons are dots; one transferred magnesium electron is a cross. Each of the two chlorine atoms receives one electron. Draw square brackets and charge 1− for this one chloride ion. All eight markers represent electrons.",
});
ionicBondingJourney.checkForms[1].push({
  ...drawOxide,
  id: "ib-v1-cb-draw",
  prompt:
    "Two sodium atoms form Na₂O with one oxygen atom. Construct the resulting oxide ion's outer-electron diagram, showing origins, charge and brackets.",
  purpose: "Reserved independent construction from two one-electron donors.",
  explanation:
    "Six original oxygen electrons are dots; the two transferred electrons are crosses, one from each sodium atom. The oxide ion is bracketed with charge 2− and has eight outer electrons.",
});
for (const t of [
  ...ionicBondingJourney.guided,
  ...ionicBondingJourney.practice,
])
  t.followUp = t.drawDotCross
    ? "ib-v1-r-origin"
    : t.id.includes("origin") || t.id.includes("brackets")
      ? "ib-v1-r-origin"
      : t.id.includes("formula") ||
          t.id.includes("group") ||
          t.id.includes("given") ||
          t.id.includes("distribution") ||
          t.id.includes("na2o") ||
          t.id.includes("mgcl")
        ? "ib-v1-r-ratio"
        : t.id.includes("neon")
          ? "ib-v1-r-core"
          : t.id.includes("pairs") || t.id.includes("explain")
            ? "ib-v1-r-bond"
            : "ib-v1-r-sign";

for (const task of [
  ...ionicBondingJourney.practice,
  ...ionicBondingJourney.checkForms.flat(),
])
  if (task.unit === "electrons" || task.unit === "cross") task.tolerance = 0;

const practiceTitles: Record<string, string> = {
  "p-direction": "Explain the transfer",
  "p-electrons": "Count chloride electrons",
  "p-distribution": "Check the distribution",
  "p-origin": "Check the electron origins",
  "p-brackets": "Complete the ion notation",
  "p-draw-chloride": "Draw a chloride ion",
  "p-draw-oxide": "Draw an oxide ion",
  "p-group": "Balance Group 1 and 6 charges",
  "p-formula": "Deduce calcium fluoride",
  "p-given": "Use supplied ion charges",
  "p-neon": "Compare sodium and neon",
  "p-pairs": "Interpret the formula ratio",
  "p-names": "Name the negative ion",
  "p-explain": "Explain magnesium oxide",
};
for (const task of ionicBondingJourney.practice)
  task.title = practiceTitles[task.id.replace("ib-v1-", "")];

extendIonicBondingWriting(ionicBondingJourney);
