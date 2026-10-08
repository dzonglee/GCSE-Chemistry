import type { LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";
import { extendAtomicModelWriting } from "./atomic-model-writing";
const beam = (
  initial: ["spread" | "central", "far" | "near" | "head-on"],
  targetApproach: "far" | "near" | "head-on",
  instruction: string,
): TaskModel => ({ kind: "scattering", initial, targetApproach, instruction });

export const atomicModelJourney: LessonJourney = {
  version: 1,
  introduction:
    "A model must explain the evidence. Compare predictions with the gold-foil observations, then trace how electrons, a nucleus, energy levels and neutrons changed the model of an atom.",
  outcomes: [
    "Describe the indivisible-sphere, plum-pudding and nuclear models, and explain why new evidence changed them.",
    "Link mostly straight alpha-particle paths to empty space, and rare large deflections to a tiny massive positive nucleus.",
    "Distinguish Bohr's specific electron distances/energy levels from Chadwick's evidence for neutrons, and order electron/proton/neutron discoveries.",
  ],
  scopeNote:
    "The qualitative path illustration is not a force, angle or probability calculation. Experimental details supporting Bohr's model and Chadwick's work are not required by the reviewed AQA scope. Atomic/nuclear scale and standard-form calculations are a separate lesson. Historical shell pictures are teaching schematics, not modern electron trajectories.",
  warmup: [
    c(
      "am-v1-w-repel",
      "An alpha particle is positively charged. What happens when it approaches another positive charge?",
      "The charges repel",
      {
        "They attract": "Unlike charges attract; these two have the same sign.",
        "There is no electrical interaction":
          "Both are charged, so they interact electrically.",
      },
      "Like charges repel. This is needed to explain deflection by a positive nucleus.",
      "Compare the signs of the two charges.",
      "Checks electrostatic reasoning before interpreting scattering.",
    ),
    c(
      "am-v1-w-mass",
      "Which region contains almost all the mass in the modern nuclear model?",
      "The nucleus",
      {
        "The electron shells":
          "Electrons have very small mass compared with the nuclear particles.",
        "Every region contains equal mass":
          "Most mass is concentrated in the nucleus.",
      },
      "The massive nuclear particles are concentrated in the nucleus; electron mass contributes very little.",
      "Use the relative masses from Inside an atom.",
      "Retrieves the nucleus/mass relation before historical evidence.",
    ),
    c(
      "am-v1-w-evidence",
      "What is a scientific reason to change an accepted model?",
      "Reliable new evidence that the model cannot explain",
      {
        "A newer picture always looks better":
          "Appearance is not evidence that a model explains nature.",
        "Scientists must replace every model each year":
          "Changes depend on evidence, not a calendar.",
      },
      "Models are tested against observations and can be revised when reliable evidence challenges their predictions.",
      "Ask whether the model explains the observations.",
      "Establishes evidence-based revision rather than memorised dates.",
    ),
  ],
  refresher: [
    c(
      "am-v1-r-refinements",
      "Which pairing separates the two later contributions?",
      "Bohr: electron levels; Chadwick: neutrons",
      {
        "Bohr: neutrons; Chadwick: electron levels":
          "These contributions have been reversed.",
        "Both discovered the electron":
          "The electron discovery preceded these refinements.",
      },
      "Bohr refined electron distances/energy levels. Chadwick provided evidence for neutral particles in the nucleus.",
      "Separate electron arrangement from nuclear particles.",
      "Repairs confusion between later refinements of the nuclear model.",
    ),
    c(
      "am-v1-r-discoveries",
      "Which particle discovery came before both protons and neutrons?",
      "Electron",
      {
        Neutron: "Neutrons were established after protons and electrons.",
        Proton: "The electron was identified earlier than the proton.",
      },
      "For these three particles, the order is electron, proton, neutron. A nuclear centre was understood before all its particles were identified.",
      "Recall the early discovery that challenged indivisibility.",
      "Repairs particle chronology without requiring experimental dates.",
    ),
    n(
      "am-v1-r-percentage",
      "Illustrative data: 190 of 200 alpha paths are nearly straight. What percentage is nearly straight?",
      95,
      "%",
      "190 ÷ 200 × 100 = 95%. These are teaching values, not quoted historical measurements.",
      "Divide the part by the total and multiply by 100.",
      "Repairs percentage interpretation of a qualitative scattering dataset.",
      { "0.95": "0.95 is the fraction; express it as a percentage." },
    ),
    c(
      "am-v1-r-evidence",
      "An old model predicts no large deflections, but reliable repeated observations include some. What should be reconsidered?",
      "Whether the model explains all the reliable evidence",
      {
        "Whether surprising observations should be erased":
          "Surprise does not justify discarding reliable evidence.",
        "Whether a more colourful picture must be correct":
          "Appearance is not a test of the prediction.",
      },
      "A useful model must account for reliable observations. New evidence can expose a limitation and justify revision.",
      "Compare what was predicted with what was observed.",
      "Repairs evidence-based model revision rather than calendar-based change.",
    ),
    c(
      "am-v1-r-repel",
      "Choose a path close to the positive centre. Why does the positive alpha particle bend away?",
      "Like charges repel",
      {
        "The nucleus attracts positive particles":
          "A positive nucleus repels a positive alpha particle.",
        "The alpha particle becomes a neutron":
          "Scattering does not turn it into a neutron.",
      },
      "Electrostatic repulsion can deflect a close positive alpha particle.",
      "Both charges are positive.",
      "Repairs charge-sign reasoning with a selected path.",
      beam(["central", "far"], "near", "Select a close approach."),
    ),
    {
      ...c(
        "am-v1-r-pudding",
        "Does the model shown contain a tiny nucleus?",
        "No: its positive material is spread through the atom",
        {
          "Yes: every historical model included a nucleus":
            "The nucleus was introduced after scattering evidence challenged this model.",
          "Yes: the embedded electrons are the nucleus":
            "Electrons are negative particles, not a positive nucleus.",
        },
        "The plum-pudding model has embedded negative electrons in positive material; it has no nuclear centre.",
        "Distinguish distributed positive material from a small central region.",
        "Repairs confusion between historical and nuclear features.",
      ),
      atomDiagram: "pudding",
    },
    c(
      "am-v1-r-empty",
      "Most alpha particles passed through with little or no deflection. What does that support?",
      "Most of an atom is empty space",
      {
        "The nucleus fills the whole atom":
          "A large massive centre would cause far more strong interactions.",
        "Atoms contain no charged particles":
          "Charge is needed to explain the particles that were deflected.",
      },
      "A tiny centre leaves most paths through the atom far from it. Mostly straight paths support mostly empty space.",
      "Compare the small centre with the large surrounding region.",
      "Repairs the link from a common observation to structure.",
      beam(["central", "near"], "far", "Select a path far from the centre."),
    ),
  ],
  guided: [
    {
      ...c(
        "am-v1-g-surprise",
        "Very few positive alpha particles turned back. Which model explains this?",
        "A tiny, massive, positively charged centre",
        {
          "Positive material spread evenly through the whole atom":
            "Diffuse material cannot account for these rare large deflections in the old model.",
          "A negatively charged centre":
            "A negative centre would attract a positive alpha particle, not explain this repulsion.",
        },
        "A close approach to a concentrated positive nucleus can produce a large deflection. Its small size makes such approaches rare; most mass is concentrated there.",
        "Keep the head-on approach and compare spread positive material with a tiny central region.",
        "Tests a surprising observation against two model predictions.",
        beam(["spread", "head-on"], "head-on", "Compare the head-on path."),
      ),
      title: "Test the surprise",
      openingHint: true,
    },
    {
      ...c(
        "am-v1-g-empty",
        "Most alpha particles passed nearly straight. What does this suggest about the atom?",
        "Most of the atom is empty space",
        {
          "Every alpha particle must hit the nucleus":
            "That would not explain mostly straight paths.",
          "The atom is a solid ball of nuclear material":
            "That would concentrate material across many more paths.",
        },
        "Most paths pass far from a tiny nucleus. Mostly straight trajectories support mostly empty space; rare close approaches explain large deflections.",
        "Select a path far from the centre, then connect the common observation to the space it crosses.",
        "Links the frequent observation to empty space with faded support.",
        beam(["central", "near"], "far", "Select a path far from the centre."),
      ),
      title: "Explain straight paths",
    },
    {
      ...c(
        "am-v1-g-charge",
        "Positive alpha particles bend away near the centre. What does this imply about its charge?",
        "It is positive, so it repels positive alpha particles",
        {
          "It is negative, so it repels positive particles":
            "Unlike charges attract.",
          "It is neutral, so it repels every charged particle":
            "Neutrality does not explain this positive-positive repulsion.",
        },
        "Like charges repel. Deflection of positive alpha particles away from the centre supports a positively charged nucleus.",
        "Use the signs of both interacting charges.",
        "Separates charge inference from the empty-space and mass conclusions.",
        beam(["central", "far"], "near", "Select a close approach."),
      ),
      title: "Explain repulsion",
    },
  ],
  practice: [
    {
      ...n(
        "am-v1-p-pudding",
        "Describe positive and negative charge in the diagram.",
        0,
        "",
        "The plum-pudding model describes negative electrons embedded in a ball of positive charge, without a tiny nucleus.",
        "Describe the spread positive material and the embedded electrons.",
        "Requires an exam-style description with distinct marking points.",
      ),
      atomDiagram: "pudding",
      answer:
        "Negative electrons are embedded in a ball of positive charge; there is no tiny nucleus.",
      rubric: [
        "A ball or region of positive charge is spread through the atom.",
        "Negative electrons are embedded within that positive material.",
        "Do not describe a nucleus, neutrons or a ball of protons as features of this historical model.",
      ],
    },
    {
      ...c(
        "am-v1-p-electron",
        "Why did the discovery of electrons challenge the earlier indivisible-sphere model?",
        "It showed that atoms contain smaller particles",
        {
          "It proved the neutron had already been discovered":
            "Neutrons were identified much later.",
          "It proved electrons are positively charged":
            "The discovered electrons are negative.",
        },
        "The discovery of a negative subatomic particle showed that an atom could not be an indivisible solid sphere.",
        "Compare a particle inside an atom with the claim that the atom cannot be divided.",
        "Connects an early discovery to the model feature it contradicted.",
      ),
      atomDiagram: "solid",
    },
    {
      ...n(
        "am-v1-p-contrast",
        "Plum pudding vs nuclear: compare charge and electrons.",
        0,
        "",
        "The old model spreads positive charge through the atom with embedded electrons. The nuclear model concentrates positive charge and most mass in a tiny centre, with electrons outside and mostly empty space.",
        "Compare where the positive charge is, where the electrons are, and how much space the centre occupies.",
        "Requires a comparative explanation rather than naming the newer model.",
      ),
      atomDiagram: "nuclear",
      answer:
        "The nuclear model concentrates positive charge and most mass in a tiny nucleus with electrons outside and mostly empty space; the old model has embedded electrons in spread positive material.",
      rubric: [
        "Plum pudding spreads positive material through the atom; the nuclear model concentrates positive charge and most mass in a tiny centre.",
        "Electrons are embedded in the old positive material but outside the nucleus in the nuclear model.",
        "The nuclear model includes mostly empty space; it is not a solid atom-sized ball of nuclear material.",
      ],
    },
    {
      ...c(
        "am-v1-p-bohr",
        "What did Bohr add to the nuclear model?",
        "Electrons occupy specific distances or energy levels",
        {
          "A ball of spread positive material replaced the nucleus":
            "That would return to the earlier model.",
          "The discovery that neutrons exist in the nucleus":
            "Chadwick supplied evidence for neutrons later.",
        },
        "Bohr adapted the nuclear model by placing electrons at particular distances/energy levels; his calculations agreed with observations.",
        "Identify the feature concerning electrons rather than a new nuclear particle.",
        "Distinguishes Bohr's refinement from other discoveries.",
      ),
      atomDiagram: "bohr",
    },
    {
      ...c(
        "am-v1-p-chadwick",
        "Which contribution is associated with James Chadwick?",
        "Evidence for neutral particles called neutrons in the nucleus",
        {
          "The first discovery of the electron":
            "That is associated with Thomson.",
          "Replacing the nucleus with spread positive charge":
            "Chadwick's work added understanding of nuclear particles.",
        },
        "Chadwick's experiments provided evidence for neutrons in the nucleus, about twenty years after the nuclear model was accepted.",
        "Look for the discovery of an uncharged nuclear particle.",
        "Connects a scientist to the specific model change without laboratory-detail recall.",
      ),
      atomDiagram: "neutrons",
    },
    c(
      "am-v1-p-proton",
      "Later evidence showed that nuclear positive charge comes in whole-number units. What name was given to the smaller positive particles?",
      "Protons",
      {
        Electrons: "Electrons are negative and outside the nucleus.",
        Neutrons:
          "Neutrons are neutral, so they do not supply its positive charge.",
      },
      "The nuclear positive charge could be divided into whole numbers of equal positive units. The particles carrying those units were named protons. This followed discovery of the nucleus.",
      "Choose the positively charged nuclear particle.",
      "Connects later evidence about whole units of nuclear charge with the proton, rather than only recalling discovery order.",
    ),
    c(
      "am-v1-p-order",
      "Which sequence gives these particles in order of discovery, earliest first?",
      "Electron → proton → neutron",
      {
        "Neutron → electron → proton":
          "Neutrons were identified after electrons and protons.",
        "Proton → neutron → electron":
          "The electron was identified first of these three.",
      },
      "The electron was discovered before the proton, and the neutron later still. Discovering the nucleus and identifying all its constituent particles were different steps.",
      "Electrons challenged indivisibility; neutrons were identified much later.",
      "Retrieves the particle chronology tested in actual GCSE questions.",
    ),
    c(
      "am-v1-p-revision",
      "Repeated experiments show rare large deflections that the old model cannot explain. Which response best follows scientific reasoning?",
      "Revise the model so it accounts for the reliable observations",
      {
        "Ignore the results because the model was accepted first":
          "Acceptance does not make a model immune to new evidence.",
        "Choose the prettiest diagram without testing it":
          "Appearance does not account for the observations.",
      },
      "Reliable evidence can lead a model to be revised or replaced. The new model should explain the observations that challenged the old one.",
      "A model's value comes from explaining observations and making tested predictions.",
      "Applies evidence-based revision to a changed context.",
    ),
    {
      ...n(
        "am-v1-p-data",
        "Illustrative data: 10 000 paths; 9890 nearly straight, 100 deflected, 10 backward. What percentage is nearly straight?",
        98.9,
        "%",
        "9890 ÷ 10 000 × 100 = 98.9%. This illustrative dataset shows 'most'; it is not a quoted measurement from Rutherford's experiment.",
        "Divide the nearly straight count by the total, then multiply by 100.",
        "Adds original data interpretation while preserving the qualitative evidence boundary.",
        {
          "0.989":
            "That is the fraction; multiply by 100 to give a percentage.",
        },
      ),
      tolerance: 0.00001,
    },
    c(
      "am-v1-p-inference",
      "Why do very few large deflections support a small nucleus rather than a nucleus filling the whole atom?",
      "Very few paths pass close to the concentrated centre",
      {
        "The nucleus must be negatively charged":
          "Charge sign comes from positive-alpha repulsion, not rarity alone.",
        "The alpha particles change into electrons":
          "The scattering interpretation does not require a particle-identity change.",
      },
      "A tiny concentrated centre is close to only a small fraction of paths. This explains rare strong deflections alongside mostly straight passage.",
      "Combine rarity with the concentrated-centre model.",
      "Separates size inference from charge inference without invented probabilities.",
    ),
  ],
  checkForms: [
    [
      {
        ...c(
          "am-v1-ca-picture",
          "Which description matches the historical model in this diagram?",
          "Negative electrons embedded in spread positive material",
          {
            "Protons and neutrons confined to a tiny nucleus":
              "That describes later nuclear features.",
            "A negatively charged nucleus with positive electrons":
              "Those charge signs are incorrect.",
          },
          "The diagram represents spread positive material containing embedded negative electrons.",
          "Describe the distribution rather than assume a modern nucleus.",
          "Reserved cold interpretation of a historical diagram.",
        ),
        atomDiagram: "pudding",
      },
      c(
        "am-v1-ca-electron",
        "Finding a negatively charged particle smaller than an atom challenged which earlier claim?",
        "Atoms cannot be divided into smaller constituents",
        {
          "All nuclear particles are neutrons":
            "That was not the earlier indivisible-sphere claim.",
          "Positive and negative charges attract":
            "The electron discovery did not overturn attraction of opposite charges.",
        },
        "An electron is a subatomic constituent, contradicting the indivisible-sphere claim.",
        "Connect the new particle with the earlier model.",
        "Reserved evidence-to-model contradiction.",
      ),
      c(
        "am-v1-ca-straight",
        "An investigation finds that the great majority of alpha particles cross the foil almost undeflected. Which structural conclusion follows?",
        "The atom is mostly empty space",
        {
          "The nucleus occupies almost all the atomic volume":
            "That would not account for most particles passing far from concentrated material.",
          "The atom has no positive charge":
            "Deflected positive alpha particles still require a charge explanation.",
        },
        "Most paths avoid the small centre, supporting mostly empty space.",
        "Explain the common observation, not only the rare one.",
        "Reserved observation-to-empty-space inference.",
      ),
      c(
        "am-v1-ca-bohr",
        "Which change refined the nuclear model by explaining the arrangement of electrons?",
        "Bohr's proposal of specific electron energy levels",
        {
          "Chadwick's discovery of neutrons":
            "That concerns particles within the nucleus.",
          "Thomson's spread-positive model": "That preceded the nuclear model.",
        },
        "Bohr introduced particular distances/energy levels for electrons.",
        "Choose the refinement about electron arrangement.",
        "Reserved distinction between successive model contributions.",
      ),
    ],
    [
      {
        ...c(
          "am-v1-cb-picture",
          "Which feature distinguishes the model shown from plum pudding?",
          "Positive charge is concentrated in a tiny nucleus, with electrons outside",
          {
            "All positive material is spread through an atom-sized ball":
              "That is the earlier model.",
            "Negative electrons form the nucleus":
              "The central nucleus is positively charged.",
          },
          "The nuclear model has a small positive centre and surrounding electrons.",
          "Compare the locations of charge.",
          "Alternate reserved comparison from an original diagram.",
        ),
        atomDiagram: "nuclear",
      },
      c(
        "am-v1-cb-rare",
        "A very small proportion of positive alpha particles reverse direction near the centre. What combination of features explains this?",
        "A tiny, massive, positively charged nucleus",
        {
          "An atom-sized negative nucleus":
            "Its size and sign do not fit the observations.",
          "A uniform cloud of neutrons throughout the atom":
            "Neutral diffuse material does not explain positive-positive repulsion.",
        },
        "Strong repulsion near a concentrated positive centre accounts for rare large deflections; most mass is concentrated there.",
        "Explain both the strength and rarity of the deflection.",
        "Alternate reserved combined inference from rare scattering.",
      ),
      c(
        "am-v1-cb-chadwick",
        "Which later evidence explained the presence of uncharged particles in the nucleus?",
        "Chadwick's evidence for neutrons",
        {
          "Bohr's electron energy-level calculations":
            "Those concern electron arrangement.",
          "The first discovery of electrons":
            "Electrons are negatively charged and outside the nucleus.",
        },
        "Chadwick supplied evidence for neutral nuclear particles called neutrons.",
        "Match the particle and its nuclear location.",
        "Alternate reserved discovery/contribution identification.",
      ),
      c(
        "am-v1-cb-order",
        "Place these discoveries from earliest to latest.",
        "Electrons, then protons, then neutrons",
        {
          "Protons, then electrons, then neutrons":
            "Electrons were identified first of these three.",
          "Electrons, then neutrons, then protons":
            "Protons were identified before neutrons.",
        },
        "Electron → proton → neutron is the order for these subatomic discoveries.",
        "Neutrons were identified much later than electrons.",
        "Alternate reserved particle chronology.",
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "am-v1-ra-repel",
        "A positive alpha particle bends away from the nuclear centre. Which interaction explains the bend?",
        "Repulsion between positive charges",
        {
          "Attraction between opposite charges":
            "An attracting centre would not explain this positive-positive repulsion.",
          "The electron becoming a neutron": "No identity change is needed.",
        },
        "The alpha particle and nucleus are positive; like charges repel.",
        "Use both charge signs.",
        "Delayed retrieval of the charge inference.",
      ),
      {
        ...c(
          "am-v1-ra-model",
          "Does the model shown include the later nuclear centre?",
          "No: the positive material is distributed and contains electrons",
          {
            "Yes: its ball is a proton-and-neutron nucleus":
              "The old model has no concentrated nuclear centre.",
            "Yes: its negative dots are nuclear particles":
              "Those dots represent electrons.",
          },
          "The diagram is the earlier distributed-positive model, without a nucleus.",
          "Compare distributed positive material with concentrated nuclear material.",
          "Delayed historical model discrimination.",
        ),
        atomDiagram: "pudding",
      },
      c(
        "am-v1-ra-evidence",
        "Why can an accepted scientific model be replaced?",
        "Reliable new observations may disagree with its predictions",
        {
          "Every model becomes false on its anniversary":
            "A calendar is not contradictory evidence.",
          "A diagram with more colours is always more accurate":
            "More colours do not test a prediction.",
        },
        "Models can change when reliable evidence shows limitations in their predictions.",
        "Connect observations with predictions.",
        "Delayed evidence-based revision reasoning.",
      ),
    ],
    [
      c(
        "am-v1-rb-bohr",
        "Which proposal concerns specific distances of electrons from the nucleus?",
        "Bohr's electron-level model",
        {
          "Chadwick's neutron discovery": "That adds nuclear particles.",
          "The indivisible-sphere model":
            "That contains no electron arrangement.",
        },
        "Bohr's refinement concerns electron distances/energy levels.",
        "Identify the contribution concerning electrons.",
        "Alternate delayed model contribution.",
      ),
      {
        ...c(
          "am-v1-rb-neutrons",
          "Which added particles are neutral and located in the nucleus?",
          "Neutrons",
          {
            Electrons: "Electrons are negative and outside the nucleus.",
            Protons: "Protons are positive, not neutral.",
          },
          "Neutrons are uncharged nuclear particles whose existence was established by Chadwick's work.",
          "Use both location and charge.",
          "Alternate delayed neutron/model relationship.",
        ),
        atomDiagram: "neutrons",
      },
      c(
        "am-v1-rb-earliest",
        "Which of electron, proton and neutron was discovered first?",
        "Electron",
        {
          Proton: "The electron was identified earlier.",
          Neutron: "The neutron was identified much later.",
        },
        "The electron was discovered first of these three.",
        "Recall which discovery challenged indivisible atoms.",
        "Alternate delayed particle chronology.",
      ),
    ],
  ],
};
for (const task of [
  ...atomicModelJourney.guided,
  ...atomicModelJourney.practice,
]) {
  task.followUp =
    task.id.includes("bohr") || task.id.includes("chadwick")
      ? "am-v1-r-refinements"
      : task.id.includes("order")
        ? "am-v1-r-discoveries"
        : task.id.includes("data")
          ? "am-v1-r-percentage"
          : task.id.includes("revision")
            ? "am-v1-r-evidence"
            : task.id.includes("pudding") ||
                task.id.includes("contrast") ||
                task.id.includes("electron")
              ? "am-v1-r-pudding"
              : task.id.includes("charge")
                ? "am-v1-r-repel"
                : "am-v1-r-empty";
}

extendAtomicModelWriting(atomicModelJourney);

const shortTitles: Record<string, string> = {
  "am-v1-r-percentage": "Read a percentage",
  "am-v1-r-repel": "Explain the bend",
  "am-v1-r-pudding": "Look for a nucleus",
  "am-v1-r-empty": "Explain straight paths",
  "am-v1-p-pudding": "Describe plum pudding",
  "am-v1-p-electron": "Explain the first revision",
  "am-v1-p-contrast": "Compare the models",
  "am-v1-p-bohr": "Identify Bohr’s change",
  "am-v1-p-chadwick": "Identify Chadwick’s evidence",
  "am-v1-p-data": "Read the common paths",
};
for (const task of [
  ...atomicModelJourney.refresher,
  ...atomicModelJourney.practice,
]) {
  if (shortTitles[task.id]) task.title = shortTitles[task.id];
}
