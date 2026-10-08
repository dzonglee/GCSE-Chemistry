export type ChangeMode = "factors" | "dilution" | "portion" | "target";
export function concentrationChange(massFactor: number, volumeFactor: number) {
  if (![massFactor, volumeFactor].every((v) => Number.isFinite(v) && v > 0))
    throw Error("Positive finite factors required");
  return massFactor / volumeFactor;
}
export function dilutedSolution(mass: number, finalCm3: number) {
  if (![mass, finalCm3].every((v) => Number.isFinite(v) && v > 0))
    throw Error("Positive finite amounts required");
  return { mass, cm3: finalCm3, concentration: (mass * 1000) / finalCm3 };
}
export function retainedPortion(
  initialMass: number,
  initialCm3: number,
  retainedCm3: number,
) {
  if (
    retainedCm3 <= 0 ||
    retainedCm3 > initialCm3 ||
    !Number.isFinite(retainedCm3)
  )
    throw Error("Retained volume must be within the initial sample");
  const initial = dilutedSolution(initialMass, initialCm3),
    mass = (initialMass * retainedCm3) / initialCm3;
  return {
    mass,
    removedMass: initialMass - mass,
    cm3: retainedCm3,
    removedCm3: initialCm3 - retainedCm3,
    concentration: initial.concentration,
  };
}
export const changeChoices = {
  factors: {
    massFactor: [0.5, 1, 2, 3],
    volumeFactor: [0.5, 1, 2, 4],
    factor: [
      "unset",
      "0.125",
      "0.25",
      "0.5",
      "0.75",
      "1",
      "1.5",
      "2",
      "3",
      "4",
      "6",
      "8",
    ],
    reason: [
      "unset",
      "mass-over-volume",
      "multiply",
      "mass-only",
      "volume-only",
    ],
  },
  dilution: {
    finalCm3: [250, 500, 1000],
    mass: ["unset", "2.5", "5", "10", "20", "40"],
    concentration: ["unset", "10", "20", "40", "80"],
    reason: ["unset", "retained-more-volume", "solute-lost", "same-strength"],
  },
  portion: {
    retainedCm3: [100, 250, 500],
    mass: ["unset", "2", "5", "10", "20"],
    concentration: ["unset", "4", "10", "20", "40", "100"],
    reason: [
      "unset",
      "both-proportional",
      "volume-only",
      "all-solute-retained",
    ],
  },
  target: {
    target: [10, 20],
    finalCm3: ["unset", "250", "500", "750", "1000"],
    addedCm3: ["unset", "250", "500", "750", "1000"],
    reason: ["unset", "final-minus-initial", "target-is-added", "lose-solute"],
  },
} as const;
export function initialChangeBoard(
  mode: ChangeMode,
): Record<string, string | number> {
  switch (mode) {
    case "factors":
      return {
        massFactor: 2,
        volumeFactor: 0.5,
        factor: "unset",
        reason: "unset",
      };
    case "dilution":
      return {
        finalCm3: 500,
        mass: "unset",
        concentration: "unset",
        reason: "unset",
      };
    case "portion":
      return {
        retainedCm3: 250,
        mass: "unset",
        concentration: "unset",
        reason: "unset",
      };
    case "target":
      return {
        target: 20,
        finalCm3: "unset",
        addedCm3: "unset",
        reason: "unset",
      };
  }
}
export function validChangeBoard(mode: ChangeMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    options = changeChoices[mode];
  return (
    Object.keys(b).length === Object.keys(options).length &&
    Object.entries(options).every(([k, vs]) =>
      (vs as readonly unknown[]).includes(b[k]),
    )
  );
}
export function changePrediction(
  mode: ChangeMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "factors": {
      const factor = concentrationChange(
        Number(b.massFactor),
        Number(b.volumeFactor),
      );
      return {
        correct: Number(b.factor) === factor && b.reason === "mass-over-volume",
        feedback: `Concentration factor = mass factor ÷ final-volume factor = ${b.massFactor} ÷ ${b.volumeFactor} = ${factor}. Equal factors leave concentration unchanged; a larger mass does not by itself prove greater concentration.`,
      };
    }
    case "dilution": {
      const d = dilutedSolution(10, Number(b.finalCm3));
      return {
        correct:
          Number(b.mass) === 10 &&
          Number(b.concentration) === d.concentration &&
          b.reason === "retained-more-volume",
        feedback: `All 10 g dissolved solute is retained. Final solution ${d.cm3} cm³ = ${d.cm3 / 1000} dm³; concentration = ${d.concentration} g/dm³. Added pure solvent changes final volume, not the retained solute amount. At 250 cm³ the volume and concentration are unchanged.`,
      };
    }
    case "portion": {
      const d = retainedPortion(10, 500, Number(b.retainedCm3));
      return {
        correct:
          Number(b.mass) === d.mass &&
          Number(b.concentration) === 20 &&
          b.reason === "both-proportional",
        feedback: `The homogeneous retained portion contains ${d.mass} g in ${d.cm3} cm³, still 20 g/dm³. Removed portion: ${d.removedMass} g in ${d.removedCm3} cm³. Together the two portions account for the original 10 g and 500 cm³. Sampling removes solute and solution volume in the same proportion; it is not dilution.`,
      };
    }
    case "target": {
      const final = (10 / Number(b.target)) * 1000,
        added = final - 250;
      return {
        correct:
          Number(b.finalCm3) === final &&
          Number(b.addedCm3) === added &&
          b.reason === "final-minus-initial",
        feedback: `Retain 10 g: final volume = 10 ÷ ${b.target} = ${final / 1000} dm³ = ${final} cm³. Under the supplied additive-volume approximation, pure solvent added = ${final} − 250 = ${added} cm³. The target final solution volume is not the amount added. No reaction or solute loss occurs.`,
      };
    }
  }
}
