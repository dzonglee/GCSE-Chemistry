import { extendGrapheneWriting } from "./graphene-writing";
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
    `ge-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    purpose,
    model,
  );
const sheet = q(
  "g-sheet",
  "How many atom layers form graphene, and do its links extend?",
  "One atom layer in an extended sheet",
  {
    "Three stacked atom layers":
      "That is a graphite-style stack rather than one graphene sheet.",
    "One separate 32-carbon molecule":
      "The finite crop is not a fixed molecule formula.",
  },
  "Graphene is one atom thick and has an extended hexagonal covalent network. Three bonded neighbours per interior carbon is a different count from one atom layer.",
  "Rotate edge-on, then follow connected rings.",
  "Layer count and network extent, kept distinct from coordination.",
  {
    kind: "graphene-properties",
    mode: "sheet",
    instruction: "Predict layers and structure extent.",
  },
);
sheet.title = "Inspect one sheet";
const electronics = q(
  "g-electronics",
  "A design needs a very thin electrically conducting layer. Why might graphene suit it?",
  "It is one atom thick and has mobile delocalised electrons",
  {
    "Every covalent material is an electrical insulator":
      "Graphene is a counterexample because it has mobile carriers.",
    "Weak attractions between three stacked sheets carry current":
      "Graphene is one sheet; sliding is not electrical conduction.",
  },
  "Thinness and electrical conduction meet the stated requirements. Mobile delocalised electrons carry charge through the sheet. Suitability for an actual device needs further testing.",
  "Match the stated thinness and carrier requirements.",
  "Property/use decision with a complete carrier explanation.",
  {
    kind: "graphene-properties",
    mode: "electronics",
    instruction: "Choose a relevant property and carrier mechanism.",
  },
);
electronics.title = "Design a thin conductor";
const composite = q(
  "g-composite",
  "Choose a supplied panel with mass at most 15 g and supported load at least 15 N. Explain graphene’s strength contribution.",
  "B: both criteria pass; strong in-sheet covalent bonds support reinforcement",
  {
    "A: only its low mass matters":
      "A supports only 8 N, below the 15 N requirement.",
    "C: only its 30 N load matters": "C has mass 20 g, above the 15 g limit.",
  },
  "Panel B has mass 12 g and supported load 18 N. Strong covalent bonding in graphene supports its potential reinforcing role. The illustrative data apply to these finished panels, not every composite.",
  "Compare both inequalities, then name the within-sheet bonding.",
  "Two-criterion supplied evidence and bonding-based application.",
  {
    kind: "graphene-properties",
    mode: "composite",
    instruction: "Use both mass and load requirements.",
  },
);
composite.title = "Choose a suitable panel";
const written: LearningTask = {
  id: "ge-v1-p-explain",
  title: "Explain two possible uses",
  prompt:
    "Explain how graphene’s structure and bonding can support use in thin electrical components and in strong lightweight composites. Keep the electrical and strength mechanisms distinct.",
  answer:
    "Graphene is one atom thick. Mobile delocalised electrons carry charge through its sheet, supporting thin electrical components. Strong covalent bonds within the sheet support high strength and a reinforcing role in lightweight composites; actual suitability depends on the whole material.",
  rubric: [
    "Single atom-layer sheet of carbon, with extended covalent bonding.",
    "Mobile delocalised electrons carry electrical charge.",
    "Link thinness and conduction to a thin electrical component.",
    "Strong within-sheet covalent bonds support strength/reinforcement.",
    "Link the relevant whole-composite properties to the proposed use without universal guarantees.",
  ],
  explanation:
    "Electrical conduction and strength need different causal explanations. An actual composite’s mass and performance must be measured.",
  hint: "Structure → property mechanism → proposed use, separately for each use.",
  purpose: "Written structure/property/use synthesis; self-review only.",
};
const comparison: LearningTask = {
  id: "ge-v1-p-compare",
  title: "Compare three carbon structures",
  prompt:
    "Compare graphene, graphite and diamond. State their arrangement and explain why graphite’s easy layer sliding is not a universal property of all three.",
  answer:
    "Graphene is one extended hexagonal sheet with three neighbours per interior carbon. Graphite stacks such sheets with weak interlayer attractions allowing sliding. Diamond has four neighbours in a rigid 3D covalent network; its structure is not stacked sliding sheets.",
  rubric: [
    "Graphene is a single extended hexagonal sheet, not a cage or fixed molecule.",
    "Graphite has multiple sheets and weaker attractions between them.",
    "Graphite layers can slide while strong within-sheet bonds remain.",
    "Diamond has four covalent neighbours in a three-dimensional network.",
    "Do not apply a between-layer sliding explanation to one isolated graphene sheet or to diamond.",
  ],
  explanation:
    "A common element and strong covalent bonding do not imply identical arrangement or properties.",
  hint: "Compare one sheet, stacked sheets and a network in all directions.",
  purpose:
    "Written structural comparison with model-boundary reasoning; self-review only.",
};
export const grapheneJourney: LessonJourney = {
  version: 1,
  introduction:
    "Inspect one atom-layer sheet and connect its bonding to electrical components and evidence-based composite choices.",
  scopeNote:
    "Common Foundation/combined graphene structure and use reasoning. Geometry is schematic; supplied panel data are illustrative, not universal material constants. Fullerenes/nanotubes require a separate lesson.",
  outcomes: [
    "Recognise an extended, one-atom-thick hexagonal sheet.",
    "Explain electrical conduction and strength with distinct bonding/electron mechanisms.",
    "Apply simultaneous design criteria to supplied composite evidence without overgeneralising.",
  ],
  warmup: [
    q(
      "w-graphite",
      "What is graphite’s arrangement?",
      "Stacked extended hexagonal carbon sheets",
      {
        "Separate six-carbon molecules": "The rings connect through sheets.",
        "Four tetrahedral neighbours in every direction":
          "That describes diamond.",
      },
      "Graphene is one of the sheets that form graphite.",
      "Recall the previous lesson’s layered model.",
      "Prerequisite layered-structure retrieval.",
    ),
    q(
      "w-mobile",
      "What feature lets graphite carry electrical charge through its layers?",
      "Mobile delocalised electrons",
      {
        "Carbon nuclei flow through the solid":
          "Nuclei remain in the structure.",
        "Only fixed electrons are required":
          "Carrier mobility through the material is needed.",
      },
      "Graphene retains a mobile delocalised-electron pool within a sheet.",
      "State charged carriers and mobility.",
      "Prerequisite electrical-carrier retrieval.",
    ),
  ],
  refresher: [
    q(
      "r-sheet",
      "How is graphene related to graphite?",
      "It is one extended atom-layer sheet of graphite",
      {
        "It is always three stacked sheets": "That is a graphite-style stack.",
        "It is a closed sixty-carbon cage":
          "That is a different carbon structure.",
      },
      "Graphene is one atom thick, with an extended hexagonal network. Each interior carbon has three bonded neighbours; layer count and neighbour count are different.",
      "Separate layer count from molecule size.",
      "Targeted single-sheet recovery.",
    ),
    q(
      "r-carriers",
      "Why can a covalent graphene sheet conduct electricity?",
      "Its delocalised electrons can move and carry charge",
      {
        "Every covalent material must be an insulator":
          "Structure and carrier mobility determine this property.",
        "All electrons must stay fixed to one atom":
          "That does not explain current through the material.",
      },
      "Mobile delocalised electrons are carriers through the sheet.",
      "Mobility, not merely presence.",
      "Targeted conduction mechanism recovery.",
    ),
    q(
      "r-strength",
      "Which feature explains graphene’s high in-plane strength?",
      "Strong covalent bonds joining carbon atoms through the sheet",
      {
        "Weak attractions between stacked sheets":
          "That is not the strong within-sheet bonding.",
        "Electrical current alone creates all its strength":
          "Electrical conduction and strength need different explanations.",
      },
      "An extended network of strong carbon–carbon bonds supports high in-plane strength.",
      "Name the within-sheet bond type.",
      "Targeted strength mechanism recovery.",
    ),
    q(
      "r-evidence",
      "A design imposes both a mass limit and a minimum supported load. How should you choose a panel?",
      "Require it to meet both supplied criteria",
      {
        "Choose the lightest even if it fails the load":
          "A failed requirement rules that candidate out.",
        "Choose the largest load even if it exceeds the mass":
          "Both criteria matter.",
      },
      "Use the complete evidence, and do not turn one result into a claim about every material.",
      "Check both inequalities.",
      "Targeted multi-criterion evidence recovery.",
    ),
  ],
  guided: [sheet, electronics, composite],
  practice: [
    number(
      "ge-v1-p-layer",
      "How many atom layers thick is an ideal graphene sheet?",
      1,
      "atom layer",
      "Graphene is one atom thick; the drawn spheres do not give physical thickness.",
      "Count layers, not neighbours.",
      "Independent layer-count retrieval.",
      {
        "3": "Three neighbours per carbon is not three atom layers.",
        "4": "Four neighbours describes diamond coordination.",
      },
    ),
    number(
      "ge-v1-p-neighbours",
      "How many directly bonded carbon neighbours meet the selected interior carbon in this single-sheet diagram?",
      3,
      "neighbours",
      "Three strong covalent links meet each selected interior carbon in the hexagonal network.",
      "Count the direct lines at the selected carbon.",
      "Independent local diagram reading.",
      {
        "1": "One atom layer does not mean one bonded neighbour.",
        "6": "Six atoms in a ring is not the local neighbour count.",
      },
    ),
    q(
      "p-extent",
      "Which description fits the supplied cropped carbon pattern?",
      "One extended sheet of interconnected hexagonal rings",
      {
        "A fixed 32-carbon molecule":
          "The crop omits continued links beyond its edges.",
        "Three stacked sheets": "Only one sheet is represented.",
      },
      "Graphene’s structure extends within one sheet; the asset’s 32 atoms are a chosen crop.",
      "Follow rings beyond a local motif.",
      "Independent network recognition.",
    ),
    q(
      "p-strength",
      "Repair: “graphene is strong because carbon atoms are joined by weak covalent bonds.”",
      "Strong covalent bonds extend within its sheet",
      {
        "The statement is correct: strong materials always have weak bonds":
          "The causal explanation is contradictory.",
        "Only weak attractions between three layers explain it":
          "Graphene is a single sheet.",
      },
      "Strong carbon–carbon covalent bonding supports in-plane strength.",
      "Name strong within-sheet bonding.",
      "Independent strength misconception repair.",
    ),
    q(
      "p-electronics",
      "Why could graphene support a very thin conducting component?",
      "One-atom thickness and mobile delocalised electrons fit the requirements",
      {
        "Carbon nuclei move freely and carry the current":
          "The carrier model uses electrons, not mobile nuclei.",
        "Every atom must be ionised before graphene can conduct":
          "Graphene has mobile electrons without that claim.",
      },
      "Thinness and electron mobility support the proposed use; real devices need further evaluation.",
      "Match both thinness and conduction.",
      "Independent property/use application.",
    ),
    q(
      "p-universal",
      "Does knowing a substance is covalent prove that it cannot conduct electricity?",
      "No: graphene has mobile delocalised electrons",
      {
        "Yes: bond type alone always decides conduction":
          "Graphene and graphite are counterexamples.",
        "No: every covalent material must therefore conduct":
          "Pure diamond lacks mobile carriers in the GCSE model.",
      },
      "Use the specific structure and mobility of charged carriers.",
      "Avoid a universal rule from one example.",
      "Independent cross-material conduction boundary.",
    ),
    q(
      "p-panel",
      "From the supplied panel table, which meets mass ≤ 15 g AND supported load ≥ 15 N?",
      "B: 12 g and 18 N",
      {
        "A: 10 g and 8 N": "The load is too small.",
        "C: 20 g and 30 N": "The mass is too large.",
      },
      "Panel B passes both supplied requirements. This is evidence about the given finished panel.",
      "Read both columns.",
      "Independent two-criterion data application.",
    ),
    number(
      "ge-v1-p-reduction",
      "Using the supplied table, what percentage less mass does panel B have than panel C?",
      40,
      "%",
      "The decrease is 20 − 12 = 8 g; 8/20 × 100 = 40%. This compares panel masses, not graphene’s atomic thickness.",
      "Divide the difference by the starting mass of C.",
      "Independent relative-change calculation from supplied evidence.",
      {
        "66.6667":
          "Use the starting C mass, not the smaller B mass, as the denominator.",
        "60": "60% is the remaining fraction, not the decrease.",
      },
    ),
    q(
      "p-criterion",
      "Why is choosing panel C only because it supports 30 N incomplete?",
      "It exceeds the stated 15 g mass limit",
      {
        "Largest supported load always overrides all other criteria":
          "The given design requires both criteria.",
        "Its strong bonding makes its mass exactly zero":
          "Bonding does not remove its mass.",
      },
      "A candidate can perform well on one dimension and still fail the design.",
      "Compare C with both limits.",
      "Independent evidence-based rejection.",
    ),
    q(
      "p-density",
      "The equal-area panels have different masses, but their thicknesses/volumes are not supplied. Can you conclude that B has lower density than C?",
      "No: density needs mass and volume, not area alone",
      {
        "Yes: lower mass always proves lower density":
          "The panels might have different volumes.",
        "No: this proves every graphene composite is unsuitable":
          "Missing density evidence does not reverse the supplied mass/load result.",
      },
      "The data support a mass comparison. They do not establish density or universal performance for all composites.",
      "Distinguish area from volume.",
      "Independent limit of material-evidence inference.",
    ),
    written,
    comparison,
  ],
  checkForms: [
    [
      number(
        "ge-v1-ca-layers",
        "Retrieve the atom-layer thickness of ideal graphene.",
        1,
        "atom layer",
        "One atom layer forms a graphene sheet.",
        "Recall the structure.",
        "Reserved single-layer retrieval.",
      ),
      q(
        "ca-network",
        "What describes graphene structure?",
        "An extended hexagonal covalent sheet",
        {
          "A separate fixed 32-carbon molecule":
            "A cropped drawing is not a molecule formula.",
          "A stack with four atom layers by definition":
            "Graphene is one atom thick.",
        },
        "Strong links extend through the sheet.",
        "Separate extent from crop size.",
        "Reserved network retrieval.",
      ),
      q(
        "ca-conduction",
        "What explains electrical conduction through graphene?",
        "Mobile delocalised electrons carry charge",
        {
          "Every electron is fixed at a carbon":
            "Fixed particles do not carry charge through the sheet.",
          "Carbon nuclei move along the circuit":
            "The carrier model uses electrons.",
        },
        "Electron mobility explains current through the sheet.",
        "State both carriers and mobility.",
        "Reserved electrical mechanism.",
      ),
      q(
        "ca-strength",
        "Which feature explains high in-plane strength?",
        "Strong covalent bonds extending through the sheet",
        {
          "Only weak between-layer attractions":
            "This is not the strong in-plane network.",
          "Being grey without any strong bonding":
            "Colour does not supply the strength mechanism.",
        },
        "The covalent network supports strong in-plane bonding.",
        "Locate the relevant bond.",
        "Reserved strength mechanism.",
      ),
      q(
        "ca-use",
        "A proposed component must be very thin and conduct charge. Which graphene features are relevant?",
        "One-atom thickness and mobile delocalised electrons",
        {
          "Layer sliding alone explains both criteria":
            "There is only one sheet and sliding is not conduction.",
          "The absence of electrons makes it a conductor":
            "It contains mobile electron carriers.",
        },
        "Match properties to the specified use.",
        "Check both requirements.",
        "Reserved property/use transfer.",
      ),
    ],
    [
      q(
        "cb-recognise",
        "Which description fits the supplied carbon pattern?",
        "A single extended planar sheet",
        {
          "A hollow spherical cage":
            "The pattern is a sheet, not a closed cage.",
          "Three stacked atom layers": "Only one pattern is represented.",
        },
        "Graphene is a single extended sheet of connected rings.",
        "Read arrangement and continuation.",
        "Second reserved diagram recognition.",
      ),
      q(
        "cb-panel",
        "Which supplied panel meets both stated mass and load requirements?",
        "B: 12 g and 18 N",
        {
          "A: lightest is enough": "A fails supported load.",
          "C: strongest is enough": "C exceeds the mass limit.",
        },
        "Use both given criteria.",
        "Read mass and load together.",
        "Second reserved data application.",
      ),
      number(
        "ge-v1-cb-drop",
        "From the table, calculate the mass decrease from C to B.",
        8,
        "g",
        "20 − 12 = 8 g.",
        "Subtract B mass from C mass.",
        "Second reserved data calculation.",
      ),
      q(
        "cb-proof",
        "What does panel B’s supplied performance establish?",
        "It meets these stated criteria; wider suitability needs more evidence",
        {
          "Every graphene composite has identical mass and strength":
            "One supplied test cannot establish that universal claim.",
          "Its mass alone proves its density": "Volume is not supplied.",
        },
        "Keep inference proportional to the evidence.",
        "Distinguish this candidate from all possible materials.",
        "Second reserved evidence boundary.",
      ),
      q(
        "cb-contrast",
        "Why is graphite-style layer sliding not the explanation for isolated graphene’s conduction?",
        "Graphene is one sheet; mobile electrons explain charge transport",
        {
          "Graphene must have no covalent bonds":
            "Its within-sheet covalent network is strong.",
          "Graphene contains four neighbours per carbon like diamond":
            "Selected interior sheet carbons have three.",
        },
        "Different properties need their own relevant structural mechanisms.",
        "Separate electron motion from whole-layer motion.",
        "Second reserved cross-structure explanation.",
      ),
    ],
  ],
  reviewForms: [
    [
      number(
        "ge-v1-ra-layers",
        "After the delay, retrieve graphene’s atom-layer count.",
        1,
        "atom layer",
        "Graphene is one atom-layer thick.",
        "Recall its relation to graphite.",
        "Delayed single-sheet retrieval.",
      ),
      q(
        "ra-carriers",
        "Why can graphene conduct charge through its sheet?",
        "Delocalised electrons can move through it",
        {
          "Only fixed nuclei are needed":
            "Carriers need to move through the material.",
          "It must have weak covalent bonds":
            "Strength and conduction are different mechanisms.",
        },
        "Mobile delocalised electrons carry charge.",
        "State mobility.",
        "Delayed electrical explanation.",
      ),
      q(
        "ra-strength",
        "Which bonding feature supports a reinforcing role for graphene?",
        "Strong covalent bonds within the sheet",
        {
          "Weak attractions between many stacked sheets":
            "Those do not explain graphene’s high in-plane strength.",
          "Low mass proves all bonds are weak":
            "Mass does not give that conclusion.",
        },
        "The strong covalent network supports in-plane strength.",
        "Locate the relevant interaction.",
        "Delayed reinforcing-property explanation.",
      ),
    ],
    [
      q(
        "rb-network",
        "Does a finite 32-atom drawing give graphene the molecule formula C₃₂?",
        "No: it is a cropped extended sheet",
        {
          "Yes: every sample contains exactly 32 atoms":
            "That is only the chosen drawing inventory.",
          "No: it must be an ionic salt": "Graphene is covalent carbon.",
        },
        "A network fragment is not a separate fixed-size molecule.",
        "Separate drawing size from structure extent.",
        "Alternative delayed representation boundary.",
      ),
      q(
        "rb-criteria",
        "A supplied candidate meets the mass limit but fails the required load. Is it suitable under those criteria?",
        "No: both requirements must pass",
        {
          "Yes: one passed criterion is always enough":
            "The design explicitly requires both.",
          "Yes: the word graphene overrides the data":
            "Material names do not override measured/supplied evidence.",
        },
        "Use all stated design criteria.",
        "Read the logical AND.",
        "Alternative delayed evidence reasoning.",
      ),
      q(
        "rb-property",
        "Why might a single graphene sheet suit a thin electrical layer?",
        "It is atomically thin and has mobile electrical carriers",
        {
          "It has no electrons at all": "Graphene has electron carriers.",
          "It is always a thick stack of sheets":
            "That is not graphene’s single-layer definition.",
        },
        "Match the proposed use to the relevant properties.",
        "Use both thinness and carrier mobility.",
        "Alternative delayed use transfer.",
      ),
    ],
  ],
};
for (const task of [...grapheneJourney.guided, ...grapheneJourney.practice])
  task.followUp =
    task.id.includes("electronic") || task.id.includes("universal")
      ? "ge-v1-r-carriers"
      : task.id.includes("strength") || task.id.includes("explain")
        ? "ge-v1-r-strength"
        : task.id.includes("panel") ||
            task.id.includes("reduction") ||
            task.id.includes("criterion") ||
            task.id.includes("density") ||
            task.id.includes("composite")
          ? "ge-v1-r-evidence"
          : "ge-v1-r-sheet";
const titles: Record<string, string> = {
  "p-layer": "Count atom layers",
  "p-neighbours": "Count direct links",
  "p-extent": "Recognise an extended sheet",
  "p-strength": "Repair a strength explanation",
  "p-electronics": "Explain a thin conductor",
  "p-universal": "Covalent does not mean insulating",
  "p-panel": "Use both design criteria",
  "p-reduction": "Calculate a mass reduction",
  "p-criterion": "Reject an incomplete comparison",
  "p-density": "Mass is not density",
};
for (const task of grapheneJourney.practice)
  task.title ??= titles[task.id.replace("ge-v1-", "")];
for (const task of grapheneJourney.practice)
  if (["ge-v1-p-neighbours", "ge-v1-p-extent"].includes(task.id))
    task.grapheneDiagram = true;
for (const task of grapheneJourney.practice)
  if (
    [
      "ge-v1-p-panel",
      "ge-v1-p-reduction",
      "ge-v1-p-criterion",
      "ge-v1-p-density",
    ].includes(task.id)
  )
    task.graphenePanelData = true;
grapheneJourney.checkForms[1][0].grapheneDiagram = true;
grapheneJourney.checkForms[1][1].graphenePanelData = true;
grapheneJourney.checkForms[1][2].graphenePanelData = true;

grapheneJourney.refresher[0].grapheneDiagram = true;

extendGrapheneWriting(grapheneJourney);
