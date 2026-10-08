/** Private individual lesson draft. Geometry and particle counts are schematic, not a kinetic-rate simulation. */
export type CollisionMode =
  "conditions" | "solution" | "gas" | "surface" | "comparison" | "evidence";
export type CollisionBoard = {
  kind: "collision-theory";
  mode: CollisionMode;
  record: string;
  answer: string;
  energy: number;
  orientation: "suitable" | "unsuitable";
  contact: boolean;
  partner: "reactant" | "inert";
  particles: number;
  volume: number;
  inert: number;
  divisions: 1 | 2 | 4;
  separated: boolean;
};
export const collisionInitial = (
  mode: CollisionMode = "solution",
  record = "initial",
): CollisionBoard => ({
  kind: "collision-theory",
  mode,
  record,
  answer: "",
  energy: 20,
  orientation: "suitable",
  contact: true,
  partner: "reactant",
  particles: 12,
  volume: 2,
  inert: 0,
  divisions: 1,
  separated: false,
});
export const surfaceGeometry = (
  divisions: 1 | 2 | 4,
  separated: boolean,
  edge = 4,
) => {
  const side = edge / divisions;
  const pieces = divisions ** 3;
  const materialVolume = pieces * side ** 3;
  // Internal touching interfaces inaccessible. Separation assumes every face fully wetted.
  const accessibleArea = separated ? pieces * 6 * side ** 2 : 6 * edge ** 2;
  return {
    side,
    pieces,
    materialVolume,
    accessibleArea,
    areaVolumeRatio: accessibleArea / materialVolume,
  };
};
export const reactingDensity = (particles: number, volume: number) =>
  particles / volume;
export type Encounter = {
  contact: boolean;
  reactingPartner: boolean;
  energy: number;
  activation: number;
  molecular: boolean;
  suitableOrientation: boolean;
};
export const successfulEncounter = (e: Encounter) =>
  e.contact &&
  e.reactingPartner &&
  e.energy >= e.activation &&
  (!e.molecular || e.suitableOrientation);
