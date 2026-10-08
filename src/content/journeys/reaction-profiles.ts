import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
import type { ProfileMode } from "../../lib/reaction-profiles";
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
    "profile-v1-" + id,
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
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    "profile-v1-" + id,
    prompt,
    answer,
    "kJ",
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
  rubric: string[],
): LearningTask => ({
  id: "profile-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (
  mode: ProfileMode,
  instruction: string,
  record?: string,
): TaskModel => ({ kind: "reaction-profile", mode, instruction, record });
const diagram = (
  reactant: number,
  product: number,
  peak: number,
  max = 120,
  step = 20,
) => ({ reactant, product, peak, max, step });
const d = (
  id: string,
  title: string,
  prompt: string,
  reactant: number,
  product: number,
  peak: number,
  explanation: string,
): LearningTask => ({
  id: "profile-v1-" + id,
  title,
  prompt,
  purpose: title,
  answer: JSON.stringify({
    reactant: String(reactant),
    product: String(product),
    peak: String(peak),
    activationArrow: "reactants-peak",
    overallArrow: "reactants-products",
  }),
  explanation,
  hint: "Construct both endpoint levels, the curved peak and the two requested arrow spans.",
  profileDrawing: true,
});
export const profileJourney: LessonJourney = {
  version: 1,
  introduction:
    "Construct and label a curved energy profile, then separate the starting barrier from the overall change.",
  scopeNote:
    "Foundation/shared AQA 4.5.1.2 and Trilogy 5.5.1.2, with limited Pearson Combined 7.15–7.16 comparison. A simple reaction profile has a vertical energy axis and horizontal progress-of-reaction axis. It is not a temperature-time graph, a literal particle path or a clock. Draw labelled reactant/product plateaus connected by a curved pathway, with a peak above both endpoint levels for the stated simple one-hump model. Exothermic products are below reactants; endothermic products are above reactants. Activation energy is the minimum energy reacting particles need for reaction to occur. A forward activation arrow spans reactant level to peak, not the absolute zero reference or product level. Overall change spans reactants to products; signed products-minus-reactants differs from positive size of released energy. Supplied numeric levels in kJ refer to the stated reaction amount and common reference, not a universal energy per molecule. Subtraction from numeric diagrams is original supporting graph work; no bond-energy sums, q=mcΔT or Arrhenius calculations are required here. Shared offsets do not change differences. An exothermic reaction can still require activation energy. Sufficient-energy collisions are necessary; energy alone does not guarantee suitable encounter/orientation. A catalyst provides an alternative pathway with a lower barrier while preserving endpoint energies and overall change for the same reaction. The one-hump catalyst construction is a simplified GCSE diagram; real mechanisms can have several steps. Curve width, apparent steepness, colour or absolute peak height on an uncalibrated progress axis do not supply elapsed time, reaction rate or temperature. Independent diagram answers require the entered endpoint/peak levels and selected arrow spans together; the preview gives no correctness feedback. Construction controls preserve incorrect endpoints/peaks/arrows and diagnose them; they do not prove freehand exam drawing competence. Actual AQA 2018 Foundation 06.7–06.8 QP 26/MS 17 and 2022 Foundation 10.5–10.6 QP 39/MS 29 were inspected: label energy, overall change, products and activation arrow, and justify exothermic using relative endpoint levels. The 2022 profile explanation ignores bond-making/breaking slogans for that question. Seven written explanations remain self-reviewed. Independent forms and real delayed retrieval defer feedback; repeated demands share exposure globally. These original tasks do not supply official examiner marks or certify full-board/course exam readiness. The principal representation is the source-backed two-dimensional energy diagram; it does not turn energy into physical 3D terrain.",
  outcomes: [
    "Construct labelled curved exothermic and endothermic profiles.",
    "Identify activation and overall-change arrows from the correct levels.",
    "Read supplied energy differences with correct sign and quantity.",
    "Preserve endpoint energies when constructing a lower-barrier alternative and explain diagram limits.",
  ],
  warmup: [
    n(
      "w-subtract",
      "Measure a vertical gap",
      "Two supplied energy levels are 35 kJ and 85 kJ. What is upper minus lower?",
      50,
      "85−35=50 kJ.",
      "Subtract the lower level.",
    ),
    c(
      "w-direction",
      "Recall energy release",
      "An exothermic reaction transfers energy to its surroundings. Which endpoint relationship is expected?",
      "Products lower than reactants",
      {
        "Products higher than reactants":
          "That would represent overall energy taken in.",
        "Products always zero": "The energy reference is arbitrary.",
      },
      "The reacting system loses energy overall.",
      "Compare the starting and final states.",
    ),
  ],
  refresher: [
    c(
      "r-levels",
      "Read the endpoints",
      "In a supplied exothermic profile, which two levels establish the overall decrease?",
      "Reactants and products",
      {
        "Reactants and peak": "That measures forward activation.",
        "Zero reference and peak": "That is an absolute peak height.",
      },
      "Overall change compares final products with initial reactants.",
      "Use the endpoints.",
      m(
        "arrows",
        "Place the overall-change arrow between the two endpoint levels.",
      ),
    ),
    n(
      "r-barrier",
      "Start activation at reactants",
      "Reactants 40 kJ; peak 90 kJ. What is forward activation energy?",
      50,
      "90−40=50 kJ; the peak height 90 is not the barrier.",
      "Subtract the reactant level.",
      m("read", "Predict the barrier and overall difference."),
    ),
    c(
      "r-classify",
      "Compare final and initial",
      "A product plateau is above the reactant plateau. What overall type is shown?",
      "Endothermic",
      {
        Exothermic: "Products would be lower.",
        "No reaction is possible":
          "An input of energy can support an endothermic reaction.",
      },
      "The products have gained energy overall.",
      "Compare product and reactant heights.",
      m(
        "build",
        "Construct the supplied higher product level and its barrier.",
        "endothermic",
      ),
    ),
    c(
      "r-axis",
      "Read the axis meaning",
      "The horizontal axis says progress of reaction. Can its uncalibrated width tell you a duration in seconds?",
      "No",
      {
        Yes: "No time scale is given.",
        "Only for exothermic reactions":
          "Energy direction does not turn progress into time.",
      },
      "It represents a pathway/sequence, not elapsed time.",
      "Read the axis label.",
      m("evidence", "Use the actual axis quantity.", "axis"),
    ),
    c(
      "r-catalyst",
      "Keep the same endpoints",
      "For the same overall reaction, what does a catalyst change in its simple profile?",
      "An alternative pathway with lower activation energy",
      {
        "The overall energy change":
          "Reactant and product energies stay the same.",
        "Products become reactants":
          "That describes a different direction, not catalytic action.",
      },
      "The alternative barrier is lower while endpoints stay fixed.",
      "Separate the pathway from its endpoints.",
      m("catalyst", "Change the barrier while retaining endpoint levels."),
    ),
    c(
      "r-start",
      "Release does not remove the barrier",
      "Can an exothermic reaction still require energy to start?",
      "Yes",
      {
        No: "Overall release and starting barrier are different spans.",
        "Only if products are hotter than reactants":
          "The profile is energy, not a thermometer.",
      },
      "Its reactant-to-peak barrier can coexist with lower product energy.",
      "Separate activation from overall release.",
      m("evidence", "Explain the two distinct vertical spans."),
    ),
  ],
  guided: [
    c(
      "g-build",
      "Construct an exothermic curve",
      "Build the stated profile: reactants 80 kJ, products 30 kJ and forward activation 40 kJ. Where is its peak?",
      "120 kJ",
      {
        "40 kJ":
          "That is the barrier above reactants, not absolute peak energy.",
        "90 kJ": "This adds the barrier to the product level.",
      },
      "80+40=120 kJ. The product plateau remains lower.",
      "Add activation to reactant energy.",
      m(
        "build",
        "Adjust the three levels; preserve a curved connection and correct labels.",
      ),
    ),
    {
      ...n(
        "g-read",
        "Read the starting barrier",
        "From this supplied profile, give forward activation energy.",
        50,
        "90−40=50 kJ.",
        "Start at reactants, then reach the peak.",
        m(
          "read",
          "Predict both requested differences from the supplied profile.",
        ),
      ),
      reactionProfile: diagram(40, 20, 90),
    },
    c(
      "g-arrows",
      "Place the correct activation arrow",
      "For this exothermic reaction, which arrow measures FORWARD activation?",
      "Reactants → peak",
      {
        "Products → peak":
          "That starts at the wrong endpoint for the stated forward reaction.",
        "Zero reference → peak":
          "That confuses absolute peak energy with a difference.",
      },
      "Forward activation begins at the reactant plateau.",
      "Use the starting state.",
      m(
        "arrows",
        "Place activation and overall-change arrows on their correct spans.",
      ),
    ),
    c(
      "g-catalyst",
      "Lower the barrier",
      "Reactants 20 kJ, products 55 kJ, original peak 90 kJ. Which alternative keeps the endpoints and lowers the barrier?",
      "Reactants 20, products 55, peak 70",
      {
        "Reactants 20, products 35, peak 70": "The product energy was changed.",
        "Reactants 20, products 55, peak 40":
          "The proposed peak lies below the products.",
      },
      "The endpoints stay fixed, and 70 is above both yet below 90.",
      "Keep endpoints and compare the two peaks.",
      m(
        "catalyst",
        "Construct any valid lower-barrier alternative with unchanged endpoints.",
        "endothermic",
      ),
    ),
    c(
      "g-evidence",
      "Reject a clock reading",
      "A peak lies halfway across a reaction-progress axis. What duration can be inferred?",
      "No duration is established",
      {
        "Half a second": "The axis has no seconds.",
        "Exactly half the total reaction time":
          "Progress has no supplied time calibration.",
      },
      "Horizontal location is a schematic pathway position.",
      "Read the x-axis quantity.",
      m("evidence", "Separate reaction progress from elapsed time.", "axis"),
    ),
  ],
  practice: [
    n(
      "p-activation",
      "Measure above reactants",
      "Reactants 30 kJ, products 10 kJ, peak 95 kJ. Give forward activation energy.",
      65,
      "95−30=65 kJ.",
      "Use peak minus reactants.",
    ),
    n(
      "p-signed",
      "Keep the overall sign",
      "Reactants 75 kJ and products 35 kJ. Give SIGNED product-minus-reactant energy change.",
      -40,
      "35−75=−40 kJ.",
      "Subtract initial from final.",
    ),
    n(
      "p-release",
      "Report a release magnitude",
      "Reactants 75 kJ and products 35 kJ. What is the POSITIVE SIZE of energy released?",
      40,
      "The decrease has magnitude 40 kJ.",
      "Use the requested magnitude.",
    ),
    n(
      "p-endo",
      "Calculate the overall increase",
      "Reactants 15 kJ and products 60 kJ. Give SIGNED overall change.",
      45,
      "60−15=+45 kJ.",
      "Final minus initial.",
    ),
    n(
      "p-build-peak",
      "Construct from activation",
      "Reactants 35 kJ; forward activation 60 kJ. What peak level should be drawn?",
      95,
      "35+60=95 kJ.",
      "Add the barrier to reactants.",
    ),
    n(
      "p-build-products",
      "Construct from energy released",
      "Reactants 70 kJ; reaction releases 25 kJ overall. What is the product level?",
      45,
      "70−25=45 kJ.",
      "A release lowers the reacting system.",
    ),
    n(
      "p-offset",
      "Ignore a shared zero shift",
      "All levels are shifted: reactants 140 kJ, products 120 kJ, peak 190 kJ. What is forward activation energy?",
      50,
      "190−140=50 kJ, unchanged by a shared offset.",
      "Subtract the relevant two levels.",
    ),
    {
      ...n(
        "p-graph",
        "Read a new supplied profile",
        "Use the supplied profile: what is the SIGNED overall energy change?",
        35,
        "70−35=+35 kJ.",
        "Compare the two plateaus.",
      ),
      reactionProfile: diagram(35, 70, 105, 140, 20),
    },
    c(
      "p-zero",
      "A zero change can have a barrier",
      "Reactants and products 50 kJ; peak 100 kJ. Which claim follows?",
      "No net energy difference; activation 50 kJ",
      {
        "No activation because endpoints match":
          "The peak remains above reactants.",
        "No reaction can happen":
          "Equal endpoint energies alone do not rule out a reaction.",
      },
      "Endpoint difference is zero; peak −reactants=50 kJ.",
      "Compare both separate spans.",
    ),
    c(
      "p-invalid",
      "Check the maximum",
      "Proposed reactants 20 kJ, products 80 kJ and single peak 60 kJ. Is the stated simple maximum valid?",
      "No",
      {
        "Yes, because it is above reactants":
          "It must also be above the products.",
        "Yes, every endothermic profile has this shape":
          "A stated maximum cannot be below its endpoint.",
      },
      "The supposed peak is below 80 kJ products.",
      "Compare all three levels.",
    ),
    c(
      "p-arrow",
      "Reject the product barrier",
      "For a forward reaction beginning at reactants, why is products-to-peak not the forward activation arrow?",
      "It starts at the wrong endpoint",
      {
        "The products are always zero": "No such zero condition exists.",
        "The peak is the overall change":
          "A peak is a level, not the endpoint difference.",
      },
      "Forward activation measures upward from the reactants.",
      "Name the starting state.",
    ),
    c(
      "p-catalyst",
      "Change the pathway",
      "Same reaction: reactants 50 kJ, products 20 kJ, original peak 100 kJ. Which simple alternative shows a lower barrier?",
      "Reactants 50, products 20, peak 75",
      {
        "Reactants 50, products 10, peak 75": "The product energy changes.",
        "Reactants 50, products 20, peak 110": "The barrier grows.",
      },
      "Endpoints stay fixed and the peak drops from 100 to 75 kJ.",
      "Compare the barrier while keeping the same reaction.",
    ),
    c(
      "p-collision",
      "Avoid a guarantee",
      "Sufficient energy is supplied for a collision, but suitable molecular orientation is not established. Is a successful reaction guaranteed?",
      "No",
      {
        "Yes, energy alone guarantees every collision":
          "Orientation/encounter also matters.",
        "No collisions ever react": "Suitable encounters can react.",
      },
      "Sufficient energy is necessary without guaranteeing every encounter succeeds.",
      "Consider what else is required.",
    ),
    c(
      "p-width",
      "Do not infer speed from width",
      "Two uncalibrated progress diagrams have the same energy levels but different horizontal widths. Which is faster?",
      "Not established from width",
      {
        "The narrower one": "No time or kinetic evidence was supplied.",
        "The wider one": "No time or kinetic evidence was supplied.",
      },
      "Progress-axis width alone does not measure time or rate.",
      "Read the actual axis.",
    ),
    c(
      "p-temperature",
      "Keep the measured quantity",
      "A profile energy axis labels a peak 120 kJ. Is that a temperature of 120 °C?",
      "No",
      {
        Yes: "kJ is energy, not temperature.",
        "Only if the reaction is exothermic":
          "Energy direction does not change units.",
      },
      "A relative energy diagram is not a thermometer.",
      "Read the axis and units.",
    ),
    c(
      "p-definition",
      "Define activation energy",
      "What is activation energy in the collision model?",
      "The minimum energy reacting particles need to react",
      {
        "The total energy released overall":
          "That is not the starting barrier.",
        "The product energy level": "That is an endpoint level.",
        "The absolute peak measured from zero": "The reference is arbitrary.",
      },
      "Reacting particles need sufficient energy to overcome the starting barrier.",
      "State the minimum-energy condition.",
    ),
    d(
      "p-draw",
      "Construct a complete labelled profile",
      "Construct an exothermic profile: reactants 60 kJ; overall energy release 35 kJ; forward activation 50 kJ. Enter the three levels and place activation and overall-change arrows.",
      60,
      25,
      110,
      "Products 60−35=25 kJ; peak 60+50=110 kJ. Activation spans 60→110; overall change 60→25. The renderer connects your named levels with a curve.",
    ),
    c(
      "p-label",
      "Name the overall-change span",
      "In a forward profile, an arrow runs from reactant level down to the lower product level. What does it represent?",
      "Overall energy change",
      {
        "Forward activation energy": "That arrow would rise to the peak.",
        "Elapsed time": "The vertical energy difference is not time.",
      },
      "The arrow compares initial and final energy states.",
      "Use its two endpoints.",
    ),
    w(
      "p-explain-exo",
      "Explain the supplied profile",
      "Reactants 80 kJ, products 30 kJ, peak 120 kJ. Explain why this is exothermic despite needing activation energy.",
      "Products are 50 kJ below reactants, so the reacting system transfers energy to surroundings overall. The forward activation barrier is 120−80=40 kJ. Starting energy and overall release are different differences.",
      [
        "Compare product and reactant levels.",
        "State energy transfer out and exothermic.",
        "Separate the reactant-to-peak activation barrier.",
      ],
    ),
    w(
      "p-explain-catalyst",
      "Explain catalytic construction",
      "Explain why moving the product plateau down is not a correct way to show a catalyst for the same overall reaction.",
      "For the same overall reaction the reactant and product energies stay unchanged, so the overall difference is unchanged. The catalyst provides an alternative pathway with a lower activation barrier; it does not change the product energy.",
      [
        "Keep both endpoint energies unchanged.",
        "Describe an alternative pathway with a lower barrier.",
        "Retain the same overall energy change.",
      ],
    ),
    w(
      "p-explain-axis",
      "Explain a diagram limit",
      "A student says the steep downhill profile means products form instantly. Explain why that does not follow.",
      "The horizontal axis is progress of reaction, not elapsed time. Curve steepness on this uncalibrated schematic does not measure reaction duration or rate. Independent kinetic/time evidence is needed.",
      [
        "Name progress of reaction.",
        "Distinguish it from elapsed time.",
        "Do not infer rate from uncalibrated slope.",
      ],
    ),
  ],
  checkForms: [
    [
      {
        ...n(
          "a-graph",
          "Independent activation",
          "Use the supplied profile to give FORWARD activation energy.",
          75,
          "115−40=75 kJ.",
          "Use the starting level.",
        ),
        reactionProfile: diagram(40, 15, 115, 140, 20),
      },
      c(
        "a-axis",
        "Independent axis label",
        "A simple profile has vertical energy and horizontal progress of reaction. Which quantity is NOT supplied by this horizontal axis?",
        "Elapsed time in seconds",
        {
          "Position along the schematic pathway": "That is its stated meaning.",
          "Progress from reactants towards products":
            "That is its stated meaning.",
        },
        "No time calibration is given.",
        "Read the axis.",
      ),
      c(
        "a-catalyst",
        "Independent lower-barrier construction",
        "Same reaction: reactants 45 kJ, products 75 kJ, original peak 115 kJ. Which simple catalysed alternative preserves the reaction and lowers its barrier?",
        "Reactants 45, products 75, peak 95",
        {
          "Reactants 45, products 65, peak 95": "The endpoint energy changed.",
          "Reactants 45, products 75, peak 60":
            "The proposed peak is below the products.",
        },
        "The original endpoints remain, and 75<95<115.",
        "Test endpoints and barrier.",
      ),
      d(
        "a-draw",
        "Independent exothermic construction",
        "Construct a labelled curved exothermic profile: reactants 50 kJ; products 20 kJ; forward activation 65 kJ. Choose both forward activation and overall-change arrows.",
        50,
        20,
        115,
        "Peak 50+65=115 kJ. Activation spans 50→115 and overall change 50→20.",
      ),
      w(
        "a-explain",
        "Independent endothermic explanation",
        "A curved profile has reactants 25 kJ, products 65 kJ and peak 105 kJ. Explain its overall type and why its peak is not the overall change.",
        "Products are 40 kJ above reactants, so the reaction takes energy in overall and is endothermic. The peak 105 kJ is a level; overall change compares 65 with 25, whereas forward activation is 105−25=80 kJ.",
        [
          "Compare product and reactant levels.",
          "State endothermic and energy taken in.",
          "Distinguish the peak level from both energy differences.",
        ],
      ),
    ],
    [
      {
        ...n(
          "b-signed",
          "Independent signed diagram change",
          "Use the supplied profile to give SIGNED product-minus-reactant change.",
          -45,
          "30−75=−45 kJ.",
          "Use the endpoint order.",
        ),
        reactionProfile: diagram(75, 30, 125, 160, 20),
      },
      d(
        "b-draw",
        "Independent endothermic construction",
        "Construct a labelled curved endothermic profile: reactants 25 kJ; overall energy taken in 40 kJ; forward activation 80 kJ. Choose both energy-arrow spans.",
        25,
        65,
        105,
        "Products 25+40=65 kJ; peak 25+80=105 kJ. Activation spans 25→105 and overall change 25→65.",
      ),
      c(
        "b-shift",
        "Independent zero reference",
        "All three energies in a profile rise by the same 200 kJ after changing the reference. What changes?",
        "Absolute levels; neither energy difference",
        {
          "Activation energy rises by 200 kJ": "The shared shift cancels.",
          "Overall change rises by 200 kJ": "The shared shift cancels.",
        },
        "Difference calculations remove the common offset.",
        "Subtract the shifted quantities.",
      ),
      c(
        "b-definition",
        "Independent activation definition",
        "Which statement defines activation energy?",
        "Minimum energy reacting particles need for reaction",
        {
          "Total energy gained by surroundings": "That is an overall transfer.",
          "Absolute energy of the final products":
            "That is a level, not a minimum collision requirement.",
        },
        "The minimum-energy requirement concerns overcoming the starting barrier.",
        "Use the minimum collision-energy condition.",
      ),
      w(
        "b-explain",
        "Independent catalyst explanation",
        "An alternative profile has the same reactant/product plateaus and a lower peak. Explain what changed and what stayed the same for the stated simple catalysed reaction.",
        "The alternative pathway has a lower forward activation barrier because the peak-minus-reactant difference is smaller. Both endpoint energies remain unchanged, so the overall energy change and exothermic/endothermic classification remain the same.",
        [
          "Explain a lower-barrier alternative pathway.",
          "Keep reactant and product energies unchanged.",
          "Retain the overall energy difference and classification.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "d-a-peak",
        "Delayed construction",
        "Reactants 55 kJ; forward activation 65 kJ. What is the peak energy level?",
        120,
        "55+65=120 kJ.",
        "Start from the reactant level.",
      ),
      c(
        "d-a-arrow",
        "Delayed arrow placement",
        "Forward activation starts at reactants and ends where?",
        "The profile peak",
        {
          "The products": "That measures overall change.",
          "The zero reference": "That does not measure the forward barrier.",
        },
        "It reaches the high-energy barrier.",
        "Use the activation span.",
      ),
      w(
        "d-a-explain",
        "Delayed exothermic explanation",
        "Products lie below reactants in a profile. Explain its overall transfer and whether a starting barrier can still exist.",
        "Lower product energy shows overall energy transferred out to surroundings, so the reaction is exothermic. A peak above reactants can still represent positive activation energy; the starting barrier differs from the overall decrease.",
        [
          "Compare the endpoint energies.",
          "Give outward transfer and exothermic.",
          "Allow a distinct starting barrier.",
        ],
      ),
    ],
    [
      {
        ...n(
          "d-b-release",
          "Delayed release magnitude",
          "Use the supplied profile to give the POSITIVE SIZE of energy released overall.",
          55,
          "90−35=55 kJ released.",
          "Use the requested magnitude.",
        ),
        reactionProfile: diagram(90, 35, 140, 180, 20),
      },
      d(
        "d-b-draw",
        "Delayed complete construction",
        "Construct the labelled curved profile: reactants 45 kJ; products 15 kJ; forward activation 60 kJ. Choose both forward activation and overall-change arrows.",
        45,
        15,
        105,
        "Peak 45+60=105 kJ. Activation spans 45→105, overall change 45→15, and products below reactants show exothermic transfer.",
      ),
      w(
        "d-b-explain",
        "Delayed pathway explanation",
        "A student makes an exothermic reaction more exothermic by drawing a catalyst with lower product energy. Explain the correction.",
        "For the same overall reaction, restore the original product and reactant energies. Draw an alternative pathway with a lower activation barrier instead; catalyst action changes the pathway, not the overall energy difference.",
        [
          "Restore both original endpoint levels.",
          "Lower the activation barrier through an alternative path.",
          "Keep the same overall energy change.",
        ],
      ),
    ],
  ],
};
profileJourney.guided[0].openingHint = true;
for (const q of profileJourney.practice)
  q.followUp =
    "profile-v1-r-" +
    (q.id.includes("catalyst") || q.id.includes("multistep")
      ? "catalyst"
      : q.id.includes("width") ||
          q.id.includes("temperature") ||
          q.id.includes("axis")
        ? "axis"
        : q.id.includes("draw") ||
            q.id.includes("activation") ||
            q.id.includes("definition") ||
            q.id.includes("peak") ||
            q.id.includes("offset") ||
            q.id.includes("arrow")
          ? "barrier"
          : q.id.includes("exo") || q.id.includes("collision")
            ? "start"
            : q.id.includes("endo") || q.id.includes("invalid")
              ? "classify"
              : "levels");
const all = [
  ...profileJourney.warmup,
  ...profileJourney.refresher,
  ...profileJourney.guided,
  ...profileJourney.practice,
  ...profileJourney.checkForms.flat(),
  ...profileJourney.reviewForms.flat(),
];
const aliases = [
  ["profile-v1-r-levels", "profile-v1-p-label"],
  [
    "profile-v1-r-axis",
    "profile-v1-g-evidence",
    "profile-v1-p-explain-axis",
    "profile-v1-a-axis",
    "profile-v1-d-b-axis",
  ],
  [
    "profile-v1-r-catalyst",
    "profile-v1-p-explain-catalyst",
    "profile-v1-b-explain",
    "profile-v1-d-b-explain",
  ],
  ["profile-v1-r-start", "profile-v1-d-a-explain"],
  ["profile-v1-g-arrows", "profile-v1-p-arrow", "profile-v1-d-a-arrow"],
  ["profile-v1-p-signed", "profile-v1-p-release"],
  ["profile-v1-p-offset", "profile-v1-b-shift"],
  ["profile-v1-p-definition", "profile-v1-b-definition"],
];
for (const group of aliases)
  for (const id of group) {
    const q = all.find((q) => q.id === id);
    if (q)
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...group.filter((x) => x !== id),
        ]),
      ];
  }
const legacy = [
  [
    "profile-v1-w-direction",
    "profile-v1-p-explain-exo",
    "profile-v1-d-a-explain",
  ],
  ["profile-v1-r-barrier", "profile-v1-g-read"],
  ["profile-v1-p-signed", "profile-v1-p-release"],
  ["profile-v1-p-definition", "profile-v1-b-definition"],
  ["profile-v1-p-endo"],
  [
    "profile-v1-r-catalyst",
    "profile-v1-p-explain-catalyst",
    "profile-v1-b-explain",
    "profile-v1-d-b-explain",
  ],
];
legacy.forEach((ids, i) => {
  for (const id of ids) {
    const q = all.find((q) => q.id === id);
    if (q)
      q.exposureAliases = [
        ...new Set([...(q.exposureAliases ?? []), "reaction-profiles-" + i]),
      ];
  }
});
