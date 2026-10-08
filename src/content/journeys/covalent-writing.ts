import type { LearningTask, LessonJourney } from "../types";
import { covalentMolecules, type CovalentMolecule } from "@/lib/covalent";
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: "cb-write-v1-" + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained explanation with the criteria. Full writing receives manual self-review, without an automatic examiner mark.",
    hint: "Separate a shared pair's attraction, the count-once electron inventory and what the representation omits.",
    purpose:
      "Construct a covalent force account and explain the limits of electron and bond representations.",
  };
}
const practiceForce = written(
  "p-force",
  "Explain a shared bond",
  "Explain how sharing holds the two atoms in H₂ together. Is the connector a literal rod?",
  "Each H contributes one electron to a shared pair. The negative shared electrons are attracted to both positive nuclei; this electrostatic attraction holds the atoms together in a strong covalent bond. A line or stick represents that bond, not a literal rod. Sharing conserves the two-electron total.",
  [
    "Identify one shared pair with one original electron from each H.",
    "Explain attraction of negative shared electrons to both positive nuclei and the strong covalent bond.",
    "Keep the two-electron total and treat a line/stick as a representation, not a rod.",
  ],
  "cb-v1-r-strong",
);
const force = written(
  "ca-force",
  "Explain the bond force",
  "Explain what holds the atoms together in HCl. Refer to the shared electrons and the nuclei.",
  "One electron from H and one from Cl form a shared pair. These negative electrons are electrostatically attracted to the positive nuclei of both atoms, holding them together in a strong covalent bond. The pair is shared, not transferred entirely to chlorine as in an ionic account. Dots and crosses identify origins, not different kinds of electron.",
  [
    "Identify a shared pair, contributed by the two atoms.",
    "Explain negative shared electrons attracted to both positive nuclei, holding the atoms together.",
    "Keep covalent sharing distinct from ionic transfer and marker origins distinct from electron species.",
  ],
  "cb-v1-r-strong",
);
const limits = written(
  "ca-limits",
  "Compare model limits",
  "Compare one useful feature and one limitation of dot-and-cross and ball-and-stick molecular models.",
  "Dot-and-cross can show shared pairs, lone pairs and consistent origins, but does not give measured three-dimensional shapes or electron paths. Ball-and-stick can illustrate which atoms are bonded and their spatial arrangement, but sticks are not literal rods and drawn colours, sizes and distances need not be to scale; it omits the complete electron distribution. Neither model makes all covalent substances separate small molecules.",
  [
    "Give a useful electron/pair/origin feature and a valid spatial/path limitation of dot-and-cross.",
    "Give a useful connectivity/spatial feature of ball-and-stick and a distinct valid limit such as omitted electrons or illustrative sizes/sticks.",
    "Distinguish representation from the actual molecule; do not generalise all covalent structures to small molecules.",
  ],
  "cb-v1-r-extent",
);
const inventory = written(
  "ra-inventory",
  "Explain shared counting",
  "Each O in O₂ counts eight outer electrons around it. Explain why the molecule has twelve outer electrons, not sixteen.",
  "Each oxygen starts with six outer electrons, giving twelve distinct electrons. Each contributes two to two shared pairs (four shared electrons) and retains four unshared electrons. Each O counts its four unshared electrons plus all four shared electrons around it. Adding both eight-around counts counts the same four shared electrons twice; it does not create four more electrons.",
  [
    "Use the original six plus six inventory to give twelve distinct electrons.",
    "Account for two shared pairs and four unshared electrons on each O.",
    "Explain that both eight-around counts include the same four shared electrons, which must be counted once in the molecule.",
  ],
  "cb-v1-r-inventory",
);
const markers = written(
  "ra-markers",
  "Correct the model claims",
  "Lee calls crosses a different electron species and says a flat drawing proves the molecule is flat. Correct both claims.",
  "Dots and crosses distinguish consistent electron origins; all electrons have the same negative charge and are the same kind of particle. The flat dot-and-cross drawing shows bonding and outer-electron bookkeeping, not a measured three-dimensional molecular shape or electron paths. A line represents one shared pair, while a stick is not a literal rod.",
  [
    "Explain marker origins and the same negative electron species.",
    "Explain that a flat drawing does not prove a flat molecular shape or measured electron paths.",
    "Correct the literal connector interpretation: one line represents a shared pair, not a rod or one electron.",
  ],
  "cb-v1-r-origins",
);
function lineDrawing(
  id: string,
  molecule: CovalentMolecule,
  title: string,
): LearningTask {
  const spec = covalentMolecules[molecule];
  const parts = spec.partners.map((atom, i) => ({
    id: `bond${i}`,
    label: `Lines ${spec.centre.symbol}–${atom.symbol} ${i + 1}`,
    answer: spec.orders[i],
  }));
  return {
    id: "cb-write-v1-" + id,
    title,
    conciseHeading: true,
    prompt: `Represent ${molecule} with bond lines from ${spec.centre.symbol} to each ${spec.partners[0].symbol}. Enter the number of lines per connection.`,
    molecularLineDrawing: { molecule },
    parts,
    answer: JSON.stringify(
      Object.fromEntries(parts.map((p) => [p.id, String(p.answer)])),
    ),
    tolerance: 0,
    explanation:
      "Each line represents one shared pair. Your proposed line counts remain visible; this schematic does not show lone pairs or measured atom sizes.",
    hint: "A single, double or triple covalent bond uses one, two or three lines respectively.",
    purpose:
      "Construct bond-line representations, rather than only selecting a supplied picture.",
    followUp: "cb-v1-r-pairs",
  };
}
export const covalentWritingAdditions: {
  practice: LearningTask[];
  check: LearningTask[];
  review: LearningTask[];
} = {
  practice: [
    practiceForce,
    lineDrawing("p-lines", "NH3", "Represent ammonia with lines"),
  ],
  check: [
    force,
    limits,
    lineDrawing("ca-lines", "CH4", "Construct methane’s bond lines"),
  ],
  review: [
    inventory,
    markers,
    lineDrawing("ra-lines", "H2O", "Retrieve water’s bond lines"),
  ],
};
export function extendCovalentWriting(
  journey: LessonJourney,
  construct: (
    id: string,
    molecule: CovalentMolecule,
    title: string,
    prompt: string,
  ) => LearningTask,
) {
  covalentWritingAdditions.check.unshift(
    construct(
      "write-ca-ammonia",
      "NH3",
      "Construct ammonia",
      "Draw NH₃ with N as reference: N has five outer electrons; each H has one.",
    ),
    construct(
      "write-ca-methane",
      "CH4",
      "Construct methane",
      "Draw CH₄ with C as reference: C has four outer electrons; each H has one.",
    ),
  );
  covalentWritingAdditions.review.unshift(
    construct(
      "write-ra-hydrogen",
      "H2",
      "Retrieve hydrogen",
      "Draw H₂. Each H has one original outer electron.",
    ),
    construct(
      "write-ra-nitrogen",
      "N2",
      "Retrieve nitrogen",
      "Draw N₂. Each N starts with five outer electrons; include unshared electrons.",
    ),
  );
  journey.practice.push(...covalentWritingAdditions.practice);
  journey.checkForms.push(covalentWritingAdditions.check);
  journey.reviewForms.push(covalentWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  const groups = [
    ["cb-v1-r-strong", "cb-v1-ca-strong", practiceForce.id, force.id],
    ["cb-v1-r-extent", "cb-v1-ra-extent", limits.id],
    ["cb-v1-r-origins", markers.id],
    ["cb-v1-r-inventory", "cb-v1-p-explain", inventory.id],
    ...["NH3", "CH4", "H2", "N2"].map((m) =>
      all.filter((q) => q.drawCovalent?.molecule === m).map((q) => q.id),
    ),
    ...["NH3", "CH4", "H2O"].map((m) =>
      all
        .filter((q) => q.molecularLineDrawing?.molecule === m)
        .map((q) => q.id),
    ),
  ];
  for (const ids of groups)
    for (const id of ids) {
      const q = all.find((q) => q.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  for (const q of all) {
    q.conciseHeading = true;
    if (q.model?.kind === "covalent-share")
      q.model.instruction = "Share outer electrons from both atoms.";
  }
  const drawings: Record<string, [string, string]> = {
    H2: ["Draw hydrogen", "Draw H₂. Each H has one original outer electron."],
    Cl2: [
      "Draw chlorine",
      "Draw Cl₂. Each Cl has seven outer electrons; include unshared electrons.",
    ],
    HCl: [
      "Draw hydrogen chloride",
      "Draw HCl. Reference Cl: seven outer electrons; H: one.",
    ],
    O2: [
      "Draw oxygen",
      "Draw O₂. Each O has six outer electrons; include unshared electrons.",
    ],
    N2: [
      "Draw nitrogen",
      "Draw N₂. Each N has five outer electrons; include unshared electrons.",
    ],
    H2O: [
      "Draw water",
      "Draw H₂O. Reference O: six outer electrons; each H: one.",
    ],
    NH3: [
      "Draw ammonia",
      "Draw NH₃. Reference N: five outer electrons; each H: one.",
    ],
    CH4: [
      "Draw methane",
      "Draw CH₄. Reference C: four outer electrons; each H: one.",
    ],
    CO2: [
      "Draw carbon dioxide",
      "Draw CO₂. Reference C: four outer electrons; each O: six.",
    ],
  };
  for (const q of journey.practice.slice(0, 9))
    [q.title, q.prompt] = drawings[q.drawCovalent!.molecule];
  const hcl = journey.checkForms[0][0];
  hcl.title = "Construct HCl";
  hcl.prompt = drawings.HCl[1];
  const water = journey.checkForms[1][0];
  water.title = "Construct water";
  water.prompt = drawings.H2O[1];
  journey.reviewForms[0][0].title = "Retrieve oxygen";
  journey.reviewForms[1][0].title = "Retrieve chlorine";
  journey.practiceGroups = [
    {
      label: "Construct molecules",
      taskIds: journey.practice.slice(0, 9).map((q) => q.id),
    },
    {
      label: "Diagnose counts and interpret models",
      taskIds: journey.practice.slice(9, 15).map((q) => q.id),
    },
    {
      label: "Explain force and construct lines",
      taskIds: journey.practice.slice(15).map((q) => q.id),
    },
  ];
}
