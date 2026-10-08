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
    `nt-v1-${id}`,
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
    `nt-v1-${id}`,
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
const tube = q(
  "g-tube",
  "Inspect a joined tube",
  "Identify the carbon wall and count bonded neighbours at the highlighted interior carbon.",
  "Hollow cylinder; three bonded neighbours",
  {
    "Solid rod; four neighbours":
      "There is an empty centre and a joined wall, not diamond.",
    "Spherical cage; six neighbours":
      "Six is the ring size, not the bonded-neighbour count.",
  },
  "A carbon nanotube is a cylindrical fullerene. Its joined hexagonal wall has three neighbours at an interior carbon. Cut ends are not a fixed molecular formula.",
  "Rotate to inspect the hollow wall and follow links.",
  "Cylindrical recognition and coordination.",
  {
    kind: "nanotube-properties",
    mode: "tube",
    instruction: "Predict shape and interior neighbours.",
  },
);
const ratio = q(
  "g-ratio",
  "Compare tube dimensions",
  "At the initial supplied dimensions, 1000 nm long and 2 nm diameter, what is length ÷ diameter?",
  "500",
  {
    "2000": "Multiply is not the requested ratio.",
    "0.002": "That is diameter divided by length.",
  },
  "1000 ÷ 2 = 500. Both dimensions use nm, so the ratio has no unit. Model dimensions can then be changed independently.",
  "Divide length by diameter.",
  "Dimensionless aspect ratio, independent of the atomic crop.",
  {
    kind: "nanotube-properties",
    mode: "ratio",
    instruction: "Predict length ÷ diameter, then change dimensions.",
  },
);
const reinforcement = q(
  "g-reinforce",
  "Choose a frame material",
  "Choose a material meeting all three limits and explain the nanotube strength contribution.",
  "B meets all limits; strong covalent bonds support reinforcement",
  {
    "A: lowest density is enough": "A fails strength and stiffness.",
    "C: greatest strength always wins": "C exceeds the density limit.",
  },
  "B has density 1.4 ≤ 1.8, strength 40 ≥ 30 and stiffness 30 ≥ 25. Strong carbon–carbon covalent bonding supports reinforcement. These are supplied finished-material data, not universal constants.",
  "Check every limit, then identify the strength mechanism.",
  "Multi-criterion evidence evaluation.",
  {
    kind: "nanotube-properties",
    mode: "reinforcement",
    instruction: "Use density, strength and stiffness together.",
  },
);
const electronics = q(
  "g-electronics",
  "Explain a conducting tube",
  "The supplied nanotube conducts. What carries charge through it?",
  "Mobile delocalised electrons",
  {
    "Carbon nuclei flow along the tube": "Nuclei remain in the structure.",
    "Electrons fixed at single carbons":
      "Presence without mobility does not explain transport.",
  },
  "Mobile delocalised electrons carry charge through this conducting nanotube. Actual nanotube conduction depends on structure; a tube shape alone does not guarantee identical conductivity.",
  "State the carrier and its mobility.",
  "Complete electrical explanation with a bounded supplied case.",
  {
    kind: "nanotube-properties",
    mode: "electronics",
    instruction: "Predict the carrier and its mobility.",
  },
);
const explain: LearningTask = {
  id: "nt-v1-p-explain",
  title: "Explain two different uses",
  prompt:
    "Explain how a suitable nanotube can contribute to a strong lightweight composite and to an electrical component. Distinguish the two mechanisms and state an evidence limit.",
  answer:
    "Strong covalent carbon–carbon bonding supports reinforcement. Suitable low-density finished material can reduce mass at the same volume. Mobile delocalised electrons carry charge in a conducting nanotube. Whole-composite properties and actual conductivity require evidence; not every nanotube has identical performance.",
  rubric: [
    "Strong covalent bonds for reinforcement, not weak layer sliding.",
    "Density/mass comparison is conditional on equal volume and finished-material evidence.",
    "Mobile delocalised electrons carry charge in the supplied conducting form.",
    "No universal conductivity or composite-performance guarantee.",
  ],
  explanation:
    "A causal mechanism and relevant design evidence support each proposed use.",
  hint: "Separate bonding strength, density and carrier mobility.",
  purpose: "Written causal explanation; self-review only.",
};
const evaluate: LearningTask = {
  id: "nt-v1-p-evaluate",
  title: "Evaluate the supplied frame data",
  prompt:
    "Evaluate A, B and C for the stated frame design using all supplied data. Give a justified choice and explain why the lowest density alone is insufficient.",
  answer:
    "B meets density, strength and stiffness limits. A is least dense but falls below both mechanical limits. C has higher strength and stiffness but exceeds the density limit. B is the supplied suitable candidate; cost, durability and manufacturing are not supplied.",
  rubric: [
    "Compare all three quantities with their respective limits.",
    "Reject A using its mechanical evidence and C using its density.",
    "Justify B from the supplied data.",
    "Identify a relevant missing practical criterion without inventing its value.",
  ],
  explanation:
    "A logically linked evaluation checks every requirement and limits the conclusion to available evidence.",
  hint: "Write one supported comparison for each candidate.",
  purpose: "Written multi-criterion evaluation; self-review only.",
};
export const nanotubeJourney: LessonJourney = {
  version: 1,
  introduction:
    "Inspect a joined hollow tube, compare its dimensions and evaluate distinct electrical and reinforcing uses.",
  scopeNote:
    "Common Foundation/combined structure and use reasoning. Single-wall atomic fragment and original material data are schematic. Ratio calculations consolidate dimension reasoning; actual conductivity depends on nanotube structure.",
  outcomes: [
    "Recognise cylindrical carbon fullerenes and joined hexagonal walls.",
    "Calculate and compare length-to-diameter ratios in common units.",
    "Explain reinforcement and supplied conduction using separate mechanisms.",
    "Evaluate density, strength and stiffness without unsupported universal claims.",
  ],
  warmup: [
    q(
      "w-fullerene",
      "Recall hollow carbon",
      "What describes a fullerene?",
      "Carbon atoms arranged in a hollow molecule",
      {
        "Every carbon form is a fullerene":
          "Diamond and graphite are other carbon structures.",
        "Any hollow object regardless of atoms":
          "Composition and molecular structure matter.",
      },
      "Nanotubes are cylindrical fullerenes.",
      "Recall the preceding lesson.",
      "Prerequisite fullerene-family retrieval.",
    ),
    q(
      "w-sheet",
      "Recall graphene",
      "What is ideal graphene?",
      "A single atom-layer hexagonal carbon sheet",
      {
        "A solid three-dimensional diamond network":
          "Graphene is a sheet with three interior neighbours.",
        "A separate six-carbon molecule": "Rings connect across the sheet.",
      },
      "A nanotube wall is related to a joined rolled carbon sheet.",
      "Recall one sheet rather than stacked layers.",
      "Prerequisite wall-network retrieval.",
    ),
  ],
  refresher: [
    q(
      "r-shape",
      "Cylinder, cage or rod?",
      "What distinguishes a nanotube wall from spherical C60?",
      "A hollow cylindrical carbon wall",
      {
        "A solid carbon rod": "The hollow centre is a structural distinction.",
        "Every tube contains exactly sixty carbons":
          "C60 is the particular spherical molecule.",
      },
      "Nanotubes have cylindrical hollow structures. A finite drawing does not define one universal atom count.",
      "Inspect the wall and axis.",
      "Targeted structural recovery.",
    ),
    q(
      "r-ratio",
      "Divide matching units",
      "A tube is 800 nm long and 4 nm diameter. What is its length-to-diameter ratio?",
      "200",
      {
        "3200": "That multiplies the dimensions.",
        "0.005": "That reverses the ratio.",
      },
      "800 ÷ 4 = 200, without a unit.",
      "Use length divided by diameter.",
      "Targeted aspect-ratio recovery.",
    ),
    q(
      "r-strength",
      "Locate the strength mechanism",
      "Which bonding supports nanotube reinforcement?",
      "Strong covalent bonds in the carbon wall",
      {
        "Weak attractions between graphite layers":
          "That explains graphite sliding, not strong tube-wall reinforcement.",
        "Colour of the carbon": "Colour is not a strength mechanism.",
      },
      "Strong connected carbon–carbon covalent bonding supports high strength. Whole-composite performance still needs evidence.",
      "Name the bonds inside the wall.",
      "Targeted mechanical explanation.",
    ),
    q(
      "r-carriers",
      "Require mobile carriers",
      "Why can the supplied conducting nanotube carry charge?",
      "Delocalised electrons move through it",
      {
        "All electrons stay fixed at one carbon": "Mobility is required.",
        "Carbon nuclei move through the circuit":
          "Nuclei are not these carriers.",
      },
      "Mobile delocalised electrons carry charge through the structure.",
      "State both particle and mobility.",
      "Targeted conduction recovery.",
    ),
    q(
      "r-evidence",
      "Check every requirement",
      "How should a candidate be selected when there are density, strength and stiffness limits?",
      "Check that it meets all three limits",
      {
        "Choose lowest density alone":
          "A light material might fail mechanically.",
        "Choose greatest strength alone": "It might exceed the density limit.",
      },
      "All given constraints matter; strength and stiffness are separate measures.",
      "Read each inequality.",
      "Targeted evidence recovery.",
    ),
  ],
  guided: [tube, ratio, reinforcement, electronics],
  practice: [
    q(
      "p-recognise",
      "Recognise a carbon tube",
      "Which structure fits the supplied carbon drawing?",
      "A hollow cylindrical fullerene wall",
      {
        "A flat graphene sheet": "The wall joins around a cylinder.",
        "A solid diamond rod":
          "The centre is hollow and the pattern is hexagonal.",
      },
      "A joined carbon cylinder is a nanotube structure.",
      "Inspect shape and the joined circumference.",
      "Independent diagram recognition.",
    ),
    n(
      "p-neighbours",
      "Count interior neighbours",
      "How many carbons are covalently bonded to the highlighted interior wall carbon?",
      3,
      "neighbours",
      "Three neighbours meet this interior carbon; six atoms belong to a ring, not six direct neighbours.",
      "Follow links from one selected carbon.",
      "Independent local coordination.",
      {
        "6": "Six is a hexagonal ring count.",
        "4": "Four tetrahedral neighbours describes diamond.",
      },
    ),
    n(
      "p-ratio",
      "Calculate a tube ratio",
      "A supplied tube is 1500 nm long and 3 nm diameter. Calculate length ÷ diameter.",
      500,
      "",
      "1500 ÷ 3 = 500; the units cancel. The length is 500 times the diameter: a very long, thin structure.",
      "Divide the length by the diameter.",
      "Independent numerical aspect ratio.",
      { "4500": "Do not multiply the dimensions." },
    ),
    n(
      "p-unit",
      "Convert before dividing",
      "A tube is 2 μm long and 4 nm diameter. Given 1 μm = 1000 nm, calculate length ÷ diameter.",
      500,
      "",
      "2 μm = 2000 nm; 2000 ÷ 4 = 500.",
      "Put both dimensions into nm first.",
      "Independent common-unit ratio.",
      { "0.5": "You divided different units without converting." },
    ),
    q(
      "p-length",
      "Change length only",
      "If length doubles while diameter stays fixed, what happens to length ÷ diameter?",
      "It doubles",
      {
        "It halves": "Length is the numerator.",
        "It stays unchanged":
          "The numerator changed while denominator stayed fixed.",
      },
      "2L ÷ d = 2(L ÷ d).",
      "Locate the changing quantity.",
      "Independent numerator reasoning.",
    ),
    q(
      "p-diameter",
      "Change diameter only",
      "If diameter doubles while length stays fixed, what happens to length ÷ diameter?",
      "It halves",
      {
        "It doubles": "Diameter is the denominator.",
        "It becomes twice the density": "Geometric ratio is not density.",
      },
      "L ÷ 2d = half of L ÷ d.",
      "Locate the denominator.",
      "Independent denominator reasoning.",
    ),
    q(
      "p-scale",
      "Scale both dimensions",
      "If both length and diameter double, what happens to their ratio?",
      "It stays the same",
      {
        "It doubles":
          "Both numerator and denominator change by the same factor.",
        "It quadruples": "That is not division of equally scaled dimensions.",
      },
      "2L ÷ 2d = L ÷ d.",
      "Cancel the common factor.",
      "Independent ratio invariance.",
    ),
    q(
      "p-wall",
      "Check the atom-count claim",
      "The model shows 72 carbons in a cut wall fragment. Does this establish that every nanotube is a C72 molecule?",
      "No: the fragment omits continuation and end termination",
      {
        "Yes: every finite diagram gives a universal formula":
          "Crop size is not universal molecular composition.",
        "No: carbon atoms cannot make covalent bonds":
          "The wall has covalent bonding.",
      },
      "Nanotubes differ in length, circumference and wall structure; this crop is not a fixed formula.",
      "Distinguish model boundaries from actual composition.",
      "Independent model-limit reasoning.",
    ),
    q(
      "p-conduction",
      "Explain charge transport",
      "For a supplied conducting nanotube, which is the complete electrical explanation?",
      "Mobile delocalised electrons carry charge through the structure",
      {
        "It merely contains fixed electrons": "Mobility is essential.",
        "Its strong covalent bonds mean nuclei flow":
          "Strong bonding does not turn nuclei into mobile carriers.",
      },
      "The carrier and its mobility explain conduction.",
      "Require both parts of the explanation.",
      "Independent carrier mechanism.",
    ),
    q(
      "p-universal",
      "Bound the electrical claim",
      "Does a tube-shaped carbon diagram prove every nanotube conducts equally well?",
      "No: conductivity depends on actual nanotube structure",
      {
        "Yes: shape alone establishes equal conductivity":
          "Conducting and semiconducting forms differ.",
        "No: all nanotubes are necessarily insulators":
          "Suitable nanotubes can conduct.",
      },
      "The supplied conducting case is not a universal property guarantee.",
      "Separate one supplied case from all forms.",
      "Independent evidence boundary.",
    ),
    q(
      "p-material",
      "Use all material limits",
      "Which supplied material meets density ≤ 1.8, strength ≥ 30 and stiffness ≥ 25?",
      "B: the nanotube composite",
      {
        "A: the least dense":
          "A has strength 12 and stiffness 8, both too low.",
        "C: the strongest": "C has density 2.8, above the limit.",
      },
      "B passes all three criteria.",
      "Compare each column with its limit.",
      "Independent multi-criterion choice.",
    ),
    n(
      "p-mass",
      "Use density and volume",
      "For 10 cm³ of material B, density 1.4 g/cm³, calculate mass.",
      14,
      "g",
      "Mass = density × volume = 1.4 × 10 = 14 g.",
      "Multiply density by volume.",
      "Independent equal-volume mass reasoning.",
      { "0.14": "Do not divide density by volume." },
    ),
    q(
      "p-stiffness",
      "Distinguish mechanical properties",
      "Why do strength and stiffness need separate columns?",
      "Resistance to breaking and resistance to deformation are different",
      {
        "They always have identical numerical values":
          "Different properties can vary independently.",
        "Both mean electrical conductivity": "Neither is charge transport.",
      },
      "Strength concerns failure; stiffness concerns resistance to deformation. A suitable frame must meet both supplied limits.",
      "Separate breaking from bending.",
      "Independent mechanical distinction.",
    ),
    explain,
    evaluate,
  ],
  checkForms: [
    [
      q(
        "ca-shape",
        "Retrieve tube structure",
        "Which carbon structure is a nanotube?",
        "A cylindrical fullerene",
        {
          "A solid diamond rod": "Nanotubes have hollow carbon walls.",
          "A single flat graphene sheet":
            "A tube joins around a circumference.",
        },
        "Carbon nanotubes are cylindrical fullerenes.",
        "Recall the structural family.",
        "Reserved recognition.",
      ),
      n(
        "ca-ratio",
        "Retrieve ratio calculation",
        "A tube is 1200 nm long and 3 nm diameter. Calculate length ÷ diameter.",
        400,
        "",
        "1200 ÷ 3 = 400.",
        "Use common units.",
        "Reserved numerical ratio.",
      ),
      q(
        "ca-carrier",
        "Retrieve electrical mechanism",
        "Why does the supplied conducting nanotube carry charge?",
        "Delocalised electrons can move through it",
        {
          "Carbon nuclei travel along it": "Nuclei are not these carriers.",
          "Only fixed electrons are needed": "Carriers must move.",
        },
        "Mobile electrons carry charge.",
        "State the particle and mobility.",
        "Reserved complete carrier explanation.",
      ),
      q(
        "ca-strength",
        "Retrieve strength mechanism",
        "What supports nanotube reinforcement?",
        "Strong covalent bonding through its carbon wall",
        {
          "Weak layer attractions only":
            "Weak layer attractions do not explain wall strength.",
          "Grey colour alone": "Colour is not a mechanical mechanism.",
        },
        "The connected covalent wall supports strength.",
        "Locate the wall bonds.",
        "Reserved mechanical mechanism.",
      ),
      q(
        "ca-units",
        "Retrieve common-unit reasoning",
        "Why convert length and diameter to matching units before dividing?",
        "So the dimensionless ratio compares the same length unit",
        {
          "So the result always has units of grams": "Mass is unrelated.",
          "So every ratio becomes one":
            "Unit conversion does not make dimensions equal.",
        },
        "Matching length units cancel.",
        "Check the unit ledger.",
        "Reserved dimensional reasoning.",
      ),
    ],
    [
      q(
        "cb-recognise",
        "Recognise an unfamiliar tube",
        "Which description fits the supplied carbon drawing?",
        "A hollow joined cylindrical wall",
        {
          "A filled sphere":
            "The represented framework has a cylindrical hollow centre.",
          "Stacked flat sheets without a joined circumference":
            "The wall joins around the axis.",
        },
        "Inspect shape and connectivity.",
        "Read the diagram.",
        "Alternative reserved recognition.",
      ),
      n(
        "cb-unit",
        "Convert and calculate",
        "A supplied tube is 3 μm long and 5 nm diameter. Use 1 μm = 1000 nm to calculate length ÷ diameter.",
        600,
        "",
        "3000 ÷ 5 = 600.",
        "Convert μm to nm first.",
        "Alternative reserved unit transfer.",
      ),
      q(
        "cb-diameter",
        "Change a denominator",
        "Diameter triples at fixed length. What happens to length ÷ diameter?",
        "It becomes one third as large",
        {
          "It triples": "The denominator increased.",
          "It stays unchanged": "Only one quantity changed.",
        },
        "L ÷ 3d is one third of L ÷ d.",
        "Inspect the denominator.",
        "Alternative reserved ratio reasoning.",
      ),
      q(
        "cb-data",
        "Evaluate a rejected material",
        "Why does C fail the supplied frame limits despite high strength and stiffness?",
        "Its density exceeds the permitted limit",
        {
          "Its strength must be zero": "The supplied strength is 45.",
          "The material name automatically disqualifies all metals":
            "Use the actual density limit and data.",
        },
        "C has density 2.8 > 1.8.",
        "Check every criterion.",
        "Alternative reserved evidence rejection.",
      ),
      q(
        "cb-boundary",
        "Bound a composite conclusion",
        "What do the supplied B results establish?",
        "B meets these stated limits; wider suitability needs further evidence",
        {
          "Every nanotube composite has identical properties":
            "One set does not prove a universal claim.",
          "B is clinically safe for every use":
            "These mechanical data do not establish clinical safety.",
        },
        "The conclusion must match the evidence.",
        "Separate these criteria from unsupplied outcomes.",
        "Alternative reserved evidence boundary.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-shape",
        "Retrieve after the delay",
        "What shape defines a carbon nanotube?",
        "A hollow carbon cylinder",
        {
          "Every nanotube is a spherical C60 cage":
            "C60 is a different fullerene form.",
          "A solid diamond rod": "Nanotubes have hollow walls.",
        },
        "Nanotubes are cylindrical fullerenes.",
        "Recall the wall shape.",
        "Delayed structural retrieval.",
      ),
      n(
        "ra-ratio",
        "Retrieve a ratio",
        "A tube is 900 nm long and 3 nm diameter. Calculate length ÷ diameter.",
        300,
        "",
        "900 ÷ 3 = 300.",
        "Use length as numerator.",
        "Delayed aspect-ratio retrieval.",
      ),
      q(
        "ra-use",
        "Retrieve an electrical use",
        "Which feature supports an electrical component made from a conducting nanotube?",
        "Mobile delocalised electrons carry charge",
        {
          "Weak layer sliding carries current":
            "Sliding is not this electrical mechanism.",
          "Carbon nuclei leave the wall": "Nuclei are not the carriers.",
        },
        "Mobile electrons transport charge.",
        "State the causal mechanism.",
        "Delayed electrical application.",
      ),
    ],
    [
      q(
        "rb-strength",
        "Retrieve reinforcing bonds",
        "Which structure feature supports nanotube reinforcement?",
        "Strong covalent carbon–carbon bonds in the wall",
        {
          "Only low density, with no mechanical evidence":
            "Low mass does not guarantee strength.",
          "Weak between-layer attractions alone":
            "That does not explain strong wall bonding.",
        },
        "Strong covalent wall bonding supports reinforcement.",
        "Locate the relevant bonds.",
        "Alternative delayed strength retrieval.",
      ),
      q(
        "rb-scale",
        "Retrieve equal scaling",
        "Both length and diameter triple. How does their ratio change?",
        "It remains unchanged",
        {
          "It triples": "Both dimensions scale together.",
          "It becomes nine times larger": "This is a ratio, not an area.",
        },
        "3L ÷ 3d = L ÷ d.",
        "Cancel the same factor.",
        "Alternative delayed invariance retrieval.",
      ),
      q(
        "rb-evidence",
        "Retrieve evidence limits",
        "Why is the least dense material not automatically the best frame?",
        "It must also meet strength and stiffness requirements",
        {
          "Density alone guarantees every mechanical property":
            "Mechanical quantities differ.",
          "All material data are irrelevant":
            "The criteria are supplied for this design.",
        },
        "All given requirements must pass.",
        "Compare every required property.",
        "Alternative delayed material evaluation.",
      ),
    ],
  ],
};
const allLearning = [
  ...nanotubeJourney.warmup,
  ...nanotubeJourney.refresher,
  ...nanotubeJourney.guided,
  ...nanotubeJourney.practice,
];
for (const task of allLearning) {
  if (
    task.id.includes("ratio") ||
    task.id.includes("unit") ||
    ["nt-v1-p-length", "nt-v1-p-diameter", "nt-v1-p-scale"].includes(task.id)
  )
    task.followUp = "nt-v1-r-ratio";
  else if (
    task.id.includes("carrier") ||
    task.id.includes("conduction") ||
    task.id.includes("electronics") ||
    task.id.includes("universal")
  )
    task.followUp = "nt-v1-r-carriers";
  else if (
    task.id.includes("material") ||
    task.id.includes("mass") ||
    task.id.includes("stiffness") ||
    task.id.includes("evaluate") ||
    task.id.includes("reinforce")
  )
    task.followUp = "nt-v1-r-evidence";
  else task.followUp = "nt-v1-r-shape";
}
nanotubeJourney.refresher[0].nanotubeDiagram = true;
nanotubeJourney.practice[0].nanotubeDiagram = true;
nanotubeJourney.practice[1].nanotubeDiagram = true;
nanotubeJourney.practice[10].nanotubeMaterialData = true;
nanotubeJourney.practice[14].nanotubeMaterialData = true;
nanotubeJourney.checkForms[1][0].nanotubeDiagram = true;
nanotubeJourney.checkForms[1][3].nanotubeMaterialData = true;

import { extendNanotubeWriting } from "./nanotube-writing";
extendNanotubeWriting(nanotubeJourney);
