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
    `mu-v1-${id}`,
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
): LearningTask => ({
  ...number(`mu-v1-${id}`, prompt, answer, unit, explanation, hint, title),
  title,
});
const guided = [
  c(
    "g-selection",
    "Choose the readings",
    "Trial 4 has a confirmed measurement fault. Find the retained mean.",
    "10.1 g",
    {
      "11.075 g": "That includes the faulty fourth reading.",
      "13.47 g": "Divide the retained total by its retained count.",
    },
    "The justified retained set is 10.2,10.0,10.1 g: 30.3÷3=10.1 g. Keep the original excluded reading in the record.",
    "Select readings before choosing a denominator.",
    {
      kind: "measurement-uncertainty",
      mode: "selection",
      instruction: "Use the recorded evidence, then predict count and mean.",
    },
  ),
  c(
    "g-spread",
    "Separate range and uncertainty",
    "For repeats 18.2,18.6,18.8,18.4 °C, use the supplied half-range convention. What ± uncertainty accompanies mean 18.5 °C?",
    "±0.3 °C",
    {
      "±0.6 °C": "That is the full range width.",
      "±18.5 °C": "That is the mean, not its repeat scatter.",
    },
    "Range endpoints are 18.2 and 18.8; width 0.6 and half-width 0.3 °C. This is an estimate of observed scatter.",
    "Calculate both endpoints, then their difference and half that difference.",
    {
      kind: "measurement-uncertainty",
      mode: "spread",
      instruction:
        "Predict endpoints, full width and the supplied ± half-range estimate.",
    },
  ),
  c(
    "g-bias",
    "Test what tight repeats show",
    "With no accepted reference value, can tightly clustered repeat masses alone establish accuracy?",
    "No; accuracy needs comparison with a true or accepted value",
    {
      "Yes; precision proves accuracy":
        "A consistent offset can give tight but biased results.",
      "Yes; any mean is the true value":
        "Averaging does not establish the truth of the mean.",
    },
    "Clustering supports precision. The same offset can shift all values equally without widening their distribution. Reveal the supplied reference to investigate accuracy.",
    "Separate agreement with one another from agreement with a reference.",
    {
      kind: "measurement-uncertainty",
      mode: "bias",
      instruction:
        "Move every reading together; compare scatter and reference agreement.",
    },
  ),
  c(
    "g-reproduce",
    "Compare investigators",
    "Investigator A repeats 9.9,10.0,10.1 g; B repeats 10.7,10.9,10.8 g. Their means must agree within 0.2 g for this comparison. What is supported?",
    "Repeatable within both sets; not reproducible between these sets",
    {
      "Reproducible because each set is tight":
        "Tight within-set repeats do not establish between-investigator agreement.",
      "Neither set is repeatable":
        "Each investigator obtains a narrow 0.2 g range.",
    },
    "Both sets cluster; their means 10.0 and 10.8 differ by 0.8 g, beyond this example's supplied 0.2 g tolerance.",
    "Inspect within-set spread before comparing the two means.",
    {
      kind: "measurement-uncertainty",
      mode: "reproduce",
      instruction:
        "Compare within-set repetition and between-investigator agreement.",
    },
  ),
];
guided[0].openingHint = true;
export const measurementJourney: LessonJourney = {
  version: 1,
  introduction:
    "Make a justified summary of chemical measurements without hiding their spread or confusing precision with accuracy.",
  scopeNote:
    "Common chemical-measurement and working-scientifically demands: original repeat records, anomalies, means, observed range, supplied uncertainty conventions, random/systematic error and repeatability/reproducibility. These are data interpretations, not laboratory procedures. Detailed apparatus resolution, titration concordance and practical methods receive their own later lessons.",
  outcomes: [
    "Justify selection of repeat readings and use the correct count for a mean.",
    "Distinguish range endpoints, full width and a supplied ± uncertainty estimate.",
    "Explain why precision and a mean do not establish accuracy or remove a common offset.",
    "Compare repeatability within an investigator and reproducibility between investigators.",
  ],
  warmup: [
    n(
      "w-total",
      "Recall a sum",
      "What is the total of 2.4,2.6 and 2.5 g?",
      7.5,
      "g",
      "2.4+2.6+2.5=7.5 g.",
      "Add all three readings.",
    ),
    n(
      "w-mean",
      "Recall a mean",
      "Three readings total 7.5 g. What is their mean?",
      2.5,
      "g",
      "7.5÷3=2.5 g.",
      "Divide by the number of readings.",
    ),
  ],
  refresher: [
    c(
      "r-selection",
      "Use the evidence for exclusion",
      "When is excluding an anomalous measurement justified?",
      "Investigate it and identify evidence of a poor measurement",
      {
        "Whenever it is the largest": "The largest reading can be valid.",
        "Whenever it moves the mean away from a target":
          "Desired outcomes do not justify deleting evidence.",
      },
      "Keep the original record, investigate the anomaly and explain the selection.",
      "A suspicious value prompts investigation.",
    ),
    c(
      "r-mean",
      "Match sum and count",
      "If one of four results is justifiably excluded, how is the retained mean calculated?",
      "Add the three retained readings and divide by 3",
      {
        "Add three and divide by 4":
          "The divisor must match the retained count.",
        "Add all four and divide by 3":
          "Both total and count must use the retained set.",
      },
      "Choose the set before calculating either sum or count.",
      "Count the readings actually included.",
    ),
    c(
      "r-range",
      "Read the required range",
      "A question asks for the range from the smallest to largest of all four recorded results. What belongs in it?",
      "Both endpoints of all four supplied readings",
      {
        "Only a preferred mean": "A mean is not a range.",
        "Automatically omit an anomaly even though all four are requested":
          "Use the set specified in the question.",
      },
      "Follow the question's stated set. A later mean question may request a different justified selection.",
      "Read which readings are requested.",
    ),
    c(
      "r-bias",
      "Separate precision and accuracy",
      "Which difference defines accuracy?",
      "Closeness to a true or accepted value",
      {
        "Only closeness of repeats to one another": "That describes precision.",
        "Only the number of decimal places":
          "Display precision does not prove accuracy.",
      },
      "Reference agreement and clustering are different evidence.",
      "Ask what the result is compared with.",
    ),
    c(
      "r-reproduce",
      "Separate two kinds of repetition",
      "What distinguishes reproducibility from repeatability?",
      "Agreement across different investigators or equipment",
      {
        "Repeating with the same investigator alone":
          "That tests repeatability.",
        "Obtaining any numerical mean":
          "A mean alone does not establish agreement.",
      },
      "Repeatability concerns same-investigator conditions; reproducibility concerns comparison across investigators/equipment.",
      "Identify who repeats the measurement.",
    ),
  ],
  guided,
  practice: [
    n(
      "p-mean",
      "Use all valid readings",
      "Valid repeat masses are 4.2,4.4,4.3 g. Calculate their mean.",
      4.3,
      "g",
      "(4.2+4.4+4.3)÷3=4.3 g.",
      "Use all valid readings.",
    ),
    n(
      "p-count",
      "Use the retained denominator",
      "Four mass readings are 6.0,6.2,11.0,6.1 g. The notebook confirms trial 3 was contaminated; exclude it. How many readings remain?",
      3,
      "",
      "Three valid readings remain.",
      "Count included records.",
    ),
    n(
      "p-selected",
      "Calculate a justified mean",
      "For 6.0,6.2,11.0,6.1 g, exclude confirmed contaminated trial 3. What is the retained mean?",
      6.1,
      "g",
      "(6.0+6.2+6.1)÷3=6.1 g.",
      "Use the retained sum and count.",
    ),
    c(
      "p-largest",
      "Retain a valid maximum",
      "Valid results are 5.1,5.2,5.3,5.4 g with no fault identified. Should 5.4 g be deleted solely because it is largest?",
      "No; size alone does not establish a poor measurement",
      {
        "Yes; the maximum is always an anomaly": "Every set has a maximum.",
        "Yes; deletion guarantees accuracy":
          "Deleting a valid result can bias the summary.",
      },
      "Investigate evidence rather than automatically deleting extremes.",
      "The maximum can be a valid observation.",
    ),
    c(
      "p-investigate",
      "Investigate a candidate anomaly",
      "Repeat volumes are 12.1,12.0,17.8,12.2 cm³. No cause is supplied. Which response is justified?",
      "Flag 17.8 cm³ for investigation and retain its original record",
      {
        "Erase 17.8 cm³ and claim a known cause":
          "The data suggest an anomaly but do not prove its cause.",
        "Every unusual value is a systematic error":
          "A single unusual reading need not be a consistent offset.",
      },
      "Anomalous means inconsistent with the pattern; investigate why before claiming a particular measurement fault.",
      "Separate observation from causal evidence.",
    ),
    {
      ...n(
        "p-range",
        "Construct observed endpoints",
        "For all four recorded mass losses 0.62,0.65,0.61,0.31 g, give minimum, maximum and full range width. Include all four as requested.",
        0,
        "",
        "Minimum 0.31; maximum 0.65; width 0.65−0.31=0.34 g.",
        "Range endpoints come from the specified full set.",
      ),
      answer: JSON.stringify({
        minimum: "0.31",
        maximum: "0.65",
        width: "0.34",
      }),
      parts: [
        { id: "minimum", label: "Minimum / g", answer: 0.31 },
        { id: "maximum", label: "Maximum / g", answer: 0.65 },
        { id: "width", label: "Full width / g", answer: 0.34 },
      ],
      partLegend: "Construct the observed range",
    },
    n(
      "p-different-set",
      "Change the specified set",
      "The 0.31 g record in 0.62,0.65,0.61,0.31 g has a confirmed fault. For the three retained readings, what is the range width?",
      0.04,
      "g",
      "0.65−0.61=0.04 g for this retained set.",
      "The requested set has changed.",
    ),
    n(
      "p-half",
      "Apply a supplied convention",
      "Repeat temperatures span 21.4 to 22.0 °C. Use uncertainty=half the full range. What is the ± amount?",
      0.3,
      "°C",
      "(22.0−21.4)÷2=0.3 °C.",
      "Separate full width from half-width.",
    ),
    n(
      "p-lower",
      "Interpret minus uncertainty",
      "A result is reported 19.6±0.4 °C. What is the lower endpoint of that stated interval?",
      19.2,
      "°C",
      "19.6−0.4=19.2 °C.",
      "Subtract the stated amount.",
    ),
    n(
      "p-upper",
      "Interpret plus uncertainty",
      "A result is reported 19.6±0.4 °C. What is the upper endpoint of that stated interval?",
      20,
      "°C",
      "19.6+0.4=20.0 °C.",
      "Add the stated amount.",
    ),
    c(
      "p-uncertainty",
      "Limit the uncertainty claim",
      "Does a repeat-scatter estimate prove that every future reading and the true value must lie inside its stated interval?",
      "No; it summarises observed scatter rather than guaranteeing those values",
      {
        "Yes; an estimate is an exact guarantee":
          "Uncertainty estimates are not absolute guarantees.",
        "Yes; systematic error is impossible": "A consistent bias can remain.",
      },
      "The convention and observed repeats support an estimate, not guaranteed coverage or absence of bias.",
      "Keep estimates distinct from exact knowledge.",
    ),
    n(
      "p-offset",
      "Move the mean with a common offset",
      "Repeat masses have mean 8.2 g. A calibration error adds 0.5 g to every reading. What mean is then recorded?",
      8.7,
      "g",
      "8.2+0.5=8.7 g.",
      "The same offset moves the mean equally.",
    ),
    n(
      "p-width-offset",
      "Preserve the repeat width",
      "Readings span 8.0 to 8.4 g. Add 0.5 g to every reading. What is the new range width?",
      0.4,
      "g",
      "(8.4+0.5)−(8.0+0.5)=0.4 g.",
      "Both endpoints move by the same amount.",
    ),
    c(
      "p-unknown",
      "Do not invent accuracy evidence",
      "A set clusters closely around 14.2 g; no true or accepted value is supplied. What is established?",
      "Precision is supported; accuracy is not established",
      {
        "Accuracy is proved by clustering":
          "Clustering alone only addresses agreement among repeats.",
        "The true value must be 14.2 g": "The mean can have a common offset.",
      },
      "Reference information is required for accuracy.",
      "Ask what external comparison is available.",
    ),
    c(
      "p-systematic",
      "Identify consistent displacement",
      "An instrument adds 0.20 g to every correctly recorded mass. Which error description fits?",
      "Systematic error",
      {
        "Random error only":
          "The displacement has a consistent amount and direction.",
        "No error because readings repeat":
          "Repeatability can coexist with bias.",
      },
      "A common offset changes reference agreement without necessarily changing scatter.",
      "Look for the same shift each time.",
    ),
    c(
      "p-random",
      "Identify unpredictable variation",
      "Under unchanged conditions, temperature readings vary above and below their typical value without a consistent direction. What is illustrated?",
      "Random error",
      {
        "A known fixed zero offset": "That would shift readings consistently.",
        "Proof there is no uncertainty":
          "The variation is evidence of uncertainty.",
      },
      "Unpredictable variation differs from a known systematic shift.",
      "Compare directions rather than just result count.",
    ),
    c(
      "p-averaging",
      "Know what a mean can improve",
      "Why can repeating a measurement and reporting a mean help with random variation but leave a known zero offset?",
      "Random variations can partly cancel; the same offset remains in every reading",
      {
        "A mean always equals the true value":
          "Averaging does not establish truth.",
        "Repeats automatically recalibrate the instrument":
          "Repetition does not change calibration.",
      },
      "Averaging can reduce effects of random scatter; systematic causes need investigation/correction.",
      "Separate varying errors from shared displacement.",
    ),
    c(
      "p-repeatable",
      "Interpret same-investigator repeats",
      "One investigator repeats the measurement with the same equipment and conditions and obtains close results. What does this support?",
      "Repeatability",
      {
        "Reproducibility across investigators has already been tested":
          "Only one investigator is described.",
        "Perfect accuracy is established":
          "No reference comparison is supplied.",
      },
      "Specify what evidence was actually collected.",
      "Same investigator, same conditions.",
    ),
    c(
      "p-reproducible",
      "Interpret between-investigator evidence",
      "Two investigators using different calibrated equipment obtain similar result sets for the same quantity under comparable conditions. What does this support?",
      "Reproducibility",
      {
        "Only a written mean, without comparison":
          "The agreement between independent sets is relevant evidence.",
        "An exact guarantee of the true value":
          "Agreement supports reproducibility, not infallibility.",
      },
      "Between-investigator/equipment agreement differs from repeats within one set.",
      "Identify the independent comparison.",
    ),
    {
      ...c(
        "p-explain",
        "Explain precise but biased data",
        "A balance's accepted reference is 10.00 g, but repeats are 10.39,10.40,10.41 g. Explain precision, accuracy and why more such repeats do not remove their offset.",
        "The repeats cluster closely, so they are precise. Their mean is 10.40 g, which is 0.40 g above the accepted 10.00 g reference, so the set is biased. More readings with the same offset do not remove it; the calibration cause must be investigated.",
        {},
        "Compare within-set scatter and reference displacement separately.",
        "Name both comparisons and the shared offset.",
      ),
      options: undefined,
      rubric: [
        "Uses close clustering as precision evidence.",
        "Compares mean 10.40 g with accepted 10.00 g, identifying+0.40 g bias.",
        "Explains that averaging the same systematic offset does not remove it.",
      ],
    },
    {
      ...c(
        "p-evaluate",
        "Justify which evidence is retained",
        "Explain why a suspected anomaly should remain in the original record even if a confirmed measurement fault later justifies excluding it from a mean.",
        "The original reading preserves the evidence and allows the anomaly and its cause to be investigated. The summary can exclude a confirmed poor measurement with a recorded reason, while retaining the original data. Deleting a value merely to obtain a preferred mean is unjustified.",
        {},
        "Keep original evidence distinct from selection for a justified summary.",
        "Explain investigation, record retention and selection.",
      ),
      options: undefined,
      rubric: [
        "Preserves the original reading for review.",
        "Requires a justified poor-measurement explanation for exclusion.",
        "Rejects deletion solely to improve agreement with a desired result.",
      ],
    },
  ],
  checkForms: [
    [
      n(
        "ca-mean",
        "Calculate a new retained mean",
        "Valid repeat masses are 7.3,7.5,7.4 g. What is the mean?",
        7.4,
        "g",
        "22.2÷3=7.4 g.",
        "Use every valid reading.",
      ),
      n(
        "ca-range",
        "Calculate a new full width",
        "All recorded temperatures are 13.6,13.9,13.7,14.0 °C. What is their full range width?",
        0.4,
        "°C",
        "14.0−13.6=0.4 °C.",
        "Subtract minimum from maximum.",
      ),
      n(
        "ca-half",
        "Use a new supplied uncertainty convention",
        "A retained temperature set spans 11.2 to 12.0 °C. Use half-range uncertainty. What is the ± amount?",
        0.4,
        "°C",
        "(12.0−11.2)÷2=0.4 °C.",
        "Use the supplied convention.",
      ),
      c(
        "ca-accuracy",
        "Check missing reference evidence",
        "Tight repeat readings are supplied without a true/accepted comparison. Is accuracy established?",
        "No; reference agreement has not been established",
        {
          "Yes; any tight set is accurate": "Tightness demonstrates precision.",
          "Yes; taking a mean proves the true value":
            "A common offset can remain.",
        },
        "Precision and accuracy require different comparisons.",
        "Look for reference evidence.",
      ),
      c(
        "ca-select",
        "Check an unsupported exclusion",
        "A measurement is excluded only because it prevents the desired mean. Is that justification valid?",
        "No; investigate measurement evidence rather than select for a preferred outcome",
        {
          "Yes; a desired mean decides validity":
            "That biases evidence selection.",
          "Yes; the largest number is always invalid":
            "Extremes need investigation.",
        },
        "Retain original records and justify exclusions.",
        "Separate evidence from preference.",
      ),
    ],
    [
      n(
        "cb-selected",
        "Use a new justified selection",
        "Readings are 3.1,3.2,8.7,3.3 g. Trial 3 has confirmed contamination; exclude it. What is the retained mean?",
        3.2,
        "g",
        "(3.1+3.2+3.3)÷3=3.2 g.",
        "Use the retained count 3.",
      ),
      n(
        "cb-offset",
        "Use a new common displacement",
        "A set has mean 6.7 g. The same+0.3 g error affects every reading. What mean is recorded?",
        7,
        "g",
        "6.7+0.3=7.0 g.",
        "A common displacement also moves the mean.",
      ),
      {
        ...n(
          "cb-interval",
          "Construct a stated interval",
          "For 23.4±0.2 °C, enter the stated lower and upper endpoints.",
          0,
          "",
          "Lower 23.2 and upper 23.6 °C.",
          "Subtract and add the given uncertainty.",
        ),
        answer: JSON.stringify({ lower: "23.2", upper: "23.6" }),
        parts: [
          { id: "lower", label: "Lower endpoint / °C", answer: 23.2 },
          { id: "upper", label: "Upper endpoint / °C", answer: 23.6 },
        ],
        partLegend: "Construct the reported interval",
      },
      c(
        "cb-reproduce",
        "Check between-investigator disagreement",
        "Both investigators repeat closely, but their means differ beyond the supplied comparison tolerance. What is supported?",
        "Repeatability within sets, but not reproducibility between them",
        {
          "Reproducibility follows from tight repeats":
            "The investigators disagree.",
          "A common mean always removes their difference":
            "Summarising does not remove bias.",
        },
        "Within-set and between-set comparisons are distinct.",
        "Compare the two means as well as their spreads.",
      ),
      c(
        "cb-systematic",
        "Check averaging limits",
        "Will averaging more readings remove a known common calibration offset?",
        "No; the same offset remains in their mean",
        {
          "Yes; any repetition removes systematic error":
            "The offset is shared by every reading.",
          "Yes; a mean has no uncertainty":
            "A mean can retain bias and uncertainty.",
        },
        "Investigate the systematic cause rather than assume repetition fixes it.",
        "Track the offset in each term.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-mean",
        "Retrieve another repeat mean",
        "Valid readings are 9.6,9.8,9.7 g. Find their mean.",
        9.7,
        "g",
        "29.1÷3=9.7 g.",
        "Use the retained total and count.",
      ),
      n(
        "ra-range",
        "Retrieve a range width",
        "Readings span 31.1 to 31.7 °C. What is the full width?",
        0.6,
        "°C",
        "31.7−31.1=0.6 °C.",
        "Use maximum minus minimum.",
      ),
      c(
        "ra-reference",
        "Retrieve the accuracy comparison",
        "What additional comparison is needed to assess whether a precise set is accurate?",
        "A true or accepted reference value",
        {
          "Only more digits": "Digits do not establish accuracy.",
          "Only deletion of the maximum":
            "Selection does not supply a reference.",
        },
        "Clustering and truth agreement are different comparisons.",
        "Identify the accepted value.",
      ),
    ],
    [
      n(
        "rb-half",
        "Retrieve half-range uncertainty",
        "A supplied half-range convention is used for a width 1.4 °C. What is the ± amount?",
        0.7,
        "°C",
        "1.4÷2=0.7 °C.",
        "Halve the full width.",
      ),
      n(
        "rb-shift",
        "Retrieve a biased mean",
        "A mean is 12.1 g before a common+0.2 g offset. What is the displaced mean?",
        12.3,
        "g",
        "12.1+0.2=12.3 g.",
        "The mean shifts equally.",
      ),
      c(
        "rb-selection",
        "Retrieve justified recording",
        "After excluding a confirmed poor measurement from the summary, what happens to its original record?",
        "Keep it with the investigation and exclusion reason",
        {
          "Erase it to conceal the anomaly":
            "Original evidence must remain reviewable.",
          "Change it to the desired mean": "That alters recorded evidence.",
        },
        "A justified summary does not erase its source data.",
        "Keep records distinct from selection.",
      ),
    ],
  ],
};
for (const q of [
  ...measurementJourney.warmup,
  ...measurementJourney.refresher,
  ...guided,
  ...measurementJourney.practice,
])
  q.followUp =
    q.id.includes("reproduc") || q.id.includes("repeatable")
      ? "mu-v1-r-reproduce"
      : q.id.includes("bias") ||
          q.id.includes("offset") ||
          q.id.includes("unknown") ||
          q.id.includes("systematic") ||
          q.id.includes("averaging") ||
          q.id.includes("explain")
        ? "mu-v1-r-bias"
        : q.id.includes("range") ||
            q.id.includes("half") ||
            q.id.includes("spread") ||
            q.id.includes("lower") ||
            q.id.includes("upper") ||
            q.id.includes("uncertainty")
          ? "mu-v1-r-range"
          : q.id.includes("mean") ||
              q.id.includes("count") ||
              q.id.includes("selected")
            ? "mu-v1-r-mean"
            : "mu-v1-r-selection";

import { extendUncertaintyWriting } from "./uncertainty-writing";
extendUncertaintyWriting(measurementJourney);
