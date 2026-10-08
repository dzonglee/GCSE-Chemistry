import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    "aqp-v1-" + id,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
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
  model?: TaskModel,
): LearningTask => ({
  ...number(
    "aqp-v1-" + id,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  points: string[],
): LearningTask => ({
  id: "aqp-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: points[0],
  rubric: points,
  purpose: title,
});
const m = (
  mode:
    "cathode" | "products" | "transfer" | "graph" | "investigation" | "reading",
  instruction: string,
): TaskModel => ({ kind: "aqueous-products", mode, instruction });
export const aqueousProductsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Use water competition to predict aqueous products, compare inert and copper electrodes, and test claims against practical observations.",
  scopeNote:
    "Foundation/shared AQA Chemistry 4.4.3.4 and Combined Trilogy 5.4.3.4, including required practical 3 / Combined practical 9 hypotheses and interpretation; related plain Pearson Combined 3.25, 3.30 and core practical 3.31. Half equations and electron-defined redox remain in the separate Higher lesson. Aqueous means dissolved in water: water supplies competing species, conventionally H+ and OH− in the GCSE account. In the standard inert-electrode GCSE model, a metal below hydrogen is deposited at the negative cathode; a metal above hydrogen gives hydrogen instead. At the positive anode, the standard single-compound GCSE prediction gives a halogen from halide ions, otherwise oxygen from water-derived species. Sulfate and nitrate are not discharged as sulfur or nitrogen in these cases. Use neutral product names: chlorine is not chloride. These are specified GCSE cases, not a universal rule independent of concentration, electrode material or operating conditions. Concentrated sodium chloride records here supply the chlorine-producing case; real oxygen/chlorine competition and mixtures are possible. Aqueous copper sulfate with inert electrodes gives copper at cathode, oxygen at anode and decreasing copper-ion concentration at fixed volume. Copper electrodes change the anode reaction: copper dissolves there while copper deposits at cathode; equal copper transfer at fixed volume replenishes solution copper ions. Purification uses an impure copper anode and pure copper cathode; supplied insoluble impurities form sludge rather than necessarily depositing. Exact equal mass changes apply only to supplied pure-copper/no-loss records, not all impure anode mass. The true 3D reference preserves Cu7S1O4 and twelve atomic IDs per state, transferring one original solution copper to the cathode and one original anode copper into solution; the intact tetrahedral sulfate remains separate. Water, hydration shells, most electrode atoms and external current supply are omitted; this is a selected atomic inventory, not a CuSO4 molecule, full apparatus, complete liquid or microscopic mechanism. Inverted gas-cylinder scales here increase downwards, with 0.2 cm³ divisions; read the gas–water boundary and follow the printed scale, not an upright-cylinder assumption. Graphs are explicitly original illustrative data: increasing volumes can show positive correlation without direct proportion; direct proportion requires a straight line through the origin. Gas identity needs supplied diagnostic tests, not bubbles alone. Equal gas-volume ratios require the stated reaction, same temperature/pressure and complete collection. Real experiments require qualified school supervision; this lesson supplies observations and simulations, not unsupervised chemical instructions. Six written explanations remain self-reviewed, not automatic examiner marks or exam-readiness certification.",
  outcomes: [
    "Predict cathode competition using water and supplied reactivity.",
    "Predict both inert-electrode aqueous products and name neutral elements.",
    "Explain copper-electrode transfer and contrast an inert anode.",
    "Read gas volumes and distinguish positive correlation from direct proportion.",
    "Evaluate a practical hypothesis, gas evidence and controlled electrode comparison.",
  ],
  warmup: [
    c(
      "w-polarity",
      "Recall electrode polarity",
      "During electrolysis, which electrode attracts positive ions?",
      "Negative cathode",
      {
        "Positive anode":
          "Positive ions migrate toward the negative electrode.",
        "Either electrode: ions are neutral": "A positive ion is charged.",
      },
      "The cathode is negative in an electrolytic cell.",
      "Use opposite charges.",
    ),
    n(
      "w-ratio",
      "Recall a supplied gas ratio",
      "A supplied water-electrolysis record gives hydrogen:oxygen volumes 2:1 at the same temperature and pressure. If oxygen is 5 cm³, how much hydrogen is collected?",
      10,
      "cm³",
      "Two equal hydrogen parts for one oxygen part: 2 × 5 = 10.",
      "Use the supplied ratio.",
    ),
  ],
  refresher: [
    c(
      "r-water",
      "Remember the solvent",
      "Why can aqueous sodium chloride give hydrogen rather than sodium at the cathode?",
      "Water supplies competing species",
      {
        "The solution contains no sodium ions":
          "Dissolved sodium ions remain present.",
        "Water removes the need for electric current":
          "An external supply still drives electrolysis.",
      },
      "Water introduces species that can produce hydrogen; sodium is above hydrogen.",
      "Aqueous is not molten.",
      m(
        "cathode",
        "Change the supplied metal or phase and predict the cathode product and reason.",
      ),
    ),
    c(
      "r-anode",
      "Keep ion and product distinct",
      "In a supplied chlorine-producing aqueous chloride case, name the neutral anode product.",
      "Chlorine",
      {
        Chloride: "Chloride is the starting ion, not the neutral product.",
        Sodium: "That is the salt's metal, not the anode halogen.",
      },
      "Chloride ions give neutral chlorine in this supplied case.",
      "Name the element.",
      m(
        "products",
        "Predict both products before checking; use the stated phase and electrodes.",
      ),
    ),
    c(
      "r-electrode",
      "Read electrode material",
      "What forms at the positive copper electrode in the supplied copper sulfate transfer case?",
      "Copper ions enter the solution",
      {
        "Oxygen must form at every anode":
          "Copper can dissolve; the electrode is not inert.",
        "Copper deposits at the positive electrode":
          "Copper deposits at the negative cathode.",
      },
      "The copper anode dissolves and replenishes copper ions.",
      "An electrode can take part.",
      m(
        "transfer",
        "Compare copper and inert electrodes; track the anode and solution.",
      ),
    ),
    c(
      "r-graph",
      "Require the origin",
      "Which volume–time line represents direct proportion?",
      "A straight line through (0, 0)",
      {
        "Any line that increases":
          "Positive correlation alone is insufficient.",
        "A straight line with initial volume 2 cm³":
          "A nonzero intercept does not give volume proportional to time.",
      },
      "Direct proportion requires a constant volume/time ratio and zero intercept.",
      "Check both shape and origin.",
      m("graph", "Move the reading marker and classify the supplied lines."),
    ),
    c(
      "r-test",
      "Use diagnostic evidence",
      "Colourless bubbles are seen at both electrodes. What can you conclude without supplied gas tests?",
      "Gas is forming, but its identity is not established",
      {
        "Both gases are hydrogen":
          "Colourless bubbles do not identify hydrogen.",
        "One must be oxygen because there are bubbles":
          "Many gases make bubbles.",
      },
      "A diagnostic observation is needed to identify each gas.",
      "Separate observation from identification.",
      m(
        "investigation",
        "Evaluate supplied supervised observations, not a home experiment.",
      ),
    ),
    n(
      "r-mass",
      "Subtract electrode readings",
      "A pure copper anode changes from 8.00 g to 7.85 g. What mass of copper has left it?",
      0.15,
      "g",
      "8.00 − 7.85 = 0.15 g.",
      "Subtract final mass from initial mass.",
    ),
  ],
  guided: [
    {
      ...c(
        "g-cathode",
        "Predict the cathode",
        "Aqueous copper sulfate; inert electrodes. Copper is below hydrogen. Which cathode product forms?",
        "Copper",
        {
          Hydrogen: "Copper is below hydrogen in this supplied series.",
          Oxygen: "Oxygen is the inert anode product.",
        },
        "Copper deposits at the negative cathode.",
        "Compare copper with hydrogen.",
        m(
          "cathode",
          "Predict the product and its reason; changing to sodium or molten salt tests a different case.",
        ),
      ),
      openingHint: true,
    },
    c(
      "g-products",
      "Predict both aqueous products",
      "Initial model: concentrated sodium chloride solution with inert electrodes in the supplied chlorine-producing case. Which products form?",
      "Hydrogen at cathode; chlorine at anode",
      {
        "Sodium at cathode; chlorine at anode":
          "Water competes; aqueous sodium is not the molten case.",
        "Hydrogen at cathode; chloride gas at anode":
          "The gas is neutral chlorine, not chloride.",
      },
      "Sodium is above hydrogen; hydrogen forms at cathode. The supplied halide case gives chlorine at anode.",
      "Use water competition and the supplied halide condition.",
      m(
        "products",
        "Explore chloride, sulfate and nitrate cases without assuming all dissolved salts give their metal.",
      ),
    ),
    c(
      "g-transfer",
      "Follow copper into and out of solution",
      "Initial model: copper sulfate solution, copper electrodes, equal transfer and fixed solution volume. What happens to copper-ion concentration?",
      "It remains approximately unchanged",
      {
        "It must fall because the cathode gains copper":
          "The anode replenishes copper ions at the same rate in this supplied case.",
        "It must increase because the anode dissolves":
          "The cathode removes the same amount.",
      },
      "Copper enters solution at anode and leaves at cathode; matched transfer keeps concentration approximately unchanged.",
      "Track both electrodes, not only one.",
      m(
        "transfer",
        "Use the true 3D before/after inventory to trace copper, then compare the inert anode.",
      ),
    ),
    n(
      "g-graph",
      "Place a gas reading",
      "Initial illustrative graph: hydrogen increases from 0 to 8 cm³ over 16 minutes along a straight line. How much hydrogen is collected at 8 minutes?",
      4,
      "cm³",
      "Half the time gives half the volume for this line through the origin: 4 cm³.",
      "Read the supplied hydrogen line.",
      m(
        "graph",
        "Move the gold marker to the hydrogen reading, then classify direct proportion and positive correlation separately.",
      ),
    ),
    c(
      "g-hypothesis",
      "Test a practical prediction",
      "A supervised sodium sulfate investigation predicts hydrogen at cathode and oxygen at anode. Supplied tests: cathode gas gives a squeaky pop; anode gas relights a glowing splint. What does this support?",
      "The predicted gas identities",
      {
        "Both gases are oxygen": "The pop supports hydrogen, not oxygen.",
        "Bubbles alone proved the identities":
          "The supplied diagnostic tests give the identifying evidence.",
      },
      "The supplied tests support hydrogen and oxygen in their predicted positions.",
      "Match each test to a gas.",
      m(
        "investigation",
        "Assess the given evidence and compare controlled and confounded electrode investigations.",
      ),
    ),
    n(
      "g-reading",
      "Read an inverted gas scale",
      "Initial inverted cylinder: the gas–water boundary is two 0.2 cm³ divisions below 4.0 cm³. What volume of gas is collected?",
      4.4,
      "cm³",
      "4.0 + 2 × 0.2 = 4.4 cm³. Numbers increase downwards on this inverted gas scale.",
      "Use the printed scale direction, not an upright-cylinder assumption.",
      m(
        "reading",
        "Move your gold reading to the visible gas–water boundary; the blue water level is the supplied observation.",
      ),
    ),
  ],
  practice: [
    c(
      "p-sodium",
      "Contrast solution and melt",
      "Why does aqueous sodium chloride give hydrogen at cathode in the standard GCSE case, while molten sodium chloride gives sodium?",
      "Water introduces competition only in the aqueous case",
      {
        "Sodium ions exist only in the melt": "They also exist in solution.",
        "Melting changes sodium's place in the reactivity series":
          "The key difference is water, not a changed reactivity order.",
      },
      "Water-derived species can produce hydrogen in solution; the binary melt has no water.",
      "Read the phase.",
      m("cathode", "Compare sodium solution with molten sodium chloride."),
    ),
    c(
      "p-magnesium",
      "Transfer the reactivity rule",
      "Magnesium is above hydrogen. Predict the cathode product from aqueous magnesium sulfate with inert electrodes.",
      "Hydrogen",
      {
        Magnesium:
          "The standard aqueous case gives hydrogen for a metal above hydrogen.",
        Sulfur: "Sulfate is not reduced to sulfur at cathode here.",
      },
      "Hydrogen forms rather than magnesium in the stated aqueous model.",
      "Compare the metal with hydrogen.",
    ),
    c(
      "p-silver",
      "Use a less reactive metal",
      "Silver is below hydrogen. Predict the cathode product from aqueous silver nitrate with inert electrodes.",
      "Silver",
      {
        Hydrogen: "Silver is the less reactive candidate in this model.",
        Nitrogen: "Nitrate does not give nitrogen at cathode.",
      },
      "Silver deposits at the cathode.",
      "Use the supplied series.",
    ),
    c(
      "p-bromide",
      "Name the halogen",
      "Aqueous potassium bromide is electrolysed using inert electrodes in a standard GCSE single-compound question. Choose both products.",
      "Hydrogen at cathode; bromine at anode",
      {
        "Potassium at cathode; bromine at anode":
          "Potassium is above hydrogen, so water competes.",
        "Hydrogen at cathode; bromide at anode":
          "Bromide is an ion; bromine is the neutral element.",
      },
      "Hydrogen and bromine are the stated GCSE products.",
      "Do not confuse bromine with bromide.",
      m("products", "Explore the bromide record."),
    ),
    w(
      "p-explain-water",
      "Explain aqueous competition",
      "Explain why predicting the salt's metal at every aqueous cathode would be wrong. Use sodium chloride and copper sulfate with inert electrodes.",
      "Water introduces competing species. Sodium is above hydrogen, so hydrogen forms rather than sodium; copper is below hydrogen, so copper deposits.",
      [
        "Identify the water-derived competition.",
        "Use sodium above hydrogen and copper below hydrogen.",
        "Name the cathode products.",
      ],
    ),
    c(
      "p-sulfate",
      "Avoid inventing sulfur",
      "Predict both products from aqueous sodium sulfate with inert electrodes.",
      "Hydrogen at cathode; oxygen at anode",
      {
        "Sodium at cathode; sulfur at anode":
          "Water competes at both electrodes; sulfate is not converted to sulfur here.",
        "Hydrogen at cathode; sulfate gas at anode":
          "Sulfate remains dissolved; oxygen is the anode gas.",
      },
      "Sodium is above hydrogen and sulfate is not a halide; water supplies the gas products.",
      "Use the standard aqueous rules.",
    ),
    c(
      "p-copper-chloride",
      "Combine two different decisions",
      "Copper is below hydrogen. In the supplied chlorine-producing copper chloride solution with inert electrodes, choose both products.",
      "Copper at cathode; chlorine at anode",
      {
        "Hydrogen at cathode; oxygen at anode":
          "Copper can deposit and chloride gives chlorine in this supplied case.",
        "Chlorine at cathode; copper at anode": "Those positions are reversed.",
      },
      "Copper deposits at cathode; chlorine forms at anode.",
      "Decide each electrode separately.",
    ),
    c(
      "p-acid",
      "Interpret acidified water",
      "Water acidified with sulfuric acid is electrolysed using inert electrodes. Which gases are expected?",
      "Hydrogen and oxygen",
      {
        "Hydrogen and sulfur":
          "Sulfate is not converted into elemental sulfur.",
        "Hydrogen only": "The anode also produces oxygen.",
      },
      "The acid improves conductivity; the supplied case decomposes water into hydrogen and oxygen.",
      "Sulfuric acid does not imply sulfur gas.",
    ),
    c(
      "p-inert",
      "Contrast an inert anode",
      "Copper sulfate solution is electrolysed with inert electrodes at fixed volume. Which change is expected?",
      "Copper ions decrease and oxygen forms at anode",
      {
        "Copper ions stay unchanged because every anode supplies copper":
          "An inert anode supplies no copper.",
        "Copper ions increase while copper deposits":
          "The cathode removes copper ions; they are not replenished here.",
      },
      "Copper deposits while oxygen forms at the inert anode; copper-ion concentration decreases.",
      "Identify whether the anode is copper.",
      m("transfer", "Change from copper electrodes to inert electrodes."),
    ),
    c(
      "p-colour",
      "Interpret solution colour carefully",
      "A copper sulfate solution becomes paler during inert-electrode electrolysis. Which explanation matches the stated chemistry?",
      "Copper ions are removed as copper deposits",
      {
        "Sulfate becomes copper metal":
          "Copper ions supply the deposited copper.",
        "Paler colour proves all copper ions have disappeared":
          "A colour change is not proof of zero concentration.",
      },
      "Decreasing copper-ion concentration can make the solution paler; colour alone does not quantify complete removal.",
      "Connect the change with the cathode.",
    ),
    n(
      "p-mass",
      "Use equal pure-copper transfer",
      "A pure copper anode falls from 15.00 g to 14.70 g. Equal copper transfer occurs with no losses. How much mass does the cathode gain?",
      0.3,
      "g",
      "15.00 − 14.70 = 0.30 g; equal transfer gives a 0.30 g gain.",
      "Use the supplied equal-transfer assumption.",
    ),
    c(
      "p-purify",
      "Choose purification electrodes",
      "For the supplied copper purification case, which arrangement is correct?",
      "Impure copper anode; pure copper cathode",
      {
        "Pure copper anode; impure copper cathode":
          "That places the impure copper at the receiving electrode.",
        "Two inert electrodes":
          "An inert anode cannot supply copper from the impure metal.",
      },
      "Copper dissolves from impure anode and deposits onto pure cathode; supplied insoluble impurities form sludge.",
      "Which electrode supplies the copper?",
    ),
    w(
      "p-explain-transfer",
      "Explain replenishment",
      "Explain why copper sulfate concentration can remain approximately unchanged with copper electrodes but fall with inert electrodes at fixed volume.",
      "A copper anode supplies copper ions while the cathode removes the same amount in the matched-transfer case. An inert anode supplies no copper ions; oxygen forms there, so deposition decreases copper-ion concentration.",
      [
        "Describe both electrodes with copper electrodes.",
        "Contrast oxygen formation at the inert anode.",
        "Use fixed volume and matched copper transfer.",
      ],
    ),
    n(
      "p-graph",
      "Scale a direct-proportion reading",
      "The illustrative hydrogen line passes through (0 min, 0 cm³) and (16 min, 8 cm³). What is the volume at 12 minutes?",
      6,
      "cm³",
      "8 ÷ 16 = 0.5 cm³ per minute; 12 × 0.5 = 6.",
      "Find the volume for one minute.",
      m(
        "graph",
        "The model shows this supplied illustrative line, not measured results from an actual experiment.",
      ),
    ),
    c(
      "p-correlation",
      "Distinguish two graph claims",
      "Both gas-volume lines rise with time, but chlorine initially curves. Which statement is supported?",
      "Both show positive correlation; only the hydrogen line shows direct proportion",
      {
        "Both must show direct proportion because both rise":
          "A rising curve can have a changing volume/time ratio.",
        "Neither shows positive correlation because one curves":
          "Positive correlation does not require a straight line.",
      },
      "Increasing together supports positive correlation; direct proportion also requires a straight line through the origin.",
      "Check the exact claim.",
    ),
    c(
      "p-offset",
      "Test a nonzero intercept",
      "A straight gas-volume line starts at 2 cm³ when time is zero. Is volume directly proportional to elapsed time?",
      "No: it does not pass through the origin",
      {
        "Yes: every straight line shows direct proportion":
          "A nonzero intercept breaks direct proportion between these stated variables.",
        "No: a rising line cannot show positive correlation":
          "It can rise while failing direct proportion.",
      },
      "The recorded volume is not zero at zero time.",
      "Use the actual axes and intercept.",
      m(
        "graph",
        "Select the offset record; keep positive correlation separate.",
      ),
    ),
    n(
      "p-gas-ratio",
      "Use a qualified volume ratio",
      "For supplied complete water electrolysis with inert electrodes, gases are collected without loss at the same temperature and pressure. Hydrogen is 24 cm³. What is oxygen volume?",
      12,
      "cm³",
      "The supplied hydrogen:oxygen ratio is 2:1, so 24 ÷ 2 = 12.",
      "This ratio belongs to the stated water reaction, not every electrolyte.",
    ),
    c(
      "p-fair",
      "Isolate electrode material",
      "Which comparison best isolates electrode material in copper sulfate electrolysis?",
      "Change only electrode material; keep solution, exposed area, current, duration and temperature comparable",
      {
        "Change electrode material and double current":
          "The current change could affect the result.",
        "Use any concentration because the salt name is unchanged":
          "Concentration can affect observations and must be controlled.",
      },
      "The comparison changes electrode material while controlling the stated other variables.",
      "Identify the independent variable.",
      m("investigation", "Compare controlled and confounded records."),
    ),
    c(
      "p-test",
      "Read gas-test results",
      "Supplied anode gas relights a glowing splint. Which identity does that support?",
      "Oxygen",
      {
        Hydrogen: "A squeaky pop is the supplied hydrogen test.",
        Chlorine: "The oxygen splint test does not identify chlorine.",
      },
      "Relighting a glowing splint supports oxygen.",
      "Use the supplied diagnostic observation.",
    ),
    w(
      "p-limits",
      "Avoid an unsupported mechanism",
      "The illustrative chlorine-volume line initially curves and less chlorine is collected than hydrogen. Does this graph alone prove one cause for the missing collected gas? Explain.",
      "No. The graph reports collected volumes, not a unique cause. Solubility, collection losses or changing conditions would need additional evidence; the graph alone does not establish which occurred.",
      [
        "Separate collected volume from total gas formed.",
        "Identify the lack of unique causal evidence.",
        "Do not turn a possible explanation into a proved cause.",
      ],
    ),
    n(
      "p-reading",
      "Transfer an inverted reading",
      "A supplied inverted gas scale increases downwards. The gas–water boundary is four 0.2 cm³ divisions below 6.0 cm³. What volume is collected?",
      6.8,
      "cm³",
      "6.0 + 4 × 0.2 = 6.8 cm³.",
      "Add divisions in the direction the printed numbers increase.",
      m(
        "reading",
        "Explore low and high gas volumes; the model is a supplied observation, not a physical experiment.",
      ),
    ),
  ],
  checkForms: [
    [
      c(
        "a-products",
        "Independent products",
        "Aqueous calcium chloride is electrolysed using inert electrodes in a supplied chlorine-producing GCSE case. Calcium is above hydrogen. Choose both products.",
        "Hydrogen at cathode; chlorine at anode",
        {
          "Calcium at cathode; chlorine at anode":
            "Water competes; calcium is above hydrogen.",
          "Hydrogen at cathode; chloride gas at anode":
            "The neutral gas is chlorine.",
        },
        "The stated case gives hydrogen and chlorine.",
        "Use phase, reactivity and the supplied anode condition.",
      ),
      c(
        "a-nitrate",
        "Independent non-halide",
        "Silver is below hydrogen. Aqueous silver nitrate with inert electrodes gives which products?",
        "Silver at cathode; oxygen at anode",
        {
          "Hydrogen at cathode; nitrogen at anode":
            "Silver deposits and nitrate is not a halide.",
          "Silver at cathode; nitrate gas at anode":
            "Oxygen is the anode product.",
        },
        "Silver deposits; water-derived oxygen forms at the inert anode.",
        "Decide both electrodes.",
      ),
      n(
        "a-reading",
        "Independent inverted scale",
        "An inverted gas scale has 0 at the top and numbers increasing downwards. A boundary is one 0.2 cm³ interval below 5.0 cm³. What gas volume is shown?",
        5.2,
        "cm³",
        "5.0 + 0.2 = 5.2 cm³.",
        "Use the printed direction and division size.",
      ),
      c(
        "a-graph",
        "Independent graph claim",
        "A gas-volume graph is an increasing straight line through (0 min, 3 cm³). Which claim is justified?",
        "Positive correlation, but not direct proportion to time",
        {
          "Positive correlation and direct proportion":
            "The line misses the origin.",
          "Neither: a positive intercept prevents correlation":
            "The increasing line still shows positive correlation.",
        },
        "The positive intercept prevents direct proportion, not positive correlation.",
        "Check the origin separately.",
      ),
      w(
        "a-evidence",
        "Independent evidence",
        "A student predicts hydrogen and oxygen from aqueous sodium sulfate with inert electrodes but reports only bubbles. Explain what the report establishes and what additional supplied evidence would identify the gases.",
        "Bubbles support gas formation but do not identify the gases. A squeaky pop from cathode gas would support hydrogen and relighting a glowing splint from anode gas would support oxygen.",
        [
          "Avoid identifying colourless bubbles alone.",
          "Match the pop with hydrogen at cathode.",
          "Match relighting with oxygen at anode.",
        ],
      ),
    ],
    [
      c(
        "b-products",
        "Independent chloride",
        "Copper is below hydrogen. Aqueous copper chloride is electrolysed with inert electrodes in a supplied chlorine-producing case. Choose both products.",
        "Copper at cathode; chlorine at anode",
        {
          "Hydrogen at cathode; oxygen at anode":
            "Copper deposits; the supplied halide condition gives chlorine.",
          "Copper ions as final deposit; chloride as final gas":
            "Final products are neutral elements.",
        },
        "Copper deposits and chlorine forms.",
        "Use neutral product names.",
      ),
      c(
        "b-electrodes",
        "Independent electrode contrast",
        "Switch only from inert to copper electrodes in copper sulfate under matched transfer at fixed volume. What changes at anode?",
        "Copper dissolves instead of oxygen forming",
        {
          "Copper deposits instead of oxygen forming":
            "Copper deposits at cathode.",
          "Nothing: all anodes are inert": "Copper electrodes can take part.",
        },
        "Copper enters solution from the active anode.",
        "Read electrode material.",
      ),
      n(
        "b-graph",
        "Independent graph reading",
        "An illustrative hydrogen line passes through (0 min, 0 cm³) and (10 min, 5 cm³). What volume is collected at 6 minutes?",
        3,
        "cm³",
        "5 ÷ 10 × 6 = 3 cm³.",
        "Find the unit rate.",
      ),
      c(
        "b-fair",
        "Independent investigation",
        "One run uses inert electrodes for 5 minutes at 0.2 A; another uses copper electrodes for 10 minutes at 0.4 A. Can the different result be attributed only to electrode material?",
        "No: current and duration also changed",
        {
          "Yes: electrode material was changed":
            "It was not the only changed variable.",
          "No: copper sulfate cannot be electrolysed":
            "Both electrode cases are possible.",
        },
        "The comparison is confounded by two additional changes.",
        "Identify all changed variables.",
      ),
      w(
        "b-explain",
        "Independent transfer explanation",
        "Explain how an impure copper anode and pure copper cathode can purify copper in the supplied case where insoluble impurities form sludge.",
        "Copper dissolves from the impure anode into solution and copper deposits onto the pure cathode. The supplied insoluble impurities fall as sludge rather than becoming the copper deposit.",
        [
          "Use impure anode and pure cathode.",
          "Describe dissolution and deposition.",
          "Account for the supplied insoluble impurities.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-water",
        "Delayed phase distinction",
        "For sodium chloride with inert electrodes, which pair of cathode products matches molten then aqueous GCSE cases?",
        "Sodium, then hydrogen",
        {
          "Hydrogen, then sodium": "The order is reversed.",
          "Sodium in both": "Water introduces competition in solution.",
        },
        "The melt has no water; the aqueous case gives hydrogen.",
        "Read the order of phases.",
      ),
      n(
        "ra-reading",
        "Delayed inverted scale",
        "An inverted gas scale increases downwards. Its boundary is one 0.2 cm³ interval below 3.0 cm³. What gas volume is shown?",
        3.2,
        "cm³",
        "3.0 + 0.2 = 3.2 cm³.",
        "Read the actual scale direction.",
      ),
      c(
        "ra-electrode",
        "Delayed electrode change",
        "At fixed volume, inert-electrode copper sulfate electrolysis deposits copper at cathode. What happens to copper-ion concentration?",
        "It decreases",
        {
          "It stays unchanged because an inert anode replenishes copper":
            "An inert anode supplies no copper.",
          "It increases because copper metal forms":
            "Metal formation removes copper ions.",
        },
        "Copper ions leave solution as a deposit without copper replenishment.",
        "Track the dissolved copper inventory.",
      ),
    ],
    [
      c(
        "rb-products",
        "Delayed sulfate prediction",
        "Magnesium is above hydrogen. Predict products from aqueous magnesium sulfate with inert electrodes.",
        "Hydrogen at cathode; oxygen at anode",
        {
          "Magnesium at cathode; sulfur at anode":
            "Water supplies both gas products in this case.",
          "Oxygen at cathode; hydrogen at anode":
            "Those positions are reversed.",
        },
        "Hydrogen forms rather than magnesium; sulfate is not a halide.",
        "Use the two aqueous decisions.",
      ),
      c(
        "rb-graph",
        "Delayed graph distinction",
        "A gas-volume curve rises with time but its slope changes. Which conclusion follows?",
        "Positive correlation does not prove direct proportion",
        {
          "Every positive correlation is direct proportion":
            "A changing slope can break direct proportion.",
          "A curve cannot show positive correlation":
            "It can still rise as time increases.",
        },
        "The two claims require different evidence.",
        "Direct proportion needs a straight line through the origin.",
      ),
      w(
        "rb-evidence",
        "Delayed practical reasoning",
        "Explain why changing electrode material, current and solution concentration together cannot isolate the effect of electrode material.",
        "Several variables change, so any observed difference could result from current or concentration as well as electrode material. Change electrode material alone and keep the other stated conditions comparable.",
        [
          "Identify multiple changed variables.",
          "Explain alternative causes of the result.",
          "State a controlled comparison.",
        ],
      ),
    ],
  ],
};
const follow: Record<string, string> = {
  "p-sodium": "r-water",
  "p-magnesium": "r-water",
  "p-silver": "r-water",
  "p-bromide": "r-anode",
  "p-explain-water": "r-water",
  "p-sulfate": "r-anode",
  "p-copper-chloride": "r-anode",
  "p-acid": "r-anode",
  "p-inert": "r-electrode",
  "p-colour": "r-electrode",
  "p-mass": "r-mass",
  "p-purify": "r-electrode",
  "p-explain-transfer": "r-electrode",
  "p-graph": "r-graph",
  "p-correlation": "r-graph",
  "p-offset": "r-graph",
  "p-gas-ratio": "r-graph",
  "p-fair": "r-test",
  "p-test": "r-test",
  "p-limits": "r-test",
  "p-reading": "r-graph",
};
for (const q of aqueousProductsJourney.practice)
  q.followUp = "aqp-v1-" + follow[q.id.replace("aqp-v1-", "")];

for (const [id, ticks, boundaryDescription] of [
  [
    "a-reading",
    26,
    "Gas–water boundary is one small division below the printed 5 cm³ mark.",
  ],
  [
    "ra-reading",
    16,
    "Gas–water boundary is one small division below the printed 3 cm³ mark.",
  ],
] as const) {
  const q = [
    ...aqueousProductsJourney.checkForms.flat(),
    ...aqueousProductsJourney.reviewForms.flat(),
  ].find((q) => q.id === "aqp-v1-" + id)!;
  q.invertedGasScale = { ticks, boundaryDescription };
  q.prompt =
    "Read the gas volume shown on this inverted cylinder. Each small interval is 0.2 cm³. Enter the volume in cm³.";
}
