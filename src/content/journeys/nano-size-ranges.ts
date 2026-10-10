import type { LearningTask, LessonJourney } from "../types";
import { nanoSizeRanges } from "../../lib/nano-size-ranges";

const prefix = "np-size-v1-";
function boundaries(
  id: string,
  title: string,
  diagram?: "learn" | "construct",
): LearningTask {
  const parts = nanoSizeRanges.flatMap((range) => [
    {
      id: `${range.id}Lower`,
      label: `${range.name} lower limit`,
      answer: range.lower,
      unit: "nm",
    },
    {
      id: `${range.id}Upper`,
      label: `${range.name} upper limit`,
      answer: range.upper,
      unit: "nm",
    },
  ]);
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt:
      diagram === "learn"
        ? "Use the size reference to enter the lower and upper limits in nm. Your entries draw the ranges."
        : "Recall the lower and upper diameter limits for nano, fine and coarse particles. Enter each limit in nm.",
    parts,
    partLegend: "Particle diameter limits / nm",
    answer: JSON.stringify(
      Object.fromEntries(parts.map((part) => [part.id, String(part.answer)])),
    ),
    nanoSizeRanges: diagram,
    explanation:
      "Nano: 1–100 nm. Fine: 100–2500 nm. Coarse / dust: 2500–10000 nm. The textbook ranges share endpoints; do not force 100 or 2500 nm into a uniquely defined category.",
    hint: "1 nm = 10⁻⁹ m. Fine spans 1 × 10⁻⁷ to 2.5 × 10⁻⁶ m; coarse spans 2.5 × 10⁻⁶ to 1 × 10⁻⁵ m.",
    purpose:
      "Construct the specified particle diameter ranges rather than selecting a supplied range.",
    followUp: prefix + "r-metres",
  };
}
function dust(
  id: string,
  title: string,
  metres: string,
  nm: number,
  fine: number,
): LearningTask {
  const ratio = nm / fine;
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt: `A particle is ${metres} m across. Convert to nm, classify it and give its everyday name. Compare its diameter with a ${fine} nm fine particle.`,
    answer: `${metres} m = ${nm} nm. This is coarse dust: its diameter is clearly within 2500–10000 nm. Its diameter is ${nm} ÷ ${fine} = ${ratio} times the fine particle's diameter. This is a length comparison, not an atom count or volume ratio.`,
    rubric: [
      `Convert correctly to ${nm} nm using 1 nm = 10⁻⁹ m.`,
      "Identify coarse particles, often called dust, using the 2500–10000 nm range.",
      `Divide the matching diameter units to obtain ${ratio}; compare lengths rather than volumes or atom counts.`,
    ],
    explanation:
      "Compare your retained explanation with the criteria. No automatic examiner mark is awarded.",
    hint: "Convert both lengths into the same unit. Identify the range containing the diameter, then divide the two diameters.",
    purpose:
      "Recall coarse dust and construct a matching-unit size comparison.",
    followUp: prefix + "r-metres",
  };
}
const refresher: LearningTask = {
  id: prefix + "r-metres",
  title: "Convert the coarse limits",
  conciseHeading: true,
  prompt:
    "AQA gives coarse dust diameters from 2.5 × 10⁻⁶ m to 1 × 10⁻⁵ m. Convert both limits to nm.",
  parts: [
    { id: "lower", label: "Lower diameter", answer: 2500, unit: "nm" },
    { id: "upper", label: "Upper diameter", answer: 10000, unit: "nm" },
  ],
  answer: JSON.stringify({ lower: "2500", upper: "10000" }),
  partLegend: "Coarse particle limits",
  explanation:
    "Divide metres by 10⁻⁹: 2.5 × 10⁻⁶ m = 2500 nm and 1 × 10⁻⁵ m = 10000 nm. Fine particles span 100–2500 nm; nano structures span 1–100 nm.",
  hint: "There are 10⁹ nanometres in one metre.",
  purpose: "Connect the actual specification's metre limits to nanometres.",
  followUp: prefix + "r-metres",
};
export const nanoSizeAdditions = {
  refresher,
  guided: boundaries("g-ranges", "Build size ranges", "learn"),
  practice: [
    boundaries("p-ranges", "Recall size ranges", "construct"),
    dust("p-dust", "Identify dust", "6 × 10⁻⁶", 6000, 300),
  ],
  check: [
    boundaries("ca-ranges", "Particle limits"),
    dust("ca-dust", "Classify dust", "4 × 10⁻⁶", 4000, 160),
  ],
  review: [
    boundaries("ra-ranges", "Retrieve ranges"),
    dust("ra-dust", "Retrieve a comparison", "7 × 10⁻⁶", 7000, 350),
  ],
};
export function extendNanoSizeRanges(journey: LessonJourney) {
  journey.refresher.push(refresher);
  journey.guided.push(nanoSizeAdditions.guided);
  journey.practice.push(...nanoSizeAdditions.practice);
  journey.checkForms.push(nanoSizeAdditions.check);
  journey.reviewForms.push(nanoSizeAdditions.review);
  journey.practiceGroups!.push({
    label: "Particle sizes and dust",
    taskIds: nanoSizeAdditions.practice.map((q) => q.id),
  });
  journey.outcomes = [
    ...(journey.outcomes ?? []),
    "Recall nano, fine and coarse diameter ranges, identify dust and compare matching length units.",
  ];
  const added = [
    refresher,
    nanoSizeAdditions.guided,
    ...nanoSizeAdditions.practice,
    ...nanoSizeAdditions.check,
    ...nanoSizeAdditions.review,
  ];
  const related = [
    ...added.map((q) => q.id),
    "np-v1-p-range",
    "np-v1-p-fine",
    "np-v1-r-scale",
  ];
  for (const q of added)
    q.exposureAliases = related.filter((id) => id !== q.id);
}
