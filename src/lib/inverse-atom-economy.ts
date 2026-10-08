import type { WorkbenchState } from "@/content/types";
import { readNumber } from "./marking";

export type InverseEconomyMode =
  "allocation" | "equation" | "complement" | "solve";

/** Relative equation contributions, not measured sample masses. */
export function inverseAtomicMass(
  percent: number,
  other: number,
  coefficient: number,
) {
  if (
    !Number.isFinite(percent) ||
    percent <= 0 ||
    percent >= 100 ||
    !Number.isFinite(other) ||
    other <= 0 ||
    !Number.isInteger(coefficient) ||
    coefficient < 1
  )
    throw Error(
      "Use a percentage between 0 and 100 and positive equation contributions.",
    );
  return (percent * other) / (coefficient * (100 - percent));
}
export const inverseEconomyRatios = {
  unset: "Choose a relationship",
  weighted: "2x ÷ (2x + 132) × 100",
  unweighted: "x ÷ (2x + 132) × 100",
  other: "132 ÷ (2x + 132) × 100",
  omitted: "2x ÷ 132 × 100",
};
export function initialInverseEconomyBoard(
  mode: InverseEconomyMode,
): WorkbenchState {
  return {
    mode,
    contribution: "",
    ratio: "unset",
    otherPercent: "",
    atomicMass: "",
  };
}
export function validInverseEconomyBoard(
  mode: InverseEconomyMode,
  b: WorkbenchState,
) {
  return (
    Object.keys(b).length === 5 &&
    b.mode === mode &&
    ["contribution", "otherPercent", "atomicMass"].every(
      (k) => typeof b[k] === "string" && String(b[k]).length <= 100,
    ) &&
    typeof b.ratio === "string" &&
    Object.hasOwn(inverseEconomyRatios, b.ratio)
  );
}
export function inverseEconomyPrediction(
  mode: InverseEconomyMode,
  b: WorkbenchState,
) {
  const key =
    mode === "allocation"
      ? "contribution"
      : mode === "complement"
        ? "otherPercent"
        : "atomicMass";
  const value = readNumber(String(b[key]));
  if (mode !== "equation" && value === null)
    return {
      correct: false,
      feedback: "Enter a number; your original entry stays in the model.",
    };
  const correct =
    mode === "allocation"
      ? value === 132
      : mode === "equation"
        ? b.ratio === "weighted"
        : mode === "complement"
          ? value !== null && Math.abs(value - 54.1) < 1e-9
          : value !== null &&
            Math.abs(value - inverseAtomicMass(45.9, 132, 2)) <= 0.05;
  const feedback =
    mode === "allocation"
      ? correct
        ? "Three CO₂ contributions give 3 × (12 + 2 × 16) = 132. These are relative contributions, not grams."
        : "Count every atom in all three CO₂ contributions: 3 × (12 + 2 × 16)."
      : mode === "equation"
        ? correct
          ? "Both metal contributions give 2x. The complete conserved total is 2x + 132; x occurs in numerator and denominator."
          : b.ratio === "unweighted"
            ? "The desired product is 2M: include its coefficient in the numerator."
            : b.ratio === "other"
              ? "132 belongs to the other product. The desired metal contribution belongs in the numerator."
              : "The denominator must contain all reactant contributions, including the metal."
        : mode === "complement"
          ? correct
            ? "The other products account for 100 − 45.9 = 54.1% of the conserved total."
            : "Desired and other products together account for 100% of the equation mass."
          : correct
            ? "This proposed atomic mass reproduces 45.9% to the supplied precision. To three significant figures, Ar(M) = 56.0. It does not uniquely identify the metal."
            : "Check the prediction against 45.9%. Solve 200x = 45.9(2x + 132), or use the other-product percentage; then divide the desired contribution by 2.";
  return { correct, feedback };
}
