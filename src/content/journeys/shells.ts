import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";

const place = (
  atomicNumber: number,
  initial: [number, number, number, number],
  instruction: string,
): TaskModel => ({ kind: "shell-place", atomicNumber, initial, instruction });
const arrangement = (
  id: string,
  prompt: string,
  counts: number[],
  explanation: string,
  hint: string,
  purpose: string,
  extras: Partial<LearningTask> = {},
): LearningTask => ({
  id,
  prompt,
  answer: counts.join(","),
  arrangement: counts,
  explanation,
  hint,
  purpose,
  ...extras,
});
const position = (
  id: string,
  prompt: string,
  group: number,
  period: number,
  diagram: number[],
  purpose: string,
): LearningTask => ({
  ...n(
    id,
    prompt,
    0,
    "",
    `There are ${period} occupied shells, so period ${period}. The outer shell has ${group} electrons, so GCSE Group ${group}.`,
    "Period counts occupied shells; for Groups 1–7, group counts outer-shell electrons.",
    purpose,
  ),
  shellDiagram: diagram,
  partLegend: "Complete the periodic-table position",
  parts: [
    { id: "group", label: "GCSE group", answer: group },
    { id: "period", label: "Period", answer: period },
  ],
  answer: JSON.stringify({ group: String(group), period: String(period) }),
});

