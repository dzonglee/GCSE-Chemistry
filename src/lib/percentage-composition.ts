import { massLedger } from "./formula-mass";
export const compositionCases = {
  CaCO3: { formula: "CaCO3", element: "Ca", ar: { Ca: 40, C: 12, O: 16 } },
  MgO: { formula: "MgO", element: "Mg", ar: { Mg: 24, O: 16 } },
  CO2: { formula: "CO2", element: "O", ar: { C: 12, O: 16 } },
  urea: { formula: "CH4N2O", ar: { C: 12, H: 1, N: 14, O: 16 } },
  nitrate: { formula: "NH4NO3", ar: { N: 14, H: 1, O: 16 } },
  sulfate: { formula: "(NH4)2SO4", ar: { N: 14, H: 1, S: 32, O: 16 } },
} as const;
export function compositionData(
  formula: string,
  ar: Record<string, number>,
  element: string,
) {
  const ledger = massLedger(formula, ar),
    row = ledger.rows.find((r) => r.element === element);
  if (!row) throw Error("Element must occur in the supplied formula");
  const atoms = ledger.rows.reduce((sum, r) => sum + r.count, 0);
  return {
    ...ledger,
    element,
    count: row.count,
    contribution: row.contribution,
    percent: (row.contribution / ledger.total) * 100,
    atomPercent: (row.count / atoms) * 100,
  };
}
export function roundOne(value: number) {
  if (!Number.isFinite(value)) throw Error("Use a finite value");
  return Math.round(value * 10) / 10;
}
export type CompositionMode =
  "contribution" | "count-mass" | "sample" | "compare";
export function initialCompositionBoard(
  mode: CompositionMode,
): Record<string, string | number> {
  switch (mode) {
    case "contribution":
      return {
        compound: "CaCO3",
        numerator: "unset",
        denominator: "unset",
        percent: "unset",
      };
    case "count-mass":
      return { compound: "MgO", basis: "unset", percent: "unset" };
    case "sample":
      return { sample: 10, elementMass: "unset", percent: "unset" };
    case "compare":
      return { element: "N", winner: "unset", basis: "unset" };
  }
}
export function validCompositionBoard(mode: CompositionMode, v: unknown) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const b = v as Record<string, unknown>,
    initial = initialCompositionBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const one = (k: string, values: unknown[]) => values.includes(b[k]);
  switch (mode) {
    case "contribution":
      return (
        one("compound", ["CaCO3", "MgO", "CO2"]) &&
        one("numerator", [
          "unset",
          "40",
          "24",
          "32",
          "16",
          "48",
          "12",
          "1",
          "2",
          "3",
        ]) &&
        one("denominator", [
          "unset",
          "100",
          "40",
          "44",
          "60",
          "80",
          "132",
          "5",
          "3",
          "2",
        ]) &&
        one("percent", ["unset", "40", "60", "72.7", "20", "50", "66.7", ".4"])
      );
    case "count-mass":
      return (
        one("compound", ["MgO", "CO2"]) &&
        one("basis", ["unset", "mass", "count"]) &&
        one("percent", ["unset", "60", "72.7", "50", "66.7", "40"])
      );
    case "sample":
      return (
        one("sample", [10, 25, 50]) &&
        one("elementMass", ["unset", "4", "10", "20", "40", "100"]) &&
        one("percent", ["unset", "40", "4", "10", "20", ".4"])
      );
    case "compare":
      return (
        one("element", ["N", "O"]) &&
        one("winner", ["unset", "urea", "nitrate", "sulfate"]) &&
        one("basis", ["unset", "mass", "count", "safe"])
      );
  }
}
export function compositionPrediction(
  mode: CompositionMode,
  b: Record<string, string | number>,
) {
  let correct = false,
    feedback = "";
  switch (mode) {
    case "contribution": {
      const spec = compositionCases[b.compound as "CaCO3" | "MgO" | "CO2"],
        d = compositionData(spec.formula, spec.ar, spec.element);
      correct =
        Number(b.numerator) === d.contribution &&
        Number(b.denominator) === d.total &&
        Number(b.percent) === roundOne(d.percent);
      feedback = correct
        ? "Include every atom of the named element in count×Aᵣ, divide by the complete compound Mᵣ, then multiply by 100. The mass percentage is dimensionless and reported with %."
        : "Check both chemical quantities: the named element’s complete mass contribution goes above the complete compound Mᵣ. Atom counts alone do not give mass percentage.";
      break;
    }
    case "count-mass": {
      const spec = compositionCases[b.compound as "MgO" | "CO2"],
        d = compositionData(spec.formula, spec.ar, spec.element);
      correct = b.basis === "mass" && Number(b.percent) === roundOne(d.percent);
      feedback = correct
        ? "Mass percentage weights each element by count×Aᵣ. Equal atom counts need not contribute equal mass; use the mass strip, not the atom-count strip."
        : "The question asks percentage by mass. Use count×Aᵣ over total Mᵣ, rather than the number of atoms over all atom counts.";
      break;
    }
    case "sample":
      correct =
        Number(b.elementMass) === Number(b.sample) * 0.4 && b.percent === "40";
      feedback = correct
        ? "For pure CaCO₃ with the supplied relative masses, calcium is 40% by mass. Scaling the sample scales calcium mass and total mass together, leaving the percentage unchanged."
        : "The sample is the same pure compound. Calcium mass is 0.40×sample mass; the percentage stays 40%, rather than becoming the numerical number of grams.";
      break;
    case "compare": {
      const compounds = ["urea", "nitrate", "sulfate"] as const,
        winner = compounds.slice().sort((a, c) => {
          const x = compositionCases[a],
            y = compositionCases[c];
          return (
            compositionData(y.formula, y.ar, String(b.element)).percent -
            compositionData(x.formula, x.ar, String(b.element)).percent
          );
        })[0];
      correct = b.winner === winner && b.basis === "mass";
      feedback = correct
        ? "Compare the named element’s count×Aᵣ contribution divided by each complete Mᵣ. The highest mass fraction supplies the most of that element for equal pure-compound masses. This does not establish universal practical suitability."
        : "Compare mass fractions for the currently named element. The largest atom count or a general safety claim is not the required calculation.";
      break;
    }
  }
  return { correct, feedback };
}