export const encounterExplanation = (e: Encounter) => {
  if (!e.contact)
    return "The reacting particles must collide; having enough energy without contact does not produce this reaction.";
  if (!e.reactingPartner)
    return "A collision with an inert particle is not a collision between the reacting partners for this reaction.";
  if (e.energy < e.activation)
    return "The collision energy is below the activation energy. Activation energy is the minimum required for this reaction.";
  if (e.molecular && !e.suitableOrientation)
    return "In this stated molecular example the reacting sites do not meet. Enough energy alone is insufficient.";
  return "For this stated encounter the reacting partners collide with sufficient energy and, where specified, suitable molecular orientation. This simplified decision does not predict a measured reaction rate.";
};
export const conditions = {
  initial: {
    label:
      "Reacting particles collide with energy 20 units; the stated minimum is 30 units.",
    activation: 30,
    molecular: false,
    contact: true,
    partner: "reactant",
    energy: 20,
    orientation: "suitable",
  },
  threshold: {
    label:
      "Reacting particles collide exactly at the stated minimum energy 30 units.",
    activation: 30,
    molecular: false,
    contact: true,
    partner: "reactant",
    energy: 30,
    orientation: "suitable",
  },
  noContact: {
    label: "The particles have 40 units of energy but do not meet.",
    activation: 30,
    molecular: false,
    contact: false,
    partner: "reactant",
    energy: 40,
    orientation: "suitable",
  },
  inert: {
    label: "A reactant encounters an inert particle with 40 units of energy.",
    activation: 30,
    molecular: false,
    contact: true,
    partner: "inert",
    energy: 40,
    orientation: "suitable",
  },
  molecular: {
    label:
      "For this stated molecular reaction the reactive ends must meet. Energy 40 units, minimum 30; the current orientation is unsuitable.",
    activation: 30,
    molecular: true,
    contact: true,
    partner: "reactant",
    energy: 40,
    orientation: "unsuitable",
  },
  atomic: {
    label:
      "This simplified atomic encounter has no molecular-end condition. Energy 40 units, minimum 30.",
    activation: 30,
    molecular: false,
    contact: true,
    partner: "reactant",
    energy: 40,
    orientation: "unsuitable",
  },
} as const;
export const densityComparisons = {
  initial: {
    label:
      "Compare 12 reacting-particle symbols in 2 equal volume units with 24 in the same 2 units. Temperature and reacting identity are unchanged.",
    before: { particles: 12, volume: 2 },
    after: { particles: 24, volume: 2 },
    expected: "more",
  },
  dilution: {
    label:
      "Keep 12 reacting-particle symbols but increase actual solution volume from 2 to 4 units. Temperature is unchanged.",
    before: { particles: 12, volume: 2 },
    after: { particles: 12, volume: 4 },
    expected: "less",
  },
  equal: {
    label:
      "Compare 12 symbols in 2 units with 24 in 4 units at the same temperature.",
    before: { particles: 12, volume: 2 },
    after: { particles: 24, volume: 4 },
    expected: "same",
  },
  vessel: {
    label:
      "Transfer the same 50 cm³ solution to a larger flask without adding liquid, evaporating or changing temperature. Actual solution volume is unchanged.",
    before: { particles: 12, volume: 2 },
    after: { particles: 12, volume: 2 },
    expected: "same",
  },
  lessDespiteCount: {
    label:
      "Compare 12 symbols in 2 units with 18 in 6 units. More total reacting particles does not necessarily mean higher concentration.",
    before: { particles: 12, volume: 2 },
    after: { particles: 18, volume: 6 },
    expected: "less",
  },
  moreDespiteCount: {
    label:
      "Compare 24 symbols in 4 units with 18 in 2 units at the same temperature.",
    before: { particles: 24, volume: 4 },
    after: { particles: 18, volume: 2 },
    expected: "more",
  },
} as const;
export const gasComparisons = {
  initial: {
    label:
      "At fixed temperature compress 12 reacting particles from 4 volume units to 2.",
    particles: 12,
    beforeVolume: 4,
    afterVolume: 2,
    beforeInert: 0,
    afterInert: 0,
    expected: "more",
  },
  expansion: {
    label:
      "At fixed temperature expand 12 reacting particles from 2 units to 4.",
    particles: 12,
    beforeVolume: 2,
    afterVolume: 4,
    beforeInert: 0,
    afterInert: 0,
    expected: "less",
  },
  unchanged: {
    label:
      "At fixed temperature keep 12 reacting particles and 2 units unchanged.",
    particles: 12,
    beforeVolume: 2,
    afterVolume: 2,
    beforeInert: 0,
    afterInert: 0,
    expected: "same",
  },
  stronger: {
    label:
      "At fixed temperature compress 24 reacting particles from 4 units to 1.",
    particles: 24,
    beforeVolume: 4,
    afterVolume: 1,
    beforeInert: 0,
    afterInert: 0,
    expected: "more",
  },
  inert: {
    label:
      "Optional transfer: at fixed temperature and volume add 12 inert particles, keeping 12 reacting particles in 2 units. Total pressure can rise without increasing reacting-particle density.",
    particles: 12,
    beforeVolume: 2,
    afterVolume: 2,
    beforeInert: 0,
    afterInert: 12,
    expected: "same",
  },
  inertCompression: {
    label:
      "Optional transfer: 12 reacting and 12 inert particles stay in the vessel; compress from 4 units to 2 at fixed temperature. Reacting-particle density increases too.",
    particles: 12,
    beforeVolume: 4,
    afterVolume: 2,
    beforeInert: 12,
    afterInert: 12,
    expected: "more",
  },
} as const;
export const surfaceCases = {
  initial: {
    label:
      "A 4 mm cube is split into 8 equal cubes. Separate them so all faces contact the other reactant.",
    divisions: 2,
    separated: true,
  },
  whole: {
    label: "A single 4 mm cube has six accessible faces.",
    divisions: 1,
    separated: false,
  },
  fine: {
    label:
      "A 4 mm cube is split into 64 equal cubes, fully separated and wetted.",
    divisions: 4,
    separated: true,
  },
  joinedEight: {
    label:
      "Eight 2 mm pieces remain touching, filling the original 4 mm cube. The other reactant cannot enter the internal interfaces.",
    divisions: 2,
    separated: false,
  },
  joinedFine: {
    label:
      "Sixty-four 1 mm pieces remain joined in the original 4 mm block. Only exterior faces contact the other reactant.",
    divisions: 4,
    separated: false,
  },
  separateWhole: {
    label:
      "One 4 mm cube has no internal interfaces to expose by separating pieces.",
    divisions: 1,
    separated: true,
  },
} as const;
export const densityDirection = (
  before: { particles: number; volume: number },
  after: { particles: number; volume: number },
) => {
  const difference =
    reactingDensity(after.particles, after.volume) -
    reactingDensity(before.particles, before.volume);
  return difference > 0 ? "more" : difference < 0 ? "less" : "same";
};

