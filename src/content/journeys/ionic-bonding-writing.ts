import type { LearningTask, LessonJourney } from "../types";
const prefix = "ib-write-v1-";
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained explanation with these criteria. Full written reasoning receives manual self-review, without an automatic examiner mark.",
    hint: "Name the donor and recipient, count the transferred electrons, then distinguish the ions from the force between them.",
    purpose:
      "Construct the transfer and electrostatic explanation rather than recognise a complete account.",
  };
}
const sodium = written(
  "p-sodium",
  "Explain sodium chloride",
  "Na is 2,8,1 and Cl is 2,8,7. Explain ion formation and the ionic bond.",
  "Sodium loses one outer electron, which chlorine gains. Na+ (2,8) and Cl− (2,8,8) form; both have full outer shells. Strong electrostatic attraction between these oppositely charged ions is the ionic bond. Electron transfer forms the ions; their nuclei are unchanged.",
  [
    "Sodium loses one outer electron; chlorine gains that same electron.",
    "Give Na+ and Cl− with full outer shells (2,8 and 2,8,8).",
    "Identify strong electrostatic attraction between opposite charges as the bond, rather than the transfer alone.",
    "Keep proton numbers unchanged; do not describe shared electrons.",
  ],
  "ib-v1-r-sign",
);
const distribution = written(
  "p-distribution",
  "Diagnose the two transfers",
  "A Mg atom gives both outer electrons to one of two Cl atoms. Explain why conservation alone does not establish MgCl₂ formation.",
  "Magnesium loses two electrons overall, but each chlorine atom must gain one. Sending both to one leaves outer counts nine and seven, rather than two eight-electron chloride outer shells. The intended ions are one Mg2+ and two Cl−, whose charges balance. Conservation of the total does not establish the correct recipient distribution.",
  [
    "Magnesium must lose two outer electrons, one to each chlorine atom.",
    "Identify the incorrect nine/seven outer counts versus eight/eight in the two chloride ions.",
    "Use one Mg2+ and two Cl− to explain charge balance; do not claim conservation guarantees the correct ions.",
  ],
  "ib-v1-r-ratio",
);
const magnesium = written(
  "ca-magnesium",
  "Describe magnesium oxide",
  "Mg is 2,8,2 and O is 2,6. Describe the electron changes and resulting ions.",
  "The magnesium atom loses two outer electrons and the oxygen atom gains those same two electrons. Mg2+ and O2− form, both with arrangement 2,8 and a full outer shell. The proton numbers stay unchanged; the transferred particles are electrons, not protons.",
  [
    "Magnesium loses outer electrons.",
    "Oxygen gains those electrons.",
    "State that two electrons transfer.",
    "Identify Mg2+ and O2−, or the corresponding opposite signs/full outer shells; do not move protons.",
  ],
  "ib-v1-r-sign",
);
const calcium = written(
  "ca-calcium",
  "Explain calcium fluoride",
  "Explain electron transfer and the ion ratio when Ca (2,8,8,2) reacts with F (2,7).",
  "One calcium atom loses two outer electrons. Each of two fluorine atoms gains one electron, producing one Ca2+ (2,8,8) and two F− (2,8) ions. Their charges sum to zero, so the simplest ratio is 1:2 and the formula CaF2. Their nuclei do not change.",
  [
    "Calcium loses two outer electrons to form Ca2+.",
    "Each of two fluorine atoms gains one electron to form F−.",
    "Connect the full outer shells and charge balance (+2−1−1=0) to the 1:2 ratio/CaF2.",
    "Do not transfer nuclei or treat CaF2 as a separate molecule.",
  ],
  "ib-v1-r-ratio",
);
const force = written(
  "ca-force",
  "Explain the bond",
  "Lee says ‘an ionic bond is a shared electron pair’. Correct the claim using sodium chloride.",
  "A shared electron pair describes a covalent bond. For sodium chloride, an electron transfers from sodium to chlorine, forming Na+ and Cl−. Strong electrostatic attraction between oppositely charged ions is ionic bonding. The transfer and the resulting attractive force are distinct.",
  [
    "Reject a shared pair as the description of ionic bonding.",
    "Use electron transfer to form Na+ and Cl−.",
    "State strong electrostatic attraction between opposite ion charges; distinguish the force from transfer.",
  ],
  "ib-v1-r-bond",
);
const oxide = written(
  "ra-oxide",
  "Explain sodium oxide",
  "Explain why forming Na₂O needs two Na atoms for each O atom. Refer to electrons and charges.",
  "Each sodium atom loses its one outer electron, so two sodium atoms supply the two electrons one oxygen atom needs. Two Na+ ions and one O2− ion form with full outer shells. Their total charge is +1+1−2=0; the simplest sodium:oxygen ratio is 2:1, not a separate molecule.",
  [
    "Each sodium loses one outer electron; oxygen gains two in total.",
    "Explain why two separate sodium donors are needed for one oxygen recipient.",
    "Use two Na+ and one O2− with full outer shells and balanced total charge to justify the 2:1 ratio.",
  ],
  "ib-v1-r-ratio",
);
const markers = written(
  "ra-markers",
  "Explain the diagram markers",
  "For Cl⁻ formed from Na and Cl, explain the outer dots/crosses, brackets and charge label.",
  "The chloride ion has seven original chlorine outer electrons and one transferred sodium electron: seven dots and one cross under the given convention. All eight markers are the same kind of particle; they distinguish origins. Square brackets and a − charge identify the ion, which has one more electron than protons. No shared electron pair is implied.",
  [
    "Use seven original chlorine electrons and one transferred sodium electron with a consistent dot/cross convention.",
    "Explain that dots/crosses track origins, not different electron types.",
    "Explain brackets and negative charge for the chloride ion; eight markers alone do not show every required detail.",
  ],
  "ib-v1-r-origin",
);
const identity = written(
  "ra-identity",
  "Distinguish formation and bonding",
  "Mg²⁺ and O²⁻ both have 2,8. Explain their different identities and the force between them.",
  "Magnesium has twelve protons and oxygen has eight, so matching electron arrangements do not make them the same element. Magnesium loses two electrons to form Mg2+; oxygen gains two to form O2−. The nuclei remain unchanged. Strong electrostatic attraction between these opposite charges holds the ions together; matching electron counts alone do not describe the bond.",
  [
    "Use different proton counts (12 and 8) to preserve different element identities despite equal electron arrangements.",
    "Connect loss/gain of two electrons to Mg2+/O2− without changing nuclei.",
    "Explain strong electrostatic attraction between opposite ion charges as ionic bonding.",
  ],
  "ib-v1-r-core",
);
export const ionicBondingWritingAdditions = {
  practice: [sodium, distribution],
  check: [magnesium, calcium, force],
  review: [oxide, markers, identity],
};
export function extendIonicBondingWriting(journey: LessonJourney) {
  journey.practice.push(...ionicBondingWritingAdditions.practice);
  journey.checkForms.push(ionicBondingWritingAdditions.check);
  journey.reviewForms.push(ionicBondingWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const ids of [
    ["ib-v1-g-nacl", "ib-v1-p-direction", "ib-v1-ca-transfer", sodium.id],
    ["ib-v1-g-mgo", "ib-v1-p-explain", "ib-v1-cb-transfer", magnesium.id],
    ["ib-v1-g-mgcl", "ib-v1-p-distribution", "ib-v1-ca-ratio", distribution.id],
    ["ib-v1-p-formula", calcium.id],
    ["ib-v1-r-bond", "ib-v1-ca-force", "ib-v1-ra-bond", force.id],
    ["ib-v1-g-na2o", "ib-v1-p-group", "ib-v1-cb-ratio", oxide.id],
    [
      "ib-v1-p-origin",
      "ib-v1-p-draw-chloride",
      "ib-v1-ca-draw",
      "ib-v1-ra-marker",
      markers.id,
    ],
    ["ib-v1-p-neon", "ib-v1-cb-identity", identity.id],
  ])
    for (const id of ids) {
      const q = all.find((t) => t.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  for (const q of all) if (q.ionDotCross) q.compactIonDiagram = true;
  const chlorideModel = journey.guided[1];
  chlorideModel.title = "Distribute two electrons";
  chlorideModel.prompt =
    "Mg has two outer electrons; each Cl needs one. Which formula follows?";
  if (chlorideModel.model?.kind === "ionic-transfer")
    chlorideModel.model.instruction = "Give one electron to each Cl atom.";
  for (const [id, title] of [
    ["ib-v1-ca-diagram", "Complete the oxide diagram"],
    ["ib-v1-cb-diagram", "Correct the chloride origins"],
    ["ib-v1-ca-draw", "Draw a chloride ion"],
    ["ib-v1-cb-draw", "Draw an oxide ion"],
  ]) {
    const q = all.find((t) => t.id === id)!;
    q.title = title;
    q.conciseHeading = true;
  }
  all.find((t) => t.id === "ib-v1-ca-diagram")!.prompt =
    "This O²⁻ proposal has six original dots and one transferred cross. How many additional crosses are needed?";
  all.find((t) => t.id === "ib-v1-cb-draw")!.prompt =
    "Two Na atoms each transfer one electron to O. Draw O²⁻ with origins, charge and brackets.";
  const titles = [
    "Recognise electron loss",
    "Count oxygen’s gain",
    "Set the transfer direction",
    "Predict group charges",
    "Interpret dots and crosses",
    "Name the ionic force",
    "Balance total charge",
    "Keep the nuclei fixed",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = titles[i]),
  );
  const oldWritten = journey.practice[13];
  oldWritten.title = "Explain magnesium oxide";
  oldWritten.prompt =
    "Explain Mg-to-O electron transfer and the force between the resulting ions.";
  journey.practiceGroups = [
    {
      label: "Transfers and explanations",
      taskIds: [0, 1, 2, 10, 13, 14, 15].map((i) => journey.practice[i].id),
    },
    {
      label: "Drawings, ratios and names",
      taskIds: [3, 4, 5, 6, 7, 8, 9, 11, 12].map((i) => journey.practice[i].id),
    },
  ];
  journey.outcomes?.push(
    "Construct independent and delayed electron-transfer, ion-ratio and electrostatic explanations.",
  );
}
