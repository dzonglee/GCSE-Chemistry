import type { Assessment } from "./assessments";
import { paper1FoundationFull } from "./paper1-foundation-full";

export const fullPapers: Assessment[] = [
  {
    slug: paper1FoundationFull.id,
    title: "Full Paper 1 · Foundation",
    shortTitle: "Paper 1 · Foundation",
    description:
      "An original 100-mark, 105-minute AQA Separate Chemistry practice paper. Ten question groups include calculations, practical methods, native diagrams and a graph. Submit the whole paper before reviewing answers, method credit and extended writing.",
    tier: "foundation",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: paper1FoundationFull.minutes,
    examPaper: paper1FoundationFull,
    questions: paper1FoundationFull.parts.map((part) => part.question),
    topics: paper1FoundationFull.parts.map((part) =>
      part.topic === "energy-changes" ? "energy" : part.topic,
    ),
  },
];
