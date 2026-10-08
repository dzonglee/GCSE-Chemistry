export type SolutionVolumeUnit = "cm3" | "dm3";
function positive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0)
    throw Error(`${label} must be positive and finite`);
}
function nonnegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0)
    throw Error(`${label} must be nonnegative and finite`);
}
/** The quantity is FINAL SOLUTION volume, never a starting water volume. */
export function solutionDm3(volume: number, unit: SolutionVolumeUnit) {
  positive(volume, "Final solution volume");
  if (unit !== "cm3" && unit !== "dm3") throw Error("Use cm3 or dm3");
  return unit === "cm3" ? volume / 1000 : volume;
}
export function molarConcentration(
  moles: number,
  volume: number,
  unit: SolutionVolumeUnit,
) {
  nonnegative(moles, "Dissolved solute amount");
  return moles / solutionDm3(volume, unit);
}
export function solutionMoles(
  concentration: number,
  volume: number,
  unit: SolutionVolumeUnit,
) {
  nonnegative(concentration, "Molar concentration");
  return concentration * solutionDm3(volume, unit);
}
export function solutionMass(
  concentration: number,
  volume: number,
  unit: SolutionVolumeUnit,
  molarMass: number,
) {
  positive(molarMass, "Molar mass");
  return solutionMoles(concentration, volume, unit) * molarMass;
}
export function concentrationFromMass(
  mass: number,
  volume: number,
  unit: SolutionVolumeUnit,
  molarMass: number,
) {
  nonnegative(mass, "Dissolved solute mass");
  positive(molarMass, "Molar mass");
  return molarConcentration(mass / molarMass, volume, unit);
}
export function massConcentration(molar: number, molarMass: number) {
  nonnegative(molar, "Molar concentration");
  positive(molarMass, "Molar mass");
  return molar * molarMass;
}
export function volumeForMoles(moles: number, concentration: number) {
  positive(moles, "Required solute amount");
  positive(concentration, "Molar concentration");
  return moles / concentration;
}
/** Homogeneous samples retain c; adding solvent retains n instead. */
export function sampleAndDilution(
  concentration: number,
  initialCm3: number,
  sampleCm3: number,
  dilutedCm3: number,
) {
  positive(concentration, "Molar concentration");
  const initialDm3 = solutionDm3(initialCm3, "cm3"),
    sampleDm3 = solutionDm3(sampleCm3, "cm3"),
    finalDm3 = solutionDm3(dilutedCm3, "cm3");
  if (sampleDm3 > initialDm3)
    throw Error("Sample cannot exceed the original solution");
  if (finalDm3 < sampleDm3)
    throw Error("Dilution cannot decrease final solution volume");
  const initialMoles = concentration * initialDm3,
    sampleMoles = concentration * sampleDm3;
  return {
    initialMoles,
    sampleMoles,
    remainingMoles: initialMoles - sampleMoles,
    sampleConcentration: concentration,
    dilutedConcentration: sampleMoles / finalDm3,
  };
}
export type MolarMode =
  "concentration" | "amount" | "mass" | "units" | "sampling";
export const molarRecords = {
  concentration: {
    initial: {
      label: "0.05 mol in 250 cm³ solution",
      moles: 0.05,
      volume: 250,
    },
    moreSolute: {
      label: "0.10 mol in 250 cm³ solution",
      moles: 0.1,
      volume: 250,
    },
    moreVolume: {
      label: "0.05 mol in 500 cm³ solution",
      moles: 0.05,
      volume: 500,
    },
  },
  amount: {
    initial: {
      label: "75 cm³ of 0.40 mol/dm³ solution",
      concentration: 0.4,
      volume: 75,
    },
    larger: {
      label: "150 cm³ of 0.40 mol/dm³ solution",
      concentration: 0.4,
      volume: 150,
    },
    stronger: {
      label: "75 cm³ of 0.80 mol/dm³ solution",
      concentration: 0.8,
      volume: 75,
    },
  },
  mass: {
    initial: {
      label: "250 cm³ of 0.20 mol/dm³ NaCl; M = 58.5 g/mol",
      concentration: 0.2,
      volume: 250,
      molarMass: 58.5,
    },
    changedSolute: {
      label: "250 cm³ of 0.20 mol/dm³ NaOH; M = 40 g/mol",
      concentration: 0.2,
      volume: 250,
      molarMass: 40,
    },
    larger: {
      label: "500 cm³ of 0.20 mol/dm³ NaCl; M = 58.5 g/mol",
      concentration: 0.2,
      volume: 500,
      molarMass: 58.5,
    },
  },
  units: {
    initial: {
      label: "11.7 g/dm³ NaCl; M = 58.5 g/mol",
      gramsPerDm3: 11.7,
      molarMass: 58.5,
    },
    changedSolute: {
      label: "11.7 g/dm³ NaOH; M = 40 g/mol",
      gramsPerDm3: 11.7,
      molarMass: 40,
    },
    moreMass: {
      label: "23.4 g/dm³ NaCl; M = 58.5 g/mol",
      gramsPerDm3: 23.4,
      molarMass: 58.5,
    },
  },
  sampling: {
    initial: {
      label:
        "125 cm³ sample from 500 cm³ at 0.40 mol/dm³; dilute sample to 250 cm³",
      concentration: 0.4,
      initial: 500,
      sample: 125,
      final: 250,
    },
    whole: {
      label: "All 500 cm³ at 0.40 mol/dm³; dilute to 1000 cm³",
      concentration: 0.4,
      initial: 500,
      sample: 500,
      final: 1000,
    },
    noDilution: {
      label: "125 cm³ sample from 500 cm³ at 0.40 mol/dm³; no added water",
      concentration: 0.4,
      initial: 500,
      sample: 125,
      final: 125,
    },
  },
} as const;
export const molarChoices: Record<
  MolarMode,
  Record<string, readonly string[]>
