export type ConcentrationMode = "unit-rate" | "basis" | "mass" | "volume";
const clean = (v: number) => Number(v.toFixed(9));
const positive = (v: number) => {
  if (!Number.isFinite(v) || v <= 0)
    throw Error("Supply a positive finite quantity");
};
export function concentrationLedger(soluteGrams: number, solutionCm3: number) {
  positive(soluteGrams);
  positive(solutionCm3);
  const dm3 = solutionCm3 / 1000;
  return {
    soluteGrams,
    solutionCm3,
    dm3,
    concentration: clean(soluteGrams / dm3),
  };
}
export function soluteMass(concentration: number, solutionCm3: number) {
  positive(concentration);
  positive(solutionCm3);
  return clean((concentration * solutionCm3) / 1000);
}
export function solutionVolume(soluteGrams: number, concentration: number) {
  positive(soluteGrams);
  positive(concentration);
  const dm3 = clean(soluteGrams / concentration);
  return { dm3, cm3: clean(dm3 * 1000) };
}
export function initialConcentrationBoard(
  mode: ConcentrationMode,
): Record<string, string | number> {
  switch (mode) {
    case "unit-rate":
      return { mass: 4, cm3: 200, dm3: "unset", concentration: "unset" };
    case "basis":
      return {
        numerator: "solute",
        denominator: "solution",
        concentration: "unset",
      };
    case "mass":
      return { concentration: 20, cm3: 250, dm3: "unset", mass: "unset" };
    case "volume":
      return { mass: 10, concentration: 40, dm3: "unset", cm3: "unset" };
  }
}
export const concentrationChoices = {
  "unit-rate": {
    mass: [4, 10, 20],
    cm3: [100, 200, 250, 500, 1000],
    dm3: ["unset", "0.1", "0.2", "0.25", "0.5", "1", "100", "200", "1000"],
    concentration: [
      "unset",
      "4",
      "8",
      "10",
      "16",
      "20",
      "40",
      "50",
      "80",
      "100",
      "200",
      "0.02",
      "0.004",
      "0.04",
      "20000",
    ],
  },
  basis: {
    numerator: ["solute", "whole"],
    denominator: ["solution", "solvent"],
    concentration: [
      "unset",
      "20",
      "20.833333333",
      "1040",
      "1083.333333333",
      "0.02",
    ],
  },
  mass: {
    concentration: [4, 20, 40],
    cm3: [25, 100, 250, 500],
    dm3: ["unset", "0.025", "0.1", "0.25", "0.5", "25", "250"],
    mass: [
      "unset",
      "0.1",
      "0.4",
      "0.5",
      "1",
      "2",
      "4",
      "5",
      "10",
      "20",
      "100",
      "5000",
    ],
  },
  volume: {
    mass: [4, 10, 20],
    concentration: [20, 40, 80],
    dm3: [
      "unset",
      "0.05",
      "0.1",
      "0.125",
      "0.2",
      "0.25",
      "0.5",
      "1",
      "40",
      "80",
    ],
    cm3: [
      "unset",
      "50",
      "100",
      "125",
      "200",
      "250",
      "500",
      "1000",
      "0.25",
      "0.5",
    ],
  },
} as const;
export function validConcentrationBoard(
  mode: ConcentrationMode,
  value: unknown,
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    choices = concentrationChoices[mode];
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.entries(choices).every(([k, values]) =>
      (values as readonly unknown[]).includes(b[k]),
    )
  );
}
export function concentrationPrediction(
  mode: ConcentrationMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "unit-rate": {
      const d = concentrationLedger(Number(b.mass), Number(b.cm3)),
        correct =
          Number(b.dm3) === d.dm3 &&
          Number(b.concentration) === d.concentration;
      return {
        correct,
        feedback: correct
          ? `${d.solutionCm3} cm³ ÷1000=${d.dm3} dm³. Dissolved solute ${d.soluteGrams} g ÷ final solution volume ${d.dm3} dm³=${d.concentration} g/dm³. The quantity is solute mass per unit solution volume.`
          : "Convert the final solution volume from cm³ to dm³, then divide dissolved-solute grams by that dm³ volume. Dividing by raw cm³ gives a different unit; multiplying mass by volume reverses the concentration equation.",
      };
    }
    case "basis": {
      const correct =
        b.numerator === "solute" &&
        b.denominator === "solution" &&
        Number(b.concentration) === 20;
      return {
        correct,
        feedback: correct
          ? "Use 5 g dissolved solute and the supplied final 250 cm³ =0.25 dm³ of solution: 5÷0.25=20 g/dm³. The 260 g whole-solution mass would concern density; the original 240 cm³ solvent is not the final solution volume."
          : "Choose dissolved-solute mass, not total solution mass. Use the measured final solution volume, not the initial solvent volume. The two supplied volumes are different; do not assume dissolution preserves the starting solvent volume.",
      };
    }
    case "mass": {
      const dm3 = Number(b.cm3) / 1000,
        mass = soluteMass(Number(b.concentration), Number(b.cm3)),
        correct = Number(b.dm3) === dm3 && Number(b.mass) === mass;
      return {
        correct,
        feedback: correct
          ? `${b.cm3} cm³=${dm3} dm³. Solute mass=concentration×solution volume=${b.concentration}×${dm3}=${mass} g. This mass is dissolved solute in the specified homogeneous solution sample, not the whole solution's mass.`
          : "Convert the specified sample volume to dm³ and multiply it by concentration in g/dm³. Divide by1000 for cm³→dm³; dividing concentration by volume would not give solute mass.",
      };
    }
    case "volume": {
      const d = solutionVolume(Number(b.mass), Number(b.concentration)),
        correct = Number(b.dm3) === d.dm3 && Number(b.cm3) === d.cm3;
      return {
        correct,
        feedback: correct
          ? `Final solution volume=solute mass÷concentration=${b.mass}÷${b.concentration}=${d.dm3} dm³=${d.cm3} cm³. Convert back by multiplying by1000.`
          : "Use volume=solute mass÷concentration. The first result is in dm³ when concentration is g/dm³. Multiply that volume by1000 for cm³; do not invert the equation.",
      };
    }
  }
}
