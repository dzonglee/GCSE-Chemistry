import { test, expect } from "@playwright/test";
import {
  reversibleJourney as journey,
  reversibleAllTasks,
} from "../src/content/journeys/reversible-reactions";
import {
  directionRecords,
  reversibleEnergies,
  turnoverRecords,
  turnoverMax,
  tokenSnapshot,
  reversibleRates,
  boundaryRecords,
  equilibriumEvidence,
  type ReversibleMode,
} from "../src/lib/reversible-equilibrium";
import {
  initialReversibleBoard,
  validReversibleBoard,
  reversibleHistoryStep,
  reversibleBoardCheck,
  reversibleRecords,
  type ReversibleBoard,
} from "../src/lib/reversible-board";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import type { TaskModel } from "../src/content/types";
const modes: ReversibleMode[] = [
  "direction",
  "energy",
  "turnover",
  "rates",
  "boundary",
  "evidence",
];
function solved(mode: ReversibleMode, id: string): ReversibleBoard {
  const b = initialReversibleBoard(mode, id);
  if (mode === "direction") {
    const r = directionRecords[id],
      f = r.target === "forward";
    Object.assign(b, {
      direction: r.target,
      input: f ? "left" : "right",
      output: f ? "right" : "left",
      condition: r.target,
    });
  }
  if (mode === "energy") {
    const r = reversibleEnergies[id],
      delta =
        ((r.right - r.left) * (r.reverse ? -1 : 1) * r.targetAmount) / r.amount;
    Object.assign(b, {
      direction: r.reverse ? "reverse" : "forward",
      change: String(delta),
      magnitude: String(Math.abs(delta)),
      flow: delta < 0 ? "toSurroundings" : "fromSurroundings",
    });
  }
  if (mode === "turnover") {
    const r = turnoverRecords[id],
      net = r.forward - r.reverse;
    Object.assign(b, {
      step: "1",
      a: String(r.a - net),
      b: String(r.b + net),
      forward: String(r.forward),
      reverse: String(r.reverse),
      classification:
        r.forward === r.reverse && r.forward > 0
          ? "equilibrium"
          : "notEquilibrium",
    });
  }
  if (mode === "rates") {
    const r = reversibleRates[id],
      net = (r.forward - r.reverse) * r.seconds;
    Object.assign(b, {
      net: String(net),
      a: String(r.a - net),
      b: String(r.b + net),
      classification:
        r.forward === r.reverse && r.forward > 0
          ? "equilibrium"
          : "notEquilibrium",
    });
  }
  if (mode === "boundary") {
    const r = boundaryRecords[id];
    Object.assign(b, { classification: r.classification, reason: r.reason });
  }
  if (mode === "evidence") {
    const r = equilibriumEvidence[id];
    Object.assign(b, {
      time: r.first === null ? "none" : String(r.first),
      reason: r.reason,
    });
  }
  return b;
}
for (const mode of modes)
  test(`${mode}: six native records require scientifically complete predictions and accept wrong saved answers`, () => {
    expect(Object.keys(reversibleRecords[mode])).toHaveLength(6);
    for (const id of Object.keys(reversibleRecords[mode])) {
      const model: TaskModel = {
          kind: "reversible-equilibrium",
          mode,
          record: id,
          instruction: "Inspect this individual record.",
        },
        first = initialReversibleBoard(mode, id),
        answer = solved(mode, id),
        history = [first];
      expect(initialBoard(model)).toEqual(first);
      expect(validReversibleBoard(mode, answer)).toBe(true);
      expect(checkBoard(model, first).correct).toBe(false);
      for (const [k, v] of Object.entries(answer))
        if (history.at(-1)![k] !== v)
          history.push({ ...history.at(-1)!, [k]: v });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, answer).correct).toBe(true);
      const wrong = { ...answer };
      if (mode === "direction")
        wrong.input = answer.input === "left" ? "right" : "left";
      else if (mode === "energy")
        wrong.flow =
          answer.flow === "toSurroundings"
            ? "fromSurroundings"
            : "toSurroundings";
      else if (mode === "turnover" || mode === "rates") wrong.a = "99";
      else if (mode === "boundary")
        wrong.classification =
          answer.classification === "equilibrium"
            ? "insufficient"
            : "equilibrium";
      else wrong.time = answer.time === "none" ? "0" : "none";
      expect(validReversibleBoard(mode, wrong)).toBe(true);
      expect(checkBoard(model, wrong).correct).toBe(false);
    }
  });
