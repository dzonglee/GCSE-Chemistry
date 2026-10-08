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
    "tech-v1-" + id,
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
    "tech-v1-" + id,
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
  rubric: string[],
): LearningTask => ({
  id: "tech-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (
  mode: "reading" | "repeats" | "errors" | "endpoint" | "sequence",
  instruction: string,
): TaskModel => ({ kind: "titration-technique", mode, instruction });
export const titrationTechniqueJourney: LessonJourney = {
  version: 1,
  introduction:
    "Read a burette, control an endpoint and decide which repeat titres support a result.",
  scopeNote:
    "Foundation/separate AQA 4.4.2.5 and required practical 2. Pearson separate 5.9C also specifies an accurate titration at both tiers; Pearson Combined 3.16/3.18 includes titration for pure salt preparation. These board overlaps do not certify uniform whole-course alignment. Concentration calculations are in the separate Higher Titration calculations lesson. A volumetric pipette measures a fixed accurate aliquot; a burette measures variable delivery from final minus initial reading. Read the bottom of a concave meniscus at eye level; burette graduations increase downwards. A rough trial locates an approximate endpoint. The repeat-selection protocol is always stated: there is no universal 0.10 cm³ rule. This workbench uses at least two careful titres and largest-minus-smallest span at or below its stated maximum; it explicitly excludes the labelled rough estimate. More than one subset may satisfy that rule. Close repeats demonstrate repeatability, not necessarily accuracy. Suitable indicator choice and endpoint observations are stated; endpoint is not universally exactly pH7 or exact equivalence. Phenolphthalein colourless alone does not establish neutrality. A sharp suitable single indicator is preferred to universal indicator's broad sequence for visual endpoint control. Rinsing and error-direction questions state acid/alkali orientation and controlled endpoint assumptions. Water added after a correct aliquot enters the flask does not change its acid amount, although it changes concentration; water remaining in the pipette before measuring or in a burette can dilute the measured solution. An initially empty jet can make column-volume loss exceed delivery to the flask; a later unrecorded top-up can make final-minus-initial undercount delivery. Overshoot adds excess titrant. Numerical records and apparatus are simulations and interpretation of supplied data, not certification of supervised laboratory competence. Original questions have no official examiner mark allocation; written explanations remain self-reviewed and cannot automatically earn correctness. Actual AQA practical handbook and paired 2018/2019/2022 questions/mark schemes informed the distinct tasks.",
  outcomes: [
    "Read initial and final burette levels and calculate the delivered titre.",
    "Select repeat titres using a stated rule and calculate an appropriate mean.",
    "Explain apparatus, endpoint control and the direction of specified measurement errors.",
    "Evaluate a comparative method and indicator-free salt preparation.",
  ],
  warmup: [
    n(
      "w-difference",
      "Subtract the starting reading",
      "A measuring device starts at 3.0 and ends at 18.0. What is the increase?",
      15,
      "",
      "18.0 − 3.0 = 15.0.",
      "Subtract start from finish.",
    ),
    c(
      "w-aliquot",
      "Recall a measured aliquot",
      "A volumetric pipette is marked 25.0 cm³. What does it measure?",
      "A fixed volume",
      {
        "A fixed mass": "The marking is a volume, not a balance reading.",
        "Any chosen volume":
          "A volumetric pipette has its specified delivery mark.",
      },
      "It measures a specified fixed volume.",
      "Read the unit.",
    ),
  ],
  refresher: [
    n(
      "r-reading",
      "Use both readings",
      "The same burette starts at 2.35 cm³ and finishes at 24.75 cm³. Calculate the titre.",
      22.4,
      "cm³",
      "24.75 − 2.35 = 22.40 cm³.",
      "Subtract the initial reading.",
      m("reading", "Read both supplied levels before predicting delivery."),
    ),
    c(
      "r-scale",
      "Read a burette scale",
      "The labelled numbers on a burette increase downwards. A meniscus moves down as solution is delivered. What happens to the reading?",
      "It increases",
      {
        "It decreases": "Burette numbers increase downwards.",
        "It stays at zero": "Zero is only a position on the scale.",
      },
      "A downward movement reaches a larger scale reading.",
      "Follow the printed numbers.",
      m("reading", "Compare the initial and final scale positions."),
    ),
    n(
      "r-mean",
      "Average accepted titres",
      "Two accepted careful titres are 19.40 and 19.50 cm³. Calculate their mean.",
      19.45,
      "cm³",
      "(19.40 + 19.50) ÷ 2 = 19.45 cm³.",
      "Divide the sum by the number selected.",
      m("repeats", "Select the careful group and examine its mean."),
    ),
    c(
      "r-repeat",
      "State the rule",
      "A supplied protocol permits careful-group span at most 0.10 cm³. Which quantity must be at most 0.10?",
      "Largest minus smallest selected titre",
      {
        "Each neighbour difference only":
          "A chain of close neighbours can span too far overall.",
        "The mean titre": "The mean is the result, not the repeat spread.",
      },
      "Check the full selected group's largest-minus-smallest span.",
      "Look at the extremes.",
      m("repeats", "Test both qualifying pairs and a wider chain."),
    ),
    c(
      "r-endpoint",
      "Control the last volume",
      "What reduces endpoint overshoot?",
      "Add dropwise near the endpoint while swirling",
      {
        "Add quickly without mixing":
          "A large final addition may pass the endpoint.",
        "Use more indicator instead of titrant":
          "Indicator signals a change; it does not replace controlled titrant delivery.",
      },
      "Small additions and mixing help identify the specified persistent endpoint.",
      "Control delivery and mix.",
      m("endpoint", "Use the stated indicator and direction of addition."),
    ),
    c(
      "r-errors",
      "Keep amount and concentration separate",
      "A correct measured acid aliquot is already in the flask. A little distilled water is added. What happens to its acid amount?",
      "It stays the same",
      {
        "It increases": "Water does not add acid.",
        "It decreases": "No acid has been removed or reacted in this step.",
      },
      "Adding water dilutes the aliquot but leaves its acid amount unchanged.",
      "Distinguish amount from concentration.",
      m("errors", "Compare flask water with pipette or burette water."),
    ),
  ],
  guided: [
    n(
      "g-reading",
      "Find the delivered volume",
      "The same burette reads 1.20 cm³ initially and 23.60 cm³ finally. Calculate the titre.",
      22.4,
      "cm³",
      "23.60 − 1.20 = 22.40 cm³.",
      "Use final minus initial.",
      m("reading", "Predict the volume delivered from the selected record."),
    ),
    n(
      "g-repeats",
      "Select before averaging",
      "Under a maximum careful-group span of 0.10 cm³, use all three specified accepted titres 24.10, 24.15 and 24.10 cm³. Give their mean to 2 decimal places.",
      24.12,
      "cm³",
      "The span is 0.05 cm³. Their sum is 72.35; divide by 3 to get 24.1166… cm³, rounding only the final mean to 24.12.",
      "Sum these three accepted readings before dividing.",
      m(
        "repeats",
        "Select a group and decide whether it meets this record's rule.",
      ),
    ),
    c(
      "g-errors",
      "Diagnose water in the burette",
      "NaOH in the burette is diluted. With acid amount and endpoint fixed, how does the titre change?",
      "It is larger",
      {
        "It is smaller": "Diluted NaOH supplies less alkali per unit volume.",
        "It is unchanged": "The NaOH concentration changed.",
      },
      "More diluted NaOH is required to react with the fixed acid amount.",
      "Ask how much alkali each cm³ supplies.",
      m("errors", "Predict both the direction and its cause."),
    ),
    c(
      "g-endpoint",
      "Use the stated colour change",
      "For the supplied HCl–NaOH phenolphthalein method, which observation is its specified endpoint?",
      "Faint pink persists after swirling",
      {
        "A pink patch disappears after swirling":
          "A local patch that disappears does not meet the stated persistent endpoint.",
        "The solution must become deep pink":
          "Deep pink may indicate passing the specified endpoint.",
      },
      "The stated endpoint requires faint persistent pink throughout the mixed solution.",
      "Use this method's endpoint criterion.",
      m(
        "endpoint",
        "Predict the next action and the specified endpoint observation.",
      ),
    ),
    c(
      "g-sequence",
      "Locate the rough trial",
      "Why do a rough trial before careful repeats?",
      "Estimate where slow final addition will be needed",
      {
        "Use its titre as the only final result":
          "A rough estimate is not a reliable repeat group.",
        "Replace initial and final readings": "Both readings are still needed.",
      },
      "The approximate endpoint helps locate the region for careful dropwise addition.",
      "Distinguish locating from precise measurement.",
      m(
        "sequence",
        "Repair the method order; preparation steps may have valid alternatives.",
      ),
    ),
  ],
  practice: [
    n(
      "p-shift",
      "A nonzero start",
      "The same burette starts at 4.35 cm³ and finishes at 29.40 cm³. Calculate the titre.",
      25.05,
      "cm³",
      "29.40 − 4.35 = 25.05 cm³.",
      "Keep both decimal readings.",
    ),
    n(
      "p-fine",
      "Read fine burette divisions",
      "Read the bottom of the meniscus on the supplied burette window. Give the reading to two decimal places.",
      6.35,
      "cm³",
      "The small divisions are 0.10 cm³. Halfway between 6.30 and 6.40 is 6.35 cm³.",
      "Use the downward scale and estimate the halfway position.",
    ),
    c(
      "p-meniscus",
      "Read the liquid level",
      "For a clear solution with a concave meniscus, how should a burette reading be taken?",
      "Bottom of the meniscus at eye level",
      {
        "Top edge viewed from above":
          "The top edge and slanted view are unsuitable for the stated concave meniscus.",
        "Bottom viewed from well below":
          "A slanted view can introduce parallax.",
      },
      "Read the meniscus bottom with the eye level with it.",
      "Avoid a slanted sight line.",
    ),
    c(
      "p-tools",
      "Match apparatus to its role",
      "Which pairing is appropriate?",
      "Pipette: fixed aliquot; burette: measured variable delivery",
      {
        "Pipette: variable delivery; burette: fixed aliquot":
          "The roles are reversed.",
        "Both determine solution colour only":
          "The apparatus measures volume; indicator provides colour.",
      },
      "A pipette transfers the fixed sample; a burette lets the titrant volume vary while measuring delivery.",
      "Compare fixed and variable volumes.",
    ),
    c(
      "p-edge",
      "Include the boundary",
      "Careful titres are 18.45 and 18.55 cm³. The maximum permitted span is 0.10 cm³, inclusive. May this pair be selected?",
      "Yes: its span equals the permitted maximum",
      {
        "No: equality is excluded": "The stated maximum is inclusive.",
        "Only if their mean is below 0.10":
          "The limit concerns spread, not the mean.",
      },
      "18.55 − 18.45 = 0.10 cm³, so the pair meets this rule.",
      "Calculate the full span.",
    ),
    c(
      "p-chain",
      "Check the whole group",
      "Careful titres are 19.90, 20.00 and 20.10 cm³. Maximum group span is 0.10 cm³. May all three be one accepted group?",
      "No: the full span is 0.20 cm³",
      {
        "Yes: each neighbour differs by 0.10":
          "The extreme readings differ by 0.20 cm³.",
        "No pair can be accepted":
          "Either neighbouring pair has span 0.10 cm³.",
      },
      "The full group fails, although each neighbouring pair separately meets the rule.",
      "Use largest minus smallest.",
    ),
    n(
      "p-wider",
      "Use this protocol",
      "A different protocol accepts two careful readings 15.25 and 15.45 cm³ within a maximum span of 0.20 cm³. Calculate their mean.",
      15.35,
      "cm³",
      "The stated inclusive span is met; (15.25 + 15.45) ÷ 2 = 15.35.",
      "Use the stated rule, not a memorised universal threshold.",
    ),
    n(
      "p-selected",
      "Exclude the labelled rough estimate",
      "A protocol excludes the rough estimate 22.80 cm³ and accepts careful readings 22.10 and 22.15 cm³. Calculate the accepted mean before rounding.",
      22.125,
      "cm³",
      "(22.10 + 22.15) ÷ 2 = 22.125 cm³; the rough value is not included.",
      "Average only the specified accepted values.",
    ),
    c(
      "p-rough-match",
      "A matching rough estimate",
      "A labelled rough titre happens to equal a careful titre. The protocol explicitly excludes rough estimates. Should it enter the selected mean?",
      "No: use the stated protocol",
      {
        "Yes: matching automatically makes it careful":
          "Numerical agreement does not change how the estimate was obtained.",
        "Always discard the first careful titre instead":
          "The label and protocol determine exclusion, not merely position.",
      },
      "Follow the given precision protocol even if the rough number happens to agree.",
      "Read the labels and rule.",
    ),
    c(
      "p-accuracy",
      "Evaluate agreeing repeats",
      "All careful titres are close, but the burette has an uncorrected calibration error. What do the repeats establish?",
      "Good repeatability without proving accuracy",
      {
        "Guaranteed accuracy": "A systematic error can affect every repeat.",
        "That calibration cannot matter":
          "Agreement does not remove calibration bias.",
      },
      "Close repeated values can share a systematic error.",
      "Separate agreement from closeness to a correct value.",
    ),
    c(
      "p-pipette-water",
      "Water before measuring",
      "An HCl pipette still contains water before it is filled to its mark with HCl. The same NaOH titrant is used. What happens to the required titre?",
      "It is smaller",
      {
        "It is larger":
          "The measured acid aliquot has been diluted, so contains less acid.",
        "It is unchanged":
          "This water enters before the fixed acid volume is measured.",
      },
      "Dilution inside the pipette reduces the acid amount in its measured aliquot.",
      "Track when the water was added.",
    ),
    c(
      "p-flask-water",
      "Water after measuring",
      "A correct HCl aliquot is already in the flask. Distilled water rinses splashes down the walls. Assume suitable endpoint behaviour. What happens to the required NaOH amount?",
      "It is unchanged",
      {
        "It doubles because the mixture volume grows":
          "Reacting amount depends on acid amount, not total diluted volume.",
        "It decreases because acid disappears": "Water does not remove acid.",
      },
      "The aliquot's acid amount remains the same.",
      "Distinguish total mixture volume from acid amount.",
    ),
    c(
      "p-bubble",
      "Fill the jet first",
      "An initially air-filled burette jet fills with titrant during the run. The correct flask endpoint is reached. How does final-minus-initial compare with actual flask delivery?",
      "It is larger than delivery to the flask",
      {
        "It is smaller than delivery to the flask":
          "Column loss includes liquid retained in the newly filled jet.",
        "It always equals flask delivery": "Some column liquid filled the jet.",
      },
      "The column loss includes both flask delivery and the newly filled jet volume.",
      "Account for liquid that stays in the jet.",
    ),
    c(
      "p-funnel",
      "Remove the filling funnel",
      "After the initial reading, an unmeasured funnel drop enters the burette and is later delivered to the flask. How does final-minus-initial compare with total flask delivery?",
      "It is smaller than total flask delivery",
      {
        "It is larger than total flask delivery":
          "The added drop supplies volume not counted in the original column.",
        "It always includes the extra drop":
          "The initial reading preceded the drop.",
      },
      "An unrecorded top-up makes the reading difference undercount actual delivery.",
      "Track the extra input after the initial reading.",
    ),
    c(
      "p-reverse-colour",
      "Reverse the addition",
      "NaOH is in the flask; HCl is added using phenolphthalein. The supplied endpoint is first persistent colourless. What colour change is expected?",
      "Pink to colourless",
      {
        "Colourless to pink": "That is the opposite acid/alkali orientation.",
        "Purple to green": "Those are not the stated phenolphthalein colours.",
      },
      "The alkali starts pink; acid addition reaches the specified colourless endpoint.",
      "Read which solution is in the flask.",
    ),
    c(
      "p-universal",
      "Choose endpoint evidence",
      "Why is universal indicator usually unsuitable for locating a sharp visual titration endpoint?",
      "It changes through several colours over a broad pH range",
      {
        "It never changes colour": "It does respond to pH.",
        "It measures an exact neutral volume":
          "Its broad colour range does not supply a sharp volumetric endpoint.",
      },
      "A suitable single indicator has a clearer transition for the chosen reaction.",
      "Compare broad colour estimates with sharp endpoint detection.",
    ),
    c(
      "p-tile",
      "Make the change visible",
      "Why place a white tile under the flask?",
      "Make the indicator colour change easier to see",
      {
        "Supply extra alkali": "A tile is not a reactant.",
        "Measure the burette volume": "Readings come from the burette scale.",
      },
      "A pale background helps distinguish the endpoint colour.",
      "Think about observation.",
    ),
    c(
      "p-salt",
      "Avoid indicator contamination",
      "After reliable titration establishes the reacting ratio, how can a fresh salt solution avoid indicator contamination?",
      "Mix fresh solutions in that ratio without indicator",
      {
        "Filter indicator out of the original solution":
          "Dissolved indicator is not removed by ordinary filtration.",
        "Use any acid and alkali volumes":
          "Wrong proportions can leave excess reactant.",
      },
      "Establish the ratio with indicator, then repeat the measured mixture without it.",
      "Separate determining the ratio from preparing the product.",
    ),
    w(
      "p-comparison",
      "Design a fair comparison",
      "Plan how a supervised titration could compare acid samples P and Q using one NaOH solution. Explain controlled conditions, reliable endpoint measurement and how results would be compared.",
      "Use equal accurately pipetted acid aliquots, the same NaOH titrant and suitable indicator/endpoint criterion. Prepare/read the burette correctly, use a rough estimate, then careful fresh-aliquot repeats with dropwise addition and swirling near the endpoint. Subtract initial from final readings, select repeats under the stated protocol and compare accepted means. Under controlled reacting chemistry, a larger mean titre means more reacting acid equivalents per equal sample volume; this alone does not prove acid strength.",
      [
        "Equal aliquots and same titrant/endpoint criterion.",
        "Accurate readings, rough then careful repeated endpoint measurement.",
        "Select accepted titres and compare their means.",
        "Do not infer ionisation strength from this comparison alone.",
      ],
    ),
    w(
      "p-error-reason",
      "Explain a systematic error",
      "Explain why several close titres can still be inaccurate if every run starts with an air bubble that fills the burette jet.",
      "Agreement shows repeatability, but every run can share the same error. Some recorded column loss fills the jet rather than entering the flask, so the titre can overstate actual flask delivery even when the endpoint is correctly observed.",
      [
        "Distinguish repeatability and accuracy.",
        "Account for solution that fills the jet.",
        "State the direction relative to actual delivery.",
      ],
    ),
  ],
  checkForms: [],
  reviewForms: [],
};

titrationTechniqueJourney.checkForms = [
  [
    n(
      "a-titre",
      "Calculate a new titre",
      "A burette initially reads 3.65 cm³ and finally reads 28.90 cm³. Calculate the titre.",
      25.25,
      "cm³",
      "28.90 − 3.65 = 25.25 cm³.",
      "Subtract the initial reading.",
    ),
    n(
      "a-mean",
      "Calculate an accepted mean",
      "The protocol accepts careful titres 21.30, 21.35 and 21.40 cm³, with maximum span 0.10 cm³. Calculate their mean.",
      21.35,
      "cm³",
      "Their span is 0.10. The sum 64.05 divided by 3 is 21.35 cm³.",
      "Average the three specified accepted values.",
    ),
    c(
      "a-endpoint",
      "Interpret mixing",
      "An indicator colour patch disappears completely after swirling. The method requires a persistent endpoint colour. What conclusion follows?",
      "The specified endpoint has not yet been observed",
      {
        "The endpoint was definitely reached":
          "The required persistence was absent.",
        "The mixture must contain no ions":
          "An indicator observation cannot establish absence of ions.",
      },
      "A local temporary patch is not the stated persistent endpoint.",
      "Use the supplied criterion.",
    ),
    c(
      "a-controls",
      "Compare equal samples",
      "A student compares two acid samples using unequal aliquot volumes but the same titrant. Why is a direct comparison of raw mean titres unsuitable?",
      "Different sample volumes confound the reacting-amount comparison",
      {
        "The same titrant removes every problem":
          "Aliquot volume also needs controlling for this direct comparison.",
        "A burette cannot measure different titres":
          "Variable delivery is its purpose.",
      },
      "A larger aliquot may need more titrant even without a greater reacting amount per equal volume.",
      "Consider the volume of each original sample.",
    ),
    w(
      "a-method",
      "Explain measurement choices",
      "Explain why this method uses a volumetric pipette for the acid sample and a burette for the alkali, and how a titre is determined.",
      "The pipette transfers a fixed acid aliquot accurately. The burette permits variable measured alkali delivery to the endpoint. Read the bottom of the meniscus at eye level before and after delivery and subtract the initial reading from the final reading.",
      [
        "Explain fixed accurate aliquot versus variable measured delivery.",
        "Specify meniscus/eye-level readings.",
        "Use final minus initial.",
      ],
    ),
  ],
  [
    n(
      "b-scale",
      "Read a new burette window",
      "Read the meniscus bottom on the supplied burette window. Give the reading to two decimal places.",
      12.7,
      "cm³",
      "The meniscus bottom aligns with the 12.70 cm³ small division.",
      "Count downward from the labelled graduations.",
    ),
    n(
      "b-mean",
      "Use the supplied selection",
      "Rough titre 17.90 cm³ is excluded by protocol. Accepted careful titres are 17.25, 17.30 and 17.35 cm³. Calculate their mean.",
      17.3,
      "cm³",
      "The accepted sum is 51.90; divide by 3 to get 17.30 cm³.",
      "Use only the specified accepted group.",
    ),
    c(
      "b-rule",
      "Change the protocol",
      "Two careful titres are 16.20 and 16.35 cm³. The stated inclusive maximum span is 0.20 cm³. What follows?",
      "The pair meets this stated span rule",
      {
        "The pair must fail every protocol":
          "The supplied limit is 0.20, not an assumed universal 0.10.",
        "Its mean must be 0.20 cm³": "The limit describes spread, not mean.",
      },
      "Their span is 0.15 cm³, below this protocol's maximum.",
      "Compare the difference with the stated threshold.",
    ),
    c(
      "b-equivalence",
      "Limit a colour claim",
      "A suitable indicator gives its specified endpoint colour. Which claim is too strong without further evidence?",
      "The mixture must be exactly pH 7 in every titration",
      {
        "The method's endpoint colour was observed":
          "This is the supplied observation.",
        "Indicator choice matters for the reaction":
          "Its transition must be suitable.",
      },
      "Indicator transitions occur over their own pH intervals; an endpoint does not universally prove exact pH7.",
      "Distinguish the observed endpoint from universal neutrality.",
    ),
    w(
      "b-overshoot",
      "Explain the consequence",
      "Explain why adding a large last portion of titrant can spoil a careful titre, and how the next trial should be improved.",
      "A large addition can pass the specified endpoint and make the recorded titre too large. Use a fresh measured aliquot and a new trial, guided by the rough estimate; add dropwise near the endpoint while swirling to identify the specified persistent colour.",
      [
        "Explain passing the endpoint and a larger titre.",
        "Use a fresh measured aliquot for the next trial.",
        "Control final additions and mix.",
      ],
    ),
  ],
];
titrationTechniqueJourney.reviewForms = [
  [
    n(
      "d-scale",
      "Retrieve a fine scale reading",
      "Read the bottom of the meniscus on the supplied burette window. Give the reading to two decimal places.",
      8.25,
      "cm³",
      "The bottom is halfway between 8.20 and 8.30 cm³, giving 8.25 cm³.",
      "Count the divisions then estimate the halfway position.",
    ),
    c(
      "d-order",
      "Retrieve preparation order",
      "Which action must occur before recording the initial reading and beginning accurate delivery?",
      "Ensure the burette jet is filled and remove the filling funnel",
      {
        "Add an unmeasured funnel drop during titration":
          "An unrecorded addition changes the volume ledger.",
        "Wait until after the endpoint to fill the jet":
          "Jet filling would already have affected delivery.",
      },
      "Prepare the delivery system before the initial measurement.",
      "Protect the relationship between column loss and flask delivery.",
    ),
    w(
      "d-salt",
      "Explain an uncontaminated product",
      "Explain how titration can establish reacting volumes for a soluble acid/alkali salt preparation without leaving indicator in the fresh product solution.",
      "Establish a reliable reacting-volume ratio with suitable indicator and accepted titres. Measure fresh acid and alkali solutions in that ratio without indicator. Concentrate and cool the salt solution, separate the crystals from mother liquor and dry appropriately. Ordinary filtration of the original indicator-containing solution does not remove dissolved indicator.",
      [
        "Reliable reacting ratio first.",
        "Fresh measured solutions without indicator.",
        "Concentrate/cool/separate/dry; dissolved indicator cannot simply be filtered out.",
      ],
    ),
  ],
  [
    n(
      "e-mean",
      "Retrieve an accepted mean",
      "Two specified accepted careful titres are 26.45 and 26.55 cm³ under an inclusive 0.10 cm³ span rule. Calculate their mean.",
      26.5,
      "cm³",
      "Their mean is (26.45 + 26.55) ÷ 2 = 26.50 cm³.",
      "Average the stated accepted pair.",
    ),
    c(
      "e-rinse",
      "Retrieve solution preparation",
      "Before measuring an acid aliquot, what should a clean volumetric pipette finally be rinsed with?",
      "The acid solution it will measure",
      {
        "Only water left inside":
          "Remaining water can dilute the acid aliquot.",
        "The alkali titrant":
          "Alkali could react with and contaminate the acid.",
      },
      "Rinsing with the measured acid avoids dilution or cross-contamination of the aliquot.",
      "Use the solution going into this apparatus.",
    ),
    w(
      "e-repeat",
      "Retrieve the limits of agreement",
      "A group's careful titres are close but its indicator endpoint was unsuitable for the reaction. Explain why close agreement does not prove an accurate reacting volume.",
      "Close titres show repeatability under that method. If the indicator transition is unsuitable, every trial may stop at a similarly wrong reacting point. Repeating the same biased endpoint does not establish accuracy; use a suitable indicator and endpoint criterion for the reaction.",
      [
        "Agreement means repeatability.",
        "A shared unsuitable endpoint can bias every trial.",
        "Choose suitable indicator/criterion, rather than claiming agreement proves accuracy.",
      ],
    ),
  ],
];

const follow: Record<string, string> = {
  "p-shift": "r-reading",
  "p-fine": "r-scale",
  "p-meniscus": "r-reading",
  "p-tools": "r-reading",
  "p-edge": "r-repeat",
  "p-chain": "r-repeat",
  "p-wider": "r-mean",
  "p-selected": "r-mean",
  "p-rough-match": "r-repeat",
  "p-accuracy": "r-repeat",
  "p-pipette-water": "r-errors",
  "p-flask-water": "r-errors",
  "p-bubble": "r-errors",
  "p-funnel": "r-errors",
  "p-reverse-colour": "r-endpoint",
  "p-universal": "r-endpoint",
  "p-tile": "r-endpoint",
  "p-salt": "r-endpoint",
  "p-comparison": "r-repeat",
  "p-error-reason": "r-errors",
};
for (const q of titrationTechniqueJourney.practice)
  q.followUp = "tech-v1-" + follow[q.id.replace("tech-v1-", "")];
const all = [
  ...titrationTechniqueJourney.warmup,
  ...titrationTechniqueJourney.refresher,
  ...titrationTechniqueJourney.guided,
  ...titrationTechniqueJourney.practice,
  ...titrationTechniqueJourney.checkForms.flat(),
  ...titrationTechniqueJourney.reviewForms.flat(),
];
for (const [ids, legacy] of [
  [["g-reading"], "titration-practical-2"],
  [["p-tools", "w-aliquot"], "titration-practical-0"],
  [["r-reading"], "titration-practical-1"],
  [["r-endpoint"], "titration-practical-3"],
  [["r-mean"], "titration-practical-4"],
  [["p-rough-match"], "titration-practical-5"],
  [["g-endpoint", "a-endpoint"], null],
] as [string[], string | null][]) {
  for (const id of ids) {
    const q = all.find((q) => q.id === "tech-v1-" + id)!;
    q.exposureAliases = [
      ...ids.filter((other) => other !== id).map((other) => "tech-v1-" + other),
      ...(legacy ? [legacy] : []),
    ];
  }
}

titrationTechniqueJourney.guided[0].openingHint = true;

for (const [id, top, reading, boundaryDescription] of [
  [
    "p-fine",
    6,
    6.35,
    "The meniscus bottom is halfway between the third and fourth small marks below the top labelled 6.0.",
  ],
  [
    "b-scale",
    12.2,
    12.7,
    "The meniscus bottom is at the fifth small mark below the top labelled 12.2.",
  ],
  [
    "d-scale",
    8,
    8.25,
    "The meniscus bottom is halfway between the second and third small marks below the top labelled 8.0.",
  ],
] as [string, number, number, string][]) {
  const q = all.find((q) => q.id === "tech-v1-" + id)!;
  q.buretteScale = { top, reading, boundaryDescription };
}
