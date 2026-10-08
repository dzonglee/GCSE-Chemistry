import {
  conditions,
  densityComparisons,
  gasComparisons,
  surfaceCases,
  rateComparisons,
  collisionEvidence,
  densityDirection,
  reactingDensity,
  surfaceGeometry,
  successfulEncounter,
} from "./collision-theory";
import type { CollisionMode } from "./collision-theory";
export const collisionRecords = {
  conditions,
  solution: densityComparisons,
  gas: gasComparisons,
  surface: surfaceCases,
  comparison: rateComparisons,
  evidence: collisionEvidence,
};
export const collisionNumbers: Record<CollisionMode, string[]> = {
  conditions: ["energy"],
  solution: ["density"],
  gas: ["density"],
  surface: ["pieces", "area", "volume", "ratio"],
  comparison: ["rateA", "rateB"],
  evidence: [],
};
export const collisionOptions: Record<
  CollisionMode,
  Record<string, string[]>
> = {
  conditions: {
    record: [],
    contact: ["yes", "no"],
    partner: ["reactant", "inert"],
    orientation: ["suitable", "unsuitable"],
    outcome: ["unset", "yes", "no"],
  },
  solution: {
    record: [],
    particles: ["12", "18", "24"],
    occupiedVolume: ["1", "2", "4", "6"],
    direction: ["unset", "more", "less", "same"],
    kinetic: ["unset", "higher", "lower", "unchanged"],
  },
  gas: {
    record: [],
    occupiedVolume: ["1", "2", "4"],
    direction: ["unset", "more", "less", "same"],
    kinetic: ["unset", "higher", "lower", "unchanged"],
  },
  surface: {
    record: [],
    divisions: ["1", "2", "4"],
    separated: ["yes", "no"],
    rateFactor: ["unset", "known-exact", "not-established"],
  },
  comparison: { record: [], faster: ["unset", "A", "B", "same"] },
  evidence: {
    record: [],
    claim: [
      "unset",
      "frequency",
      "direction-only",
      "speed-not-amount",
      "outer-faces",
      "frequency-decreases",
      "energy-and-speed",
    ],
    reason: [
      "unset",
      "density",
      "measurement-needed",
      "same-material",
      "interfaces-blocked",
      "reactant-consumed",
      "temperature-lower",
    ],
  },
};
for (const mode of Object.keys(collisionRecords) as CollisionMode[])
  collisionOptions[mode].record = Object.keys(collisionRecords[mode]);
export const validCollisionNumber = (v: unknown): v is string =>
  typeof v === "string" &&
  /^(?:0|[1-9]\d*)(?:\.\d{1,10})?$/.test(v) &&
  Number(v) <= 100000;
export function initialCollisionBoard(
  mode: CollisionMode,
  record = "initial",
): Record<string, string> {
  if (!collisionOptions[mode].record.includes(record))
    throw Error("Unknown collision-theory case.");
  const b = Object.fromEntries([
    ...Object.keys(collisionOptions[mode]).map((k) => [
      k,
      k === "record"
        ? record
        : collisionOptions[mode][k].includes("unset")
          ? "unset"
          : collisionOptions[mode][k][0],
    ]),
    ...collisionNumbers[mode].map((k) => [k, "0"]),
  ]);
  if (mode === "conditions") {
    const r = conditions[record as keyof typeof conditions];
    b.contact = r.contact ? "yes" : "no";
    b.partner = r.partner;
    b.energy = String(r.energy);
    b.orientation = r.orientation;
  } else if (mode === "solution") {
    const r = densityComparisons[record as keyof typeof densityComparisons];
    b.particles = String(r.before.particles);
    b.occupiedVolume = String(r.before.volume);
  } else if (mode === "gas") {
    const r = gasComparisons[record as keyof typeof gasComparisons];
    b.occupiedVolume = String(r.beforeVolume);
  } else if (mode === "surface") {
    b.divisions = "1";
    b.separated = "no";
  }
  return b;
}
export function validCollisionBoard(
  mode: CollisionMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(initialCollisionBoard(mode)).length &&
    Object.entries(collisionOptions[mode]).every(
      ([k, opts]) => typeof b[k] === "string" && opts.includes(b[k] as string),
    ) &&
    collisionNumbers[mode].every((k) => validCollisionNumber(b[k]))
  );
}
export function collisionHistoryStep(
  mode: CollisionMode,
  a: unknown,
  b: unknown,
) {
  if (!validCollisionBoard(mode, a) || !validCollisionBoard(mode, b))
    return false;
  if (a.record !== b.record) {
    const reset = initialCollisionBoard(mode, b.record);
    return Object.keys(reset).every((k) => b[k] === reset[k]);
  }
  return Object.keys(a).filter((k) => a[k] !== b[k]).length === 1;
}
const near = (actual: unknown, expected: number) =>
  validCollisionNumber(actual) && Math.abs(Number(actual) - expected) <= 1e-9;
