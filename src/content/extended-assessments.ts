import { lessons, questionById } from "./curriculum";
import type { Assessment } from "./assessments";

// Curated one task at a time. Reuse the original identity and exposure history;
// moving a lesson task into a cumulative set must not make it fresh again.
export const paper1FoundationIds = [
  "atom-v2-ca-neutrons",
  "am-v1-ca-straight",
  "as-v1-ca-ratio",
  "ram-v1-ca-three",
  "g7-v1-ca-infer",
  "tm-v1-ca-physical",
  "ib-v1-ca-draw",
  "cb-v1-ca-hcl",
  "mp-v1-ca-force",
  "mb-v1-ca-hardness",
  "gr-v1-ca-carriers",
  "np-v1-ca-risk",
  "fm-v1-ca-barium",
  "be-v1-ca-neutralisation",
  "mc-v1-ca-reading",
  "mu-v1-ca-half",
  "sc-v1-ca-mg",
  "py-v1-ca-proof",
  "mr-v1-ca-written",
  "me-v1-a-explain",
  "ss-v1-p-method-write",
  "aqp-v1-a-evidence",
  "tech-v1-a-titre",
  "tech-v1-a-method",
  "heat-v1-a-graph",
  "profile-v1-a-draw",
  "profile-v1-a-explain",
  "ep-v1-a-gradient",
  "ep-v1-a-written",
  "cf-v1-A-impact",
] as const;

function curatedQuestions(ids: readonly string[]) {
  return ids.map((id) => {
    const question = questionById(id);
    if (!question) throw new Error(`Missing curated question: ${id}`);
    return question;
  });
}
function curatedTopics(questions: Assessment["questions"]) {
  return questions.map((question) => {
    const lesson = lessons.find((lesson) => {
      const journey = lesson.journey;
      return (
        journey &&
        [...journey.practice, ...journey.checkForms.flat()].some(
          (task) => task.id === question.id,
        )
      );
    });
    if (!lesson) throw new Error(`Missing curated topic: ${question.id}`);
    return lesson.topic;
  });
}

const questions = curatedQuestions(paper1FoundationIds);
const topics = curatedTopics(questions);

export const paper1Foundation: Assessment = {
  slug: "paper-1-foundation-extended",
  title: "Paper 1 cumulative practice · Foundation",
  shortTitle: "Paper 1 · Foundation",
  description:
    "30 questions on AQA Chemistry Paper 1 topics, including diagrams, calculations and practical reasoning. Nine written responses need self-review after submission.",
  tier: "foundation",
  course: "separate",
  structure: "extended",
  kind: "paper",
  minutes: 90,
  questions,
  topics,
};

// Foundation Paper 2 was separately researched and reviewed after delivery of
// Paper 1. These are existing questions, not newly generated exposure identities.
export const paper2FoundationIds = [
  "rr-v1-A-interval",
  "rr-v1-A-draw",
  "ct-v1-check-a-compress",
  "tc-v1-a2",
  "re-v1-a-written",
  "rp-v1-a-plan",
  "oil-v1-a-column",
  "alk-v1-a-balance",
  "crk-v1-a-bromine",
  "alc-v1-a-carbonate",
  "pol-v1-a-draw",
  "natural-v1-c-a-types",
  "purity-v1-cA-label",
  "chromatography-v1-cA-rf",
  "chromatography-v1-cA-drawing",
  "gas-tests-v1-cA-pair",
  "ion-tests-v1-cA-plan",
  "instrumental-analysis-v1-cA-concentration",
  "early-atmosphere-v1-cA-origin",
  "greenhouse-v1-cA-mechanism",
  "climate-v1-cA-graph",
  "climate-v1-cA-effects",
  "pollution-v1-cA-sulfur",
  "pollution-v1-cA-CO",
  "water-v1-cA-method",
  "waste-v1-cA-pair",
  "lca-v1-cA-judgement",
  "materials-v1-cA-zinc",
  "haber-v1-cA-cool",
  "haber-v1-cA-mix",
] as const;

const paper2Questions = curatedQuestions(paper2FoundationIds);
export const paper2Foundation: Assessment = {
  slug: "paper-2-foundation-extended",
  title: "Paper 2 cumulative practice · Foundation",
  shortTitle: "Paper 2 · Foundation",
  description:
    "30 questions on AQA Chemistry Paper 2 topics, including graph and structure construction, chemical tests and evidence-based evaluation. Fourteen written or drawn responses need self-review after submission.",
  tier: "foundation",
  course: "separate",
  structure: "extended",
  kind: "paper",
  minutes: 90,
  questions: paper2Questions,
  topics: curatedTopics(paper2Questions),
};