test("strict canonical fields reject coercion unknown cases and unfinished number entries", () => {
  for (const mode of modes) {
    const b = solved(mode, "initial");
    expect(validReversibleBoard(mode, { ...b, extra: "1" })).toBe(false);
    const missing = { ...b };
    delete missing.record;
    expect(validReversibleBoard(mode, missing)).toBe(false);
    expect(validReversibleBoard(mode, { ...b, record: "unknown" })).toBe(false);
    expect(validReversibleBoard(mode, { ...b, [Object.keys(b)[1]]: 0 })).toBe(
      false,
    );
  }
  for (const value of ["", "1/2", "1e2", "01", "Infinity", "100001"])
    expect(
      validReversibleBoard("energy", {
        ...solved("energy", "initial"),
        change: value,
      }),
    ).toBe(false);
  expect(
    validReversibleBoard("turnover", {
      ...solved("turnover", "notEqual"),
      step: "2",
    }),
  ).toBe(false);
});
test("atomic case reset is order-independent and step history cannot invent skipped intervals", () => {
  for (const mode of modes) {
    const a = solved(mode, "initial"),
      id = Object.keys(reversibleRecords[mode])[1],
      reset = initialReversibleBoard(mode, id),
      reordered = Object.fromEntries(Object.entries(reset).reverse());
    expect(reversibleHistoryStep(mode, a, reordered)).toBe(true);
    expect(reversibleHistoryStep(mode, a, a)).toBe(false);
    expect(
      reversibleHistoryStep(mode, a, {
        ...reset,
        [Object.keys(reset)[1]]: "999",
      }),
    ).toBe(false);
  }
  const first = initialReversibleBoard("turnover");
  expect(
    reversibleHistoryStep("turnover", first, { ...first, step: "2" }),
  ).toBe(false);
  expect(
    reversibleHistoryStep("turnover", first, { ...first, step: "1" }),
  ).toBe(true);
});
test("numbered tokens conserve material while equal positive rates preserve unequal inventories", () => {
  for (const r of Object.values(turnoverRecords))
    for (let step = 0; step <= turnoverMax(r); step++) {
      const t = tokenSnapshot(r, step);
      expect(t).toHaveLength(20);
      expect(new Set(t.map((x) => x.id)).size).toBe(20);
      expect(t.filter((x) => x.state === "A")).toHaveLength(
        r.a - step * (r.forward - r.reverse),
      );
      if (step)
        expect(t.filter((x) => x.changed)).toHaveLength(r.forward + r.reverse);
    }
  const r = turnoverRecords.initial,
    t = tokenSnapshot(r, 6);
  expect(t.filter((x) => x.state === "A")).toHaveLength(14);
  expect(t.filter((x) => x.state === "B")).toHaveLength(6);
  expect(t.some((x) => x.id <= 14 && x.state === "B")).toBe(true);
  expect(
    reversibleBoardCheck("turnover", {
      ...solved("turnover", "stopped"),
      classification: "equilibrium",
    }).correct,
  ).toBe(false);
});
test("closed amount changes match displayed directional-rate interval areas; equal amounts and open plateaus are insufficient", () => {
  for (const r of Object.values(equilibriumEvidence)) {
    if (!r.closed) continue;
    for (let i = 1; i < r.times.length; i++) {
      const delta =
        ((r.times[i] - r.times[i - 1]) *
          (r.forward[i - 1] -
            r.reverse[i - 1] +
            (r.forward[i] - r.reverse[i]))) /
        2;
      expect(r.b[i] - r.b[i - 1]).toBe(delta);
      expect(r.a[i] + r.b[i]).toBe(20);
    }
    if (r.first !== null) {
      const i = r.times.indexOf(r.first);
      for (let j = i; j < r.times.length; j++) {
        expect(r.forward[j]).toBe(r.reverse[j]);
        expect(r.forward[j]).toBeGreaterThan(0);
        expect(r.a[j]).toBe(r.a[i]);
      }
    }
  }
  expect(equilibriumEvidence.initial.first).toBe(4);
  expect(equilibriumEvidence.catalyst.first).toBe(2);
  expect(equilibriumEvidence.catalyst.a.at(-1)).toBe(
    equilibriumEvidence.initial.a.at(-1),
  );
  expect(equilibriumEvidence.equalAmounts.first).toBeNull();
  expect(equilibriumEvidence.open.first).toBeNull();
});
test("all original tasks have audited numeric answers and written self-review; recovery and independent givens remain honest", () => {
  const refs: Record<string, number> = {
    "w-energy": 20 - 60,
    "r-sign": -16,
    "r-scale": (0.9 * 6) / 3,
    "r-water": 7 - 4,
    "r-gross": 3 + 3,
    "r-net": (4 - 2) * 2,
    "g-energy": 20 - 50,
    "g-rates": (2 - 2) * 2,
    "g-evidence": 4,
    "p-energy-endo": -18,
    "p-energy-exo": 80 - 25,
    "p-energy-offset": ((140 - 170) * 6) / 3,
    "p-energy-forward": (24 * 10) / 4,
    "p-dry-batch": (1.2 * 7.5) / 3,
    "p-water-mass": ((5 - 3.2) * 12.5) / 5,
    "p-gross": 2 + 2,
    "p-products": 15 + 3 - 3,
    "p-equal-not-eq": 10 + 4 - 1,
    "p-net-reverse": 7 - 1 + 3,
    "p-rate-forward": (3 - 1) * 2,
    "p-rate-reverse": (1 - 3) * 2,
    "p-rate-count": 10 - (2 - 1) * 3,
    "p-evidence-reverse": 6,
    "p-evidence-catalyst": 2,
    "a-energy": 36,
    "a-net": 6 + (4 - 1) * 2,
    "b-batch": (1.6 * 9) / 4,
    "b-count": 8 + (2 - 1) * 3,
    "ra-energy": -42,
    "rb-water": ((6 - 4) * 15) / 6,
  };
  expect(reversibleAllTasks).toHaveLength(72);
  expect(new Set(reversibleAllTasks.map((t) => t.id)).size).toBe(72);
  expect(reversibleAllTasks.filter((t) => t.rubric)).toHaveLength(9);
  expect(
    reversibleAllTasks.filter((t) => !t.options && !t.rubric),
  ).toHaveLength(30);
  for (const q of reversibleAllTasks) {
    const result = mark(q, q.answer);
    if (q.rubric) {
      expect(result.correct).toBe(false);
      expect(result.selfReview).toBe(true);
    } else {
      expect(result.correct, q.id).toBe(true);
      if (q.options) {
        for (const wrong of q.options.filter((x) => x !== q.answer))
          expect(mark(q, wrong).correct).toBe(false);
      } else {
        expect(Number(q.answer)).toBeCloseTo(refs[q.id.slice(6)], 8);
        expect(mark(q, "99999").correct).toBe(false);
      }
    }
  }
  for (const q of journey.practice)
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  for (const forms of [journey.checkForms, journey.reviewForms])
    for (const form of forms)
      for (const q of form) expect(q.model).toBeUndefined();
});
test("original six question IDs survive and direct exposure connects native criteria and prior catalyst learning", () => {
  const lesson = lessons.find((l) => l.slug === "reversible-reactions")!;
  expect(lesson.journey).toBe(journey);
  for (let i = 0; i < 6; i++)
    expect(
      [...lesson.questions, ...lesson.checks].some(
        (q) => q.id === "reversible-reactions-" + i,
      ),
    ).toBe(true);
  const opening = journey.guided[0];
  expect(opening.exposureAliases).toContain("re-v1-a-definition");
  expect(
    journey.practice.find((q) => q.id === "re-v1-p-catalyst")!.exposureAliases,
  ).toContain("reversible-reactions-5");
});
