import { formulaCounts } from "./formula-mass";
export const balanceCases = {
  water: { left: ["H2", "O2"], right: ["H2O"], least: [2, 1, 2] },
  magnesium: { left: ["Mg", "O2"], right: ["MgO"], least: [2, 1, 2] },
  aluminium: { left: ["Al", "O2"], right: ["Al2O3"], least: [4, 3, 2] },
  methane: { left: ["CH4", "O2"], right: ["CO2", "H2O"], least: [1, 2, 1, 2] },
  ethane: { left: ["C2H6", "O2"], right: ["CO2", "H2O"], least: [2, 7, 4, 6] },
  ammonia: { left: ["N2", "H2"], right: ["NH3"], least: [1, 3, 2] },
  potassium: { left: ["K", "H2O"], right: ["KOH", "H2"], least: [2, 2, 2, 1] },
} as const;
export type BalanceCase = keyof typeof balanceCases;
export type BalanceMode = "ledger" | "molecules" | "identity" | "words";
export function balanceLedger(
  left: readonly string[],
  right: readonly string[],
  coefficients: readonly number[],
) {
  if (
    coefficients.length !== left.length + right.length ||
    coefficients.some((v) => !Number.isFinite(v) || v <= 0)
  )
    throw Error("Supply positive coefficients for every formula");
  const side = (formulas: readonly string[], offset: number) => {
    const counts: Record<string, number> = {};
    formulas.forEach((f, i) => {
      for (const [element, count] of Object.entries(formulaCounts(f)))
        counts[element] =
          (counts[element] ?? 0) + count * coefficients[offset + i];
    });
    return counts;
  };
  const reactants = side(left, 0),
    products = side(right, left.length),
    elements = [
      ...new Set([...Object.keys(reactants), ...Object.keys(products)]),
    ];
  const rows = elements.map((element) => ({
    element,
    left: reactants[element] ?? 0,
    right: products[element] ?? 0,
  }));
  const balanced = rows.every((r) => r.left === r.right),
    integer = coefficients.every(Number.isInteger);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = integer ? coefficients.reduce(gcd) : null;
  return {
    rows,
    balanced,
    integer,
    divisor,
    smallest: balanced && integer && divisor === 1,
  };
}
export function initialBalanceBoard(
  mode: BalanceMode,
): Record<string, string | number> {
  if (mode === "identity") return { product: "H2O2", reason: "unset" };
  if (mode === "words")
    return { hydroxide: "unset", hydrogen: "unset", a: 1, b: 1, c: 1, d: 1 };
  return mode === "ledger"
    ? { reaction: "water", a: 1, b: 1, c: 1 }
    : { reaction: "methane", a: 1, b: 1, c: 1, d: 1 };
}
export function validBalanceBoard(mode: BalanceMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    init = initialBalanceBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(init).length ||
    Object.keys(init).some((k) => !(k in b))
  )
    return false;
  const one = (key: string, values: unknown[]) => values.includes(b[key]);
  if (mode === "identity")
    return (
      one("product", ["H2O", "H2O2"]) &&
      one("reason", ["unset", "identity", "counts", "both"])
    );
  const coefficients = ["a", "b", "c", ...(mode === "ledger" ? [] : ["d"])];
  if (
    !coefficients.every(
      (k) =>
        typeof b[k] === "number" &&
        one(k, [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8]),
    )
  )
    return false;
  if (mode === "words")
    return (
      one("hydroxide", ["unset", "KOH", "KO"]) &&
      one("hydrogen", ["unset", "H2", "H"])
    );
  return one(
    "reaction",
    mode === "ledger"
      ? ["water", "magnesium", "aluminium"]
      : ["methane", "ethane"],
  );
}
export function boardReaction(
  mode: BalanceMode,
  b: Record<string, string | number>,
) {
  if (mode === "identity")
    return {
      left: ["H2", "O2"],
      right: [String(b.product)],
      coefficients: [1, 1, 1],
    };
  if (mode === "words")
    return {
      left: ["K", "H2O"],
      right: [
        b.hydroxide === "unset" ? "KOH" : String(b.hydroxide),
        b.hydrogen === "unset" ? "H2" : String(b.hydrogen),
      ],
      coefficients: [Number(b.a), Number(b.b), Number(b.c), Number(b.d)],
    };
  const s = balanceCases[b.reaction as BalanceCase];
  return {
    left: [...s.left],
    right: [...s.right],
    coefficients: ["a", "b", "c", ...(mode === "ledger" ? [] : ["d"])].map(
      (k) => Number(b[k]),
    ),
  };
}
export function balancePrediction(
  mode: BalanceMode,
  b: Record<string, string | number>,
) {
  const r = boardReaction(mode, b),
    ledger = balanceLedger(r.left, r.right, r.coefficients);
  if (mode === "identity")
    return {
      correct: b.product === "H2O" && b.reason === "identity",
      feedback:
        b.product === "H2O2"
          ? "H₂ + O₂ → H₂O₂ conserves atom counts, but makes hydrogen peroxide, not the specified water. Restore H₂O and balance using coefficients."
          : b.reason === "identity"
            ? "H₂O keeps water’s identity. The all-one equation is still unbalanced: use 2H₂ + O₂ → 2H₂O."
            : "Distinguish the specified substance from atom balance. H₂O is water; H₂O₂ is a different compound.",
    };
  if (mode === "words" && (b.hydroxide !== "KOH" || b.hydrogen !== "H2"))
    return {
      correct: false,
      feedback:
        "First preserve the named products: potassium hydroxide is KOH and hydrogen gas is H₂. Atom equality cannot repair a wrong product formula.",
    };
  if (!ledger.balanced)
    return {
      correct: false,
      feedback: `Recount every element. ${ledger.rows
        .filter((row) => row.left !== row.right)
        .map(
          (row) =>
            `${row.element}: ${row.left} on the left, ${row.right} on the right`,
        )
        .join(
          "; ",
        )}. Change coefficients, keeping each supplied formula intact.`,
    };
  if (!ledger.integer)
    return {
      correct: false,
      feedback:
        "The atom counts balance, but this model asks for a final whole-number equation. Multiply every coefficient by the same number to remove fractions; do not change only one term.",
    };
  return {
    correct: true,
    feedback: ledger.smallest
      ? "Every element is conserved and these are the smallest whole-number coefficients. The coefficients multiply complete formulas, including every atom inside brackets."
      : `Every element is conserved: this equation is balanced. All coefficients share factor ${ledger.divisor}; divide every coefficient by ${ledger.divisor} to write the conventional smallest whole-number ratio.`,
  };
}
