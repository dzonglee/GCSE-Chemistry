import type { LearningTask, LessonJourney } from "../types";
import { choice as c, number as n } from "./helpers";
import { extendGroupSevenWriting } from "./group-seven-writing";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  c(
    `g7-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Halogen reasoning: ${id}.`,
  );
const molecule = q(
  "g-molecule",
  "Which formula represents an elemental chlorine molecule?",
  "Cl₂",
  {
    Cl: "This represents one atom, not the usual elemental molecule.",
    "Cl⁻": "This is a chloride ion, not a neutral chlorine molecule.",
  },
  "Elemental chlorine contains neutral pairs of atoms: Cl₂. The subscript counts atoms; the minus superscript on Cl⁻ shows ion charge.",
  "Repair the particle representation: two identical bonded atoms.",
);
molecule.title = "Build a halogen molecule";
molecule.openingHint = true;
molecule.model = {
  kind: "halogen-particle",
  halogen: "chlorine",
  initial: "atom",
  target: "molecule",
  instruction: "Compare one atom, a molecule and a halide ion.",
};
const phase = q(
  "g-phase",
  "Use the supplied transition values. What is iodine's state at 150 °C?",
  "Liquid",
  {
    Solid: "150 °C is above the supplied melting point 114 °C.",
    Gas: "150 °C is below the supplied boiling point 184 °C.",
  },
  "114 <150 <184: iodine is liquid using the supplied rounded data. It is a solid at room temperature, but that state does not apply at every temperature. The I₂ molecules remain intact.",
  "Set 150 °C, then compare with both transition points.",
);
phase.title = "Temperature changes the state";
phase.model = {
  kind: "halogen-phase",
  halogen: "iodine",
  initialTemperature: 20,
  targetTemperature: 150,
  instruction: "Set 150 °C and read the melting/boiling bounds.",
};
const displace = q(
  "g-displace",
  "Chlorine is added to aqueous bromide ions. Which new neutral species forms?",
  "Br₂",
  {
    "Br⁻":
      "These are the original bromide ions, not the displaced neutral molecule.",
    "Sodium metal":
      "The metal counter-ion is a spectator, not a metal product.",
  },
  "Chlorine is more reactive than bromine: Cl₂ +2Br⁻ →2Cl⁻ +Br₂. Bromine molecules form; sodium/potassium ions remain spectators.",
  "Predict a displacement, then compare the before/after species.",
);
displace.title = "Test displacement";
displace.model = {
  kind: "halogen-displacement",
  initial: ["chlorine", "bromide", "none"],
  target: ["chlorine", "bromide"],
  instruction: "Compare chlorine with bromide ions.",
};
const none = q(
  "g-none",
  "Iodine is added to aqueous chloride ions. What net displacement occurs?",
  "None: iodine is less reactive than chlorine",
  {
    "Iodine displaces chlorine":
      "A less reactive halogen does not displace a more reactive one.",
    "The chloride ions become sodium atoms":
      "The metal counter-ion is not produced as a metal.",
  },
  "I₂ cannot displace chlorine from chloride solution. The original iodine and chloride species remain. Brown iodine solution can remain brown without a displacement.",
  "Compare the added halogen with the halogen represented by the halide.",
);
none.title = "Test no displacement";
none.model = {
  kind: "halogen-displacement",
  initial: ["iodine", "chloride", "reaction"],
  target: ["iodine", "chloride"],
  instruction: "Compare iodine with chloride ions.",
};
const written: LearningTask = {
  id: "g7-v1-p-explain",
  title: "Explain the opposite trend",
  prompt:
    "Explain why iodine is less reactive than chlorine even though both have seven outer electrons.",
  answer:
    "Iodine has more occupied shells, so an incoming electron is farther from the nucleus and more shielded by inner electrons. The attraction to that incoming electron is weaker overall, making electron gain harder. Halogens react by gaining electrons, so iodine is less reactive than chlorine.",
  explanation:
    "Both have seven outer electrons, but iodine has greater distance and shielding. Weaker overall attraction makes gaining an electron harder; this is the opposite electron process from Group 1 loss.",
  hint: "Connect occupied shells → attraction to an incoming electron → ease of gain → reactivity.",
  purpose:
    "Requires the full Group 7 causal chain instead of repeating the Group 1 loss rule.",
  rubric: [
    "Both have seven outer electrons; iodine has more occupied shells, greater distance and more shielding.",
    "Attraction to an incoming electron is weaker overall in iodine.",
    "Gaining an electron is harder, so reactivity decreases; do not describe losing the outer electron as the halogen mechanism.",
  ],
};
export const groupSevenJourney: LessonJourney = {
  version: 1,
  introduction:
    "Distinguish halogen molecules from halide ions, predict state at a supplied temperature, and test displacement against chemical evidence. Physical boiling-point trends and electron-gain reactivity trends describe different changes.",
  outcomes: [
    "Identify diatomic halogens, room-temperature colours/states and temperature-dependent states from supplied values.",
    "Predict displacement and no-displacement outcomes, keeping halogen molecules, halide ions and spectator metal ions distinct.",
    "Explain decreasing reactivity through harder electron gain; describe selected ionic metal halides, molecular hydrogen halides and chlorine-test evidence.",
  ],
  scopeNote:
    "AQA Chemistry 4.1.2.6/Trilogy 5.1.2.6, with bounded Pearson 6.6–6.13 comparison. Models cover chlorine/bromine/iodine; A supplied name/symbol reference includes the wider group; astatine molecule/state items are pattern-based predictions, and no tennessine reaction/state claim is made. Rounded phase data are a cited secondary teaching reference, not official measurements. Formal redox half-equations and detailed bonding are follow-ons; practical work here is evidence interpretation, not an experiment procedure.",
  warmup: [
    q(
      "w-outer",
      "For a neutral atom with arrangement 2,8,7, how many outer electrons are present?",
      "Seven",
      {
        Three: "Three is the occupied-shell count.",
        Seventeen: "Seventeen is the total electron count.",
      },
      "The final occupied shell contains seven electrons.",
      "Read the final entry.",
    ),
    q(
      "w-charge",
      "A neutral atom gains one electron with its nucleus unchanged. What is its charge?",
      "1−",
      {
        "1+": "Electron loss, not gain, gives positive charge.",
        "7−": "Only one electron is gained; group number is not ion charge.",
      },
      "One additional negative electron gives charge −1.",
      "Count the charge added, not the original outer electrons.",
    ),
  ],
  refresher: [
    q(
      "r-species",
      "Which description distinguishes Cl₂ from Cl⁻?",
      "Cl₂ is a neutral two-atom molecule; Cl⁻ is a single chloride ion",
      {
        "Both are identical neutral molecules":
          "The atom count and charge differ.",
        "The2 means two negative charges":
          "A subscript counts atoms; a superscript shows charge.",
      },
      "A formula's subscript and charge superscript communicate different quantities. Bromine/iodine follow the same diatomic/halide distinction.",
      "Read the positions of the number and charge sign.",
    ),
    q(
      "r-state",
      "Using supplied melting114 °C and boiling184 °C, what is iodine at 150 °C?",
      "Liquid",
      {
        "Solid because iodine is always solid":
          "Room state is not a universal state.",
        "Gas because150 exceeds room temperature":
          "It is still below the supplied boiling point.",
      },
      "Between melting and boiling the substance is liquid. Physical state changes do not break I₂ into isolated atoms.",
      "Compare with both thresholds.",
    ),
    q(
      "r-displace",
      "What determines whether a halogen displaces another from an aqueous halide?",
      "The added halogen must be more reactive",
      {
        "The metal counter-ion must become a metal":
          "The counter-ion is a spectator.",
        "Any visible colour proves displacement":
          "An added coloured halogen can retain its colour without reacting.",
      },
      "Chlorine >bromine >iodine. Compare the incoming halogen with the element represented by the halide ion.",
      "Distinguish bromine from bromide, then compare their elements.",
    ),
    q(
      "r-gain",
      "How does a halogen atom form its usual halide ion?",
      "It gains one electron to form1−",
      {
        "It loses seven electrons":
          "Halogens usually gain one in forming simple halide ions.",
        "It removes a proton": "That would change element identity.",
      },
      "Seven outer electrons need one more for a full outer shell; electron gain gives a negative ion while preserving the nucleus.",
      "Use electron gain, not the Group 1 loss mechanism.",
    ),
    q(
      "r-structure",
      "Why is gaining an electron harder down Group 7?",
      "More shells increase distance/shielding and weaken attraction to an incoming electron",
      {
        "Every lower atom has fewer protons":
          "Proton count increases down the group.",
        "The neutral atoms stop having seven outer electrons":
          "Their main-group outer count stays seven.",
      },
      "Distance and shielding reduce the overall attraction to an incoming electron despite increased nuclear charge; reactivity decreases.",
      "Link structure to attraction and ease of gain.",
    ),
    q(
      "r-compound",
      "Which comparison is correct for the selected compounds?",
      "Sodium chloride is ionic; hydrogen chloride is molecular and covalent",
      {
        "Both must be identical metal salts":
          "Hydrogen chloride is not an alkali-metal salt.",
        "Every halide of every metal is necessarily ionic":
          "Some metal halides have covalent character; this lesson uses selected ionic examples.",
      },
      "Alkali-metal halides contain positive metal and negative halide ions. Hydrogen halides are molecular; hydrogen chloride dissolves in water to give acidic hydrochloric acid.",
      "Use the supplied metal and non-metal examples rather than an absolute rule.",
    ),
    q(
      "r-colour",
      "Which iodine appearance is appropriate in these aqueous displacement examples?",
      "Brown solution",
      {
        "Purple always, regardless of physical state or solvent":
          "Purple describes iodine vapour or certain organic-solvent solutions, not this aqueous example.",
        "Grey-black gas": "Grey-black describes the room-temperature solid.",
      },
      "Room iodine is grey-black solid, vapour purple, aqueous iodine brown. Appearance depends on state, solvent and concentration.",
      "Keep the conditions attached to the colour.",
    ),
    q(
      "r-bleach",
      "What is the standard positive chlorine-test result using damp litmus?",
      "It is bleached white",
      {
        "It turns red only":
          "Red alone can indicate acidity; bleaching white is the stated chlorine result.",
        "It remains unchanged": "That is not a positive result.",
      },
      "The reviewed GCSE test uses damp litmus and bleaching white. Interpret a supplied result; do not treat red-only acidity as sufficient chlorine evidence.",
      "Retrieve bleaching rather than colour change alone.",
    ),
    q(
      "r-relative",
      "What changes when an elemental halogen is written as X₂?",
      "Its relative molecular mass is twice the relative atomic mass of X",
      {
        "Its atomic number doubles in every atom":
          "Each nucleus keeps its own proton count.",
        "Its charge must become2−": "The elemental molecule is neutral.",
      },
      "Two atoms contribute to the molecular total. The subscript changes atom count, not individual atomic identity or charge.",
      "Add the masses of the two atoms.",
    ),
  ],
  guided: [molecule, phase, displace, none],
  practice: [
    {
      ...n(
        "g7-v1-p-mass",
        "Bromine has supplied relative atomic mass 80. Calculate the relative molecular mass of Br₂.",
        160,
        "",
        "Two bromine atoms give2×80=160. Relative molecular mass has no unit.",
        "Count both atoms in the formula.",
        "Independent formula-to-relative-mass calculation.",
        {
          "80": "That counts one atom, not the molecule.",
          "40": "The subscript means two atoms, not division by two.",
        },
      ),
      title: "Count the molecular mass",
    },
    q(
      "p-room",
      "Which set gives chlorine, bromine and iodine at room temperature?",
      "Yellow-green gas; red-brown liquid; grey-black solid",
      {
        "All are purple gases": "The three room states and colours differ.",
        "Grey solids; blue gases; white liquids":
          "These do not match the reviewed first-three descriptions.",
      },
      "Chlorine is yellow-green gas, bromine red-brown liquid and iodine grey-black solid. Iodine vapour is purple, not its room solid.",
      "Associate each appearance with its state and element.",
    ),
    q(
      "p-state",
      "Bromine's supplied boiling point is 59 °C. What is its state at 150 °C at the same pressure?",
      "Gas",
      {
        "Liquid because bromine is a room-temperature liquid":
          "150 is above its boiling point.",
        "Solid because halogens gain electrons":
          "Ion formation does not determine this physical state.",
      },
      "150 >59: bromine is gas using the supplied data, while Br₂ molecules remain intact.",
      "Compare the temperature with the supplied boiling point.",
    ),
    q(
      "p-negative",
      "Chlorine has supplied melting −102 °C and boiling −34 °C. What is its state at−60 °C?",
      "Liquid",
      {
        "Solid because the temperature is negative": "−60 is above−102.",
        "Gas because chlorine is always gas": "−60 is below−34.",
      },
      "−102 <−60 <−34, so chlorine is liquid in the supplied interval. A negative Celsius value does not imply a solid.",
      "Place all three signed temperatures in order.",
    ),
    q(
      "p-iodide",
      "Chlorine is added to aqueous iodide ions. What neutral halogen is formed?",
      "I₂",
      {
        "I⁻": "Iodide ions are the original species, not the released molecule.",
        "Cl⁻ only, with no iodine molecule":
          "The iodide ions also form iodine molecules when chlorine is reduced.",
      },
      "Chlorine is more reactive than iodine: Cl₂ +2I⁻ →2Cl⁻ +I₂. Shown atom counts and charge are conserved.",
      "Name the neutral molecule formed from iodide.",
    ),
    q(
      "p-none",
      "Bromine is added to aqueous chloride ions. What occurs?",
      "No net displacement; bromine is less reactive than chlorine",
      {
        "Bromine displaces chlorine":
          "A less reactive halogen does not displace the more reactive one.",
        "Sodium metal is released": "The metal ions remain spectators.",
      },
      "No net displacement occurs. Orange bromine solution can remain orange, so colour alone is not proof of reaction.",
      "Compare the added halogen with chlorine, not sodium.",
    ),
    q(
      "p-salt",
      "Chlorine is added to aqueous sodium bromide. Which products describe the displacement?",
      "Sodium chloride and bromine",
      {
        "Sodium metal and chlorine":
          "The metal ion is a spectator; it does not become sodium metal.",
        "Sodium bromide with no change":
          "Chlorine is more reactive than bromine, so displacement occurs.",
      },
      "Cl₂ +2NaBr →2NaCl +Br₂. In the ionic view, Na⁺ is unchanged and the halogen/halide species undergo electron transfer.",
      "Keep sodium as a counter-ion and change the halogen species.",
    ),
    {
      ...q(
        "p-infer",
        "A, B and C label three unknown halogens in supplied observations. Which is most reactive?",
        "A",
        {
          B: "A displaces B from its halide, so A is more reactive.",
          C: "Both A and B displace C.",
        },
        "The supplied results give A>B>C. These are labels for unknown samples, not claims of new elements between named halogens.",
        "A halogen that displaces another is more reactive.",
      ),
      title: "Infer from reaction data",
      halogenResults: [
        { added: "A₂", halide: "B⁻", reaction: true },
        { added: "A₂", halide: "C⁻", reaction: true },
        { added: "B₂", halide: "C⁻", reaction: true },
        { added: "C₂", halide: "A⁻", reaction: false },
      ],
    },
    {
      ...q(
        "p-bonding",
        "NaCl, NaBr and NaI are formed with sodium; HCl, HBr and HI are formed with hydrogen. Which classification fits these selected compounds?",
        "The sodium compounds are ionic; the hydrogen compounds are molecular/covalent before dissolution",
        {
          "All six are neutral elemental halogen molecules X₂":
            "The compounds contain partner elements; the sodium salts contain ions.",
          "All six are alkaline metal hydroxides":
            "These are halides, not hydroxides; the hydrogen halides form acidic solutions in water.",
        },
        "The selected sodium halides contain Na⁺ with Cl⁻, Br⁻ or I⁻. HCl, HBr and HI have covalent molecules before dissolution. This describes selected simple compounds, not a rule that every metal halide must be purely ionic.",
        "Compare the metal partner with the non-metal hydrogen partner.",
      ),
      title: "Compare metal and hydrogen halides",
    },
    q(
      "p-acid",
      "Hydrogen iodide dissolves in water. What solution behaviour is predicted from the hydrogen-halide pattern?",
      "Acidic",
      {
        "Alkaline metal hydroxide solution":
          "Hydrogen iodide is not an alkali-metal hydroxide.",
        "No dissolved species can form":
          "The supplied pattern describes an acidic aqueous solution.",
      },
      "Hydrogen halides such as HCl, HBr and HI form acidic solutions in water. The gaseous molecular compound and the aqueous acidic solution are different contexts.",
      "Use the compound type and the stated water context.",
    ),
    q(
      "p-test",
      "Which reported damp-litmus outcome matches the standard chlorine test?",
      "Bleached white",
      {
        "Red only with no bleaching":
          "Acidity alone is not the stated positive chlorine result.",
        "Unchanged blue paper":
          "That does not provide the positive bleaching observation.",
      },
      "The chlorine test is bleaching damp litmus white. This task interprets supplied evidence, not a gas-handling procedure.",
      "Choose the distinctive stated result.",
    ),
    q(
      "p-trends",
      "Down Group 7, boiling points increase. Does this mean chemical reactivity also increases?",
      "No: boiling points increase while chemical reactivity decreases",
      {
        "Yes: every physical and chemical property must change in the same direction":
          "They describe different processes.",
        "Yes: boiling requires breaking every covalent pair into atoms":
          "Phase changes leave the diatomic molecules intact.",
      },
      "Boiling concerns forces between molecules; halogen reactivity concerns electron gain. The trends have different explanations and opposite directions.",
      "Separate physical state change from chemical electron transfer.",
    ),
    q(
      "p-unknown",
      "Melting points increase down Group 7. Iodine's supplied melting point is 114 °C and astatine lies below it. What state is predicted for astatine at 20 °C using that pattern?",
      "Solid under the supplied group trend",
      {
        "Gas because it is less reactive":
          "Lower chemical reactivity does not imply a lower melting point.",
        "Liquid because all heavier halogens are liquids":
          "The supplied trend places its predicted melting point above 114 °C, well above 20 °C.",
      },
      "The group trend predicts a melting point above iodine's 114 °C, so 20 °C is below that predicted threshold: solid. This is a pattern-based GCSE prediction, not a directly measured sample in the app.",
      "Keep melting-point prediction separate from chemical reactivity.",
    ),
    written,
  ],
  checkForms: [
    [
      {
        ...n(
          "g7-v1-ca-mass",
          "Iodine has supplied relative atomic mass 127. Calculate Mr for I₂.",
          254,
          "",
          "2×127=254, with no unit for relative molecular mass.",
          "Count both atoms.",
          "Reserved diatomic mass transfer.",
        ),
        title: "A new molecule",
      },
      q(
        "ca-state",
        "Given chlorine melting −102 °C and boiling −34 °C, predict its state at−50 °C.",
        "Liquid",
        {
          Solid: "−50 is above the melting threshold.",
          Gas: "−50 is below the boiling threshold.",
        },
        "−102 <−50 <−34 gives liquid.",
        "Order the signed values.",
      ),
      q(
        "ca-displace",
        "What happens when chlorine is added to bromide solution?",
        "Bromine molecules and chloride ions form",
        {
          "Chlorine ions gain protons and become bromine":
            "Nuclear identities are not changed.",
          "Bromine atoms gain electrons to become more negative bromide":
            "The original bromide becomes neutral bromine in this displacement.",
        },
        "Cl₂ +2Br⁻ →2Cl⁻ +Br₂.",
        "Keep neutral molecules distinct from halide ions.",
      ),
      q(
        "ca-test",
        "Damp litmus turns white in a supplied gas-test result. Which standard interpretation fits?",
        "Chlorine bleaching evidence",
        {
          "Only an alkaline solution is indicated":
            "The reviewed chlorine test is bleaching white.",
          "The result proves every gas has reacted identically":
            "The test has a specific reported interpretation.",
        },
        "Bleaching damp litmus white is the stated chlorine-test outcome.",
        "Use the reported positive result.",
      ),
      {
        ...q(
          "ca-infer",
          "Which unknown halogen is most reactive: P, Q or R?",
          "Q",
          {
            P: "R displaces P, so P is less reactive than R.",
            R: "Q displaces R, so Q is more reactive.",
          },
          "Q displaces R and R displaces P: Q>R>P. The table is experimental evidence, not a recalled order of named elements.",
          "Use each observed displacement to compare the two elements.",
        ),
        halogenResults: [
          { added: "R₂", halide: "P⁻", reaction: true },
          { added: "Q₂", halide: "R⁻", reaction: true },
          { added: "P₂", halide: "Q⁻", reaction: false },
        ],
      },
    ],
    [
      q(
        "cb-unknown",
        "Using the GCSE diatomic-group pattern, what molecular formula would be predicted for a halogen with symbol At?",
        "At₂",
        {
          "At⁻": "That denotes a halide ion, not an elemental molecule.",
          "At₂⁻": "The usual elemental diatomic prediction is neutral.",
        },
        "The group pattern predicts two bonded atoms: At₂. This is a supplied-model prediction, not a claim of a directly measured sample here.",
        "Use the elemental molecule pattern.",
      ),
      q(
        "cb-none",
        "Iodine is added to aqueous bromide ions. Which prediction follows the order chlorine>bromine>iodine?",
        "No net displacement",
        {
          "Bromine is displaced because iodine is below it":
            "Reactivity decreases down the group.",
          "The spectator metal becomes neutral atoms":
            "The counter-ion does not form a metal.",
        },
        "Iodine is less reactive than bromine and does not displace it.",
        "Compare the element represented by the halide.",
      ),
      q(
        "cb-compound",
        "Which description fits hydrogen chloride before and after dissolving in water?",
        "A molecular gas that forms an acidic aqueous solution",
        {
          "An alkali-metal hydroxide in both contexts":
            "HCl is not a metal hydroxide.",
          "A metallic solid that becomes alkaline":
            "That does not describe hydrogen chloride.",
        },
        "HCl is molecular/covalent before dissolution and forms hydrochloric acid in water.",
        "Keep the physical/solvent context attached.",
      ),
      q(
        "cb-structure",
        "Why does iodine gain an incoming electron less readily than chlorine?",
        "Greater distance/shielding weakens the overall attraction",
        {
          "Iodine has no positive nucleus":
            "Its nucleus remains positively charged.",
          "Iodine has only one outer electron":
            "Neutral halogens have seven outer electrons.",
        },
        "More occupied shells increase distance and shielding; electron gain becomes harder despite increased nuclear charge.",
        "Use the complete structural explanation.",
      ),
      {
        ...q(
          "cb-infer",
          "Which unknown halogen is least reactive: M, N or L?",
          "L",
          {
            M: "M displaces N and is above N in reactivity.",
            N: "N displaces L, so L is less reactive.",
          },
          "M>N>L, so L is least reactive. Lack of displacement is interpreted with the positive comparisons.",
          "Identify which halogen can be displaced by the others.",
        ),
        halogenResults: [
          { added: "M₂", halide: "N⁻", reaction: true },
          { added: "N₂", halide: "L⁻", reaction: true },
          { added: "L₂", halide: "M⁻", reaction: false },
        ],
      },
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-molecule",
        "What does Br₂ represent?",
        "A neutral molecule containing two bromine atoms",
        {
          "A bromide ion with charge2−":
            "The2 subscript counts atoms, not charge.",
          "Two positively charged nuclei with no electrons anywhere":
            "The neutral molecule contains electrons.",
        },
        "Bromine is diatomic in its elemental molecular form.",
        "Read subscript and charge separately.",
      ),
      q(
        "ra-ion",
        "Which formula represents a single iodide ion?",
        "I⁻",
        {
          "I₂": "That represents an elemental iodine molecule.",
          "I₂⁺": "That is not the usual single iodide ion.",
        },
        "Iodide is a one-atom negative ion formed by electron gain.",
        "Retrieve the halide charge.",
      ),
      q(
        "ra-none",
        "Can an orange solution by itself prove bromine displaced chlorine from chloride?",
        "No: added bromine is coloured even when no displacement occurs",
        {
          "Yes: any colour proves displacement":
            "Colour must be compared with the initial species and references.",
          "Yes: chloride ions must turn into sodium metal":
            "The metal counter-ion is a spectator.",
        },
        "Bromine cannot displace chlorine; an added colour can remain without reaction.",
        "Consider the starting halogen's colour.",
      ),
    ],
    [
      q(
        "rb-state",
        "Iodine has supplied boiling point 184 °C. At 200 °C, which description fits?",
        "Gas containing intact I₂ molecules",
        {
          "Liquid containing only separate iodine atoms":
            "200 is above the supplied boiling point; phase change does not split the pairs.",
          "Solid because room-temperature iodine is solid":
            "Room state is not universal.",
        },
        "200 >184 gives gas in the supplied data, with diatomic molecules intact.",
        "Separate boiling from chemical bond breaking.",
      ),
      q(
        "rb-gain",
        "A halogen atom gains one electron. What charge does its simple ion have?",
        "1−",
        {
          "1+": "Gain of negative charge gives a negative ion.",
          "7−": "One electron gained means one extra negative charge.",
        },
        "Halide formation gives charge −1 without changing the nucleus.",
        "Count the electron gained.",
      ),
      q(
        "rb-trends",
        "Which pair describes typical down-group halogen trends?",
        "Higher boiling point; lower chemical reactivity",
        {
          "Lower boiling point; higher chemical reactivity":
            "These directions are reversed.",
          "Every halogen becomes an alkali metal":
            "Group identity does not change.",
        },
        "Physical boiling-point and chemical electron-gain trends describe different properties.",
        "Retrieve the distinct directions.",
      ),
    ],
  ],
};
for (const task of [...groupSevenJourney.guided, ...groupSevenJourney.practice])
  task.followUp = task.id.includes("mass")
    ? "g7-v1-r-relative"
    : task.id.includes("phase") ||
        task.id.includes("state") ||
        task.id.includes("negative")
      ? "g7-v1-r-state"
      : task.id.includes("molecule")
        ? "g7-v1-r-species"
        : task.id.includes("room")
          ? "g7-v1-r-colour"
          : task.id.includes("test")
            ? "g7-v1-r-bleach"
            : task.id.includes("bonding") || task.id.includes("acid")
              ? "g7-v1-r-compound"
              : task.id.includes("explain") || task.id.includes("trends")
                ? "g7-v1-r-structure"
                : "g7-v1-r-displace";
extendGroupSevenWriting(groupSevenJourney);