export type ParticlePosition = {
  id: number;
  species: "reacting" | "inert";
  x: number;
  y: number;
  z: number;
  radius: number;
};
/** Seeded irregular positions; minimum-volume packing means expansion cannot introduce overlaps. */
export function gasParticlePositions(
  reacting: number,
  inert: number,
  volume: number,
): ParticlePosition[] {
  if (
    !Number.isInteger(reacting) ||
    !Number.isInteger(inert) ||
    reacting < 0 ||
    inert < 0 ||
    reacting + inert > 48 ||
    volume < 1 ||
    volume > 6 ||
    !Number.isFinite(volume)
  )
    throw new Error("Invalid schematic gas state.");
  let seed = 93741;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const radius = 0.09;
  const points: { x: number; y: number; z: number }[] = [];
  let attempts = 0;
  while (points.length < reacting + inert) {
    if (++attempts > 100000)
      throw new Error("Unable to place schematic particles without overlap.");
    const p = {
      x: (random() - 0.5) * (1 - 2 * radius),
      y: (random() - 0.5) * (2 - 2 * radius),
      z: (random() - 0.5) * (2 - 2 * radius),
    };
    if (
      points.every(
        (q) =>
          Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) >= 2 * radius + 0.015,
      )
    )
      points.push(p);
  }
  return points.map((p, id) => ({
    id,
    species: id < reacting ? "reacting" : "inert",
    x: p.x * volume,
    y: p.y,
    z: p.z,
    radius,
  }));
}
export function solidPiecePositions(divisions: 1 | 2 | 4, separated: boolean) {
  const side = 4 / divisions;
  const pitch = side + (separated ? 0.7 : 0);
  const result: {
    id: number;
    x: number;
    y: number;
    z: number;
    side: number;
  }[] = [];
  for (let x = 0; x < divisions; x++)
    for (let y = 0; y < divisions; y++)
      for (let z = 0; z < divisions; z++) {
        result.push({
          id: result.length,
          x: (x - (divisions - 1) / 2) * pitch,
          y: (y - (divisions - 1) / 2) * pitch,
          z: (z - (divisions - 1) / 2) * pitch,
          side,
        });
      }
  return result;
}

