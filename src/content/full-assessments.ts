import type { Assessment } from "./assessments";
import { paper1FoundationFull } from "./paper1-foundation-full";
import { paper2FoundationFull } from "./paper2-foundation-full";

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
  {
    slug: paper2FoundationFull.id,
    title: "Full Paper 2 · Foundation",
    shortTitle: "Paper 2 · Foundation",
    description:
      "An original 100-mark, 105-minute AQA Separate Chemistry practice paper. Ten question groups include reaction-rate calculations, chromatography, molecular and polymer construction, a plotted graph and a six-mark practical method. Submit the whole paper before reviewing answers and deciding method, drawing and writing marks.",
    tier: "foundation",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: paper2FoundationFull.minutes,
    examPaper: paper2FoundationFull,
    questions: paper2FoundationFull.parts.map((part) => part.question),
    topics: paper2FoundationFull.parts.map((part) => part.topic),
  },
];
