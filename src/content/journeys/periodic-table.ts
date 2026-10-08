import { extendPeriodicPositionWriting } from "./periodic-position-writing";
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";
const place = (atomicNumber: number, initial: [number, number]): TaskModel => ({
  kind: "periodic-place",
  atomicNumber,
  initial,
  instruction:
    "Choose the group and period from the supplied electron arrangement.",
});
const position = (
  id: string,
  prompt: string,
  group: number,
  period: number,
  explanation: string,
  hint: string,
  purpose: string,
  shellDiagram?: number[],
): LearningTask => ({
  id,
  prompt,
  answer: JSON.stringify({ group: String(group), period: String(period) }),
  partLegend: "Group and period",
  parts: [
    { id: "group", label: "GCSE group", answer: group },
    { id: "period", label: "Period", answer: period },
  ],
  explanation,
  hint,
  purpose,
  shellDiagram,
});
export const periodicTableJourney: LessonJourney = {
  version: 1,
  introduction:
    "The modern table orders elements by proton number and groups similar chemistry. Use electron arrangement to place an element, then connect position with likely ion formation and physical evidence.",
  outcomes: [
    "Distinguish horizontal periods and vertical groups; use atomic number and arrangement to infer position.",
    "Explain similar main-group chemistry through outer electrons and use given group information for unfamiliar elements.",
    "Compare metal/non-metal position, physical characteristics and electron loss/gain, without treating one property or a boundary location as conclusive.",
  ],
  scopeNote:
    "The placement model covers the first 20 ground-state atoms and GCSE Groups 1–7/0, with modern numbering explained. Hydrogen is a non-metal despite its Group 1 position; boron/silicon and other boundary elements have intermediate properties. Detailed reactivity trends, bonding and historical table development have separate lessons.",
  warmup: [
    n(
      "pt-v1-w-shells",
      "For arrangement 2,8,4, how many shells are occupied?",
      3,
      "shells",
      "There are three occupied shells, so the element is in period 3.",
      "Count the entries, not their total.",
      "Retrieves the shell-count prerequisite for period.",
    ),
    n(
      "pt-v1-w-outer",
      "For arrangement 2,6, how many outer electrons are present?",
      6,
      "electrons",
      "The last occupied shell contains six electrons.",
      "Read the final occupied shell.",
      "Retrieves outer count before group inference.",
    ),
    c(
      "pt-v1-w-ion",
      "A neutral atom loses an electron while its nucleus stays unchanged. What happens to charge?",
      "It becomes positive",
      {
        "It becomes negative":
          "Losing a negative electron makes net charge more positive.",
        "It must become a new element":
          "Element identity depends on protons, not electrons.",
      },
      "The proton count exceeds the electron count after loss, so the ion is positive.",
      "Use proton charge minus electron charge.",
      "Checks the ion-formation prerequisite for metal behaviour.",
    ),
  ],
  refresher: [
    c(
      "pt-v1-r-order",
      "What fixes an element's modern periodic-table position?",
      "Its atomic number: proton count",
      {
        "Its isotope's neutron count":
          "Isotopes share one element position despite neutron differences.",
        "Relative atomic mass alone":
          "Weighted mass and proton-number order are different.",
      },
      "Modern order uses atomic/proton number. Different isotopes retain the same element identity and position.",
      "Retrieve the number that defines the element.",
      "Repairs the specific distinction between isotope-weighted mass and atomic-number order.",
    ),
    c(
      "pt-v1-r-hydrogen",
      "Why doesn't hydrogen's Group 1 location classify it as an alkali metal?",
      "Hydrogen is a non-metal with different properties from the alkali metals",
      {
        "It has no protons": "Hydrogen has one proton.",
        "All Group 1 positions must have identical physical properties":
          "Hydrogen is a non-metal exception to the alkali metals below it.",
      },
      "One electron explains its position, but hydrogen's properties differ from lithium, sodium and potassium.",
      "Use behaviour as well as a table location.",
      "Repairs the specific hydrogen/alkali-metal exception.",
    ),
    c(
      "pt-v1-r-gain",
      "A non-metal atom gains one electron. What is its resulting charge relative to the original neutral atom?",
      "1−",
      {
        "1+": "Gaining negative charge makes the ion negative.",
        "7−": "One electron gained gives one negative charge, regardless of how many outer electrons were already present.",
      },
      "Electron gain creates a negative ion; electron loss creates a positive ion. Preserve the nucleus in both cases.",
      "Use the sign of the one added electron.",
      "Repairs non-metal electron gain separately from metal electron loss.",
    ),
    c(
      "pt-v1-r-directions",
      "Which pairing names the table's directions correctly?",
      "Period: horizontal row; group: vertical column",
      {
        "Period: vertical; group: horizontal": "These have been interchanged.",
        "Both are isotope lists":
          "A group or period contains different elements.",
      },
      "Periods run across; groups run down.",
      "Distinguish rows from columns.",
      "Repairs reversed table directions.",
    ),
    position(
      "pt-v1-r-position",
      "An atom has arrangement 2,8,6. Give its GCSE group and period.",
      6,
      3,
      "Six outer electrons give Group 6; three occupied shells give period 3.",
      "Use outer count for group and occupied shells for period.",
      "Repairs group/period confusion with a new arrangement.",
    ),
    c(
      "pt-v1-r-helium",
      "Why is helium placed in Group 0 rather than Group 2?",
      "Its outer shell is full with two electrons",
      {
        "It has two occupied shells": "Helium has only one occupied shell.",
        "It is a metal that loses both electrons readily":
          "Helium is a very unreactive non-metal.",
      },
      "Group 0 is defined by a full outer shell; the first shell is full at two.",
      "Remember the first-shell exception.",
      "Repairs mechanical outer-count grouping for helium.",
    ),
    c(
      "pt-v1-r-metal",
      "Which chemical behaviour identifies a metal in the reviewed GCSE description?",
      "Formation of positive ions by electron loss",
      {
        "Always being solid":
          "Mercury is a metal that is liquid at room temperature.",
        "Formation of negative ions by electron gain":
          "That is not the typical metal-ion behaviour.",
      },
      "Metals form positive ions by losing electrons. Most elements are metals, found mainly to the left and bottom; non-metals are mainly toward the right and top. Use chemical behaviour alongside position and physical evidence.",
      "Consider the sign after losing electrons.",
      "Repairs metal classification based on a single physical feature.",
    ),
    c(
      "pt-v1-r-similar",
      "Which feature explains similar main-group reactions?",
      "Similar outer-electron arrangements",
      {
        "Equal neutron numbers":
          "Neutron counts do not explain main-group chemistry.",
        "Identical atomic masses":
          "Elements in one group have different masses.",
      },
      "Chemical reactions involve outer electrons. Similar outer arrangements support similar chemistry.",
      "Focus on the electrons involved in bonding.",
      "Repairs same-group reasoning based on nuclear mass.",
    ),
    c(
      "pt-v1-r-boundary",
      "An element near the dividing boundary has mixed physical properties. How should it be classified?",
      "Use additional chemical and physical evidence; position alone may be inconclusive",
      {
        "Choose metal only because it conducts":
          "Conductivity alone has exceptions.",
        "Choose non-metal only because it is on a printed line":
          "A table boundary is a guide, not a complete experimental classification.",
      },
      "Boundary elements can have intermediate properties. Make a justified prediction from more than one piece of evidence.",
      "Separate a location clue from measured or chemical behaviour.",
      "Repairs overconfident classification near the boundary.",
    ),
  ],
  guided: [
    {
      ...position(
        "pt-v1-g-sodium",
        "Sodium has arrangement 2,8,1. Give its group and period.",
        1,
        3,
        "One outer electron gives Group 1; three occupied shells give period 3. Swapping these counts gives the wrong position.",
        "Group counts outer electrons; period counts occupied shells.",
        "Uses a deliberately wrong proposed placement that must be repaired.",
      ),
      model: place(11, [3, 1]),
      title: "Place sodium",
      openingHint: true,
    },
    {
      ...position(
        "pt-v1-g-oxygen",
        "Oxygen has arrangement 2,6. Place it in the table.",
        6,
        2,
        "Six outer electrons give Group 6; two occupied shells give period 2.",
        "Apply the same relationship to a non-metal.",
        "Transfers placement with less support and a different classification.",
      ),
      model: place(8, [2, 4]),
      title: "Place a non-metal",
    },
    {
      ...c(
        "pt-v1-g-magnesium",
        "Magnesium is in Group 2 with arrangement 2,8,2. Which ion forms when it loses the outer electrons?",
        "Mg²⁺",
        {
          "Mg²⁻": "Losing electrons makes charge positive.",
          "Mg⁺": "Both outer electrons are lost in the usual Group 2 ion.",
        },
        "Magnesium loses two outer electrons, leaving 2,8. Its twelve protons and ten electrons give charge +2.",
        "Keep the nucleus unchanged and remove the two outer electrons.",
        "Connects main-group position to typical positive ion formation.",
        {
          kind: "atom-transform",
          operation: "ion",
          initial: [12, 12, 12],
          target: [12, 12, 10],
          instruction:
            "Keep the magnesium nucleus fixed. Remove two outer electrons to form the usual ion.",
        },
      ),
      title: "Connect position to ion formation",
    },
  ],
  practice: [
    c(
      "pt-v1-p-order",
      "Which quantity sets the modern order of elements?",
      "Atomic number: number of protons",
      {
        "Relative atomic mass alone":
          "Isotope abundance means mass order can differ from proton-number order.",
        "Number of neutrons":
          "Different isotopes of one element have different neutron counts.",
      },
      "The modern table orders elements by atomic/proton number.",
      "Use the quantity that defines element identity.",
      "Independent modern-order distinction; historical development is separate.",
    ),
    position(
      "pt-v1-p-position",
      "Use the supplied electron diagram to give this atom's GCSE group and period.",
      5,
      3,
      "The diagram contains 2,8,5: Group 5, period 3.",
      "Read the outer electrons and number of occupied shells separately.",
      "Independent diagram-to-position conversion.",
      [2, 8, 5],
    ),
    n(
      "pt-v1-p-unfamiliar",
      "An unfamiliar main-group element is in GCSE Group 7, period 6. Predict its number of outer electrons.",
      7,
      "electrons",
      "Main GCSE Group 7 atoms have seven outer electrons; the period does not change that group relationship.",
      "Use the given group rather than trying to construct all its shells.",
      "Transfers beyond the first 20, as required by an actual unfamiliar-element question.",
    ),
    c(
      "pt-v1-p-hydrogen",
      "Hydrogen appears above Group 1 in many tables. Which statement is correct?",
      "It is a non-metal; that position does not make it an alkali metal",
      {
        "It is an alkali metal because every Group 1 cell is metallic":
          "Hydrogen is the important exception.",
        "It has a full outer shell with one electron":
          "The first shell is full with two.",
      },
      "Hydrogen is a non-metal with one electron, unlike the alkali metals below it. Position guides prediction but does not erase exceptions.",
      "Distinguish hydrogen from lithium, sodium and potassium.",
      "Corrects an absolute left-side/Group-1 classification rule.",
    ),
    c(
      "pt-v1-p-gain",
      "A Group 7 non-metal gains one electron in forming its usual simple ion. What is the charge?",
      "1−",
      {
        "1+": "Gaining a negative electron makes the charge negative.",
        "7−": "Group number is not the number of electrons gained.",
      },
      "Seven outer electrons need one more for a full outer shell. Gaining one gives charge −1.",
      "Count electrons gained, not electrons already present.",
      "Links group position to electron-gain reasoning without full bonding diagrams.",
    ),
    c(
      "pt-v1-p-physical",
      "Which set of properties is characteristic of many metals?",
      "Good conductivity, malleability and tendency to form positive ions",
      {
        "Always gases and always gain electrons":
          "These are not characteristic metal properties.",
        "Always brittle and never conduct":
          "Metals commonly conduct and are malleable.",
      },
      "Use a combination of physical and chemical properties. 'Many' avoids claiming every metal has identical behaviour.",
      "Combine conductivity and shape change with electron loss.",
      "Requires more than one classification characteristic.",
    ),
    c(
      "pt-v1-p-graphite",
      "Graphite is a form of non-metal carbon and conducts electricity. What does this show?",
      "Electrical conductivity alone cannot prove that an element is a metal",
      {
        "Every conductor must be a metal": "Graphite is a counterexample.",
        "Carbon must become a different element when it conducts":
          "Conductivity does not change proton number.",
      },
      "Graphite has mobile delocalised electrons despite being a form of non-metal carbon. Its structure is developed in the bonding lesson.",
      "Use the supplied counterexample to test the rule.",
      "Prevents a false universal physical-property classification.",
    ),
    {
      ...n(
        "pt-v1-p-explain",
        "Explain why sodium and potassium have similar chemical properties even though their atoms have different masses.",
        0,
        "",
        "Both are Group 1 with one outer electron and tend to lose it when reacting. Mass and occupied-shell count differ, but outer-electron similarity accounts for similar chemistry.",
        "Use outer electrons and typical electron loss; do not claim equal masses.",
        "Requires a causal same-group explanation using a specific pair.",
      ),
      answer:
        "Sodium and potassium each have one outer electron. Chemical reactions involve outer electrons, and both tend to lose that electron to form a positive ion, giving similar chemical properties despite different masses.",
      rubric: [
        "Each atom has one outer electron; both are in Group 1.",
        "Outer electrons are involved in chemical reactions; both commonly lose one to form +1 ions.",
        "Their masses and occupied-shell counts need not be equal for similar group chemistry.",
      ],
    },
    c(
      "pt-v1-p-boundary",
      "An unknown element lies near the metal/non-metal boundary and no reaction data are given. Which conclusion is best?",
      "A prediction needs qualification; obtain more evidence before a firm classification",
      {
        "It must be a metal because its radius is large":
          "A radius alone does not establish the classification.",
        "It must be a non-metal because it is drawn on the right half":
          "Boundary position can be ambiguous.",
      },
      "A justified prediction can use position, but mixed boundary properties require further chemical/physical evidence. The reviewed exam scheme accepts differently justified predictions for its boundary example.",
      "Say which evidence you have and what remains unknown.",
      "Transfers the nuanced evidence demand without copying the official boundary question.",
    ),
    n(
      "pt-v1-p-ion-count",
      "Calcium is a Group 2 metal with atomic number 20. How many electrons are in its usual 2+ ion?",
      18,
      "electrons",
      "The neutral atom has twenty electrons; losing two leaves eighteen.",
      "Form the usual Group 2 ion by electron loss.",
      "Transfers main-group ion reasoning to a fourth-period atom.",
    ),
  ],
  checkForms: [
    [
      position(
        "pt-v1-ca-position",
        "An atom has arrangement 2,8,8,1. Give its GCSE group and period.",
        1,
        4,
        "One outer electron and four occupied shells give Group 1, period 4.",
        "Separate group and period counts.",
        "Reserved fourth-period placement.",
      ),
      n(
        "pt-v1-ca-unfamiliar",
        "A main-group element in GCSE Group 6, period 5 has how many outer electrons?",
        6,
        "electrons",
        "Group 6 gives six outer electrons.",
        "Use the stated group.",
        "Reserved unfamiliar-element transfer.",
      ),
      c(
        "pt-v1-ca-metal",
        "An element commonly loses electrons to form positive ions and is malleable. Which classification is supported?",
        "Metal",
        {
          "Non-metal because it must gain electrons":
            "The supplied evidence says it loses electrons and forms positive ions.",
          "Noble gas with an already full outer shell":
            "Ready positive-ion formation and malleability do not describe a noble gas.",
        },
        "Electron loss/positive ions and malleability support metal classification.",
        "Use the chemical and physical evidence together.",
        "Reserved evidence-based classification.",
      ),
      c(
        "pt-v1-ca-similar",
        "Why do fluorine and chlorine have similar chemical properties?",
        "Both have seven outer electrons involved in reactions",
        {
          "Both have equal neutron counts":
            "Their neutron counts need not match.",
          "Both have identical atomic masses":
            "They are different elements with different masses.",
        },
        "Similar outer-electron arrangements explain related chemistry.",
        "Focus on the main-group outer shell.",
        "Reserved causal group-property recognition.",
      ),
    ],
    [
      position(
        "pt-v1-cb-helium",
        "Helium has two electrons in its only shell. Give its GCSE group and period.",
        0,
        1,
        "Its full first shell puts it in Group 0; one occupied shell gives period 1.",
        "Full shell takes priority over a mechanical Group 2 guess.",
        "Alternate reserved helium exception.",
      ),
      n(
        "pt-v1-cb-ion",
        "A Group 1 atom with atomic number 19 forms its usual 1+ ion. How many electrons remain?",
        18,
        "electrons",
        "Nineteen minus one gives eighteen electrons.",
        "Apply electron loss while preserving protons.",
        "Alternate reserved position-to-ion calculation.",
      ),
      c(
        "pt-v1-cb-order",
        "Which pair of quantities remains different in the modern table?",
        "Atomic number sets element order; relative atomic mass is an isotope-weighted average",
        {
          "Atomic number and relative atomic mass always mean the same thing":
            "Proton count and average mass differ.",
          "Neutron number fixes the modern position of every isotope":
            "Isotopes of one element share a proton number and table position.",
        },
        "The modern order uses proton number, distinct from isotope-weighted relative mass.",
        "Retrieve the definitions of the two numbers.",
        "Alternate reserved nuclear/average order distinction.",
      ),
      c(
        "pt-v1-cb-exception",
        "Can conductivity by itself identify every metal and non-metal?",
        "No: a non-metal form such as graphite can also conduct",
        {
          "Yes: no non-metal can conduct": "Graphite is a counterexample.",
          "Yes: conductivity measures proton number directly":
            "It does not count nuclear protons.",
        },
        "Use multiple evidence types and recognise exceptions.",
        "Test the proposed rule against graphite.",
        "Alternate reserved physical-property limitation.",
      ),
    ],
  ],
  reviewForms: [
    [
      position(
        "pt-v1-ra-position",
        "For arrangement 2,2, give the GCSE group and period.",
        2,
        2,
        "Two outer electrons and two occupied shells give Group 2, period 2.",
        "Keep the two counts conceptually separate.",
        "Delayed placement with coincident but differently meaningful counts.",
      ),
      c(
        "pt-v1-ra-group",
        "A vertical column in the periodic table is called what?",
        "A group",
        {
          "A period": "A period is a horizontal row.",
          "An isotope":
            "Isotopes are atoms of one element, not a table column.",
        },
        "Groups run vertically; periods run horizontally.",
        "Retrieve the directions.",
        "Delayed table vocabulary.",
      ),
      c(
        "pt-v1-ra-chemical",
        "How do typical metal atoms form positive ions?",
        "They lose electrons while preserving the nucleus",
        {
          "They gain electrons": "That would make charge more negative.",
          "They remove protons": "That would change element identity.",
        },
        "Electron loss leaves more protons than electrons.",
        "Separate ion formation from nuclear change.",
        "Delayed metal-ion mechanism.",
      ),
    ],
    [
      n(
        "pt-v1-rb-unfamiliar",
        "An unfamiliar main-group element is in GCSE Group 3 and period 5. Predict its outer-electron count.",
        3,
        "electrons",
        "Group 3 indicates three outer electrons in this GCSE main-group convention.",
        "Use group, not period.",
        "Alternate delayed unfamiliar-element transfer.",
      ),
      c(
        "pt-v1-rb-hydrogen",
        "Is hydrogen an alkali metal simply because it is drawn above Group 1?",
        "No: hydrogen is a non-metal with distinct behaviour",
        {
          "Yes: location makes it identical to sodium":
            "Its properties are different.",
          "Yes: it contains no electrons": "Neutral hydrogen has one electron.",
        },
        "Hydrogen is a position/behaviour exception.",
        "Retrieve the distinction from the alkali metals.",
        "Alternate delayed exception retrieval.",
      ),
      c(
        "pt-v1-rb-similar",
        "Main-group elements with similar outer-electron arrangements generally have what in common?",
        "Similar chemical properties",
        {
          "Exactly equal atomic masses": "Their masses need not be equal.",
          "Equal occupied-shell counts in every group":
            "Elements down a group have different occupied-shell counts.",
        },
        "Outer electrons influence reactions; groups bring similar chemistry together.",
        "Connect outer arrangement and chemical behaviour.",
        "Alternate delayed causal relationship.",
      ),
    ],
  ],
};
periodicTableJourney.practice.push({
  ...c(
    "pt-v1-p-location",
    "Which pattern describes the full periodic table?",
    "Most elements are metals, mainly on the left and toward the bottom",
    {
      "Most elements are non-metals, mainly on the left":
        "Most elements are metals; non-metals are mainly toward the right and top.",
      "Every element on the left must be an alkali metal":
        "There are many kinds of metals, and hydrogen is a non-metal exception.",
    },
    "Most elements are metals. Metals occur mainly toward the left and bottom, non-metals toward the right and top. Position is a useful clue, with hydrogen and boundary exceptions.",
    "Use the general regions, while retaining the exceptions.",
    "Teaches the majority and general positional classification required by the specification.",
  ),
  title: "Read the table's regions",
});
for (const task of [
  ...periodicTableJourney.guided,
  ...periodicTableJourney.practice,
])
  task.followUp = task.id.includes("order")
    ? "pt-v1-r-order"
    : task.id.includes("hydrogen")
      ? "pt-v1-r-hydrogen"
      : task.id.includes("gain")
        ? "pt-v1-r-gain"
        : task.id.includes("graphite") || task.id.includes("boundary")
          ? "pt-v1-r-boundary"
          : task.id.includes("magnesium") ||
              task.id.includes("physical") ||
              task.id.includes("location") ||
              task.id.includes("ion-count")
            ? "pt-v1-r-metal"
            : task.id.includes("explain")
              ? "pt-v1-r-similar"
              : "pt-v1-r-position";

extendPeriodicPositionWriting(periodicTableJourney);
