/** Limited chemical-formula grammar: symbols, positive subscripts and brackets.
 * Coefficients, charges and hydration dots are deliberately not formula counts. */
export function formulaCounts(formula: string): Record<string, number> {
  if (!formula || formula.length > 80) throw Error("Use a supported formula");
  let index = 0;
  const multiplier = () => {
    const token = formula.slice(index).match(/^\d+/)?.[0];
    if (!token) return 1;
    if (!/^[1-9]\d*$/.test(token) || Number(token) > 256)
      throw Error("Use a positive bounded subscript");
    index += token.length;
    return Number(token);
  };
  const group = (depth: number): Record<string, number> => {
    if (depth > 4) throw Error("Too many brackets");
    const counts: Record<string, number> = {};
    let terms = 0;
    while (index < formula.length && formula[index] !== ")") {
      let part: Record<string, number>;
      if (formula[index] === "(") {
        index++;
        part = group(depth + 1);
        if (formula[index] !== ")") throw Error("Close the bracket");
        index++;
      } else {
        const symbol = formula.slice(index).match(/^[A-Z][a-z]?/)?.[0];
        if (!symbol)
          throw Error("Use chemical symbols, not coefficients or charges");
        index += symbol.length;
        part = { [symbol]: 1 };
      }
      const factor = multiplier();
      for (const [symbol, n] of Object.entries(part)) {
        counts[symbol] = (counts[symbol] ?? 0) + n * factor;
        if (counts[symbol] > 2048) throw Error("Formula count too large");
      }
      terms++;
    }
    if (!terms) throw Error("Empty group");
    return counts;
  };
  const result = group(0);
  if (index !== formula.length) throw Error("Unexpected closing bracket");
  return result;
}
export function massLedger(
  formula: string,
  relativeMasses: Record<string, number>,
) {
  const counts = formulaCounts(formula),
    rows = Object.entries(counts).map(([element, count]) => {
      const ar = relativeMasses[element];
      if (!Number.isFinite(ar) || ar <= 0)
        throw Error("Supply positive relative atomic masses for every element");
      return { element, count, ar, contribution: count * ar };
    });
  return { rows, total: rows.reduce((sum, r) => sum + r.contribution, 0) };
}
export const formulaMassCases = {
  H2O: { formula: "H2O", kind: "molecular", ar: { H: 1, O: 16 } },
  CO2: { formula: "CO2", kind: "molecular", ar: { C: 12, O: 16 } },
  MgCl2: { formula: "MgCl2", kind: "ionic", ar: { Mg: 24, Cl: 35.5 } },
  NaCl: { formula: "NaCl", kind: "ionic", ar: { Na: 23, Cl: 35.5 } },
  CaOH: { formula: "Ca(OH)2", kind: "ionic", ar: { Ca: 40, O: 16, H: 1 } },
  MgNO3: { formula: "Mg(NO3)2", kind: "ionic", ar: { Mg: 24, N: 14, O: 16 } },
} as const;
export type FormulaMassMode = "count" | "mass" | "brackets" | "quantity";
export function initialFormulaMassBoard(
  mode: FormulaMassMode,
): Record<string, string | number> {
  switch (mode) {
    case "count":
      return { formula: "H2O", countA: "unset", countB: "unset" };
    case "mass":
      return {
        formula: "MgCl2",
        countA: "unset",
        countB: "unset",
        total: "unset",
      };
    case "brackets":
      return {
        formula: "CaOH",
        countA: "unset",
        countB: "unset",
        countC: "unset",
      };
    case "quantity":
      return {
        coefficient: 2,
        hydrogen: "unset",
        oxygen: "unset",
        mr: "unset",
      };
  }
}
export function validFormulaMassBoard(mode: FormulaMassMode, v: unknown) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const b = v as Record<string, unknown>,
    initial = initialFormulaMassBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const one = (k: string, values: unknown[]) => values.includes(b[k]),
    count = (k: string) =>
      one(k, ["unset", "0", "1", "2", "3", "4", "6", "8", "12"]);
  switch (mode) {
    case "count":
      return (
        one("formula", ["H2O", "CO2"]) && count("countA") && count("countB")
      );
    case "mass":
      return (
        one("formula", ["MgCl2", "NaCl"]) &&
        count("countA") &&
        count("countB") &&
        one("total", ["unset", "59.5", "58.5", "95", "71", "24", "23", "119"])
      );
    case "brackets":
      return (
        one("formula", ["CaOH", "MgNO3"]) &&
        count("countA") &&
        count("countB") &&
        count("countC")
      );
    case "quantity":
      return (
        one("coefficient", [1, 2, 3]) &&
        count("hydrogen") &&
        count("oxygen") &&
        one("mr", ["unset", "18", "36", "54", "17"])
      );
  }
}
export function formulaMassPrediction(
  mode: FormulaMassMode,
  b: Record<string, string | number>,
) {
  let correct = false,
    feedback = "";
  if (mode === "quantity") {
    const n = Number(b.coefficient);
    correct =
      Number(b.hydrogen) === 2 * n && Number(b.oxygen) === n && b.mr === "18";
    feedback = correct
      ? "The coefficient scales the number of complete H₂O molecules and total atoms represented. Each water formula still has Mᵣ = 2×1 +16 =18, without units."
      : "Count all represented molecules, but calculate Mᵣ for one H₂O formula. A coefficient changes quantity, not the chemical formula or its Mᵣ.";
  } else {
    const spec = formulaMassCases[b.formula as keyof typeof formulaMassCases],
      ledger = massLedger(spec.formula, spec.ar),
      keys = ["countA", "countB", "countC"];
    correct =
      ledger.rows.every((r, i) => Number(b[keys[i]]) === r.count) &&
      (mode !== "mass" || Number(b.total) === ledger.total);
    feedback = correct
      ? mode === "mass"
        ? "Correct counts give the individual count×Aᵣ contributions and their sum. Mᵣ is a relative ratio, so it has no units."
        : mode === "brackets"
          ? "The outside subscript multiplies every atom inside the bracket, while symbols outside keep their own subscripts. This ionic formula gives proportions, not an isolated molecule."
          : "A subscript belongs to the preceding symbol. A missing subscript means one. The molecular model and the formula show the same atom counts."
      : mode === "brackets"
        ? "Apply the bracket multiplier to every enclosed atom, including an atom whose internal subscript is omitted. Keep the outside metal count separate."
        : "Read each element count before substituting Aᵣ. Keep a two-letter symbol such as Cl together, then add all count×Aᵣ contributions.";
  }
  return { correct, feedback };
}