export const shellJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build a shell diagram, write its counts from inner to outer, then connect occupied shells and outer electrons to the periodic table. Correct totals alone are not enough: electrons occupy the lowest available levels first.",
  outcomes: [
    "Construct and read ground-state electron arrangements for neutral atoms of the first 20 elements, using diagrams and numerical notation.",
    "Diagnose a correct electron total in the wrong shells, and explain the lowest-available-energy-level rule.",
    "Distinguish period from GCSE Group 1–7, and recognise full outer shells including helium's two-electron shell.",
  ],
  scopeNote:
    "This first-20-elements model is not a universal 2,8,8 shell-capacity rule. Detailed subshells and transition-metal arrangements are outside this lesson. Ionic electron transfer and bonding need their own lessons. GCSE Group 0 is also called Group 18; GCSE Groups 3–7 correspond to modern Groups 13–17.",
  warmup: [
    n(
      "sh-v1-w-neutral",
      "A neutral fluorine atom has atomic number 9. How many electrons must its completed shell diagram show?",
      9,
      "electrons",
      "Nine protons require nine electrons for zero overall charge.",
      "For a neutral atom, use the proton number.",
      "Retrieves neutrality before electron placement.",
      { "19": "Mass number would count nuclear particles, not electrons." },
    ),
    {
      ...n(
        "sh-v1-w-read",
        "How many electrons are shown in this neutral atom's diagram?",
        5,
        "electrons",
        "Two in shell 1 plus three in shell 2 gives five electrons.",
        "Count the purple dots in both occupied shells.",
        "Checks diagram counting without providing numerical notation.",
      ),
      shellDiagram: [2, 3],
    },
    c(
      "sh-v1-w-order",
      "Which available shell do electrons fill first in a ground-state atom?",
      "The innermost available shell",
      {
        "The outermost shell":
          "Outer shells are used after lower available levels.",
        "Any shell, as long as the total is right":
          "The total and distribution must both be right.",
      },
      "Electrons occupy the lowest available energy levels first.",
      "Compare lower and higher energy levels.",
      "Retrieves the ordering rule before constructing a diagram.",
    ),
  ],
  refresher: [
    arrangement(
      "sh-v1-r-count",
      "Build a neutral beryllium atom with atomic number 4. Write its electron arrangement.",
      [2, 2],
      "Two electrons occupy the first shell and two the second: 2,2.",
      "Place all four electrons; fill the first shell before the second.",
      "Repairs using atomic number as the electron budget.",
      {
        model: place(
          4,
          [0, 0, 0, 0],
          "Place beryllium's four electrons; then write the occupied-shell counts.",
        ),
      },
    ),
    arrangement(
      "sh-v1-r-fill",
      "This lithium construction has three electrons but puts them in shells as 1,2. Correct it and write the arrangement.",
      [2, 1],
      "Move one electron from the second shell into the first. The total remains three; the ground-state arrangement is 2,1.",
      "The first shell has room for a second electron before the second shell is used.",
      "Repairs a correct total with incorrect inner-shell filling.",
      {
        model: place(
          3,
          [1, 2, 0, 0],
          "Remove one electron from shell 2 and place it in shell 1.",
        ),
        misconceptions: {
          "1,2":
            "Three is the right total, but the lowest shell is not filled first.",
        },
      },
    ),
    {
      ...c(
        "sh-v1-r-position",
        "This magnesium atom has arrangement 2,8,2. Which statement correctly separates group and period?",
        "Group 2; period 3",
        {
          "Group 3; period 2":
            "Three occupied shells give period 3; two outer electrons give Group 2.",
          "Group 12; period 2":
            "Twelve is the total electron count, not the group.",
        },
        "Two outer-shell electrons give GCSE Group 2. Three occupied shells give period 3.",
        "Count occupied shells separately from the outer electrons.",
        "Repairs confusion between horizontal period and vertical group.",
      ),
      shellDiagram: [2, 8, 2],
    },
  ],
  guided: [
    arrangement(
      "sh-v1-g-oxygen",
      "Complete a neutral oxygen atom, atomic number 8. Write the occupied-shell electron counts.",
      [2, 6],
      "Eight electrons occupy the shells as 2,6. The first two use the lowest level; the remaining six occupy the second.",
      "Fill the first shell with two electrons. Place the remaining electrons in the next lowest available shell.",
      "Connects deliberate placement to both diagram and numerical representation.",
      {
        title: "Build oxygen’s shells",
        openingHint: true,
        model: place(
          8,
          [0, 0, 0, 0],
          "Place oxygen's eight electrons, filling lower levels first.",
        ),
        misconceptions: {
          "2,8": "That is ten electrons; oxygen needs eight.",
          "2,5,1":
            "The second level has available space before the third is used.",
        },
      },
    ),
    arrangement(
      "sh-v1-g-sodium",
      "Sodium has atomic number 11. The first ten electrons are placed. Complete the diagram and write its arrangement.",
      [2, 8, 1],
      "The first two shells contain ten electrons. The eleventh goes in shell 3: 2,8,1.",
      "The first and second shells are full in this model. Place the remaining electron in the next shell.",
      "Crosses the second-to-third-shell boundary with faded support.",
      {
        title: "Where does the eleventh electron go?",
        model: place(
          11,
          [2, 8, 0, 0],
          "Complete neutral sodium without moving the ten correctly placed electrons.",
        ),
        misconceptions: {
          "2,9":
            "The second shell holds eight in this model; the eleventh electron starts shell 3.",
        },
      },
    ),
    arrangement(
      "sh-v1-g-fluorine",
      "This fluorine construction has all nine electrons but the distribution is 1,8. Correct it, then write its ground-state arrangement.",
      [2, 7],
      "A correct total does not guarantee a correct distribution. Move one from shell 2 to shell 1 to get 2,7.",
      "Check the lowest available level before accepting the total.",
      "Makes wrong placement recoverable rather than auto-filling the diagram.",
      {
        title: "The total is right. Is the arrangement?",
        model: place(
          9,
          [1, 8, 0, 0],
          "Keep nine electrons overall. Remove one from shell 2, then add it to shell 1.",
        ),
        misconceptions: {
          "1,8":
            "There is still a space in the lowest level. Correct the distribution.",
        },
      },
    ),
    arrangement(
      "sh-v1-g-potassium",
      "Complete a ground-state potassium atom, atomic number 19. Write its electron arrangement.",
      [2, 8, 8, 1],
      "For the first 20 neutral atoms, the nineteenth electron starts the fourth shell: 2,8,8,1. This does not mean the third shell has a universal maximum of eight.",
      "Use the first-20-elements pattern, and count only occupied shells in the final notation.",
      "Handles the fourth-shell boundary without teaching a universal eight-electron third-shell capacity.",
      {
        title: "Start a fourth occupied shell",
        model: place(
          19,
          [2, 8, 8, 0],
          "Place potassium's nineteenth electron in the first-20-elements shell model.",
        ),
        misconceptions: {
          "2,8,9":
            "This is not the ground-state GCSE arrangement for potassium; its nineteenth electron starts shell 4.",
        },
      },
    ),
  ],
  practice: [
    arrangement(
      "sh-v1-p-helium",
      "Helium has atomic number 2. Construct its numerical arrangement and diagram.",
      [2],
      "Helium has one occupied shell with two electrons. Its outer shell is full; it does not need eight.",
      "The first shell is full at two electrons.",
      "Checks the helium exception and drawing from counts.",
      {
        drawArrangement: true,
        misconceptions: {
          "2,8": "That adds eight electrons helium does not have.",
          "1,1": "Fill the lowest level before using another.",
        },
      },
    ),
    arrangement(
      "sh-v1-p-hydrogen",
      "Hydrogen has atomic number 1. Write its arrangement and use your answer diagram to check the dot count.",
      [1],
      "One proton in a neutral atom requires one electron in the first shell.",
      "Use one occupied shell and one electron.",
      "Transfers diagram construction to the smallest atom.",
      { drawArrangement: true },
    ),
    arrangement(
      "sh-v1-p-carbon",
      "Carbon has atomic number 6. Build its arrangement as numbers and a diagram without the guided workbench.",
      [2, 4],
      "Six electrons give 2,4. The diagram must show two in the first shell and four in the second.",
      "Fill the first shell, then place the remainder in the second.",
      "Requires independent diagram construction from atomic number.",
      {
        drawArrangement: true,
        model: place(
          6,
          [0, 0, 0, 0],
          "Use this support only if needed: place carbon's six electrons.",
        ),
      },
    ),
    arrangement(
      "sh-v1-p-sulfur",
      "Write the numerical electron arrangement shown in this sulfur diagram.",
      [2, 8, 6],
      "The inner-to-outer counts are two, eight and six: 2,8,6.",
      "Count each ring's dots separately, starting at the nucleus.",
      "Reads an original three-shell diagram rather than recalling a name.",
      { shellDiagram: [2, 8, 6] },
    ),
    {
      ...n(
        "sh-v1-p-aluminium",
        "Use the diagram to identify aluminium's GCSE group number.",
        3,
        "",
        "Three outer-shell electrons place aluminium in GCSE Group 3 (modern Group 13). The total is thirteen, not the GCSE group number.",
        "For GCSE Groups 1–7, count outer-shell electrons.",
        "Distinguishes total electrons from group and makes the naming convention explicit.",
        {
          "13": "Thirteen is the modern group label and the atomic number here; this question asks for GCSE Group 1–7 notation.",
        },
      ),
      shellDiagram: [2, 8, 3],
    },
    arrangement(
      "sh-v1-p-calcium",
      "Calcium has atomic number 20. Write its ground-state arrangement and construct the corresponding diagram.",
      [2, 8, 8, 2],
      "Twenty electrons are arranged 2,8,8,2, occupying four shells.",
      "Use the first-20-elements pattern; the final two occupy shell 4.",
      "Transfers fourth-shell construction to the upper boundary of the model.",
      { drawArrangement: true },
    ),
    {
      ...c(
        "sh-v1-p-nitrogen",
        "A proposed nitrogen arrangement is 2,4,1. It contains seven electrons. Why is it not the ground-state arrangement?",
        "The second shell has available space before the third is used",
        {
          "Nitrogen must have eight electrons":
            "Neutral nitrogen has seven, from its atomic number.",
          "The first shell needs eight electrons":
            "The first shell holds two, not eight.",
        },
        "The total is seven, but the second level has available space. The ground-state arrangement is 2,5.",
        "A correct total must also follow the lowest-available-level rule.",
        "Diagnoses shell order without changing the correct electron budget.",
      ),
      shellDiagram: [2, 4, 1],
    },
    {
      ...c(
        "sh-v1-p-neon",
        "Which explanation connects this neon arrangement to its very low reactivity?",
        "Its outer shell is full, so it does not readily gain, lose or share electrons",
        {
          "It has no electrons": "The diagram shows ten electrons.",
          "Its nucleus has no charge":
            "The nucleus contains positive protons; neutrality concerns the whole atom.",
        },
        "Neon has arrangement 2,8 and a full outer shell, so it does not readily gain, lose or share electrons.",
        "Look at the completeness of the outer shell, then connect that to electron transfer or sharing.",
        "Links stable arrangement to chemical behaviour rather than a bare label.",
      ),
      shellDiagram: [2, 8],
    },
    {
      ...n(
        "sh-v1-p-phosphorus",
        "This diagram represents a neutral atom. What is its atomic number?",
        15,
        "",
        "2 + 8 + 5 = 15 electrons. Neutrality means fifteen protons, so atomic number fifteen.",
        "Add the electron counts, then use neutrality.",
        "Inverts a diagram into atomic number using two reasoning steps.",
      ),
      shellDiagram: [2, 8, 5],
    },
    {
      ...n(
        "sh-v1-p-explanation",
        "A student says: 'Boron has two occupied shells, so it is in Group 2.' Explain the error and give its GCSE group and period.",
        0,
        "",
        "Boron is 2,3. Two occupied shells mean period 2; three outer electrons mean GCSE Group 3.",
        "Separate the evidence for period from the evidence for group.",
        "Requires a written correction of a plausible group/period misconception.",
      ),
      shellDiagram: [2, 3],
      answer:
        "Two occupied shells mean period 2. Three outer electrons mean GCSE Group 3.",
      rubric: [
        "Two occupied shells establish period 2, not Group 2.",
        "The outer shell contains three electrons, establishing GCSE Group 3.",
        "Group and period use different features of the arrangement.",
      ],
    },
  ],
  checkForms: [
    [
      arrangement(
        "sh-v1-ca-beryllium",
        "A neutral atom has atomic number 4. Write its ground-state electron arrangement and diagram.",
        [2, 2],
        "Four electrons are arranged 2,2.",
        "Use the lowest available levels first.",
        "Reserved construction from atomic number.",
        { drawArrangement: true, exposureAliases: ["sh-v1-r-count"] },
      ),
      arrangement(
        "sh-v1-ca-chlorine",
        "Write the occupied-shell arrangement shown in this neutral atom's diagram.",
        [2, 8, 7],
        "The inner-to-outer counts are 2,8,7.",
        "Count each occupied ring from the nucleus outward.",
        "Reserved three-shell diagram interpretation.",
        { shellDiagram: [2, 8, 7] },
      ),
      position(
        "sh-v1-ca-magnesium",
        "Use this diagram to give the atom's GCSE group and period.",
        2,
        3,
        [2, 8, 2],
        "Reserved distinction between outer electrons and occupied shells.",
      ),
      {
        ...c(
          "sh-v1-ca-argon",
          "Why does this argon atom not readily form chemical bonds?",
          "Its full outer shell gives a stable arrangement, so it does not readily gain, lose or share electrons",
          {
            "Its atoms have no outer electrons":
              "The outer shell contains eight electrons.",
            "Its neutrons prevent electron transfer":
              "Neutrons do not explain this outer-shell stability.",
          },
          "A full outer shell gives a stable arrangement. Argon does not readily transfer or share electrons.",
          "Connect the outer arrangement to electron transfer and sharing.",
          "Reserved causal chemical explanation.",
        ),
        shellDiagram: [2, 8, 8],
      },
    ],
    [
      arrangement(
        "sh-v1-cb-lithium",
        "An atom has three protons and no overall charge. Write its ground-state arrangement and diagram.",
        [2, 1],
        "Neutrality requires three electrons, arranged 2,1.",
        "Use neutrality, then fill the lower shell first.",
        "Alternate reserved construction with neutrality as a prerequisite.",
        { drawArrangement: true },
      ),
      arrangement(
        "sh-v1-cb-silicon",
        "Convert this atom's electron diagram into numerical notation.",
        [2, 8, 4],
        "The shell counts from inner to outer are 2,8,4.",
        "Use one number per occupied shell.",
        "Alternate reserved diagram-to-number representation.",
        { shellDiagram: [2, 8, 4] },
      ),
      position(
        "sh-v1-cb-sodium",
        "Identify the GCSE group and period from this diagram.",
        1,
        3,
        [2, 8, 1],
        "Alternate reserved position reasoning from a diagram.",
      ),
      {
        ...n(
          "sh-v1-cb-calcium",
          "This is a completed neutral atom. What atomic number does its diagram imply?",
          20,
          "",
          "2 + 8 + 8 + 2 = 20 electrons, so twenty protons and atomic number twenty.",
          "Count electrons and use neutrality.",
          "Alternate reserved inverse atomic-number reasoning.",
        ),
        shellDiagram: [2, 8, 8, 2],
      },
    ],
  ],
  reviewForms: [
    [
      arrangement(
        "sh-v1-ra-hydrogen",
        "A neutral atom has one proton. Reconstruct its occupied-shell notation and diagram.",
        [1],
        "One electron occupies the first shell.",
        "Use one electron to balance the proton.",
        "Delayed retrieval of the simplest independent construction.",
        { drawArrangement: true, exposureAliases: ["sh-v1-p-hydrogen"] },
      ),
      {
        ...n(
          "sh-v1-ra-oxygen",
          "Infer the atomic number of the neutral atom in this diagram.",
          8,
          "",
          "Two plus six gives eight electrons, hence eight protons.",
          "Count electrons and use neutrality.",
          "Delayed inverse diagram interpretation.",
        ),
        shellDiagram: [2, 6],
      },
      {
        ...n(
          "sh-v1-ra-argon",
          "Which period contains the atom represented here?",
          3,
          "",
          "Three occupied shells give period 3. Eight outer electrons do not mean period 8.",
          "Count occupied shells, not outer electrons.",
          "Delayed separation of period from outer-shell count.",
        ),
        shellDiagram: [2, 8, 8],
      },
    ],
    [
      arrangement(
        "sh-v1-rb-helium",
        "A neutral atom has two protons. Reconstruct its shell arrangement and diagram.",
        [2],
        "Two electrons fill the first shell; there is no occupied second shell.",
        "The first shell fills at two.",
        "Alternate delayed construction and helium boundary.",
        { drawArrangement: true, exposureAliases: ["sh-v1-p-helium"] },
      ),
      {
        ...n(
          "sh-v1-rb-sodium",
          "What atomic number follows from this neutral-atom diagram?",
          11,
          "",
          "2 + 8 + 1 = 11 electrons, equal to the proton number.",
          "Add the electron counts and use neutrality.",
          "Alternate delayed inverse reasoning.",
        ),
        shellDiagram: [2, 8, 1],
      },
      position(
        "sh-v1-rb-phosphorus",
        "Give the GCSE group and period for this diagram.",
        5,
        3,
        [2, 8, 5],
        "Alternate delayed retrieval of both periodic-position features.",
      ),
    ],
  ],
};
for (const task of [...shellJourney.guided, ...shellJourney.practice]) {
  task.followUp =
    task.id.includes("position") ||
    task.id.includes("aluminium") ||
    task.id.includes("explanation")
      ? "sh-v1-r-position"
      : task.id.includes("fluorine") || task.id.includes("nitrogen")
        ? "sh-v1-r-fill"
        : "sh-v1-r-count";
}
