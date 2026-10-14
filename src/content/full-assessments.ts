import type { Assessment } from "./assessments";
import { paper1FoundationFull } from "./paper1-foundation-full";
import { paper2FoundationFull } from "./paper2-foundation-full";
import { paper1HigherFull } from "./paper1-higher-full";
import { paper2HigherFull } from "./paper2-higher-full";
import { edexcelPaper1FoundationFull } from "./edexcel-paper1-foundation-full";
import { edexcelPaper2FoundationFull } from "./edexcel-paper2-foundation-full";
import { edexcelPaper1HigherFull } from "./edexcel-paper1-higher-full";
import { edexcelPaper2HigherFull } from "./edexcel-paper2-higher-full";

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
  {
    slug: paper1HigherFull.id,
    title: "Full Paper 1 · Higher",
    shortTitle: "Paper 1 · Higher",
    description:
      "An original 100-mark, 105-minute AQA Separate Chemistry practice paper. Ten question groups include multi-stage mole and titration calculations, independent plotting and extrapolation, native electron and energy diagrams and a six-mark practical method. Submit the whole paper before reviewing retained working, requested precision and manual method marks.",
    tier: "higher",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: paper1HigherFull.minutes,
    examPaper: paper1HigherFull,
    questions: paper1HigherFull.parts.map((part) => part.question),
    topics: paper1HigherFull.parts.map((part) =>
      part.topic === "energy-changes" ? "energy" : part.topic,
    ),
  },
  {
    slug: paper2HigherFull.id,
    title: "Full Paper 2 · Higher",
    shortTitle: "Paper 2 · Higher",
    description:
      "An original 100-mark, 105-minute AQA Separate Chemistry practice paper. Ten question groups include rate and tangent calculations, a curved fuel graph, an unfamiliar polymer repeat, a six-mark ion-test method and a four-mark fertiliser evaluation. Submit the whole paper before reviewing retained working, precision, carried-error credit and whole-response levels.",
    tier: "higher",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: paper2HigherFull.minutes,
    examPaper: paper2HigherFull,
    questions: paper2HigherFull.parts.map((part) => part.question),
    topics: paper2HigherFull.parts.map((part) => part.topic),
  },
  {
    slug: edexcelPaper1FoundationFull.id,
    title: "Edexcel Paper 1 · Foundation",
    shortTitle: "Paper 1 · Foundation",
    description:
      "An original 100-mark, 105-minute Pearson Edexcel Separate Chemistry paper. Its own 40 parts include ink separation, copper purification and plotting, empirical formulae from reacting masses, titration and Haber/cell decisions. Submit the whole paper before reviewing retained work, drawings and method credit.",
    tier: "foundation",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: edexcelPaper1FoundationFull.minutes,
    examPaper: edexcelPaper1FoundationFull,
    questions: edexcelPaper1FoundationFull.parts.map((part) => part.question),
    topics: edexcelPaper1FoundationFull.parts.map((part) => part.topic),
  },
  {
    slug: edexcelPaper2FoundationFull.id,
    title: "Edexcel Paper 2 · Foundation",
    shortTitle: "Paper 2 · Foundation",
    description:
      "An original 100-mark, 105-minute Pearson Edexcel Separate Chemistry paper. Its own48 parts include gas-rate plotting, endothermic profiles, ion identification, photometer calibration, alcohol and polymer construction, atmosphere evidence and nanoparticle calculations. Submit the whole paper before reviewing retained work and method marks.",
    tier: "foundation",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: edexcelPaper2FoundationFull.minutes,
    examPaper: edexcelPaper2FoundationFull,
    questions: edexcelPaper2FoundationFull.parts.map((part) => part.question),
    topics: edexcelPaper2FoundationFull.parts.map((part) => part.topic),
  },
  {
    slug: edexcelPaper1HigherFull.id,
    title: "Edexcel Paper 1 · Higher",
    shortTitle: "Paper 1 · Higher",
    description:
      "An original 100-mark, 105-minute Pearson Edexcel Separate Chemistry paper. Its own 43 parts include isotope and particle calculations, oxygen construction, two extended responses, accurate titration, copper plotting, limiting-reactant gas calculations and industrial decisions. Submit the whole paper before reviewing retained work and method marks.",
    tier: "higher",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: edexcelPaper1HigherFull.minutes,
    examPaper: edexcelPaper1HigherFull,
    questions: edexcelPaper1HigherFull.parts.map((part) => part.question),
    topics: edexcelPaper1HigherFull.parts.map((part) => part.topic),
  },
  {
    slug: edexcelPaper2HigherFull.id,
    title: "Edexcel Paper 2 · Higher",
    shortTitle: "Paper 2 · Higher",
    description:
      "An original 100-mark, 105-minute Pearson Edexcel Separate Chemistry paper. Its own 39 parts include halogen redox, tangent and energy-profile construction, cracking deductions, two extended responses, acid/monomer/polyester structures, finite-chain water loss, calibration and practical evaluation. Submit the whole paper before reviewing retained work and method marks.",
    tier: "higher",
    course: "separate",
    structure: "full",
    kind: "paper",
    minutes: edexcelPaper2HigherFull.minutes,
    examPaper: edexcelPaper2HigherFull,
    questions: edexcelPaper2HigherFull.parts.map((part) => part.question),
    topics: edexcelPaper2HigherFull.parts.map((part) => part.topic),
  },
];
