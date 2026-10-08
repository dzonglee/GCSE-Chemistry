import { purityCases } from "./purity-cases";
export type PurityMode = keyof typeof purityCases;
export type PurityBoard = Record<string, string>;
export type PurityFocus =
  | "all"
  | "category"
  | "conclusion"
  | "width"
  | "amount"
  | "amount0"
  | "amount1"
  | "amount2"
  | "method"
  | "residueSalt"
  | "filtrateSalt"
  | "collectionMass"
  | "recovery"
  | "purity";
export const purityChoices: Record<string, readonly string[]> = {
  category: ["", "element", "compound", "mixture", "unknown", "formulation"],
  label: ["", "chemical", "everyday", "none"],
  conclusion: [
    "",
    "consistent",
    "impure",
    "other",
    "inconsistent",
    "insufficient",
  ],
  method: [
    "",
    "filtration",
    "simple",
    "crystallisation",
    "evaporation",
    "fractional",
    "chromatography",
    "none",
  ],
  location: [
    "",
    "residue",
    "distillate",
    "crystals",
    "vessel",
    "fractions",
    "paper",
    "together",
  ],
};
const fields: Record<PurityMode, string[]> = {
  identity: ["category", "label"],
  melting: ["start", "finish", "width", "conclusion"],
  boiling: ["conclusion"],
  formulation: ["amount0", "amount1", "amount2", "category"],
  method: ["method", "location"],
  filtration: [
    "residueSand",
    "residueSalt",
    "residueWater",
    "filtrateSand",
    "filtrateSalt",
    "filtrateWater",
  ],
  recovery: ["collectionMass", "recovery", "purity", "lostProduct"],
};
export function purityCase(
  mode: PurityMode,
  record: string,
): Record<string, unknown> | null {
  if (
    !Object.hasOwn(purityCases, mode) ||
    !Object.hasOwn(purityCases[mode], record)
  )
    return null;
  return (
    purityCases[mode] as unknown as Record<string, Record<string, unknown>>
  )[record];
}
export function initialPurity(mode: PurityMode, record: string): PurityBoard {
  if (!purityCase(mode, record))
    throw new Error("Unknown supplied purity case.");
  return Object.fromEntries([
    ["record", record],
    ...fields[mode].map((k) => [k, ""]),
  ]);
}
export function parsePurityNumber(raw: string, signed = false): number | null {
  if (
    raw.length > 24 ||
    !(
      signed ? /^[-−]?(?:\d+(?:\.\d+)?|\.\d+)$/ : /^(?:\d+(?:\.\d+)?|\.\d+)$/
    ).test(raw)
  )
    return null;
  const value = Number(raw.replace("−", "-"));
  return Number.isFinite(value) ? value : null;
}
function plain(v: unknown): v is Record<string, unknown> {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(v))
  );
}
export function validPurity(mode: PurityMode, v: unknown): v is PurityBoard {
  if (!plain(v) || typeof v.record !== "string" || !purityCase(mode, v.record))
    return false;
  const wanted = ["record", ...fields[mode]];
  if (
    Reflect.ownKeys(v).length !== wanted.length ||
    wanted.some((k) => !Object.hasOwn(v, k))
  )
    return false;
  for (const k of fields[mode]) {
    if (typeof v[k] !== "string" || (v[k] as string).length > 24) return false;
    const allowed = purityChoices[k];
    if (allowed && !allowed.includes(v[k] as string)) return false;
  }
  if (
    mode === "identity" &&
    !["", "element", "compound", "mixture", "unknown"].includes(
      v.category as string,
    )
  )
    return false;
  if (
    mode === "formulation" &&
    !["", "formulation", "mixture"].includes(v.category as string)
  )
    return false;
  const c = purityCase(mode, v.record)!;
  if (
    mode === "formulation" &&
    (c.components as unknown[]).length === 2 &&
    v.amount2 !== ""
  )
    return false;
  if (
    mode === "melting" &&
    c.finish === null &&
    (v.finish !== "" || v.width !== "")
  )
    return false;
  return true;
}
const text = (n: number) => String(Math.round(n * 1e8) / 1e8);
export function expectedPurity(mode: PurityMode, record: string): PurityBoard {
  const c = purityCase(mode, record);
  if (!c) throw new Error("Unknown supplied purity case.");
  const n = (k: string) => c[k] as number;
  switch (mode) {
    case "identity":
      return { category: c.category as string, label: c.label as string };
    case "melting":
      return c.finish === null
        ? { start: text(n("start")), conclusion: c.conclusion as string }
        : {
            start: text(n("start")),
            finish: text(n("finish")),
            width: text(n("finish") - n("start")),
            conclusion: c.conclusion as string,
          };
    case "boiling":
      return { conclusion: c.conclusion as string };
    case "formulation":
      return Object.fromEntries([
        ...(c.components as { percent: number }[]).map((v, i) => [
          "amount" + i,
          text((n("total") * v.percent) / 100),
        ]),
        ["category", c.category as string],
      ]);
    case "method":
      return { method: c.method as string, location: c.location as string };
    case "filtration": {
      const residueSalt =
        n("salt") - n("dissolvedSalt") + n("retainedDissolvedSalt");
      return {
        residueSand: text(n("sand")),
        residueSalt: text(residueSalt),
        residueWater: text(n("retainedWater")),
        filtrateSand: "0",
        filtrateSalt: text(n("salt") - residueSalt),
        filtrateWater: text(n("water") - n("retainedWater")),
      };
    }
    case "recovery": {
      const mass = n("productCollected") + n("contaminant") + n("water");
      return {
        collectionMass: text(mass),
        recovery: text(
          Math.round((n("productCollected") / n("sourceProduct")) * 1000) / 10,
        ),
        purity: text(Math.round((n("productCollected") / mass) * 1000) / 10),
        lostProduct: text(n("sourceProduct") - n("productCollected")),
      };
    }
  }
}
export function purityTargets(
  mode: PurityMode,
  record: string,
  focus: PurityFocus = "all",
): string[] {
  const all = Object.keys(expectedPurity(mode, record));
  if (focus === "all") return all;
  if (focus === "amount") return all.filter((k) => k.startsWith("amount"));
  if (!all.includes(focus))
    throw new Error("This supplied case does not assess that focus.");
  return [focus];
}
export function checkPurity(
  mode: PurityMode,
  board: PurityBoard,
  focus: PurityFocus = "all",
): { valid: boolean; correct: boolean } {
  if (!validPurity(mode, board)) return { valid: false, correct: false };
  const expected = expectedPurity(mode, board.record),
    keys = purityTargets(mode, board.record, focus);
  if (
    keys.some(
      (k) =>
        board[k] === "" ||
        (!purityChoices[k] &&
          parsePurityNumber(
            board[k],
            k === "start" || k === "finish" || k === "width",
          ) === null),
    )
  )
    return { valid: false, correct: false };
  return {
    valid: true,
    correct: keys.every((k) =>
      purityChoices[k]
        ? board[k] === expected[k]
        : parsePurityNumber(
            board[k],
            k === "start" || k === "finish" || k === "width",
          ) === Number(expected[k]),
    ),
  };
}
export function updatePurity(
  mode: PurityMode,
  board: PurityBoard,
  key: string,
  value: string,
): PurityBoard {
  if (!validPurity(mode, board) || !fields[mode].includes(key))
    throw new Error("Invalid retained purity proposal.");
  const next = { ...board, [key]: value };
  if (!validPurity(mode, next)) throw new Error("Unsupported purity proposal.");
  return next;
}
export function validPurityHistory(
  mode: PurityMode,
  originalRecord: string,
  value: unknown,
  focus: PurityFocus = "all",
): value is PurityBoard[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 500 ||
    !purityCase(mode, originalRecord)
  )
    return false;
  if (!value.every((v) => validPurity(mode, v))) return false;
  const compatible = compatiblePurityCases(mode, focus);
  if (value.some((v) => !compatible.includes(v.record))) return false;
  const first = initialPurity(mode, originalRecord);
  if (Object.keys(first).some((k) => value[0][k] !== first[k])) return false;
  for (let i = 1; i < value.length; i++) {
    const a = value[i - 1],
      b = value[i];
    const pristine = initialPurity(mode, b.record);
    const reset = Object.keys(pristine).every((k) => b[k] === pristine[k]);
    if (reset) continue;
    if (a.record !== b.record) return false;
    if (Object.keys(a).filter((k) => a[k] !== b[k]).length > 1) return false;
  }
  return true;
}

/** A focused question only offers comparisons which contain its requested quantity. */
export function compatiblePurityCases(
  mode: PurityMode,
  focus: PurityFocus,
): string[] {
  return Object.keys(purityCases[mode]).filter((record) => {
    try {
      return purityTargets(mode, record, focus).length > 0;
    } catch {
      return false;
    }
  });
}
