import type { LearningTask, LessonJourney, Tier } from "../types";
const prefix = "st-write-v1-";
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
      "Compare your retained explanation with the criteria. Written reasoning receives manual self-review, without an automatic examiner mark.",
    hint: "Separate particle identity, arrangement and movement. Link the energy transfer to the relevant attractions.",
    purpose:
      "Construct a particle and energy account of physical changes, keeping model limitations and bulk properties distinct.",
  };
}
const melt = written(
  "ca-melt",
  "Explain melting",
  "Explain how particles change when a crystalline solid melts. Include energy and particle identity.",
  "Energy transfers to the substance, allowing particles to overcome enough of the attractions holding them in fixed positions. They remain close but can move past one another in a less ordered arrangement. Particle chemical identities remain unchanged: melting is physical, not atoms growing or becoming a new substance.",
  [
    "Describe energy transfer into the substance and overcoming attractions holding particles in fixed positions.",
    "Contrast fixed-position vibration with close particles moving past one another in the liquid.",
    "Keep particle chemical identity unchanged; do not claim particles grow, disappear or react.",
  ],
  "st-v1-r-energy",
);
const forces = written(
  "ca-forces",
  "Compare boiling points",
  "Two molecular liquids have comparable molecule sizes. A has stronger intermolecular attractions than B. Explain why A boils at a higher temperature.",
  "Boiling separates molecules. Stronger intermolecular attractions in A require more energy to overcome, so A has a higher boiling point. The covalent bonds within each molecule are not broken by this physical change; molecule identities remain unchanged.",
  [
    "Identify attractions between molecules, not covalent bonds within them.",
    "Link stronger attractions to more energy needed to separate molecules.",
    "Connect that energy demand to the higher boiling point and retain molecule identity.",
  ],
  "st-v1-r-energy",
);
const bulk = written(
  "ca-bulk",
  "Correct the particle claim",
  "Sam says a gas forms because each particle expands and becomes a tiny gas. Correct this account.",
  "Gas describes the bulk collection, not the state of each individual atom or molecule. The particles remain the same size and chemical identity; they become widely separated and move rapidly in random directions, filling the available space. Greater spacing, not swelling of particles, explains the increased sample volume.",
  [
    "Distinguish a bulk gas from individual particles; do not assign a tiny gas state to each particle.",
    "Keep individual size and chemical identity unchanged.",
    "Explain widely spaced random movement through available space and increased separation.",
  ],
  "st-v1-r-spacing",
);
const freeze = written(
  "ra-freeze",
  "Explain freezing",
  "A pure liquid freezes at fixed pressure. Explain energy transfer and changes in particle movement and arrangement.",
  "Energy transfers from the substance to its surroundings. Attractions hold the particles in fixed positions in the solid; particles still vibrate, rather than becoming motionless. They remain close and their chemical identities are unchanged. A crystalline solid has a regular arrangement, although not all solids are crystalline.",
  [
    "Describe energy leaving the substance for its surroundings.",
    "Link attractions to fixed-position vibration, rather than no motion.",
    "Keep particles close and identities unchanged; a regular arrangement applies to the crystalline model.",
  ],
  "st-v1-r-solid",
);
const condense = written(
  "ra-condense",
  "Explain condensation",
  "Explain what happens to a gas’s particles and energy when it condenses. Does this create new molecules?",
  "Energy transfers from the gas to its surroundings. Attractions bring particles much closer together in the liquid, where they can still move past one another. Their chemical identity is unchanged, so condensation does not create new molecules. Gas and liquid describe arrangements of the bulk sample, not different-sized individual particles.",
  [
    "Describe energy transfer out to the surroundings.",
    "Describe closer particles that remain mobile in the liquid, with attractions relevant to bringing them together.",
    "Keep chemical identity unchanged: this is physical, not production of new molecules.",
  ],
  "st-v1-r-spacing",
);
const boundary = written(
  "ra-boundary",
  "Justify a boundary prediction",
  "X melts at −20 °C and boils at 60 °C at fixed pressure. Explain its state at −10 °C and what can coexist at exactly −20 °C.",
  "At −10 °C X is above its melting point but below its boiling point, so it is liquid. At exactly −20 °C solid and liquid can coexist during melting/freezing; that boundary temperature alone does not specify how much of each phase is present. Particles are not themselves tiny solids or liquids.",
  [
    "Use both signed comparisons: −20 < −10 < 60, so X is liquid.",
    "Recognise solid/liquid coexistence at the melting boundary during a transition.",
    "Do not infer phase proportions from temperature alone or assign bulk states to individual particles.",
  ],
  "st-v1-r-data",
);
const limits = written(
  "p-higher-limits",
  "Higher: evaluate the model",
  "Higher extension: explain why identical solid spheres with no forces cannot explain different melting points.",
  "The representation omits the attractions whose strengths determine the energy needed for a state change. Identical solid inelastic spheres do not represent the different atom, ion and molecule structures or their bonding. The model can illustrate arrangement and motion, but it cannot by itself explain different melting points; omitted forces still exist in real substances.",
  [
    "Explain that omitted attractions prevent a force-strength/energy account.",
    "Explain why identical solid inelastic spheres do not capture varied particles and bonding.",
    "Distinguish a useful arrangement model from a complete explanation; omission does not prove real forces are absent.",
  ],
  "st-v1-r-energy",
);
const higherCheck = written(
  "ca-higher",
  "Higher: explain a model limit",
  "Higher: a sphere model shows melting but no forces. Explain two limits that stop it predicting a material’s melting point.",
  limits.answer,
  limits.rubric!,
  "st-v1-r-energy",
);
const higherReview = written(
  "ra-higher",
  "Higher: retrieve model limits",
  "Higher: Lee treats particles as literal solid inelastic balls and says omitted forces do not exist. Explain why both claims fail.",
  "Solid inelastic balls are an illustrative representation, not literal particle structure: real particles may be atoms, ions or molecules with different bonding. Forces omitted from a drawing still act in the real material. Their type and strength determine the energy needed for changes of state, so the no-force ball model cannot explain differing melting/boiling points by itself.",
  [
    "Explain the solid inelastic sphere assumption as a representation, not literal structure or bulk solid particles.",
    "State that omitted forces still exist in the real substance.",
    "Connect actual attraction type/strength to state-change energy and temperature, which the no-force model cannot predict.",
  ],
  "st-v1-r-energy",
);
for (const q of [limits, higherCheck, higherReview]) q.tier = "higher";
export const statesWritingAdditions = {
  practice: [limits],
  check: [melt, forces, bulk, higherCheck],
  review: [freeze, condense, boundary, higherReview],
};
export function extendStatesWriting(journey: LessonJourney) {
  journey.guided[2].prompt =
    "X melts at −20 °C and boils at 60 °C (fixed pressure). Predict its state at −40 °C.";
  journey.guided[3].prompt =
    "On melting, where does energy go? Does particle identity change?";
  journey.practice.push(limits);
  journey.checkForms.push(statesWritingAdditions.check);
  journey.reviewForms.push(statesWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  const concepts = [
    ["st-v1-p-explain", "st-v1-r-energy", melt.id, forces.id, freeze.id],
    ["st-v1-p-compare", "st-v1-r-spacing", bulk.id, condense.id],
    ["st-v1-p-higher-limits", limits.id, higherCheck.id, higherReview.id],
    ["st-v1-r-data", boundary.id],
  ];
  for (const ids of concepts)
    for (const id of ids) {
      const q = all.find((q) => q.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  for (const q of all) q.conciseHeading = true;
  journey.practiceGroups = [
    {
      label: "Particles and signed state predictions",
      taskIds: journey.practice.slice(0, 10).map((q) => q.id),
    },
    {
      label: "Physical changes, energy and symbols",
      taskIds: journey.practice.slice(10, 18).map((q) => q.id),
    },
    {
      label: "Explain bulk behaviour",
      taskIds: journey.practice.slice(19, 21).map((q) => q.id),
    },
    {
      label: "Higher: model limitations",
      taskIds: [journey.practice[18].id, limits.id],
    },
  ];
}
/** Preserve every original learning position; only new reserved Higher writing is tier-filtered. */
export function statesForTier(
  journey: LessonJourney,
  tier: Tier,
): LessonJourney {
  if (tier === "higher") return journey;
  const keep = (qs: LearningTask[]) => qs.filter((q) => q.tier !== "higher");
  return {
    ...journey,
    checkForms: journey.checkForms.map(keep),
    reviewForms: journey.reviewForms.map(keep),
  };
}
