export type MassBalanceMode =
  "amounts" | "candidates" | "fraction" | "consumed";
export function smallestWholeRatio(amounts: readonly number[]) {
  if (amounts.length < 2 || amounts.some((v) => !Number.isFinite(v) || v <= 0))
    throw Error("Positive finite amounts required");
  const minimum = Math.min(...amounts),
    relative = amounts.map((v) => v / minimum);
  for (let multiplier = 1; multiplier <= 12; multiplier++) {
    const scaled = relative.map((v) => v * multiplier);
    if (
      scaled.every(
        (v) =>
          Number.isSafeInteger(Math.round(v)) &&
          Math.abs(v - Math.round(v)) < 1e-8,
      )
    ) {
      const whole = scaled.map(Math.round),
        gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a),
        divisor = whole.reduce(gcd);
      return {
        minimum,
        relative,
        multiplier,
        coefficients: whole.map((v) => v / divisor),
      };
    }
  }
  throw Error(
    "These amounts do not justify a small whole-number ratio at the stated precision",
  );
}
export function coefficientsFromMasses(
  masses: readonly number[],
  molarMasses: readonly number[],
) {
  if (
    masses.length !== molarMasses.length ||
    masses.some((v) => !Number.isFinite(v) || v <= 0) ||
    molarMasses.some((v) => !Number.isFinite(v) || v <= 0)
  )
    throw Error("Matching positive finite masses required");
  const amounts = masses.map((v, i) => v / molarMasses[i]);
  return { amounts, ...smallestWholeRatio(amounts) };
}
export const massBalanceSamples = {
  small: { masses: [4.8, 3.2, 8], amounts: [0.2, 0.1, 0.2] },
  double: { masses: [9.6, 6.4, 16], amounts: [0.4, 0.2, 0.4] },
} as const;
export const candidateSamples = {
  one: {
    copper: 2.54,
    water: 0.72,
    cuAmount: 0.04,
    waterAmount: 0.04,
    equation: "CuO",
  },
  two: {
    copper: 5.08,
    water: 0.72,
    cuAmount: 0.08,
    waterAmount: 0.04,
    equation: "Cu2O",
  },
} as const;
export const massBalanceChoices = {
  amounts: {
    sample: ["small", "double"],
    mgAmount: ["unset", "0.1", "0.2", "0.4", "4.8", "9.6"],
    oxygenAmount: ["unset", "0.1", "0.2", "0.4", "3.2", "6.4"],
    oxideAmount: ["unset", "0.1", "0.2", "0.4", "8", "16"],
    divisor: ["unset", "0.1", "0.2", "0.4", "3.2"],
    ratio: ["unset", "2:1:2", "3:2:5", "1:1:1", "4:2:4"],
  },
  candidates: {
    sample: ["one", "two"],
    copperAmount: ["unset", "0.04", "0.08", "2.54", "5.08"],
    waterAmount: ["unset", "0.04", "0.08", "0.72"],
    equation: ["unset", "CuO", "Cu2O"],
  },
  fraction: {
    oxygenRatio: ["unset", "3", "3.5", "4", "7"],
    multiplier: ["unset", "1", "2", "3"],
    ethane: [1, 2, 4],
    oxygen: [3, 4, 7, 14],
    carbonDioxide: [2, 4, 8],
    water: [3, 6, 12],
  },
  consumed: {
    oxygenMass: ["unset", "4", "6", "10"],
    mgAmount: ["unset", "0.125", "0.25", "6"],
    oxygenAmount: ["unset", "0.125", "0.25", "0.3125"],
    oxideAmount: ["unset", "0.125", "0.25", "10"],
    ratio: ["unset", "2:1:2", "4:5:4", "2:1:1", "4:2:4"],
  },
} as const;
export function initialMassBalanceBoard(
  mode: MassBalanceMode,
): Record<string, string | number> {
  switch (mode) {
    case "amounts":
      return {
        sample: "small",
        mgAmount: "unset",
        oxygenAmount: "unset",
        oxideAmount: "unset",
        divisor: "unset",
        ratio: "unset",
      };
    case "candidates":
      return {
        sample: "one",
        copperAmount: "unset",
        waterAmount: "unset",
        equation: "unset",
      };
    case "fraction":
      return {
        oxygenRatio: "unset",
        multiplier: "unset",
        ethane: 1,
        oxygen: 3,
        carbonDioxide: 2,
        water: 3,
      };
    case "consumed":
      return {
        oxygenMass: "unset",
        mgAmount: "unset",
        oxygenAmount: "unset",
        oxideAmount: "unset",
        ratio: "unset",
      };
  }
}
export function validMassBalanceBoard(mode: MassBalanceMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    choices = massBalanceChoices[mode];
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.entries(choices).every(([k, v]) =>
      (v as readonly unknown[]).includes(b[k]),
    )
  );
}
export function massBalancePrediction(
  mode: MassBalanceMode,
  b: Record<string, string | number>,
) {
  if (mode === "amounts") {
    const d = massBalanceSamples[b.sample as keyof typeof massBalanceSamples],
      r = coefficientsFromMasses(d.masses, [24, 32, 40]);
    return {
      correct:
        Number(b.mgAmount) === d.amounts[0] &&
        Number(b.oxygenAmount) === d.amounts[1] &&
        Number(b.oxideAmount) === d.amounts[2] &&
        Number(b.divisor) === d.amounts[1] &&
        b.ratio === "2:1:2",
      feedback: `Divide each reacted mass by its own molar mass: Mg ${d.masses[0]}/24=${d.amounts[0]} mol; O₂ ${d.masses[1]}/32=${d.amounts[1]} mol; MgO ${d.masses[2]}/40=${d.amounts[2]} mol. Divide all amounts by ${r.minimum}: 2:1:2. Thus 2Mg + O₂ → 2MgO. A 4:2:4 equation is atom-balanced but not the requested smallest whole-number form. The gram ratio alone does not give coefficients.`,
    };
  }
  if (mode === "candidates") {
    const d = candidateSamples[b.sample as keyof typeof candidateSamples];
    return {
      correct:
        Number(b.copperAmount) === d.cuAmount &&
        Number(b.waterAmount) === d.waterAmount &&
        b.equation === d.equation,
      feedback: `Using supplied M(Cu)=63.5 g/mol: ${d.copper}/63.5=${d.cuAmount} mol Cu. Water: ${d.water}/18=${d.waterAmount} mol. Cu:H₂O ratio=${d.cuAmount / d.waterAmount}:1, so ${d.equation === "CuO" ? "CuO + H₂ → Cu + H₂O" : "Cu₂O + H₂ → 2Cu + H₂O"} matches these measured products. Both candidate equations are balanced; only one matches this experiment. An equivalent mass comparison weights each product coefficient by molar mass: Cu:water is63.5:18 for CuO or127:18 for Cu₂O. This comparison does not make a unique equation from product masses without the supplied candidates.`,
    };
  }
  if (mode === "fraction")
    return {
      correct:
        Number(b.oxygenRatio) === 3.5 &&
        Number(b.multiplier) === 2 &&
        b.ethane === 2 &&
        b.oxygen === 7 &&
        b.carbonDioxide === 4 &&
        b.water === 6,
      feedback:
        "Reacted masses 3 g C₂H₆, 11.2 g O₂, 8.8 g CO₂ and 5.4 g H₂O give amounts 0.1:0.35:0.2:0.3 mol. Divide all by0.1: 1:3.5:2:3. Multiply every entry by2, not just oxygen: 2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O. Do not round3.5 down to3 or up to4. 4:14:8:12 is balanced but not smallest.",
    };
  return {
    correct:
      Number(b.oxygenMass) === 4 &&
      Number(b.mgAmount) === 0.25 &&
      Number(b.oxygenAmount) === 0.125 &&
      Number(b.oxideAmount) === 0.25 &&
      b.ratio === "2:1:2",
    feedback:
      "Initial6 g Mg and10 g O₂ produce10 g MgO, with6 g O₂ remaining. Reacted O₂ mass=10−6=4 g. Amounts:6/24=.25 mol Mg,4/32=.125 mol O₂,10/40=.25 mol MgO. Normalize to2:1:2. Do not use all initial excess oxygen as though it reacted. Total mass16 g is retained as10 g oxide +6 g unreacted oxygen; leftovers are excluded from the reaction ratio, not discarded from mass conservation.",
  };
}
