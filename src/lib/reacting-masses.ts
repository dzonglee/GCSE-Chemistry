export type ReactionMode = "ratio" | "forward" | "required" | "conserved";
export const reactingCases = {
  ammonia: {
    equation: "N₂ + 3H₂ → 2NH₃",
    given: "N₂",
    requested: "NH₃",
    givenCoefficient: 1,
    requestedCoefficient: 2,
    givenM: 28,
    requestedM: 17,
    masses: [14, 28, 56],
    ar: "N=14; H=1",
  },
  water: {
    equation: "2H₂ + O₂ → 2H₂O",
    given: "O₂",
    requested: "H₂O",
    givenCoefficient: 1,
    requestedCoefficient: 2,
    givenM: 32,
    requestedM: 18,
    masses: [16, 32, 64],
    ar: "H=1; O=16",
  },
  magnesium: {
    equation: "2Mg + O₂ → 2MgO",
    given: "Mg",
    requested: "MgO",
    givenCoefficient: 2,
    requestedCoefficient: 2,
    givenM: 24,
    requestedM: 40,
    masses: [6, 12, 24],
    ar: "Mg=24; O=16",
  },
  silica: {
    equation: "2Mg + SiO₂ → Si + 2MgO",
    given: "SiO₂",
    requested: "Mg",
    givenCoefficient: 1,
    requestedCoefficient: 2,
    givenM: 60,
    requestedM: 24,
    masses: [60, 300, 1200],
    ar: "Mg=24; Si=28; O=16",
  },
} as const;
export const ratioCases = {
  nitrogen: {
    given: "N₂",
    requested: "NH₃",
    givenCoefficient: 1,
    requestedCoefficient: 2,
    amount: 0.5,
  },
  hydrogen: {
    given: "H₂",
    requested: "NH₃",
    givenCoefficient: 3,
    requestedCoefficient: 2,
    amount: 1.5,
  },
  reverse: {
    given: "NH₃",
    requested: "H₂",
    givenCoefficient: 2,
    requestedCoefficient: 3,
    amount: 2,
  },
} as const;
export function scaleReactionAmount(
  amount: number,
  givenCoefficient: number,
  requestedCoefficient: number,
) {
  if (
    ![amount, givenCoefficient, requestedCoefficient].every(
      (v) => Number.isFinite(v) && v > 0,
    )
  )
    throw Error("Positive finite amounts and coefficients required");
  const result = (amount / givenCoefficient) * requestedCoefficient;
  if (!Number.isFinite(result) || result <= 0)
    throw Error("Unrepresentable amount");
  return result;
}
export function reactionMass(
  grams: number,
  givenM: number,
  givenCoefficient: number,
  requestedM: number,
  requestedCoefficient: number,
) {
  if (![grams, givenM, requestedM].every((v) => Number.isFinite(v) && v > 0))
    throw Error("Positive finite masses required");
  const givenAmount = grams / givenM,
    requestedAmount = scaleReactionAmount(
      givenAmount,
      givenCoefficient,
      requestedCoefficient,
    ),
    mass = requestedAmount * requestedM;
  if (!Number.isFinite(mass) || mass <= 0) throw Error("Unrepresentable mass");
  return { givenAmount, requestedAmount, mass };
}
const predictions = [
  ...new Set([
    "unset",
    "0.25",
    "0.5",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "10",
    "20",
    "40",
    "60",
    "300",
    "1200",
    "1.2",
    "6",
    "12",
    "14",
    "16",
    "17",
    "18",
    "24",
    "28",
    "32",
    "34",
    "36",
    "40",
    "48",
    "56",
    "64",
    "68",
    "72",
    "240",
    "600",
    "960",
    "2400",
    "8",
  ]),
];
export const reactingChoices = {
  ratio: {
    example: ["nitrogen", "hydrogen", "reverse"],
    givenCoefficient: ["unset", "1", "2", "3", "6"],
    requestedCoefficient: ["unset", "1", "2", "3", "6"],
    requestedAmount: ["unset", "0.25", "0.5", "1", "2", "3", "4", "6"],
  },
  forward: {
    reaction: ["ammonia", "water", "magnesium"],
    size: ["small", "middle", "large"],
    givenAmount: predictions,
    requestedAmount: predictions,
    mass: predictions,
  },
  required: {
    size: ["small", "middle", "large"],
    unit: ["kg", "g"],
    grams: predictions,
    givenAmount: predictions,
    requestedAmount: predictions,
    mass: predictions,
  },
  conserved: {
    scale: [0.5, 1, 2],
    beforeAmount: predictions,
    afterAmount: predictions,
    beforeMass: predictions,
    afterMass: predictions,
  },
} as const;
export function initialReactingBoard(
  mode: ReactionMode,
): Record<string, string | number> {
  switch (mode) {
    case "ratio":
      return {
        example: "nitrogen",
        givenCoefficient: "unset",
        requestedCoefficient: "unset",
        requestedAmount: "unset",
      };
    case "forward":
      return {
        reaction: "ammonia",
        size: "small",
        givenAmount: "unset",
        requestedAmount: "unset",
        mass: "unset",
      };
    case "required":
      return {
        size: "large",
        unit: "kg",
        grams: "unset",
        givenAmount: "unset",
        requestedAmount: "unset",
        mass: "unset",
      };
    case "conserved":
      return {
        scale: 1,
        beforeAmount: "unset",
        afterAmount: "unset",
        beforeMass: "unset",
        afterMass: "unset",
      };
  }
}
export function validReactingBoard(mode: ReactionMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    options = reactingChoices[mode];
  return (
    Object.keys(b).length === Object.keys(options).length &&
    Object.entries(options).every(([k, v]) =>
      (v as readonly unknown[]).includes(b[k]),
    )
  );
}
export function reactingData(
  mode: "forward" | "required",
  b: Record<string, string | number>,
) {
  const d =
      mode === "required"
        ? reactingCases.silica
        : reactingCases[b.reaction as "ammonia" | "water" | "magnesium"],
    grams = d.masses[["small", "middle", "large"].indexOf(String(b.size))];
  return {
    ...d,
    grams,
    ...reactionMass(
      grams,
      d.givenM,
      d.givenCoefficient,
      d.requestedM,
      d.requestedCoefficient,
    ),
  };
}
export function reactingPrediction(
  mode: ReactionMode,
  b: Record<string, string | number>,
) {
  if (mode === "ratio") {
    const d = ratioCases[b.example as keyof typeof ratioCases],
      amount = scaleReactionAmount(
        d.amount,
        d.givenCoefficient,
        d.requestedCoefficient,
      );
    return {
      correct:
        Number(b.givenCoefficient) === d.givenCoefficient &&
        Number(b.requestedCoefficient) === d.requestedCoefficient &&
        Number(b.requestedAmount) === amount,
      feedback: `The given ${d.given} coefficient is ${d.givenCoefficient}; the requested ${d.requested} coefficient is ${d.requestedCoefficient}. Requested amount = ${d.amount} × (${d.requestedCoefficient} ÷ ${d.givenCoefficient}) = ${amount} mol. The known amount belongs to the named substance, not the whole coefficient total.`,
    };
  }
  if (mode === "conserved") {
    const s = Number(b.scale);
    return {
      correct:
        Number(b.beforeAmount) === 4 * s &&
        Number(b.afterAmount) === 2 * s &&
        Number(b.beforeMass) === 34 * s &&
        Number(b.afterMass) === 34 * s,
      feedback: `Before: ${s} mol N₂ + ${3 * s} mol H₂ = ${4 * s} mol molecules, mass ${s}×28 + ${3 * s}×2 = ${34 * s} g. After complete theoretical conversion: ${2 * s} mol NH₃, mass ${2 * s}×17 = ${34 * s} g. Atom amounts and total mass are conserved; total molecular amount is not. This does not assert complete conversion in a real reversible Haber process.`,
    };
  }
  const d = reactingData(mode, b);
  return {
    correct:
      (mode !== "required" || Number(b.grams) === d.grams) &&
      Number(b.givenAmount) === d.givenAmount &&
      Number(b.requestedAmount) === d.requestedAmount &&
      Number(b.mass) === d.mass,
    feedback: `Use ${d.grams} g ${d.given}. Given amount = ${d.grams} ÷ ${d.givenM} = ${d.givenAmount} mol. Requested ${d.requested} amount = ${d.givenAmount} × (${d.requestedCoefficient} ÷ ${d.givenCoefficient}) = ${d.requestedAmount} mol. Requested mass = ${d.requestedAmount} × ${d.requestedM} = ${d.mass} g. Equivalently, the mass ratio is (${d.requestedCoefficient} × ${d.requestedM}) : (${d.givenCoefficient} × ${d.givenM}), not the bare coefficient ratio. ${mode === "required" ? "Both named substances are reactants: calculate the magnesium required, not a product mass." : "Assume complete theoretical conversion of the given reactant with the other reactant in excess."}`,
  };
}