> = {
  concentration: {
    record: ["initial", "moreSolute", "moreVolume"],
    volume: ["unset", "0.25", "0.5", "250", "500"],
    answer: ["unset", "0.0001", "0.0002", "0.1", "0.2", "0.4", "100", "200"],
    reason: [
      "unset",
      "amount-over-final-volume",
      "amount-times-volume",
      "water-volume",
    ],
  },
  amount: {
    record: ["initial", "larger", "stronger"],
    volume: ["unset", "0.075", "0.15", "75", "150"],
    answer: ["unset", "0.03", "0.06", "0.12", "0.3", "30", "60"],
    reason: [
      "unset",
      "concentration-times-volume",
      "concentration-divide-volume",
      "concentration-is-amount",
    ],
  },
  mass: {
    record: ["initial", "changedSolute", "larger"],
    moles: ["unset", "0.05", "0.1", "0.2", "50", "100"],
    answer: ["unset", "2", "2.925", "5.85", "11.7", "40", "58.5"],
    reason: [
      "unset",
      "amount-times-molar-mass",
      "concentration-is-grams",
      "molar-mass-divide-amount",
    ],
  },
  units: {
    record: ["initial", "changedSolute", "moreMass"],
    answer: ["unset", "0.2", "0.2925", "0.4", "11.7", "23.4", "468", "684.45"],
    reason: [
      "unset",
      "grams-divide-molar-mass",
      "grams-times-molar-mass",
      "same-number-different-unit",
    ],
  },
  sampling: {
    record: ["initial", "whole", "noDilution"],
    moles: ["unset", "0.0125", "0.025", "0.05", "0.1", "0.2"],
    sample: ["unset", "0.1", "0.2", "0.4", "0.8"],
    answer: ["unset", "0.05", "0.1", "0.2", "0.4", "0.8"],
    reason: [
      "unset",
      "sample-retains-c-dilution-retains-n",
      "sampling-lowers-c",
      "adding-water-removes-solute",
    ],
  },
};
export function initialMolarBoard(
  mode: MolarMode,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.keys(molarChoices[mode]).map((key) => [
      key,
      key === "record" ? "initial" : "unset",
    ]),
  );
}
export function validMolarBoard(
  mode: MolarMode,
  board: Record<string, string | number>,
) {
  const choices = molarChoices[mode];
  return (
    Object.keys(board).length === Object.keys(choices).length &&
    Object.entries(choices).every(
      ([k, v]) =>
        typeof board[k] === "string" && v.includes(board[k] as string),
    )
  );
}
export function molarExpected(
  mode: MolarMode,
  record: string,
): Record<string, string> {
  if (mode === "concentration") {
    const r =
      molarRecords.concentration[
        record as keyof typeof molarRecords.concentration
      ];
    return {
      volume: String(r.volume / 1000),
      answer: String(molarConcentration(r.moles, r.volume, "cm3")),
      reason: "amount-over-final-volume",
    };
  }
  if (mode === "amount") {
    const r = molarRecords.amount[record as keyof typeof molarRecords.amount];
    return {
      volume: String(r.volume / 1000),
      answer: String(solutionMoles(r.concentration, r.volume, "cm3")),
      reason: "concentration-times-volume",
    };
  }
  if (mode === "mass") {
    const r = molarRecords.mass[record as keyof typeof molarRecords.mass];
    return {
      moles: String(solutionMoles(r.concentration, r.volume, "cm3")),
      answer: String(
        solutionMass(r.concentration, r.volume, "cm3", r.molarMass),
      ),
      reason: "amount-times-molar-mass",
    };
  }
  if (mode === "units") {
    const r = molarRecords.units[record as keyof typeof molarRecords.units];
    return {
      answer: String(r.gramsPerDm3 / r.molarMass),
      reason: "grams-divide-molar-mass",
    };
  }
  const r = molarRecords.sampling[record as keyof typeof molarRecords.sampling],
    s = sampleAndDilution(r.concentration, r.initial, r.sample, r.final);
  return {
    moles: String(s.sampleMoles),
    sample: String(s.sampleConcentration),
    answer: String(s.dilutedConcentration),
    reason: "sample-retains-c-dilution-retains-n",
  };
}
export function molarPrediction(
  mode: MolarMode,
  board: Record<string, string | number>,
) {
  if (!validMolarBoard(mode, board)) return { correct: false, complete: false };
  const expected = molarExpected(mode, String(board.record));
  const complete = Object.keys(expected).every((k) => board[k] !== "unset");
  const correct =
    complete &&
    Object.entries(expected).every(([k, v]) =>
      k === "reason"
        ? board[k] === v
        : Math.abs(Number(board[k]) - Number(v)) < 1e-12,
    );
  return { correct, complete, expected };
}