export const rateComparisons = {
  initial: {
    label:
      "Both trials collect 20 cm³ gas. Trial A takes 25 s and trial B takes 50 s. Compare mean rates to the same endpoint.",
    amountA: 20,
    timeA: 25,
    amountB: 20,
    timeB: 50,
    unit: "cm³/s",
    rateA: 0.8,
    rateB: 0.4,
    faster: "A",
  },
  slower: {
    label:
      "Both trials collect 15 cm³ gas. Trial A takes 30 s and trial B takes 60 s. A longer time to the same endpoint means a slower mean rate.",
    amountA: 15,
    timeA: 30,
    amountB: 15,
    timeB: 60,
    unit: "cm³/s",
    rateA: 0.5,
    rateB: 0.25,
    faster: "A",
  },
  reverse: {
    label:
      "Both trials collect 24 cm³ gas. Trial A takes 80 s and trial B takes 40 s.",
    amountA: 24,
    timeA: 80,
    amountB: 24,
    timeB: 40,
    unit: "cm³/s",
    rateA: 0.3,
    rateB: 0.6,
    faster: "B",
  },
  differentAmount: {
    label:
      "Trial A collects 20 cm³ in 20 s. Trial B collects 40 cm³ in 30 s. Different endpoints require amount/time; time alone cannot establish which mean rate is greater.",
    amountA: 20,
    timeA: 20,
    amountB: 40,
    timeB: 30,
    unit: "cm³/s",
    rateA: 1,
    rateB: 4 / 3,
    faster: "B",
  },
  equalRate: {
    label:
      "Trial A collects 12 cm³ in 20 s. Trial B collects 30 cm³ in 50 s. Compare the measured mean rates rather than total amounts.",
    amountA: 12,
    timeA: 20,
    amountB: 30,
    timeB: 50,
    unit: "cm³/s",
    rateA: 0.6,
    rateB: 0.6,
    faster: "same",
  },
  mass: {
    label:
      "Trial A forms 1.2 g product in 60 s. Trial B forms 0.9 g in 30 s. Use the stated gram quantities; these are not gas volumes.",
    amountA: 1.2,
    timeA: 60,
    amountB: 0.9,
    timeB: 30,
    unit: "g/s",
    rateA: 0.02,
    rateB: 0.03,
    faster: "B",
  },
} as const;
export const collisionEvidence = {
  initial: {
    label:
      "At fixed temperature a student says that doubling concentration doubles particle speed.",
    claim: "frequency",
    reason: "density",
    explanation:
      "More reacting particles per unit volume increases collision frequency in the controlled comparison. The fixed temperature does not give each particle more kinetic energy.",
  },
  exactRate: {
    label:
      "Only concentration is stated to double. No measured rates are supplied. A student claims an exact twofold chemical-rate increase.",
    claim: "direction-only",
    reason: "measurement-needed",
    explanation:
      "The controlled concentration comparison supports an expected increase in collision frequency and rate. It does not establish a universal exact rate factor; measured rates are needed.",
  },
  solidAmount: {
    label:
      "The same solid mass is crushed and fully wetted, with other reactant amounts unchanged and complete reaction. A student says crushing creates more reacting material and therefore more final product.",
    claim: "speed-not-amount",
    reason: "same-material",
    explanation:
      "Crushing exposes more accessible surface without creating more reactant. With the same reactant amounts and complete reaction, the available total product is unchanged.",
  },
  joined: {
    label:
      "Eight solid pieces remain touching as a 4 mm cube; the other reactant cannot enter their internal interfaces. A student counts all 48 faces as accessible.",
    claim: "outer-faces",
    reason: "interfaces-blocked",
    explanation:
      "Only faces exposed to the other reactant contribute to accessible area here. Internal touching interfaces are excluded under the stated assumption.",
  },
  depletion: {
    label:
      "Temperature and solution volume remain constant during a batch reaction. The reaction slows as dissolved reactant is consumed.",
    claim: "frequency-decreases",
    reason: "reactant-consumed",
    explanation:
      "There are fewer reacting particles per unit volume as reactant is consumed. Collision frequency falls even though temperature has not fallen.",
  },
  cooling: {
    label:
      "Particle count and actual volume remain unchanged while the sample is cooled. A student attributes the slower reaction to fewer particles per unit volume.",
    claim: "energy-and-speed",
    reason: "temperature-lower",
    explanation:
      "Cooling lowers average particle speed and the fraction of collisions with sufficient energy. In this stated unchanged-count/volume comparison, number density does not decrease.",
  },
} as const;
