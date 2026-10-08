import { test, expect } from "@playwright/test";
import {
  formulaCounts,
  massLedger,
  formulaMassCases,
  initialFormulaMassBoard,
  validFormulaMassBoard,
  formulaMassPrediction,
} from "../src/lib/formula-mass";
import { formulaMassJourney as journey } from "../src/content/journeys/formulae-and-mass";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { exposureIds } from "../src/lib/progress";
test("formula scope preserves implied ones two-letter symbols repeated groups and rejects coefficients charges and malformed syntax", () => {
  for (const [formula, counts] of Object.entries({
    H2O: { H: 2, O: 1 },
    CO2: { C: 1, O: 2 },
    MgCl2: { Mg: 1, Cl: 2 },
    "Ca(OH)2": { Ca: 1, O: 2, H: 2 },
    "Al2(SO4)3": { Al: 2, S: 3, O: 12 },
    "(NH4)2SO4": { N: 2, H: 8, S: 1, O: 4 },
    "Ca3(PO4)2": { Ca: 3, P: 2, O: 8 },
    "Mg(NO3)2": { Mg: 1, N: 2, O: 6 },
  }))
    expect(formulaCounts(formula)).toEqual(counts);
  for (const formula of [
    "",
    "2H2O",
    "H0",
    "H01",
    "Mg(NO3",
    "MgNO3)",
    "()2",
    "Ca(OH)0",
    "cl2",
    "Na+",
    "CuSO4.5H2O",
    "H999999",
  ])
    expect(() => formulaCounts(formula)).toThrow();
  expect(massLedger("Al2(SO4)3", { Al: 27, S: 32, O: 16 })).toEqual({
    rows: [
      { element: "Al", count: 2, ar: 27, contribution: 54 },
      { element: "S", count: 3, ar: 32, contribution: 96 },
      { element: "O", count: 12, ar: 16, contribution: 192 },
    ],
    total: 342,
  });
  expect(massLedger("MgCl2", { Mg: 24, Cl: 35.5 }).total).toBe(95);
  expect(massLedger("NaCl", { Na: 23, Cl: 35.5 }).total).toBe(58.5);
  expect(() => massLedger("NaCl", { Na: 23 })).toThrow();
  expect(() => massLedger("H2O", { H: 1, O: NaN })).toThrow();
});
test("strict count ledger bracket and coefficient boards retain incorrect chemical reasoning", () => {
  for (const mode of ["count", "mass", "brackets", "quantity"] as const) {
    const b = initialFormulaMassBoard(mode);
    expect(validFormulaMassBoard(mode, b)).toBe(true);
    expect(validFormulaMassBoard(mode, { ...b, extra: 1 })).toBe(false);
    expect(formulaMassPrediction(mode, b).correct).toBe(false);
  }
  for (const [mode, formulas] of [
    ["count", ["H2O", "CO2"]],
    ["mass", ["MgCl2", "NaCl"]],
    ["brackets", ["CaOH", "MgNO3"]],
  ] as const)
    for (const formula of formulas) {
      const spec = formulaMassCases[formula],
        ledger = massLedger(spec.formula, spec.ar),
        board: Record<string, string | number> = {
          ...initialFormulaMassBoard(mode),
          formula,
        };
      ledger.rows.forEach(
        (r, i) => (board[["countA", "countB", "countC"][i]] = String(r.count)),
      );
      if (mode === "mass") board.total = String(ledger.total);
      expect(validFormulaMassBoard(mode, board)).toBe(true);
      expect(formulaMassPrediction(mode, board).correct).toBe(true);
      expect(
        formulaMassPrediction(mode, { ...board, countA: "0" }).correct,
      ).toBe(false);
    }
  for (const coefficient of [1, 2, 3]) {
    const b = {
      coefficient,
      hydrogen: String(2 * coefficient),
      oxygen: String(coefficient),
      mr: "18",
    };
    expect(formulaMassPrediction("quantity", b).correct).toBe(true);
    expect(formulaMassPrediction("quantity", { ...b, mr: "36" }).correct).toBe(
      false,
    );
  }
  expect(
    validFormulaMassBoard("quantity", {
      coefficient: "2",
      hydrogen: "4",
      oxygen: "2",
      mr: "18",
    }),
  ).toBe(false);
});
test("fifty-two original tasks independently assess working and preserve original bank and repeat exposure", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(52);
  expect(journey.practice).toHaveLength(24);
  expect(new Set(all.map((q) => q.id)).size).toBe(52);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct).toBe(false);
  }
  for (const q of [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
  ])
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  const l = lessons.find((l) => l.slug === "formulae-and-mass")!;
  expect(l.questions).toHaveLength(4);
  expect(l.checks).toHaveLength(2);
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("relative-atomic-mass");
  expect(exposureIds(["fm-v1-cb-quantity"])).toContain("fm-v1-p-co2");
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
  }
});
test("complete independent contributions reject a correct total hiding missing working", () => {
  const q = journey.practice.find((q) => q.id === "fm-v1-p-working")!;
  for (const values of [
    { mg: "24", o: "16", h: "2", mr: "58" },
    { mg: "24", o: "32", h: "", mr: "58" },
    { mg: "24", o: "32", h: "2", mr: "74" },
  ])
    expect(mark(q, JSON.stringify(values)).correct).toBe(false);
  expect(mark(q, q.answer).correct).toBe(true);
});
