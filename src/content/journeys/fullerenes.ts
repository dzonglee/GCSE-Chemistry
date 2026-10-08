import { extendFullereneWriting } from "./fullerene-writing";
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  purpose: string,
  model?: TaskModel,
) =>
  choice(
    `fu-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    purpose,
    model,
  );
const cage = q(
  "g-cage",
  "Is this carbon structure a separate molecule or an extended sheet?",
  "A discrete hollow C₆₀ molecule",
  {
    "An extended planar graphene sheet":
      "The links close into a finite hollow cage.",
    "Diamond’s network extending in every direction":
      "This structure has a complete molecular cage, not a cropped giant diamond network.",
  },
  "Buckminsterfullerene has sixty carbon atoms in a roughly spherical hollow molecule, with pentagonal and hexagonal rings joined through the cage.",
  "Rotate the whole structure and follow a selected ring.",
  "Molecular extent and ring inspection in an actual closed cage.",
  {
    kind: "fullerene-properties",
    mode: "cage",
    instruction: "Classify the whole cage. Count the selected ring.",
  },
);
cage.title = "Inspect a carbon cage";
const separation = q(
  "g-separation",
  "What remains when two C₆₀ molecules separate without reacting?",
  "Both sixty-carbon cages and their internal covalent bonds remain intact",
  {
    "All internal bonds break into free atoms":
      "That would destroy the molecules, not separate them unchanged.",
    "A strong covalent bond between the two molecules must break":
      "The model shows a between-molecule attraction, not a covalent cage link between molecules.",
  },
  "Overcome between-molecule attractions while the strong internal covalent links remain. This is not a supplied melting/sublimation measurement.",
  "Separate within-cage bonds from between-molecule interactions.",
  "Conserved whole-molecule separation with deliberate wrong force predictions.",
  {
    kind: "fullerene-properties",
    mode: "separation",
    instruction: "Predict the interaction and fate of internal bonds.",
  },
);
separation.title = "Separate intact molecules";
const carrier = q(
  "g-carrier",
  "Why could a suitable hollow fullerene support a carrier role?",
  "Its hollow cage could enclose a suitable payload, with further evidence needed",
  {
    "Its colour alone proves every drug fits":
      "Colour does not establish enclosure or molecular fit.",
    "Hollow shape guarantees all fullerenes are safe":
      "Shape alone does not prove fit, release, compatibility or safety.",
  },
  "A hollow shape can support a possible carrier application. An actual design needs appropriate size, release and compatibility evidence.",
  "Give a shape-based reason and bound what it proves.",
  "Cage/property/use reasoning without universal suitability claims.",
  {
    kind: "fullerene-properties",
    mode: "carrier",
    instruction: "Choose the useful shape and the justified inference.",
  },
);
carrier.title = "Explain a possible carrier";
const written: LearningTask = {
  id: "fu-v1-p-explain",
  title: "Explain structure and a possible use",
  prompt:
    "Describe Buckminsterfullerene’s structure, then explain a possible carrier use. State what the shape alone cannot establish.",
  answer:
    "C60 has sixty carbons in one closed roughly spherical hollow molecule, with connected pentagonal and hexagonal rings and covalent bonds. A hollow cage can potentially enclose a suitable payload. Fit, release, compatibility and safety need evidence beyond shape.",
  rubric: [
    "Sixty carbon atoms in one C₆₀ molecule.",
    "Closed roughly spherical hollow cage, with pentagonal/hexagonal rings.",
    "Covalent bonds join atoms within the molecule.",
    "Link hollow shape to potential enclosure/carriage of a suitable payload.",
    "Do not infer universal fit, release, compatibility or safety from shape.",
  ],
  explanation:
    "Structure and possible use need a causal link, with an appropriate limit on the inference.",
  hint: "Formula → cage/rings → hollow shape → possible enclosure → evidence needed.",
  purpose: "Written structure/property/use explanation; self-review only.",
};
const comparison: LearningTask = {
  id: "fu-v1-p-compare",
  title: "Compare a molecule and a sheet",
  prompt:
    "Compare C₆₀ with graphene. Explain the difference between separating two unchanged C₆₀ molecules and breaking a graphene sheet.",
  answer:
    "C60 is a finite closed sixty-carbon molecule; graphene is an extended planar network with no fixed molecule size. Separating intact C60 molecules overcomes between-molecule attractions. Breaking a graphene sheet disrupts strong covalent links within the network.",
  rubric: [
    "C₆₀ is one finite closed hollow molecule, not a giant sheet.",
    "Graphene is an extended single-sheet covalent network.",
    "Both contain strong covalent bonds between carbon atoms.",
    "Separating unchanged C₆₀ molecules leaves their internal bonds intact.",
    "Breaking a graphene sheet disrupts its within-network covalent bonds.",
  ],
  explanation:
    "Common covalent bonding does not mean identical structural extent or interactions during a specified change.",
  hint: "State which links change in each case.",
  purpose: "Written molecule/network interaction transfer; self-review only.",
};
export const fullereneJourney: LessonJourney = {
  version: 1,
  introduction:
    "Inspect a real closed carbon cage. Distinguish whole molecules from selected rings, preserve cages during separation and explain a possible carrier role.",
  scopeNote:
    "Common Foundation/combined fullerene recognition, C₆₀ structure and bounded uses. Ideal cage geometry is schematic; face totals are asset checks, not extra memorisation. Nanotube geometry and aspect ratio are a separate next lesson.",
  outcomes: [
    "Recognise hollow fullerene molecules and Buckminsterfullerene C₆₀.",
    "Distinguish rings, complete molecules and extended networks.",
    "Explain whole-molecule separation and a possible carrier use without unsupported guarantees.",
  ],
  warmup: [
    q(
      "w-network",
      "What describes graphene’s structure extent?",
      "An extended single-sheet covalent network",
      {
        "A fixed sixty-carbon cage":
          "That describes a different carbon structure.",
        "A three-layer molecule of exactly ninety-six atoms":
          "A finite drawing is not a fixed molecule formula.",
      },
      "Graphene’s sheet extends beyond any finite crop.",
      "Recall the previous lesson.",
      "Prerequisite molecular/network contrast.",
    ),
    q(
      "w-sharing",
      "What kind of bond joins carbon atoms within a covalent molecule?",
      "A strong shared-electron covalent bond",
      {
        "Only weak between-molecule attraction":
          "Internal bonds and between-molecule attractions differ.",
        "A link made by transferring a nucleus":
          "Nuclei are not transferred to make a covalent bond.",
      },
      "Strong covalent bonds can form a small or larger discrete molecule as well as an extended network.",
      "Separate bond type from structure extent.",
      "Prerequisite within-molecule bonding.",
    ),
  ],
  refresher: [
    q(
      "r-type",
      "What is Buckminsterfullerene, C₆₀?",
      "A roughly spherical hollow molecule of sixty carbon atoms",
      {
        "An extended flat sheet with exactly sixty atoms in every sample":
          "Graphene is an extended sheet, not C₆₀.",
        "A compound containing sixty different elements":
          "The formula contains only carbon.",
      },
      "Buckminsterfullerene, C₆₀, was the first fullerene discovered. It is a hollow roughly spherical molecule; other fullerene cages can contain different numbers of carbon atoms.",
      "Use the formula and hollow shape.",
      "Targeted C60 formula/shape recovery.",
    ),
    q(
      "r-rings",
      "Does one pentagonal ring form a separate molecule inside C₆₀?",
      "No: rings share atoms and bonds through one closed cage",
      {
        "Yes: C₆₀ is sixty separate ring molecules":
          "The atoms connect through the cage.",
        "No: C₆₀ has only hexagons and no pentagons":
          "Its football-like cage includes pentagons and hexagons.",
      },
      "Count the selected perimeter, then distinguish it from the sixty-atom molecule. Fullerene structures are based on hexagonal rings and may also contain five- or seven-membered rings; C₆₀ itself has pentagons and hexagons.",
      "One ring is a local motif, not the whole molecular formula.",
      "Targeted ring/cage recovery.",
    ),
    q(
      "r-separation",
      "Which interactions change when intact C₆₀ molecules move apart?",
      "Attractions between molecules, with internal covalent bonds unchanged",
      {
        "Every internal carbon–carbon bond breaks":
          "That would destroy the molecules.",
        "Only the nuclei disappear": "The atoms remain.",
      },
      "Molecular separation is different from breaking internal covalent links.",
      "Specify what stays intact.",
      "Targeted force/conservation recovery.",
    ),
    q(
      "r-carrier",
      "Which fullerene feature directly supports a possible enclosing-carrier use?",
      "Its hollow cage shape",
      {
        "Graphite-style sliding sheets":
          "A molecular cage is not a stack of graphite sheets.",
        "Colour alone proves enclosure": "Colour does not supply the geometry.",
      },
      "A suitable hollow cage can potentially enclose a compatible payload.",
      "Link shape to possible function.",
      "Targeted property/use recovery.",
    ),
    q(
      "r-evidence",
      "Does being hollow prove a fullerene is suitable for every payload?",
      "No: fit, release, compatibility and safety need further evidence",
      {
        "Yes: every hollow cage is harmless in every use":
          "Shape alone does not establish that.",
        "No: therefore no fullerene could ever have a useful role":
          "Lack of a universal guarantee does not disprove a particular suitable design.",
      },
      "Use a bounded possible application, then state what remains to be tested.",
      "Separate a possible mechanism from a universal claim.",
      "Targeted evidence/inference recovery.",
    ),
  ],
  guided: [cage, separation, carrier],
  practice: [
    q(
      "p-type",
      "What structural family does the supplied hollow carbon cage represent?",
      "A fullerene molecule",
      {
        "An extended graphene sheet":
          "The structure closes into a hollow cage.",
        "A giant alternating-ion lattice":
          "All represented atoms are carbon, with covalent links.",
      },
      "Fullerenes are hollow carbon molecules; a cage is distinct from an extended sheet.",
      "Read the whole arrangement.",
      "Independent cage recognition.",
    ),
    number(
      "fu-v1-p-count",
      "How many carbon atoms are in one molecule of Buckminsterfullerene, C₆₀?",
      60,
      "carbon atoms",
      "The subscript 60 counts carbons in one complete molecule.",
      "Read the formula, not one ring.",
      "Independent molecule formula count.",
      {
        "6": "Six is a possible ring size, not the C60 molecular count.",
        "1": "One molecule contains many atoms.",
      },
    ),
    number(
      "fu-v1-p-pentagon",
      "Count the carbon circles around the highlighted closed ring in this cage projection.",
      5,
      "carbons",
      "The selected ring has five carbon atoms; those atoms belong to the same sixty-carbon cage.",
      "Follow its highlighted closed perimeter once.",
      "Independent pentagonal ring reading.",
      {
        "6": "Do not assume every fullerene ring is a hexagon.",
        "60": "Count the selected ring, not the whole molecule.",
      },
    ),
    number(
      "fu-v1-p-hexagon",
      "How many carbons are on this different highlighted cage ring?",
      6,
      "carbons",
      "This selected ring has six carbon atoms; a different ring can be pentagonal.",
      "Count the closed perimeter.",
      "Independent hexagonal ring reading.",
      {
        "5": "This selected ring is the six-membered one.",
        "60": "Whole-molecule size is a different count.",
      },
    ),
    q(
      "p-element",
      "C₆₀ contains only carbon atoms. Is it a compound merely because it has many bonded atoms?",
      "No: it is a molecular form of the carbon element",
      {
        "Yes: sixty atoms means sixty different elements":
          "The formula contains just one element symbol.",
        "No: it must therefore contain no covalent bonds":
          "Atoms of one element can bond covalently.",
      },
      "A compound contains more than one element. A molecule can contain atoms of a single element.",
      "Read the element symbols, not just atom count.",
      "Independent molecule/element/compound distinction.",
    ),
    q(
      "p-family",
      "An unfamiliar C₇₀ carbon molecule has a closed hollow cage. Which family does its description indicate?",
      "Fullerene",
      {
        "Graphene because every carbon structure is a flat sheet":
          "The supplied structure is a closed cage.",
        "It cannot be a fullerene because only C₆₀ exists":
          "Other carbon cage sizes exist.",
      },
      "Fullerene is a family of hollow carbon molecules, not just one sixty-atom member.",
      "Use the arrangement, not a single memorised formula.",
      "Independent unfamiliar-cage transfer.",
    ),
    q(
      "p-separation",
      "Two C₆₀ molecules move apart unchanged. Which interactions are overcome?",
      "Attractions between the two molecules",
      {
        "All internal covalent cage bonds":
          "The stated molecules remain unchanged.",
        "Every carbon atom’s nuclear bonds": "This is not a nuclear process.",
      },
      "Strong internal covalent bonds remain while between-molecule attractions are overcome.",
      "Use the stated unchanged-molecule condition.",
      "Independent interaction identification.",
    ),
    q(
      "p-guarantee",
      "A diagram shows a hollow fullerene. Does it prove every drug would fit and be released safely?",
      "No: shape alone does not establish those requirements",
      {
        "Yes: being hollow guarantees all sizes and safety":
          "Actual fit, release and compatibility require evidence.",
        "No: hollow shape can never support any possible carrier role":
          "A possible mechanism remains relevant despite further requirements.",
      },
      "A hollow shape can support a possible use without establishing universal suitability.",
      "Separate a mechanism from proof of all requirements.",
      "Independent bounded carrier-use inference.",
    ),
    q(
      "p-current",
      "Does a hollow carbon-cage shape alone establish electrical conduction in every fullerene material?",
      "No: carrier mobility and the actual material need evidence",
      {
        "Yes: every carbon material conducts identically":
          "Carbon structures and material conditions differ.",
        "No: no carbon material can ever conduct":
          "Graphene and graphite provide counterexamples.",
      },
      "Do not infer a universal bulk conduction rule from shape or element identity alone.",
      "Use charged-carrier mobility rather than one visual feature.",
      "Independent property-inference boundary.",
    ),
    number(
      "fu-v1-p-three",
      "Three separate C₆₀ molecules remain intact. How many carbon atoms are present in total?",
      180,
      "carbon atoms",
      "3 × 60 = 180 carbon atoms; there are still three separate molecules.",
      "Multiply the molecule count by atoms per molecule.",
      "Independent atom versus molecule inventory.",
      {
        "63": "Adding the counts does not give atoms in three molecules.",
        "3": "That is the molecule count, not the atom count.",
      },
    ),
    written,
    comparison,
  ],
  checkForms: [
    [
      number(
        "fu-v1-ca-count",
        "Retrieve the number of carbons in one Buckminsterfullerene molecule.",
        60,
        "carbon atoms",
        "Buckminsterfullerene is C60.",
        "Recall the formula.",
        "Reserved named-molecule count.",
      ),
      q(
        "ca-shape",
        "Which description fits Buckminsterfullerene?",
        "A closed roughly spherical hollow carbon molecule",
        {
          "An endless flat sheet": "That describes graphene.",
          "An alternating sodium/chloride lattice":
            "That is not a carbon cage.",
        },
        "Its finite hollow cage differs from a giant extended network.",
        "Recall the whole arrangement.",
        "Reserved cage extent/shape.",
      ),
      q(
        "ca-rings",
        "How are rings related within C₆₀?",
        "Pentagonal and hexagonal rings join through one covalent cage",
        {
          "Each ring is a separate sixty-atom molecule":
            "The rings connect within the same molecule.",
          "No pentagons are present":
            "The football-like cage includes pentagons.",
        },
        "Connected local rings build the complete cage.",
        "Separate ring and molecule.",
        "Reserved ring/cage relation.",
      ),
      q(
        "ca-interaction",
        "What remains intact when unchanged C₆₀ molecules separate?",
        "Covalent bonds within each cage",
        {
          "Every cage becomes separate carbon atoms":
            "That would not be unchanged molecular separation.",
          "A giant covalent link between both molecules":
            "The model uses between-molecule attractions.",
        },
        "Molecular separation leaves internal bonds intact.",
        "Use the unchanged-molecule condition.",
        "Reserved within/between distinction.",
      ),
      q(
        "ca-use",
        "Which structural feature supports a possible enclosure-carrier role?",
        "A hollow cage can enclose a suitable payload",
        {
          "Grey colour proves every payload is harmless":
            "Colour does not establish the mechanism or safety.",
          "Sliding graphite layers guarantee release":
            "These are molecular cages, not layered graphite.",
        },
        "Link a suitable shape to possible function without universal guarantees.",
        "Use hollow shape.",
        "Reserved property/use chain.",
      ),
    ],
    [
      q(
        "cb-unfamiliar",
        "A supplied unfamiliar carbon molecule has 76 atoms in a hollow cage. Which family best fits?",
        "Fullerene",
        {
          Graphene: "An extended single sheet is a different arrangement.",
          "Every member must instead have exactly sixty atoms":
            "Fullerene is a family with different molecular sizes.",
        },
        "A hollow carbon-cage arrangement identifies the family.",
        "Use structure rather than one memorised count.",
        "Second reserved unfamiliar family transfer.",
      ),
      number(
        "fu-v1-cb-formula",
        "A supplied fullerene formula is C₇₀. How many carbon atoms does one molecule contain?",
        70,
        "carbon atoms",
        "The formula subscript counts carbon atoms in one molecule.",
        "Read the supplied formula.",
        "Second reserved molecular formula transfer.",
      ),
      number(
        "fu-v1-cb-ring",
        "Count the carbon atoms around the highlighted closed perimeter.",
        6,
        "carbons",
        "The selected ring is six-membered.",
        "Follow its closed perimeter once.",
        "Second reserved independent ring reading.",
      ),
      q(
        "cb-evidence",
        "Does hollow shape alone prove a candidate will release any enclosed payload suitably?",
        "No: release and other requirements need further evidence",
        {
          "Yes: any enclosing shape guarantees release":
            "Enclosure and release are different requirements.",
          "No: therefore hollow shape has no possible relevance":
            "Hollow shape can still support a possible carrier role.",
        },
        "Distinguish shape-based possibility from demonstrated performance.",
        "Check what the evidence actually establishes.",
        "Second reserved use/evidence boundary.",
      ),
      q(
        "cb-sheet",
        "How does C₆₀ differ from a graphene-sheet fragment?",
        "C₆₀ is one complete fixed-size molecule; graphene is an extended sheet",
        {
          "Both are always sixty-atom molecules":
            "A graphene crop has no fixed molecular size.",
          "Only C₆₀ can contain covalent bonds":
            "Both contain carbon–carbon covalent links.",
        },
        "Common bond type does not imply common structure extent.",
        "Compare closed finite cage with extended planar network.",
        "Second reserved molecular/network comparison.",
      ),
    ],
  ],
  reviewForms: [
    [
      number(
        "fu-v1-ra-count",
        "After the delay, retrieve the carbon count in one Buckminsterfullerene molecule.",
        60,
        "carbon atoms",
        "C60 contains sixty carbons.",
        "Recall the named formula.",
        "Delayed named fullerene count.",
      ),
      q(
        "ra-separation",
        "What changes when two unchanged fullerene molecules separate?",
        "Between-molecule attractions are overcome",
        {
          "Every internal covalent bond breaks":
            "That would change/destroy the molecules.",
          "All carbon nuclei disappear": "Atoms remain.",
        },
        "The internal cage remains bonded.",
        "Separate inside from between.",
        "Delayed interaction explanation.",
      ),
      q(
        "ra-use",
        "Why could a suitable fullerene have an enclosing-carrier use?",
        "Its hollow cage could enclose a compatible payload",
        {
          "Its name proves every drug is safe":
            "Names do not establish actual suitability.",
          "All hollow cages are extended graphite layers":
            "A hollow molecule is a different arrangement.",
        },
        "Link hollow shape to possible function, with fit/release/compatibility evidence still relevant.",
        "Use shape and a bounded claim.",
        "Delayed structure/use transfer.",
      ),
    ],
    [
      q(
        "rb-type",
        "An unfamiliar closed hollow carbon molecule has a different atom count from C₆₀. Must it be excluded from the fullerene family?",
        "No: the family includes different hollow carbon molecules",
        {
          "Yes: only sixty-atom molecules qualify": "Other cage sizes exist.",
          "No: it must instead be an endless flat sheet":
            "The supplied structure is a cage.",
        },
        "Use the family definition and supplied arrangement.",
        "Do not confuse one example with the whole family.",
        "Alternative delayed family boundary.",
      ),
      q(
        "rb-rings",
        "Does a selected five-membered cage ring represent a separate five-carbon molecule?",
        "No: it is a local ring within the connected cage",
        {
          "Yes: every ring is an independent molecule":
            "Rings share atoms and edges within the cage.",
          "No: no fullerene can contain a pentagon": "C60 includes pentagons.",
        },
        "Local ring size differs from whole-molecule size.",
        "Follow links beyond the selected ring.",
        "Alternative delayed ring/molecule relation.",
      ),
      q(
        "rb-evidence",
        "What further evidence is relevant before a proposed hollow carrier is judged suitable?",
        "Payload fit, release and compatibility for the particular use",
        {
          "Nothing: shape settles every requirement":
            "Shape alone is incomplete evidence.",
          "Only its colour, regardless of the intended function":
            "Colour alone does not establish the stated requirements.",
        },
        "A possible shape/function mechanism does not establish universal suitability.",
        "Match evidence to the proposed use.",
        "Alternative delayed bounded use reasoning.",
      ),
    ],
  ],
};
for (const task of [...fullereneJourney.guided, ...fullereneJourney.practice])
  task.followUp =
    task.id.includes("separation") || task.id.includes("compare")
      ? "fu-v1-r-separation"
      : task.id.includes("pentagon") ||
          task.id.includes("hexagon") ||
          task.id.includes("seven")
        ? "fu-v1-r-rings"
        : task.id.includes("guarantee") || task.id.includes("current")
          ? "fu-v1-r-evidence"
          : task.id.includes("carrier") || task.id.includes("explain")
            ? "fu-v1-r-carrier"
            : "fu-v1-r-type";
const titles: Record<string, string> = {
  "p-type": "Recognise a hollow carbon molecule",
  "p-count": "Read the molecular formula",
  "p-pentagon": "Count one ring",
  "p-hexagon": "Inspect a different ring",
  "p-element": "A molecule of one element",
  "p-family": "Recognise an unfamiliar cage",
  "p-separation": "Separate between and within",
  "p-guarantee": "Bound a possible use",
  "p-current": "Shape does not prove conduction",
  "p-three": "Count atoms in three molecules",
};
for (const task of fullereneJourney.practice)
  task.title ??= titles[task.id.replace("fu-v1-", "")];
for (const task of fullereneJourney.practice)
  if (["fu-v1-p-type", "fu-v1-p-pentagon", "fu-v1-p-hexagon"].includes(task.id))
    task.fullereneDiagram = { ring: task.id === "fu-v1-p-hexagon" ? 1 : 0 };
fullereneJourney.checkForms[1][2].fullereneDiagram = { ring: 1 };

fullereneJourney.refresher[1].model = {
  kind: "fullerene-properties",
  mode: "cage",
  instruction: "Inspect a ring, then compare it with the whole cage.",
};

const supportTitles: Record<string, string> = {
  "w-network": "Recall an extended sheet",
  "w-sharing": "Recall a shared bond",
  "r-type": "Recall the complete C₆₀ cage",
  "r-rings": "Ring or molecule?",
  "r-separation": "Keep whole cages intact",
  "r-carrier": "Link shape to function",
  "r-evidence": "What does shape prove?",
};
for (const task of [...fullereneJourney.warmup, ...fullereneJourney.refresher])
  task.title = supportTitles[task.id.replace("fu-v1-", "")];

const widerFamily = q(
  "p-seven",
  "A supplied hollow fullerene structure includes seven-membered rings. Does that mean every C₆₀ molecule must contain seven-membered rings too?",
  "No: the family can include such rings, while C₆₀ has pentagons and hexagons",
  {
    "Yes: one member’s rings define every fullerene":
      "One example does not define every member of the family.",
    "No: seven-membered rings are impossible anywhere in the family":
      "The fullerene family may include seven-membered rings as well as hexagons and pentagons.",
  },
  "Distinguish the broader fullerene family from the particular C₆₀ structure.",
  "Use the stated family boundary and the specific C₆₀ cage.",
  "Independent wider-family ring boundary, required by the reviewed specification.",
);
widerFamily.title = "Different rings in the wider family";
widerFamily.followUp = "fu-v1-r-rings";
fullereneJourney.practice.splice(
  fullereneJourney.practice.findIndex((q) => q.id === "fu-v1-p-family") + 1,
  0,
  widerFamily,
);

extendFullereneWriting(fullereneJourney);
