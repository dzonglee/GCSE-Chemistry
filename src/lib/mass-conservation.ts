import { massLedger } from "./formula-mass";
import { balanceLedger, balanceCases } from "./equation-balancing";
export type MassMode = "inventory" | "gas" | "oxidation" | "weighted";
export function gasMassBalance(closed: boolean, stage: number) {
  if (!Number.isInteger(stage) || stage < 0 || stage > 3)
    throw Error("Use a release stage from zero to three");
  const escaped = closed ? 0 : stage,
    escapedMass = escaped * 1.5;
  return {
    escaped,
    escapedMass,
    retainedGas: 4.5 - escapedMass,
    contents: 25 - escapedMass,
    reading: 75 - escapedMass,
    allMaterial: 75,
    packets: Array.from({ length: 3 }, (_, id) => ({
      id,
      grams: 1.5,
      inside: id >= escaped,
    })),
  };
}
export const inventoryCases = {
  complete: {
    apparatus: 50,
    reactants: [12, 8],
    products: [14, 6],
    unreacted: 0,
  },
  leftover: { apparatus: 50, reactants: [10, 7], products: [13], unreacted: 4 },
} as const;
export function inventoryMass(
  caseId: keyof typeof inventoryCases,
  boundary: "contents" | "apparatus",
) {
  const s = inventoryCases[caseId],
    initial = s.reactants.reduce<number>((sum, v) => sum + v, 0),
    products = s.products.reduce<number>((sum, v) => sum + v, 0);
  return {
    initial,
    products,
    unreacted: s.unreacted,
    afterContents: products + s.unreacted,
    reading:
      products + s.unreacted + (boundary === "apparatus" ? s.apparatus : 0),
  };
}
export function oxidationMass(scale: number, boundary: "sample" | "closed") {
  if (scale !== 1 && scale !== 2) throw Error("Use supplied scale 1 or 2");
  const magnesium = 12 * scale,
    oxygen = 8 * scale;
  return {
    magnesium,
    oxygen,
    oxide: magnesium + oxygen,
    before: boundary === "sample" ? magnesium : magnesium + oxygen,
    after: magnesium + oxygen,
    gain: boundary === "sample" ? oxygen : 0,
  };
}
export function weightedMass(
  reaction: "water" | "magnesium",
  coefficients: number[],
) {
  const s = balanceCases[reaction],
    formulas = [...s.left, ...s.right],
    ar = { H: 1, O: 16, Mg: 24 },
    rows = formulas.map((formula, i) => ({
      formula,
      mr: massLedger(formula, ar).total,
      coefficient: coefficients[i],
      weighted: massLedger(formula, ar).total * coefficients[i],
    })),
    left = rows.slice(0, s.left.length).reduce((sum, r) => sum + r.weighted, 0),
    right = rows.slice(s.left.length).reduce((sum, r) => sum + r.weighted, 0),
    atoms = balanceLedger(s.left, s.right, coefficients);
  return { rows, left, right, atoms };
}
export function initialMassBoard(
  mode: MassMode,
): Record<string, string | number> {
  switch (mode) {
    case "inventory":
      return {
        case: "complete",
        boundary: "apparatus",
        reading: "unset",
        productTotal: "unset",
      };
    case "gas":
      return { closure: "closed", stage: 0, reading: "unset", reason: "unset" };
    case "oxidation":
      return {
        scale: 1,
        boundary: "sample",
        after: "unset",
        gain: "unset",
        reason: "unset",
      };
    case "weighted":
      return {
        reaction: "water",
        a: 1,
        b: 1,
        c: 1,
        left: "unset",
        right: "unset",
      };
  }
}
export function validMassBoard(mode: MassMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    init = initialMassBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(init).length ||
    Object.keys(init).some((k) => !(k in b))
  )
    return false;
  const one = (k: string, values: unknown[]) => values.includes(b[k]);
  switch (mode) {
    case "inventory":
      return (
        one("case", ["complete", "leftover"]) &&
        one("boundary", ["contents", "apparatus"]) &&
        one("reading", ["unset", "20", "70", "17", "67", "13", "50", "4"]) &&
        one("productTotal", ["unset", "20", "17", "13", "70", "67"])
      );
    case "gas":
      return (
        one("closure", ["closed", "open"]) &&
        one("stage", [0, 1, 2, 3]) &&
        one("reading", [
          "unset",
          "75",
          "73.5",
          "72",
          "70.5",
          "25",
          "4.5",
          "20.5",
        ]) &&
        one("reason", [
          "unset",
          "retained",
          "escaped",
          "destroyed",
          "weightless",
        ])
      );
    case "oxidation":
      return (
        one("scale", [1, 2]) &&
        one("boundary", ["sample", "closed"]) &&
        one("after", ["unset", "20", "40", "12", "24", "8", "16"]) &&
        one("gain", ["unset", "0", "8", "16", "12", "24"]) &&
        one("reason", ["unset", "entered", "retained", "created", "heat"])
      );
    case "weighted":
      return (
        one("reaction", ["water", "magnesium"]) &&
        ["a", "b", "c"].every((k) => one(k, [1, 2, 3, 4])) &&
        one("left", [
          "unset",
          "34",
          "36",
          "68",
          "72",
          "56",
          "80",
          "160",
          "2",
          "32",
        ]) &&
        one("right", ["unset", "18", "36", "40", "80", "160", "72", "34"])
      );
  }
}
export function massPrediction(
  mode: MassMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "inventory": {
      const d = inventoryMass(
          b.case as "complete" | "leftover",
          b.boundary as "contents" | "apparatus",
        ),
        correct =
          Number(b.reading) === d.reading &&
          Number(b.productTotal) === d.products;
      return {
        correct,
        feedback: correct
          ? "Include all retained material in the weighed system. Apparatus contributes only when that boundary includes it. Unreacted material is retained matter, but is not newly formed product."
          : "Distinguish product mass, all contents and apparatus-plus-contents. If some reactant remains, include it in retained contents rather than calling it a product.",
      };
    }
    case "gas": {
      const d = gasMassBalance(b.closure === "closed", Number(b.stage)),
        correct =
          Number(b.reading) === d.reading &&
          b.reason === (d.escaped > 0 ? "escaped" : "retained");
      return {
        correct,
        feedback: correct
          ? d.escaped > 0
            ? "The balance reading decreases only by the CO₂ mass that crosses out of the weighed system. Include that gas in the wider accounting: the total material remains 75 g."
            : "No material crosses the weighed boundary. Gas inside the closed system still has mass, and the total reading remains 75 g."
          : "Track whether gas actually crosses the weighed boundary. Gas formation alone does not remove mass. An open boundary can lose gas; a closed one retains it. The escaped gas still exists.",
      };
    }
    case "oxidation": {
      const d = oxidationMass(
          Number(b.scale),
          b.boundary as "sample" | "closed",
        ),
        correct =
          Number(b.after) === d.after &&
          Number(b.gain) === d.gain &&
          b.reason === (b.boundary === "sample" ? "entered" : "retained");
      return {
        correct,
        feedback: correct
          ? b.boundary === "sample"
            ? "The oxide includes oxygen that was outside the original weighed magnesium sample. Its gain is the oxygen mass added, not creation of matter or the mass of heat."
            : "The closed accounting already includes magnesium and the reacting oxygen. Their combined mass is unchanged as oxide forms."
          : "Keep the boundary explicit. The solid-only comparison gains the reacting oxygen mass; the whole closed accounting includes that oxygen from the start. Heat does not create the extra product mass.",
      };
    }
    case "weighted": {
      const d = weightedMass(b.reaction as "water" | "magnesium", [
          Number(b.a),
          Number(b.b),
          Number(b.c),
        ]),
        correct =
          d.atoms.balanced &&
          Number(b.left) === d.left &&
          Number(b.right) === d.right;
      return {
        correct,
        feedback: correct
          ? "Multiply each complete Mᵣ by its equation coefficient before adding. The weighted totals and all element counts agree. These are relative-mass bookkeeping totals, not a measured sample mass in grams."
          : "First balance every element with fixed formulas. Then multiply every complete Mᵣ by its own coefficient and add each side separately. Do not add unweighted Mᵣ values or treat coefficient ratios as gram ratios.",
      };
    }
  }
}
