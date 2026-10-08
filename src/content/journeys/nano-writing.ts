import type { LearningTask, LessonJourney } from "../types";
import { choice, number } from "./helpers";

function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp = "np-v1-r-evidence",
): LearningTask {
  return {
    id: `np-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained explanation with the criteria. No automatic examiner mark is awarded.",
    hint: "Use the supplied evidence, separate benefits from missing risk evidence, and justify your judgement.",
    purpose:
      "Independently interpret nanoparticle evidence, ethical issues and risk perception.",
  };
}
function areas(
  id: string,
  title: string,
  base: number,
  height: number,
): LearningTask {
  return {
    id: `np-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt:
      "Calculate the rectangle and triangular coating footprints shown, in nm². Use the perpendicular height.",
    answer: JSON.stringify({
      rectangle: String(base * height),
      triangle: String((base * height) / 2),
    }),
    partLegend: "Coating footprint areas",
    parts: [
      {
        id: "rectangle",
        label: "Rectangle area",
        answer: base * height,
        unit: "nm²",
      },
      {
        id: "triangle",
        label: "Triangle area",
        answer: (base * height) / 2,
        unit: "nm²",
      },
    ],
    nanoFootprintDiagram: { base, height },
    explanation: `Rectangle: ${base} × ${height} = ${base * height} nm². Triangle: half of this, ${(base * height) / 2} nm². These are ideal coating footprints, not total particle surface areas.`,
    hint: "Rectangle = base × perpendicular height; triangle = half of this.",
    purpose: "Apply rectangle and triangle area with squared length units.",
    followUp: "np-write-v1-r-footprint",
  };
}
const guided: LearningTask = {
  ...number(
    "np-write-v1-g-footprint",
    "The triangle has base 32 nm and perpendicular height 24 nm. Calculate its coating footprint, in nm².",
    384,
    "nm²",
    "Half of 32 × 24 = 384 nm². The dashed rectangle contains two matching triangles; its area is 768 nm². This footprint is not the six-face surface area of a particle.",
    "Use half of base × perpendicular height.",
    "Relate a triangle to its bounding rectangle.",
  ),
  title: "Compare coating footprints",
  conciseHeading: true,
  nanoFootprintDiagram: { base: 32, height: 24, interactive: true },
  followUp: "np-write-v1-r-footprint",
};
const refresher: LearningTask = {
  ...number(
    "np-write-v1-r-footprint",
    "An ideal triangular footprint has base 18 nm and perpendicular height 10 nm. Calculate its area.",
    90,
    "nm²",
    "½ × 18 × 10 = 90 nm². Use perpendicular height, not a sloping edge. This is an ideal coating footprint, not an atom-count model.",
    "Find the matching rectangle area, then halve it.",
    "Revisit triangle area and perpendicular height.",
  ),
  title: "Revisit footprint area",
  conciseHeading: true,
  followUp: "np-write-v1-r-footprint",
};
const benefits = written(
  "p-benefits",
  "Suggest two benefits",
  "A nano window coating cleans equally with less material and passes more light than a fine-particle coating. Suggest two reasons to use it.",
  "Use any two distinct relevant reasons: higher surface area to volume ratio; less material or a thinner coating for the same effect; more light transmitted in this supplied comparison. These are reasons for this application, not proof that every nanoparticle is transparent or safe.",
  [
    "Give two distinct relevant reasons: higher surface area to volume ratio, less material for the same effect, or the supplied greater light transmission.",
    "Keep claims tied to the supplied coating; do not infer universal transparency or safety.",
  ],
);
const ethics = written(
  "p-ethics",
  "Consider affected people",
  "A nano coating saves cleaning costs. Worker and resident exposure is unmeasured. Explain an ethical issue and justify a next step.",
  "Cost savings benefit users, while workers and residents may bear an unmeasured exposure burden. It is an ethical issue whether benefits and possible harms are fairly shared and whether affected people receive information and a voice. Investigate exposure and consult affected groups before a wider decision. A different justified precautionary decision is acceptable; uncertainty alone proves neither harm nor safety.",
  [
    "Identify whose benefits and possible exposure burdens differ.",
    "Explain a rights, fairness or informed-participation issue, rather than just naming a hazard.",
    "Justify a relevant investigation, consultation or precaution without claiming unmeasured harm or guaranteed safety.",
  ],
);
const evidence = written(
  "ca-evidence",
  "Evaluate a catalyst test",
  "A supplied nano catalyst needs 1.5 g and a fine-particle catalyst 6 g for 90% conversion in 12 minutes. Release and exposure were not tested. Evaluate the result.",
  "The nano catalyst uses one quarter of the mass for the same tested conversion and time. Higher exposed surface per amount can account for more accessible reaction sites. This performance result does not establish release, exposure or harm. Investigate these under relevant use conditions before a safety conclusion.",
  [
    "Use 1.5 g versus 6 g for the same 90% conversion and 12 minutes.",
    "Link a plausible benefit to higher surface area per amount, without claiming a universal effect.",
    "Distinguish measured performance from missing release, exposure and harm evidence.",
  ],
);
const coldEthics = written(
  "ca-ethics",
  "Weigh benefits and rights",
  "A school proposes an unfamiliar nano surface treatment to save water. Cleaners may face exposure; exposure data and their views are missing. Explain an ethical issue and justify a decision.",
  "Saving water benefits the school, but cleaners may carry an unmeasured burden. Fairness, information and participation matter when other people receive the savings. Seek relevant exposure evidence and cleaners’ views; a justified limited trial with precautions or postponement is reasonable. Do not turn missing data into proof of danger or safety.",
  [
    "Connect water-saving benefits with the people carrying possible exposure burdens.",
    "Explain fairness, information or participation as an ethical issue.",
    "Support a bounded decision and relevant next step; accept different reasoned conclusions.",
  ],
);
const perception = written(
  "ca-perception",
  "Perception and risk",
  "People accept a familiar coating they choose, but fear an unfamiliar invisible nano spray used nearby. No exposure or harm data are supplied. Explain the different perceptions and what can be concluded.",
  "Familiarity and voluntary choice can make risk feel more acceptable, whereas unfamiliarity, invisibility and imposed exposure can increase concern. These factors describe perceived risk, not measured exposure or harm. The information cannot establish which product poses greater actual risk; relevant exposure and hazard evidence is needed.",
  [
    "Explain a supplied contrast such as familiar/unfamiliar, voluntary/imposed or visible/invisible exposure.",
    "Distinguish perceived risk from measured exposure and harm.",
    "Reject ranking actual risk without relevant evidence; identify what must be investigated.",
  ],
);
const delayedEvidence = written(
  "ra-evidence",
  "Retrieve evidence limits",
  "Nano and fine-particle coatings remove equal dirt in a supplied test using 3 g and 9 g. Neither weathered release nor exposure was measured. Evaluate the benefit and safety claim.",
  "The nano coating uses one third of the tested mass for equal dirt removal. This supports a bounded performance benefit, not universal effectiveness or safety. Investigate release after weathering and relevant exposure and harm before drawing safety conclusions.",
  [
    "Use 3 g versus 9 g for the same tested effect.",
    "Separate performance benefit from absent weathered-release and exposure evidence.",
    "Propose relevant investigation without assuming all uses safe or harmful.",
  ],
);
const delayedPerception = written(
  "ra-perception",
  "Fairness and risk",
  "An invisible council nano treatment cuts maintenance costs. Residents cannot choose exposure; no exposure data exist. Explain a perception factor, an ethical issue and a justified next step.",
  "Invisible and imposed exposure can increase perceived concern, but concern does not measure actual risk. The council receives savings while residents may bear an unknown burden; fairness and an informed voice are ethical issues. Consult residents and investigate release, exposure and harm under relevant conditions, using proportionate precautions or postponement supported by reasons.",
  [
    "Explain invisible or imposed exposure as a perceived-risk factor, not a measurement of harm.",
    "Explain fairness or informed participation for affected residents.",
    "Justify a relevant evidence-gathering or precautionary step; accept different reasoned decisions.",
  ],
);
const ethicalRefresher: LearningTask = {
  ...choice(
    "np-write-v1-r-ethics",
    "Which question identifies an ethical issue when a coating saves money but other people may face exposure?",
    "Are benefits and possible burdens fairly shared?",
    {
      "How many nanometres wide is the particle?":
        "A size measurement does not itself address rights, fairness or responsibilities.",
      "Does invisible mean definitely harmful?":
        "Visibility affects perception; it does not prove harm or settle fairness.",
    },
    "Ethical questions concern right and wrong, rights and responsibilities. Ask who benefits, who may bear burdens, and whether affected people have information and a voice. Different decisions can be justified; neither uncertainty nor a cost saving settles the issue alone.",
    "Distinguish fairness and rights from a physical measurement.",
    "Revisit rights, responsibilities and fair distribution.",
  ),
  title: "Revisit ethical issues",
  conciseHeading: true,
  followUp: "np-write-v1-r-ethics",
};
const perceptionRefresher: LearningTask = {
  ...choice(
    "np-write-v1-r-perception",
    "An unfamiliar invisible spray worries people more than a familiar coating they choose. What does this difference establish?",
    "Different perceived risks, not measured harm",
    {
      "The spray must have a greater measured dose":
        "A reaction of concern does not measure the amount reaching someone.",
      "The familiar product must be harmless":
        "Familiarity does not establish exposure or harm.",
    },
    "Voluntary versus imposed, familiar versus unfamiliar, and visible versus invisible exposure can change how risk is perceived. Actual risk needs evidence about the material's hazards and the route and extent of exposure. Feelings of reassurance or concern are not measurements of harm.",
    "Separate how risk feels from measured exposure and harm.",
    "Revisit perceived and measured risk.",
  ),
  title: "Revisit risk perception",
  conciseHeading: true,
  followUp: "np-write-v1-r-perception",
};
const guidedJudgement: LearningTask = {
  ...choice(
    "np-write-v1-g-judgement",
    "A nano treatment saves water. Workers cannot choose possible exposure and no exposure data exist. Which judgement follows?",
    "Consider fairness; investigate exposure before judging risk",
    {
      "Saving water proves everyone is safe":
        "A performance benefit is not an exposure or harm measurement.",
      "Workers' concern proves actual harm":
        "Concern about imposed exposure describes perception, not measured harm.",
    },
    "Saving water is a benefit. Possible burdens on workers raise ethical questions about fairness, information and an informed voice. Imposed or invisible exposure can increase perceived concern. Investigate release, exposure and relevant harm to assess actual risk; a precautionary decision must have reasons rather than assume all nano materials safe or harmful.",
    "Ask who benefits, who bears possible burdens and what was actually measured.",
    "Learn evidence, ethical fairness and risk perception together.",
  ),
  title: "Consider fairness and risk",
  conciseHeading: true,
  followUp: "np-write-v1-r-ethics",
};
export const nanoWritingAdditions = {
  guided,
  refresher,
  practice: [
    areas("p-area", "Calculate two footprints", 28, 18),
    benefits,
    ethics,
  ],
  check: [
    areas("ca-area", "Compare footprint areas", 42, 20),
    evidence,
    coldEthics,
    perception,
  ],
  review: [
    areas("ra-area", "Retrieve footprint areas", 30, 22),
    delayedEvidence,
    delayedPerception,
  ],
};
export function extendNanoWriting(journey: LessonJourney) {
  journey.guided.push(guided, guidedJudgement);
  journey.refresher.push(refresher, ethicalRefresher, perceptionRefresher);
  journey.practice.push(...nanoWritingAdditions.practice);
  journey.checkForms.push(nanoWritingAdditions.check);
  journey.reviewForms.push(nanoWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const q of all) q.conciseHeading = true;
  for (const ids of [
    [
      guided.id,
      refresher.id,
      ...[
        nanoWritingAdditions.practice[0],
        nanoWritingAdditions.check[0],
        nanoWritingAdditions.review[0],
      ].map((q) => q.id),
    ],
    [
      "np-v1-g-evidence",
      "np-v1-r-evidence",
      "np-v1-p-evaluate",
      "np-v1-p-benefit",
      "np-v1-p-risk",
      "np-v1-p-amount",
      "np-v1-ca-risk",
      "np-v1-ra-risk",
      "np-v1-cb-benefit",
      "particles-and-nanoparticles-4",
      benefits.id,
      evidence.id,
      delayedEvidence.id,
    ],
    [
      ethics.id,
      coldEthics.id,
      perception.id,
      delayedPerception.id,
      ethicalRefresher.id,
      perceptionRefresher.id,
      guidedJudgement.id,
    ],
  ])
    for (const q of all.filter((q) => ids.includes(q.id)))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((id) => id !== q.id),
        ]),
      ];
  for (const q of [ethics, coldEthics]) q.followUp = ethicalRefresher.id;
  for (const q of [perception, delayedPerception])
    q.followUp = perceptionRefresher.id;
  journey.practice[8].title = "Construct a ratio";
  journey.practice[8].prompt =
    "Using nm, reduce the numerical surface-area:volume values 150:125 to the smallest whole-number pair.";
  journey.practice[20].title = "Evaluate performance";
  journey.practice[20].prompt =
    "A nano catalyst uses 2 g versus 8 g for equal conversion. Release and exposure were not tested. Evaluate the benefit and safety claim.";
  journey.guided[2].prompt =
    "For the initial 40 nm particle and 0.2 nm atom diameters, which length comparison is valid?";
  journey.guided[2].title = "Compare diameters";
  journey.guided[3].title = "Evaluate a use";
  if (journey.guided[2].model?.kind === "nano-properties")
    journey.guided[2].model.instruction =
      "Convert diameter and compare matching lengths.";
  if (journey.guided[0].model?.kind === "nano-properties")
    journey.guided[0].model.instruction =
      "Predict exposed area and material volume.";
  journey.practiceGroups = [
    {
      label: "Size, surface and scale",
      taskIds: journey.practice.slice(0, 19).map((q) => q.id),
    },
    {
      label: "Construct explanations and evaluate",
      taskIds: journey.practice.slice(19).map((q) => q.id),
    },
  ];
}
