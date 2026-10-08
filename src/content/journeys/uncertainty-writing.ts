import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
import { classFrequencies } from "@/lib/frequency-display";

function histogram(
  id: string,
  title: string,
  readings: number[],
  edges: number[],
): LearningTask {
  const frequencies = classFrequencies(readings, edges);
  return {
    id: `mu-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt: `Masses / g: ${readings.join(", ")}. Count the readings in each class to construct the frequency table and histogram.`,
    answer: JSON.stringify(
      Object.fromEntries(frequencies.map((f, i) => [`f${i}`, String(f)])),
    ),
    parts: frequencies.map((f, i) => ({
      id: `f${i}`,
      label: `${edges[i]} ≤ m < ${edges[i + 1]}`,
      answer: f,
      inputMode: "numeric",
    })),
    partLegend: "Your class frequencies",
    frequencyDisplay: { kind: "histogram", ticks: edges, unit: "g" },
    explanation: `Class frequencies are ${frequencies.join(", ")}, totalling ${readings.length}. Include a lower boundary and exclude its upper boundary. Every repeated observation counts. Equal class widths allow heights proportional to frequency; with unequal widths use frequency density so bar area represents frequency.`,
    hint: "Count every observation once. The lower edge is included; the upper edge belongs to the next class.",
    purpose:
      "Construct and interpret a measured distribution as a frequency table and equal-width histogram.",
    followUp: "mu-write-v1-r-count",
  };
}
function bar(
  id: string,
  title: string,
  readings: number[],
  ticks: number[],
): LearningTask {
  const frequencies = ticks.map((v) => readings.filter((n) => n === v).length);
  return {
    id: `mu-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt: `Recorded volumes / cm³: ${readings.join(", ")}. Count each exact recorded value to construct its frequency table and bar chart.`,
    answer: JSON.stringify(
      Object.fromEntries(frequencies.map((f, i) => [`f${i}`, String(f)])),
    ),
    parts: ticks.map((v, i) => ({
      id: `f${i}`,
      label: `${v} cm³`,
      answer: frequencies[i],
      inputMode: "numeric",
    })),
    partLegend: "Frequency of each recorded volume",
    frequencyDisplay: { kind: "bar", ticks, unit: "cm³" },
    explanation: `The frequencies are ${frequencies.join(", ")}, totalling ${readings.length} records. Equal recorded values from different trials are separate observations. Bars are separated because these display exact recorded values rather than adjoining continuous intervals. The values do not prove an exact underlying volume or absence of measurement uncertainty.`,
    hint: "A frequency is the number of records at a value, not the value itself. Count repeated values separately.",
    purpose:
      "Construct a frequency table and a labelled bar chart from repeated recorded values.",
    followUp: "mu-write-v1-r-count",
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: `mu-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained response with the criteria; no automatic examiner mark is awarded.",
    hint: "Use the actual readings and the comparison named in the question; distinguish observed scatter from a consistent offset.",
    purpose:
      "Independently evaluate measurement evidence, uncertainty and justified improvements.",
  };
}
const countRefresher: LearningTask = {
  ...choice(
    "mu-write-v1-r-count",
    "How should observations enter a frequency display?",
    "Count each observation once in its stated class or exact value",
    {
      "Repeated equal values count only once":
        "Different trials remain separate observations even when their recorded values agree.",
      "A class-boundary value counts in both adjoining classes":
        "For lower ≤ x < upper, include the lower edge and exclude the upper edge: one observation must not be counted twice.",
    },
    "Keep every observation. Exact-value frequencies count all matching records. Grouped classes must not overlap: lower ≤ x < upper includes the lower boundary and excludes the upper one. Histogram bars touch; equal class widths here allow frequencies as heights. Unequal widths need frequency density.",
    "Read the class-boundary symbols and count separate trial records.",
    "Revisit frequencies",
  ),
  title: "Revisit frequencies",
  conciseHeading: true,
  followUp: "mu-write-v1-r-count",
};
const scatter = written(
  "ca-scatter",
  "Explain an uncertainty",
  "Temperatures: 20.2,20.4,20.8,20.6 °C; mean 20.5 °C. Explain the report 20.5 ± 0.3 °C and its limits.",
  "The ±0.3 °C describes estimated repeat uncertainty: the observed endpoints are 20.2 and 20.8 °C, 0.3 °C below and above the mean 20.5 °C. Their full width is 0.6 °C. This summarises observed scatter; it does not prove the true value or all future readings lie inside, and a systematic offset could still affect all readings.",
  [
    "Identify ±0.3 °C as estimated uncertainty from observed repeat scatter.",
    "Use both observed endpoints relative to mean 20.5 °C, distinguishing full width 0.6 °C from ±0.3 °C.",
    "Avoid guaranteed true/future values or a claim that repeat scatter excludes systematic error.",
  ],
  "mu-v1-r-range",
);
const calibration = written(
  "ca-calibration",
  "Evaluate a balance",
  "An 8.00 g reference gives 8.49,8.50,8.51 g. Evaluate precision, accuracy and more repeats; suggest an improvement.",
  "The readings cluster within a 0.02 g range, so they are precise. Their mean 8.50 g is 0.50 g above the accepted 8.00 g reference and is inaccurate for that reference. More repeats can help random variation but do not remove this consistent displacement. Investigate the balance’s zero/calibration and verify it against a known reference after correction, rather than simply deleting high readings.",
  [
    "Use the narrow 0.02 g scatter as precision evidence.",
    "Compare mean 8.50 g with reference 8.00 g and identify +0.50 g displacement.",
    "Explain why more repeats do not automatically remove a common systematic offset.",
    "Suggest checking/correcting zero or calibration and verifying with a known reference.",
  ],
  "mu-v1-r-bias",
);
const exclusion = written(
  "ra-exclusion",
  "Justify retained evidence",
  "Masses: 6.1,6.2,11.0,6.3 g. Trial 3 has confirmed contamination. Explain the retained mean and the range of all four recorded readings.",
  "Retain all original records and the confirmed contamination reason. Exclude trial 3 only from the justified mean: (6.1+6.2+6.3)/3=6.2 g. The requested range of all four remains from 6.1 to 11.0 g, width 4.9 g. Do not silently remove the original 11.0 g record or use the retained count for the full sum; an unusual value alone would need investigation.",
  [
    "Keep the original 11.0 g record and justify exclusion from the mean using the confirmed fault.",
    "Use retained total 18.6 g and count 3 for mean 6.2 g.",
    "Respect the requested all-four range: 6.1 to 11.0 g, width 4.9 g, distinct from the retained set.",
  ],
  "mu-v1-r-selection",
);
const investigators = written(
  "ra-investigators",
  "Compare investigators",
  "Same quantity and conditions: A 4.9,5.0,5.1 g; B 5.5,5.6,5.7 g. Mean tolerance 0.2 g here. Evaluate repetition and accuracy.",
  "Each investigator has a narrow 0.2 g range, supporting repeatability within each set under the stated comparison. Means 5.0 and 5.6 g differ by 0.6 g, beyond the supplied 0.2 g tolerance, so these sets do not support reproducibility between investigators. No true or accepted reference is given, so agreement within a set cannot establish accuracy. The supplied tolerance is for this example, not a universal scientific threshold.",
  [
    "Use within-set clustering/ranges as repeatability evidence.",
    "Compare mean difference 0.6 g with this example’s 0.2 g tolerance; distinguish reproducibility from repeatability.",
    "State that accuracy cannot be established without a true/accepted comparison.",
  ],
  "mu-v1-r-reproduce",
);
export const uncertaintyWritingAdditions = {
  guided: [
    histogram(
      "g-frequency",
      "Build a histogram",
      [14, 14.2, 14.3, 14.3, 14.4, 14.5, 14.5, 14.7],
      [14, 14.2, 14.4, 14.6, 14.8],
    ),
  ],
  practice: [
    histogram(
      "p-histogram",
      "Group repeat masses",
      [24, 24.2, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7],
      [24, 24.2, 24.4, 24.6, 24.8],
    ),
    bar(
      "p-bars",
      "Count recorded volumes",
      [10, 11, 10, 12, 11, 11, 12, 11],
      [10, 11, 12],
    ),
  ],
  check: [
    scatter,
    calibration,
    histogram(
      "ca-histogram",
      "Construct a histogram",
      [17, 17.1, 17.2, 17.4, 17.4, 17.5, 17.5, 17.6],
      [17, 17.2, 17.4, 17.6, 17.8],
    ),
    bar(
      "ca-bars",
      "Construct a bar chart",
      [5, 6, 5, 7, 6, 7, 7, 7],
      [5, 6, 7],
    ),
  ],
  review: [
    exclusion,
    investigators,
    histogram(
      "ra-histogram",
      "Retrieve a histogram",
      [21, 21, 21.1, 21.2, 21.3, 21.4, 21.6, 21.7],
      [21, 21.2, 21.4, 21.6, 21.8],
    ),
    bar(
      "ra-bars",
      "Retrieve recorded counts",
      [8, 9, 8, 10, 8, 9, 9, 10],
      [8, 9, 10],
    ),
  ],
};
export function extendUncertaintyWriting(journey: LessonJourney) {
  journey.refresher.push(countRefresher);
  journey.guided.push(...uncertaintyWritingAdditions.guided);
  journey.practice.push(...uncertaintyWritingAdditions.practice);
  journey.checkForms.push(uncertaintyWritingAdditions.check);
  journey.reviewForms.push(uncertaintyWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const q of all) q.conciseHeading = true;
  const families = [
    [
      "mu-write-v1-r-count",
      ...all.filter((q) => q.frequencyDisplay).map((q) => q.id),
    ],
    [
      "mu-v1-r-bias",
      "mu-v1-g-bias",
      "mu-v1-p-explain",
      "mu-v1-p-averaging",
      "mu-v1-cb-systematic",
      calibration.id,
    ],
    ["mu-v1-r-range", "mu-v1-g-spread", "mu-v1-p-uncertainty", scatter.id],
    [
      "mu-v1-r-selection",
      "mu-v1-g-selection",
      "mu-v1-p-evaluate",
      "mu-v1-p-investigate",
      "mu-v1-ca-select",
      exclusion.id,
    ],
    [
      "mu-v1-r-reproduce",
      "mu-v1-g-reproduce",
      "mu-v1-p-reproducible",
      "mu-v1-cb-reproduce",
      investigators.id,
    ],
  ];
  for (const ids of families)
    for (const q of all)
      if (ids.includes(q.id))
        q.exposureAliases = [
          ...new Set([
            ...(q.exposureAliases ?? []),
            ...ids.filter((id) => id !== q.id),
          ]),
        ];
  journey.practiceGroups = [
    {
      label: "Means, ranges and evidence",
      taskIds: journey.practice.slice(0, 21).map((q) => q.id),
    },
    {
      label: "Construct frequency displays",
      taskIds: journey.practice.slice(21).map((q) => q.id),
    },
  ];
  const instructions = [
    "Choose readings using evidence.",
    "Compare range and half-range.",
    "Compare scatter and reference.",
    "Compare the two investigators.",
  ];
  journey.guided.slice(0, 4).forEach((q, i) => {
    if (q.model?.kind === "measurement-uncertainty")
      q.model.instruction = instructions[i];
  });
  journey.guided[1].title = "Estimate repeat uncertainty";
  journey.guided[2].title = "Test precise readings";
  journey.guided[3].title = "Compare investigators";
  journey.guided[1].prompt =
    "Repeats: 18.2,18.6,18.8,18.4 °C; mean 18.5 °C. Use half-range uncertainty. What ± amount?";
  journey.guided[3].prompt =
    "Repeats / g: A 9.9,10.0,10.1; B 10.7,10.9,10.8. Means must agree within 0.2 g here. What is supported?";
  journey.practice[5].title = "Construct a range";
  journey.practice[5].prompt =
    "Masses: 0.62,0.65,0.61,0.31 g. Using all four, enter minimum, maximum and full range width.";
  journey.practice[19].prompt =
    "Reference 10.00 g; repeats 10.39,10.40,10.41 g. Explain precision, accuracy and why more repeats do not remove their common offset.";
  journey.practice[20].prompt =
    "Why retain an anomalous reading in the original record even when a confirmed fault justifies excluding it from a mean?";
  journey.practice[19].title = "Explain a common offset";
  journey.practice[20].title = "Justify an exclusion";
}