export function collisionBoardCheck(
  mode: CollisionMode,
  b: unknown,
): { correct: boolean; feedback: string } {
  if (!validCollisionBoard(mode, b))
    return {
      correct: false,
      feedback:
        "A saved field is invalid. Retain your work and correct the field before checking.",
    };
  if (mode === "conditions") {
    const r = conditions[b.record as keyof typeof conditions];
    const success = successfulEncounter({
      contact: b.contact === "yes",
      reactingPartner: b.partner === "reactant",
      energy: Number(b.energy),
      activation: r.activation,
      molecular: r.molecular,
      suitableOrientation: b.orientation === "suitable",
    });
    return {
      correct: b.outcome === (success ? "yes" : "no"),
      feedback: success
        ? "This stated simplified encounter meets contact, reacting-partner and minimum-energy conditions, plus molecular orientation where specified. It does not measure a chemical rate."
        : b.contact !== "yes"
          ? "The reacting particles do not collide. Sufficient energy alone is not enough."
          : b.partner !== "reactant"
            ? "An inert collision partner does not produce this specified reaction."
            : Number(b.energy) < r.activation
              ? "The collision energy is below the stated activation minimum."
              : r.molecular
                ? "The reactive molecular sites do not meet in the stated orientation."
                : "Check the stated encounter conditions.",
    };
  }
  if (mode === "solution") {
    const r = densityComparisons[b.record as keyof typeof densityComparisons];
    if (
      Number(b.particles) !== r.after.particles ||
      Number(b.occupiedVolume) !== r.after.volume
    )
      return {
        correct: false,
        feedback:
          "First construct the stated final reacting count and occupied solution volume. The larger vessel case keeps actual solution volume unchanged.",
      };
    const density = reactingDensity(r.after.particles, r.after.volume);
    if (!near(b.density, density))
      return {
        correct: false,
        feedback:
          "Divide the reacting count by the actual occupied volume; neither total count alone nor vessel capacity gives concentration.",
      };
    if (b.direction !== densityDirection(r.before, r.after))
      return {
        correct: false,
        feedback:
          "Compare both count/volume ratios, including both denominators.",
      };
    if (b.kinetic !== "unchanged")
      return {
        correct: false,
        feedback:
          "The temperature is unchanged. A concentration change does not give each particle more average kinetic energy.",
      };
    return {
      correct: true,
      feedback: `The final density is ${density} reacting symbols per volume unit. The fixed temperature leaves average kinetic energy unchanged. This density comparison does not establish an exact chemical-rate factor.`,
    };
  }
  if (mode === "gas") {
    const r = gasComparisons[b.record as keyof typeof gasComparisons];
    if (Number(b.occupiedVolume) !== r.afterVolume)
      return {
        correct: false,
        feedback:
          "Set the stated final occupied gas volume. Reacting and inert particle counts are fixed for this comparison.",
      };
    if (!near(b.density, r.particles / r.afterVolume))
      return {
        correct: false,
        feedback:
          "Use the reacting-particle count in the numerator, excluding inert particles, and divide by actual occupied volume.",
      };
    const direction = densityDirection(
      { particles: r.particles, volume: r.beforeVolume },
      { particles: r.particles, volume: r.afterVolume },
    );
    if (b.direction !== direction)
      return {
        correct: false,
        feedback:
          "Compare reacting count per occupied volume before and after. Total pressure and reacting-particle density are distinct in the optional inert-gas case.",
      };
    if (b.kinetic !== "unchanged")
      return {
        correct: false,
        feedback:
          "Temperature is fixed. Compression changes particle density, not average kinetic energy in this controlled comparison.",
      };
    return {
      correct: true,
      feedback:
        "The reacting count is conserved and the count/volume comparison is correct. Fixed temperature means unchanged average kinetic energy. The scene is stationary and does not predict a measured rate.",
    };
  }
  if (mode === "surface") {
    const r = surfaceCases[b.record as keyof typeof surfaceCases];
    if (
      Number(b.divisions) !== r.divisions ||
      (b.separated === "yes") !== r.separated
    )
      return {
        correct: false,
        feedback:
          "Construct the stated pieces and contact arrangement. Separated means every face is fully wetted; touching internal interfaces are inaccessible.",
      };
    const g = surfaceGeometry(r.divisions, r.separated);
    if (!near(b.pieces, g.pieces))
      return {
        correct: false,
        feedback:
          "The number of pieces is the number along one edge cubed, because subdivision occurs in all three dimensions.",
      };
    if (!near(b.area, g.accessibleArea))
      return {
        correct: false,
        feedback: r.separated
          ? "For separated fully wetted cubes, count six faces per piece and multiply by the square of each edge."
          : "Only exterior faces contact the other reactant in this joined block. Do not count blocked internal interfaces.",
      };
    if (!near(b.volume, g.materialVolume))
      return {
        correct: false,
        feedback:
          "Splitting conserves material volume. Use piece count times edge cubed, not total surface area.",
      };
    if (!near(b.ratio, g.areaVolumeRatio))
      return {
        correct: false,
        feedback:
          "Divide accessible area by conserved material volume. This quotient has units mm⁻¹.",
      };
    if (b.rateFactor !== "not-established")
      return {
        correct: false,
        feedback:
          "An area factor does not by itself establish an exact measured chemical-rate factor.",
      };
    return {
      correct: true,
      feedback: `The accessible area is ${g.accessibleArea} mm² and material volume stays 64 mm³. Area/volume is ${g.areaVolumeRatio} mm⁻¹. More accessible area changes contact opportunities without creating more material.`,
    };
  }
  if (mode === "comparison") {
    const r = rateComparisons[b.record as keyof typeof rateComparisons];
    if (!near(b.rateA, r.rateA) || !near(b.rateB, r.rateB))
      return {
        correct: false,
        feedback:
          "Calculate each matching amount/time ratio. A shorter time alone establishes a faster mean only when endpoint amounts match.",
      };
    if (b.faster !== r.faster)
      return {
        correct: false,
        feedback:
          "Compare the two calculated mean rates rather than total amount or time alone.",
      };
    return {
      correct: true,
      feedback: `The measured means are ${r.rateA} and ${r.rateB} ${r.unit}. These are means over the stated intervals, not instantaneous rates or guaranteed rates for a different experiment.`,
    };
  }
  const r = collisionEvidence[b.record as keyof typeof collisionEvidence];
  return {
    correct: b.claim === r.claim && b.reason === r.reason,
    feedback: r.explanation,
  };
}
