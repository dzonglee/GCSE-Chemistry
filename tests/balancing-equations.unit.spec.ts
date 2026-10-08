import { test, expect } from "@playwright/test";
import {
  balanceCases,
  balanceLedger,
  initialBalanceBoard,
  validBalanceBoard,
  boardReaction,
  balancePrediction,
  type BalanceMode,
} from "../src/lib/equation-balancing";
import { reactionAsset } from "../src/lib/reaction-asset";
import { balancingJourney } from "../src/content/journeys/balancing-equations";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { validHistory } from "../src/lib/workbench";
test("independent elemental ledgers distinguish identity, all-element balance, fractions and smallest integer ratios", () => {
  for (const s of Object.values(balanceCases)) {
    const l = balanceLedger(s.left, s.right, s.least);
    expect(l.balanced).toBe(true);
    expect(l.smallest).toBe(true);
    expect(
      balanceLedger(
        s.left,
        s.right,
        s.least.map((v) => 2 * v),
      ),
    ).toMatchObject({ balanced: true, smallest: false, divisor: 2 });
  }
  expect(
    balanceLedger(["CH4", "O2"], ["CO2", "H2O"], [1, 1, 1, 2]).rows,
  ).toEqual([
    { element: "C", left: 1, right: 1 },
    { element: "H", left: 4, right: 4 },
    { element: "O", left: 2, right: 4 },
  ]);
  expect(
    balanceLedger(["C2H6", "O2"], ["CO2", "H2O"], [1, 3.5, 2, 3]),
  ).toMatchObject({ balanced: true, integer: false, smallest: false });
  expect(balanceLedger(["H2", "O2"], ["H2O2"], [1, 1, 1]).balanced).toBe(true);
  expect(
    balanceLedger(["Ca(OH)2", "HCl"], ["CaCl2", "H2O"], [1, 2, 1, 2]).rows,
  ).toEqual([
    { element: "Ca", left: 1, right: 1 },
    { element: "O", left: 2, right: 2 },
    { element: "H", left: 4, right: 4 },
    { element: "Cl", left: 2, right: 2 },
  ]);
  expect(() => balanceLedger(["H2"], ["H2"], [1])).toThrow();
  expect(() => balanceLedger(["H2"], ["H2"], [0, 0])).toThrow();
});
test("mode-specific predictions preserve incorrect counts and reject altered types or identities", () => {
  for (const mode of [
    "ledger",
    "molecules",
    "identity",
    "words",
  ] as BalanceMode[]) {
    const b = initialBalanceBoard(mode);
    expect(validBalanceBoard(mode, b)).toBe(true);
    expect(balancePrediction(mode, b).correct).toBe(false);
    expect(validBalanceBoard(mode, { ...b, extra: 1 })).toBe(false);
    const model = {
      kind: "equation-balancing" as const,
      mode,
      instruction: "check",
    };
    expect(validHistory(model, [b])).toBe(true);
    expect(validHistory(model, [b, b])).toBe(false);
  }
  for (const reaction of ["water", "magnesium", "aluminium"] as const) {
    const s = balanceCases[reaction],
      b = { reaction, a: s.least[0], b: s.least[1], c: s.least[2] };
    expect(balancePrediction("ledger", b).correct).toBe(true);
    expect(balancePrediction("ledger", { ...b, a: b.a * 2 }).correct).toBe(
      false,
    );
    expect(validBalanceBoard("ledger", { ...b, a: String(b.a) })).toBe(false);
  }
  expect(
    balancePrediction("molecules", {
      reaction: "ethane",
      a: 1,
      b: 3.5,
      c: 2,
      d: 3,
    }),
  ).toMatchObject({ correct: false });
  expect(
    balancePrediction("molecules", {
      reaction: "ethane",
      a: 2,
      b: 7,
      c: 4,
      d: 6,
    }).correct,
  ).toBe(true);
  expect(
    balancePrediction("ledger", { reaction: "water", a: 4, b: 2, c: 4 }),
  ).toMatchObject({ correct: true });
  expect(
    balancePrediction("ledger", { reaction: "water", a: 4, b: 2, c: 4 })
      .feedback,
  ).toContain("balanced");
  expect(
    balancePrediction("identity", { product: "H2O2", reason: "identity" })
      .correct,
  ).toBe(false);
  expect(
    balancePrediction("identity", { product: "H2O", reason: "identity" })
      .correct,
  ).toBe(true);
  expect(
    balancePrediction("words", {
      hydroxide: "KOH",
      hydrogen: "H2",
      a: 2,
      b: 2,
      c: 2,
      d: 1,
    }).correct,
  ).toBe(true);
  expect(
    balancePrediction("words", {
      hydroxide: "KO",
      hydrogen: "H2",
      a: 1,
      b: 1,
      c: 1,
      d: 1,
    }).correct,
  ).toBe(false);
  expect(boardReaction("words", initialBalanceBoard("words")).right).toEqual([
    "KOH",
    "H2",
  ]);
});
test("actual methane asset changes molecule numbers while conserving every element, retaining tetrahedral and bent positions", () => {
  const group = reactionAsset([1, 2, 1, 2]);
  expect(group.children).toHaveLength(6);
  const leftGroups = group.children.filter((node) =>
    node.name.startsWith("reactant-"),
  );
  expect(new Set(leftGroups.map((node) => node.position.x)).size).toBe(2);
  expect(new Set(leftGroups.map((node) => node.position.y)).size).toBe(2);
  const totals: Record<string, Record<string, number>> = {
    reactant: {},
    product: {},
  };
  group.traverse((node) => {
    const match = node.name.match(/^(reactant|product)-.*-atom-\d+-(C|H|O)$/);
    if (match)
      totals[match[1]][match[2]] = (totals[match[1]][match[2]] ?? 0) + 1;
  });
  expect(totals.reactant).toEqual({ C: 1, H: 4, O: 4 });
  expect(totals.product).toEqual({ C: 1, O: 4, H: 4 });
  const methane = group.getObjectByName("reactant-CH4-0")!,
    atoms = methane.children.filter((n) => /-atom-/.test(n.name));
  expect(atoms).toHaveLength(5);
  const h = atoms.filter((n) => /-H$/.test(n.name));
  expect(
    h[0].position.clone().normalize().dot(h[1].position.clone().normalize()),
  ).toBeCloseTo(-1 / 3, 10);
  const water = group.getObjectByName("product-H2O-0")!,
    hydrogens = water.children.filter((n) => /-H$/.test(n.name));
  const cosine = hydrogens[0].position
    .clone()
    .normalize()
    .dot(hydrogens[1].position.clone().normalize());
  expect((Math.acos(cosine) * 180) / Math.PI).toBeCloseTo(104.6, 1);
  expect(() => reactionAsset([1, 3.5, 2, 3])).toThrow();
  expect(reactionAsset([2, 4, 2, 4]).children).toHaveLength(12);
});
test("the individually authored tasks retain coefficient constructions and self-reviewed complete equation writing", () => {
  const qs = tasks(balancingJourney);
  expect(qs).toHaveLength(60);
  expect(balancingJourney.practice).toHaveLength(25);
  expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
  const ids = new Set(qs.map((q) => q.id));
  for (const q of qs) {
    expect(q.prompt.trim()).not.toBe("");
    expect(q.explanation.trim()).not.toBe("");
    const result = mark(q, q.answer);
    expect(result.correct).toBe(!q.rubric);
    if (q.rubric) expect(result.selfReview).toBe(true);
    if (q.followUp) expect(ids.has(q.followUp)).toBe(true);
  }
  const complete = balancingJourney.practice.find(
    (q) => q.id === "be-v1-p-methane",
  )!;
  expect(complete.parts).toHaveLength(4);
  expect(
    mark(complete, JSON.stringify({ c0: "1", c1: "1", c2: "1", c3: "2" }))
      .correct,
  ).toBe(false);
  expect(
    mark(complete, JSON.stringify({ c0: "2", c1: "4", c2: "2", c3: "4" }))
      .correct,
  ).toBe(false);
});
