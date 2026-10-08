import { extendGraphiteWriting } from "./graphite-writing";
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
    `gr-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    purpose,
    model,
  );
const coordination = q(
  "g-coordination",
  "How many carbons bond directly to the selected carbon?",
  "Three neighbours in the same sheet",
  {
    "Four neighbours in different sheets":
      "That describes diamond coordination, not graphite.",
    "Six neighbours because rings have six atoms":
      "Ring size and neighbours per atom are different counts.",
  },
  "Each interior carbon has three strong covalent bonds in a hexagonal sheet. Stacking does not add a covalent neighbour.",
  "Count direct links, not all atoms in a ring.",
  "Local connectivity, with deliberate wrong coordination.",
  {
    kind: "graphite-properties",
    mode: "coordination",
    instruction: "Predict a count. Rotate to inspect.",
  },
);
coordination.title = "Carbon neighbours";
const sliding = q(
  "g-sliding",
  "What happens to bonds when one graphite sheet slides?",
  "Strong in-sheet bonds stay intact; weak interlayer attractions are overcome",
  {
    "Every in-sheet covalent bond breaks":
      "That would destroy the sheet, not represent easy layer sliding.",
    "A fourth covalent bond stretches between sheets":
      "Graphite has no covalent interlayer links.",
  },
  "Moving an intact sheet over another explains softness and lubrication. Strong in-sheet bonds do not become weak.",
  "Separate within-sheet links from between-sheet attractions.",
  "Two-part force and bond-preservation prediction.",
  {
    kind: "graphite-properties",
    mode: "sliding",
    instruction: "Predict the interaction and the fate of sheet bonds.",
  },
);
sliding.title = "Slide an intact sheet";
const carriers = q(
  "g-carriers",
  "What carries electrical charge through graphite layers?",
  "Mobile delocalised electrons",
  {
    "Carbon nuclei moving along the sheets":
      "The carbon structure need not drift to carry current.",
    "Electrons fixed at a single carbon":
      "Fixed charged particles are not mobile carriers through the material.",
  },
  "One electron per carbon contributes to the delocalised pool; electrons can move along sheets and carry charge.",
  "Both charged particles and mobility are needed.",
  "Carrier identity and mobility with actual marker motion.",
  {
    kind: "graphite-properties",
    mode: "carriers",
    instruction: "Predict carriers and mobility. Advance their drift.",
  },
);
carriers.title = "Find mobile carriers";
const melting = q(
  "g-melting",
  "Why can graphite be soft yet have a very high melting temperature?",
  "Sliding sheets is easier than overcoming many strong covalent bonds",
  {
    "All carbon–carbon covalent bonds must be weak":
      "Weak interlayer attractions do not make in-sheet covalent bonds weak.",
    "Softness always means a low melting point":
      "Hardness and melting involve different structural changes here.",
  },
  "Sliding overcomes weak interlayer attractions; changing the giant covalent structure requires much energy to overcome strong in-layer bonds.",
  "Compare what changes in sliding and in melting.",
  "Contrasting causal explanations for two properties.",
  {
    kind: "graphite-properties",
    mode: "melting",
    instruction: "Predict the interaction and energy demand.",
  },
);
melting.title = "Softness versus melting";
const written: LearningTask = {
  id: "gr-v1-p-explain",
  title: "Explain two different properties",
  prompt:
    "Explain why graphite conducts electricity and can act as a lubricant. Include the relevant structural feature for each property.",
  answer:
    "Delocalised electrons move through layers and carry charge. Weak attractions between layers allow layers to slide while strong covalent bonds within sheets stay intact.",
  rubric: [
    "Identify mobile delocalised electrons as electrical carriers.",
    "Explain charge movement through layers rather than motion of carbon nuclei.",
    "Identify weak attractions between layers, with no covalent interlayer bonds.",
    "Link sliding of intact sheets to lubrication; do not call in-sheet covalent bonds weak.",
  ],
  explanation: "Use a different structural reason for each property.",
  hint: "Separate electron movement from sheet movement.",
  purpose: "Written two-property causal explanation; self-review only.",
};
const comparison: LearningTask = {
  id: "gr-v1-p-compare",
  title: "Compare two carbon allotropes",
  prompt:
    "Compare diamond and graphite: describe their local bonding and explain their different conduction and hardness.",
  answer:
    "Diamond has four covalent neighbours per carbon in a rigid three-dimensional network and no mobile carriers. Graphite has three neighbours in layers, delocalised electrons and weak interlayer attractions allowing sliding.",
  rubric: [
    "Both are carbon allotropes with strong covalent bonding, not different elements.",
    "Diamond: four covalent neighbours in a rigid three-dimensional network; very hard.",
    "Graphite: three covalent neighbours in hexagonal layers; weak interlayer attractions allow sliding.",
    "Graphite has mobile delocalised electrons; diamond lacks mobile carriers in the pure GCSE model.",
  ],
  explanation:
    "Structure extent and mobile carriers matter; both materials contain electrons and strong covalent bonds.",
  hint: "Compare four directions with three in a plane, then sliding and mobility.",
  purpose: "Written cross-allotrope synthesis; self-review only.",
};
export const graphiteJourney: LessonJourney = {
  version: 1,
  introduction:
    "Inspect graphite’s hexagonal sheets. Separate sliding from melting and mobile electrons from carbon movement.",
  scopeNote:
    "Common Foundation/combined graphite and giant covalent reasoning, with Pearson electrode/lubricant uses. Shapes, layer spacing and electron markers are schematic; graphene/fullerenes are separate future work.",
  outcomes: [
    "Recognise three bonded neighbours and stacked hexagonal sheets.",
    "Explain sliding, high melting and electrical conduction with distinct causes.",
    "Apply structure to lubrication and electrodes; compare graphite with diamond.",
  ],
  warmup: [
    q(
      "w-bond",
      "What holds two carbon atoms together within a covalent network?",
      "A shared pair of electrons attracted to both nuclei",
      {
        "Only weak forces between separate molecules":
          "Do not replace covalent bonding with intermolecular attraction.",
        "Transfer of a carbon nucleus":
          "Covalent bonding does not transfer nuclei.",
      },
      "Covalent bonding is strong shared-electron attraction.",
      "Recall the previous bonding lesson.",
      "Prerequisite bond explanation.",
    ),
    q(
      "w-mobile",
      "What is required for a material to conduct electrical charge?",
      "Charged particles able to move through the material",
      {
        "Any electrons, even all fixed locally":
          "Presence is not enough; carriers must be mobile.",
        "A non-zero overall charge on the whole material":
          "Neutral metals can conduct.",
      },
      "Mobility of carriers explains conduction, not merely overall charge.",
      "Use the neutral-metal counterexample.",
      "Prerequisite carrier condition.",
    ),
  ],
  refresher: [
    q(
      "r-coordination",
      "How does local graphite bonding differ from diamond?",
      "Three coplanar neighbours instead of four tetrahedral neighbours",
      {
        "Six neighbours instead of four":
          "A hexagonal ring has six atoms, but each interior carbon has three bonded neighbours.",
        "Three different element types": "Both allotropes are carbon.",
      },
      "Graphite forms extended hexagonal sheets with three neighbours per interior carbon.",
      "Separate ring size from atom coordination.",
      "Targeted local-connectivity recovery.",
    ),
    q(
      "r-sliding",
      "Which interactions are weaker in graphite?",
      "Attractions between layers",
      {
        "Covalent bonds within layers": "These carbon–carbon bonds are strong.",
        "All interactions are equally weak":
          "The strong/weak distinction explains its different properties.",
      },
      "There are no covalent links between layers; weaker attractions permit sliding.",
      "Identify where the attraction acts.",
      "Targeted softness/lubrication recovery.",
    ),
    q(
      "r-carriers",
      "How do graphite electrons differ from diamond bonding electrons?",
      "Graphite has a mobile delocalised-electron pool",
      {
        "Diamond contains no electrons at all":
          "Diamond has electrons; they are not mobile carriers through pure diamond.",
        "Carbon nuclei in graphite become negative":
          "Do not confuse electrons with nuclei.",
      },
      "One outer electron per carbon contributes to graphite’s delocalised pool.",
      "Explain mobility through a sheet.",
      "Targeted carrier recovery.",
    ),
    q(
      "r-melting",
      "Does easy layer sliding imply graphite has weak in-layer covalent bonds?",
      "No: strong in-layer bonds require much energy to overcome",
      {
        "Yes: every bond must be weak":
          "Softness concerns sliding, not destroying sheets.",
        "No: only a single weak molecular attraction matters":
          "Graphite is a giant layered covalent structure.",
      },
      "Many strong covalent bonds explain very high melting; weak interlayer attractions explain sliding.",
      "Distinguish the structural changes.",
      "Targeted force/energy recovery.",
    ),
    q(
      "r-uses",
      "Which graphite property is directly relevant to an electrode?",
      "Electrical conduction by mobile delocalised electrons",
      {
        "Softness alone explains charge transport":
          "Sliding does not itself carry electrical charge.",
        "Its grey colour alone explains conduction":
          "Colour is not the carrier mechanism.",
      },
      "A conducting electrode provides a path for electrical charge; chemical suitability still depends on the actual system.",
      "Select the use-relevant property.",
      "Targeted property-to-use recovery.",
    ),
  ],
  guided: [coordination, sliding, carriers, melting],
  practice: [
    q(
      "p-recognise",
      "Which description fits this cropped carbon pattern?",
      "Stacked extended hexagonal sheets",
      {
        "Separate six-carbon molecules":
          "Adjacent rings share atoms and extend beyond the crop.",
        "Four-direction tetrahedral bulk network":
          "That describes diamond, not the represented layered arrangement.",
      },
      "Rings extend into sheets; stacking is not molecular grouping.",
      "Follow links beyond one ring.",
      "Independent structure recognition.",
    ),
    number(
      "gr-v1-p-neighbours",
      "How many direct links meet the selected carbon in its own sheet?",
      3,
      "neighbours",
      "Three covalent neighbours surround each selected interior graphite carbon.",
      "Count links at the carbon, not all atoms in a ring.",
      "Independent local diagram count.",
      {
        "4": "A fourth tetrahedral neighbour belongs to diamond.",
        "6": "Ring size is not local coordination.",
      },
    ),
    number(
      "gr-v1-p-pool",
      "In the ideal GCSE model, 60 graphite carbons each contribute one delocalised electron. How many electrons enter the mobile pool?",
      60,
      "electrons",
      "One contribution per carbon gives 60 delocalised electrons. This is not the total number of electrons in 60 atoms.",
      "Use the stated one-per-carbon contribution.",
      "Conserved contribution count.",
      {
        "240":
          "Four outer electrons per carbon is not the one-per-carbon delocalised contribution.",
        "360": "Total atomic electrons are not all mobile carriers.",
      },
    ),
    q(
      "p-sliding",
      "Repair: “graphite lubricates because its carbon–carbon covalent bonds are weak.”",
      "Weak interlayer attractions allow intact sheets to slide",
      {
        "The statement is correct: all covalent bonds are weak":
          "In-sheet covalent bonds are strong.",
        "Every ring separates into a free six-carbon molecule":
          "Sliding does not break the sheet into molecules.",
      },
      "Lubrication depends on easier sliding between strongly bonded sheets.",
      "Name the location of the weaker attraction.",
      "Independent misconception repair.",
    ),
    q(
      "p-melting",
      "Why does softness not imply a low melting temperature for graphite?",
      "Melting the giant structure requires much energy to overcome many strong in-sheet bonds",
      {
        "Only soft materials can have strong bonds":
          "Hardness is not a classification of all bond strengths.",
        "Only weak interlayer attractions explain high melting":
          "Weak interactions alone cannot explain the high energy demand.",
      },
      "Sliding and changing the giant covalent structure involve different interactions.",
      "Use strong bonds, many bonds and much energy.",
      "Independent full melting explanation.",
    ),
    q(
      "p-conduction",
      "Repair: “graphite conducts because all electrons stay fixed on carbon atoms.”",
      "Delocalised electrons move through the layers and carry charge",
      {
        "Fixed electrons alone carry charge through the material":
          "Conduction requires carriers to move through the material.",
        "Carbon nuclei flow through the solid":
          "The nuclei remain in the structure.",
      },
      "One electron per carbon contributes to the delocalised pool.",
      "State both mobility and charge carriage.",
      "Independent carrier correction.",
    ),
    q(
      "p-electrode",
      "A graphite rod is selected as an electrode in a supplied suitable electrochemical system. Which property explains its electrical role?",
      "Mobile delocalised electrons carry charge through it",
      {
        "Layer sliding alone carries current":
          "Sliding explains lubrication, not electrical conduction.",
        "Graphite has absolutely no chemical reactions in any conditions":
          "Electrode reactivity depends on the system; this is not a universal inertness claim.",
      },
      "Electrical conduction explains the rod’s electrical role; chemical compatibility must be considered separately.",
      "Choose a carrier explanation.",
      "Bounded electrode-use transfer.",
    ),
    q(
      "p-pencil",
      "Graphite leaves a mark when rubbed on paper. Which structural explanation fits?",
      "Layers can slide and rub off because attractions between them are weak",
      {
        "Each carbon loses its nucleus to the paper":
          "Rubbing off material does not transfer individual nuclei by breaking atoms.",
        "All strong in-layer bonds must break at once":
          "Intact layered fragments can detach.",
      },
      "The layered structure and weak between-layer attractions explain transfer onto paper.",
      "Distinguish material rubbing off from destroying atoms.",
      "Pencil-use transfer without chemical change claims.",
    ),
    q(
      "p-neutral",
      "Both graphite and diamond are overall neutral. Why can their conduction differ?",
      "Graphite has mobile delocalised electrons; pure diamond lacks mobile carriers",
      {
        "Neutrality forces both to insulate":
          "Neutral conducting metals and graphite are counterexamples.",
        "Diamond must contain fewer kinds of elements":
          "Both are forms of carbon.",
      },
      "Structure and electron mobility, not neutrality or different elements, explain the contrast.",
      "Compare the carrier condition.",
      "Cross-allotrope neutral-material transfer.",
    ),
    q(
      "p-boundary",
      "At a cut edge, a carbon has only two drawn links. What does this tell you about bulk graphite?",
      "The drawing omits continuation; interior bulk carbon has three neighbours",
      {
        "Every graphite carbon has exactly two covalent neighbours":
          "Cut edges do not give the interior coordination.",
        "Real surfaces must have the same termination forever":
          "The model does not specify real surface chemistry.",
      },
      "Separate a finite representation from the extended structure and actual surface chemistry.",
      "Read the selected interior site.",
      "Independent model-boundary interpretation.",
    ),
    written,
    comparison,
  ],
  checkForms: [
    [
      number(
        "gr-v1-ca-neighbours",
        "Retrieve the number of covalent neighbours per interior graphite carbon.",
        3,
        "neighbours",
        "Graphite has three covalent neighbours per interior carbon.",
        "Recall local coordination.",
        "Reserved coordination retrieval.",
      ),
      q(
        "ca-structure",
        "Which structure describes graphite?",
        "Extended hexagonal sheets stacked in layers",
        {
          "Separate six-atom molecules": "The rings join an extended sheet.",
          "A four-neighbour network in every direction":
            "That describes diamond.",
        },
        "Strong links extend within sheets; there are no covalent links between sheets.",
        "Recall layers and rings.",
        "Reserved structure retrieval.",
      ),
      q(
        "ca-sliding",
        "Why can graphite layers slide easily?",
        "Weak attractions between layers are overcome",
        {
          "All in-layer covalent bonds are weak": "Those bonds are strong.",
          "Sliding requires every carbon atom to become an ion":
            "That is not the layer mechanism.",
        },
        "Intact sheets can slide because interlayer attractions are weaker.",
        "Locate the weaker interaction.",
        "Reserved causal softness retrieval.",
      ),
      q(
        "ca-carriers",
        "What explains graphite electrical conduction?",
        "Mobile delocalised electrons carry charge through layers",
        {
          "Carbon nuclei drift through the material":
            "The structure need not move.",
          "Only electrons fixed at one carbon are needed":
            "Those are not mobile carriers.",
        },
        "Delocalised electrons supply mobile charged carriers.",
        "Name particles and mobility.",
        "Reserved carrier retrieval.",
      ),
      q(
        "ca-melting",
        "Why is graphite’s melting temperature very high?",
        "Many strong covalent bonds require much energy to overcome",
        {
          "Weak interlayer attractions require little energy":
            "That explains easier sliding, not the high melting demand.",
          "Softness means there are no bonds":
            "Graphite has strong covalent bonds within sheets.",
        },
        "Strong in-layer covalent bonds explain the high energy demand.",
        "Use the complete causal chain.",
        "Reserved high-temperature retrieval.",
      ),
    ],
    [
      q(
        "cb-diagram",
        "Which description fits the supplied cropped carbon pattern?",
        "Stacked sheets with linked six-membered rings",
        {
          "Exactly six carbon atoms in every piece":
            "The rings extend through a sheet.",
          "All carbons have four tetrahedral neighbours":
            "The represented sheets have three links per interior carbon.",
        },
        "The diagram represents an extended layered structure.",
        "Read arrangement and connectivity.",
        "Second reserved diagram recognition.",
      ),
      q(
        "cb-lubricant",
        "Choose a complete lubricant explanation for graphite.",
        "Weak interlayer attractions permit sliding of strongly bonded sheets",
        {
          "Delocalised electrons alone explain sliding":
            "Carrier mobility explains electrical conduction.",
          "Strong in-layer bonds must all break into atoms":
            "That does not describe intact sheet sliding.",
        },
        "Use the property-relevant interaction.",
        "Separate sliding from conduction.",
        "Second reserved use reasoning.",
      ),
      q(
        "cb-electrode",
        "Why can suitable graphite carry charge as an electrode?",
        "Delocalised electrons are mobile through the layers",
        {
          "Because it is grey": "Colour is not the electrical mechanism.",
          "Because every material with electrons conducts": "Mobility matters.",
        },
        "Electron mobility supplies the electrical pathway.",
        "State charged carriers and movement.",
        "Second reserved electrode transfer.",
      ),
      number(
        "gr-v1-cb-pool",
        "In the supplied ideal model, 84 carbons each contribute one mobile delocalised electron. What is the contribution count?",
        84,
        "electrons",
        "One contribution from each carbon gives 84.",
        "Count contributions, not all atomic electrons.",
        "Second reserved contribution transfer.",
      ),
      q(
        "cb-compare",
        "What do diamond and graphite have in common despite different properties?",
        "Both are carbon allotropes with strong covalent bonding",
        {
          "Both have the same mobile electron pool":
            "Pure diamond lacks graphite’s mobile carriers.",
          "Both consist of small separate molecules":
            "Both have giant covalent structures.",
        },
        "Different arrangements of the same element produce different properties.",
        "Separate common bond type from arrangement.",
        "Second reserved allotrope comparison.",
      ),
    ],
  ],
  reviewForms: [
    [
      number(
        "gr-v1-ra-neighbours",
        "After the delay, retrieve graphite’s interior bonded-neighbour count.",
        3,
        "neighbours",
        "Three neighbours meet each interior carbon within its sheet.",
        "Recall local links.",
        "Delayed local coordination.",
      ),
      q(
        "ra-sliding",
        "What remains intact when one graphite sheet slides over another?",
        "Strong covalent bonds within each sheet",
        {
          "Every carbon atom becomes a separate molecule":
            "The sheet remains bonded.",
          "A fourth covalent link between sheets":
            "There are no such interlayer covalent links.",
        },
        "Sliding overcomes weaker interlayer attractions.",
        "Recall which structure moves as a whole.",
        "Delayed sliding mechanism.",
      ),
      q(
        "ra-carriers",
        "Why can graphite carry current while pure diamond cannot in this model?",
        "Graphite has mobile delocalised electrons",
        {
          "Diamond contains no electrons":
            "Diamond contains electrons but lacks mobile carriers.",
          "Graphite has positive carbon nuclei that flow":
            "Nuclei do not carry the represented current.",
        },
        "Mobile charged carriers explain conduction.",
        "State mobility.",
        "Delayed carrier contrast.",
      ),
    ],
    [
      q(
        "rb-melting",
        "Why can a soft layered material still have a very high melting temperature?",
        "Many strong in-layer bonds require much energy to overcome",
        {
          "Softness guarantees weak covalent bonds":
            "Softness here reflects sliding between sheets.",
          "All hexagonal rings are separate small molecules":
            "They connect through the sheets.",
        },
        "Identify the interaction relevant to the structural change.",
        "Compare sliding with changing the giant structure.",
        "Alternative delayed force contrast.",
      ),
      q(
        "rb-use",
        "Which feature makes graphite suitable as a lubricant?",
        "Weak interlayer attractions allow sheets to slide",
        {
          "Fixed nuclei directly carry electrical charge":
            "That does not explain lubrication.",
          "Lack of any strong covalent bonds": "Within-sheet bonds are strong.",
        },
        "Connect layer sliding with reduced friction in suitable uses.",
        "Choose the use-relevant cause.",
        "Alternative delayed use transfer.",
      ),
      q(
        "rb-crop",
        "Does a drawing with 96 graphite carbons establish a C₉₆ molecule formula?",
        "No: it is a finite crop of extended sheets",
        {
          "Yes: all pieces of graphite have exactly 96 atoms":
            "The displayed count is a chosen fragment.",
          "No: graphite must therefore be an ionic salt":
            "It is covalent carbon.",
        },
        "Finite asset counts are not molecular formulas.",
        "Separate visual inventory from bulk structure.",
        "Alternative delayed representation boundary.",
      ),
    ],
  ],
};
for (const task of [...graphiteJourney.guided, ...graphiteJourney.practice])
  task.followUp =
    task.id.includes("carrier") ||
    task.id.includes("conduction") ||
    task.id.includes("neutral") ||
    task.id.includes("pool")
      ? "gr-v1-r-carriers"
      : task.id.includes("sliding") || task.id.includes("pencil")
        ? "gr-v1-r-sliding"
        : task.id.includes("melting")
          ? "gr-v1-r-melting"
          : task.id.includes("electrode")
            ? "gr-v1-r-uses"
            : "gr-v1-r-coordination";
const titles: Record<string, string> = {
  "p-recognise": "Recognise stacked sheets",
  "p-neighbours": "Count direct neighbours",
  "p-pool": "Count mobile contributions",
  "p-sliding": "Repair the sliding explanation",
  "p-melting": "Soft does not mean low melting",
  "p-conduction": "Explain charge movement",
  "p-electrode": "Apply a conducting property",
  "p-pencil": "Explain a pencil mark",
  "p-neutral": "Neutral materials can differ",
  "p-boundary": "Interpret the cropped edge",
};
for (const task of graphiteJourney.practice)
  task.title ??= titles[task.id.replace("gr-v1-", "")];
for (const task of graphiteJourney.practice)
  if (
    ["gr-v1-p-recognise", "gr-v1-p-neighbours", "gr-v1-p-boundary"].includes(
      task.id,
    )
  )
    task.graphiteDiagram = true;
graphiteJourney.checkForms[1][0].graphiteDiagram = true;

extendGraphiteWriting(graphiteJourney);