// Higher Paper1 was individually curated after the Foundation samples and
// separately delivered inverse atom-economy and temperature-graph corrections.
export const paper1HigherIds = [
  "am-v1-p-contrast",
  "as-v1-cb-analogy",
  "iso-v1-cb-table",
  "ram-v1-cb-count",
  "g7-v1-cb-infer",
  "tm-v1-cb-evidence",
  "ib-v1-cb-draw",
  "cb-v1-cb-water",
  "if-v1-cb-nitrate",
  "dn-v1-p-compare",
  "ge-v1-cb-panel",
  "np-v1-cb-ratio",
  "ae-v1-p-inverse-transfer",
  "rm-v1-cb-working",
  "lr-v1-cb-proof",
  "tc-v1-cb-volume",
  "gv-v1-cb-steam",
  "ty-v1-cb-required",
  "ss-v1-p-method-write",
  "he-v1-b-zinc-acid",
  "acid-v1-b-factor",
  "he-v1-b-explain",
  "aqp-v1-b-explain",
  "tech-v1-b-overshoot",
  "bond-v1-b-change",
  "bond-v1-b-inverse",
  "fh-v1-B-oxygen",
  "cv-v1-B-evidence",
  "ep-v1-p-scatter",
  "cf-v1-B-method",
] as const;
const paper1HigherQuestions = curatedQuestions(paper1HigherIds);
export const paper1Higher: Assessment = {
  slug: "paper-1-higher-extended",
  title: "Paper 1 cumulative practice · Higher",
  shortTitle: "Paper 1 · Higher",
  description:
    "30 questions on AQA Chemistry Paper 1 topics, including multi-step calculations, bonding explanations, practical methods and graph construction. Ten written or drawn responses need self-review after submission.",
  tier: "higher",
  course: "separate",
  structure: "extended",
  kind: "paper",
  minutes: 90,
  questions: paper1HigherQuestions,
  topics: curatedTopics(paper1HigherQuestions),
};

// Higher Paper 2 was reviewed separately against selected paired questions,
// schemes and specification clauses after the Paper 1 sample was delivered.
export const paper2HigherIds = [
  "tr-v1-A-draw",
  "tr-v1-B-calibration",
  "tc-v1-b5",
  "es-v1-b-equal",
  "es-v1-b-removal",
  "rp-v1-b-plan",
  "alk-v1-b-balance",
  "crk-v1-b-control",
  "alc-v1-b-draw",
  "pol-v1-b-draw",
  "pol-v1-p-polyester2",
  "natural-v1-c-b-diagram",
  "purity-v1-cB-recovery",
  "chromatography-v1-cB-round",
  "chromatography-v1-cB-mechanism",
  "gas-tests-v1-cB-contact",
  "ion-tests-v1-cB-plan",
  "instrumental-analysis-v1-cB-ca-cu",
  "early-atmosphere-v1-cB-synthesis",
  "greenhouse-v1-cB-ledger",
  "greenhouse-v1-cB-methane",
  "climate-v1-cB-service",
  "climate-v1-cB-quality",
  "pollution-v1-cB-balance",
  "water-v1-cB-energy",
  "bio-v1-cB-bio",
  "lca-v1-cB-recovery",
  "materials-v1-cB-ldhd",
  "haber-v1-cB-feed",
  "haber-v1-cB-freeGraph",
] as const;
const paper2HigherQuestions = curatedQuestions(paper2HigherIds);
export const paper2Higher: Assessment = {
  slug: "paper-2-higher-extended",
  title: "Paper 2 cumulative practice · Higher",
  shortTitle: "Paper 2 · Higher",
  description:
    "30 questions on AQA Chemistry Paper 2 topics, including tangent and graph construction, organic structures, chemical tests and evidence evaluation. Fourteen written or drawn responses need self-review after submission.",
  tier: "higher",
  course: "separate",
  structure: "extended",
  kind: "paper",
  minutes: 90,
  questions: paper2HigherQuestions,
  topics: curatedTopics(paper2HigherQuestions),
};

export const extendedPapers: Assessment[] = [
  paper1Foundation,
  paper2Foundation,
  paper1Higher,
  paper2Higher,
];
