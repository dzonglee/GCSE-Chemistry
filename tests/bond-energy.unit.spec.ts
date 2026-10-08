import { test, expect } from "@playwright/test";
import {
  bondRecords,
  bondReactions,
  bondInitial,
  bondTotals,
  bondCorrect,
  bondCountKeys,
  validBondBoard,
  bondHistoryStep,
  validBondHistory,
  bondEvidence,
  type BondMode,
} from "../src/lib/bond-energy";
import { initialBoard, validHistory } from "../src/lib/workbench";
test("28 supplied scenarios use strict string boards and task-matched canonical defaults", () => {
  let total = 0;
  for (const mode of Object.keys(bondRecords) as BondMode[])
    for (const record of bondRecords[mode]) {
      total++;
      const b = bondInitial(mode, record);
      expect(validBondBoard(mode, b)).toBe(true);
      expect(validBondBoard(mode, { ...b, extra: "0" })).toBe(false);
      expect(validBondBoard(mode, { ...b, record: "missing" })).toBe(false);
      expect(bondCorrect(mode, b)).toBe(false);
    }
  expect(total).toBe(28);
  expect(
    initialBoard({
      kind: "bond-energy",
      mode: "count",
      record: "water",
      instruction: "",
    }),
  ).toEqual(bondInitial("count", "water"));
});
test("forward, reverse, scaled and larger-coefficient totals match independent numerical references", () => {
  const refs: Record<string, number[]> = {
    hydrogenChloride: [679, 864, -185],
    water: [1370, 1856, -486],
    ammonia: [2253, 2346, -93],
    methane: [2648, 3466, -818],
    splitHCl: [864, 679, 185],
    doubleHCl: [1358, 1728, -370],
    bromination: [1841, 1892, -51],
    ammoniaOxidation: [6186, 7458, -1272],
  };
  for (const [id, reference] of Object.entries(refs))
    expect(Object.values(bondTotals(bondReactions[id])), id).toEqual(reference);
});
test("structural counts include coefficients and distinct double/triple entries including zero absent bonds", () => {
  const refs: Record<string, [Record<string, number>, Record<string, number>]> =
    {
      water: [{ HH: 2, OO: 1 }, { OH: 4 }],
      ammonia: [{ NN: 1, HH: 3 }, { NH: 6 }],
      methane: [
        { CH: 4, OO: 2 },
        { COdouble: 2, OH: 4 },
      ],
      ammoniaOxidation: [
        { NH: 12, OO: 3 },
        { NN: 2, OH: 12 },
      ],
      hydrogenChloride: [{ HH: 1, ClCl: 1 }, { HCl: 2 }],
      doubleHCl: [{ HH: 2, ClCl: 2 }, { HCl: 4 }],
    };
  for (const [id, [left, right]] of Object.entries(refs)) {
    const b = bondInitial("count", id);
    for (const k of bondCountKeys(bondReactions[id])) {
      b["broken-" + k] = String(left[k] ?? 0);
      b["formed-" + k] = String(right[k] ?? 0);
    }
    expect(bondCorrect("count", b)).toBe(true);
    for (const k of Object.keys(b).filter((k) => k !== "record"))
      expect(
        bondCorrect("count", { ...b, [k]: String(Number(b[k]) + 1) }),
        id + "/" + k,
      ).toBe(false);
  }
});
test("ledger requires both positive totals and the separately entered signed change and classification", () => {
  for (const record of bondRecords.ledger) {
    const t = bondTotals(bondReactions[record]),
      b = {
        ...bondInitial("ledger", record),
        input: String(t.input),
        release: String(t.release),
        change: String(t.change),
        classification: t.change < 0 ? "exothermic" : "endothermic",
      };
    expect(bondCorrect("ledger", b)).toBe(true);
    expect(
      bondCorrect("ledger", {
        ...b,
        input: String(t.release),
        release: String(t.input),
      }),
    ).toBe(false);
    expect(bondCorrect("ledger", { ...b, change: String(-t.change) })).toBe(
      false,
    );
    expect(bondCorrect("ledger", { ...b, classification: "unset" })).toBe(
      false,
    );
  }
});
test("unknowns on either side reproduce the supplied signed change with correct multiplicity", () => {
  const expected: Record<string, number> = {
    bromination: 290,
    unknownHCl: 432,
    unknownOH: 464,
    unknownHH: 436,
  };
  for (const [record, x] of Object.entries(expected)) {
    const r = bondReactions[record],
      b = { ...bondInitial("inverse", record), unknown: String(x) };
    expect(bondCorrect("inverse", b)).toBe(true);
    expect(bondCorrect("inverse", { ...b, unknown: String(x + 1) })).toBe(
      false,
    );
    const trial = { ...r, values: { ...r.values, [r.unknown!]: x } };
    expect(bondTotals(trial).change).toBe(r.suppliedChange);
  }
});
test("all cancellation proposals preserve difference only with equal existing entries", () => {
  for (let left = 0; left <= 24; left++)
    for (let right = 0; right <= 24; right++) {
      const b = {
        record: "bromination",
        cancelBroken: String(left),
        cancelFormed: String(right),
        change: "-51",
      };
      expect(bondCorrect("cancel", b), left + "/" + right).toBe(
        left === right && left >= 1 && left <= 3,
      );
    }
  const r = bondReactions.bromination,
    t = bondTotals(r);
  for (let n = 0; n <= 3; n++)
    expect(t.input - n * 412 - (t.release - n * 412)).toBe(-51);
});
test("all evidence scenarios require matched source-backed claim and reason", () => {
  for (const record of bondRecords.evidence) {
    const e = bondEvidence[record as keyof typeof bondEvidence],
      b = { record, claim: e.claim, reason: e.reason };
    expect(bondCorrect("evidence", b)).toBe(true);
    for (const other of Object.values(bondEvidence)) {
      if (other.claim !== e.claim)
        expect(bondCorrect("evidence", { ...b, claim: other.claim })).toBe(
          false,
        );
      if (other.reason !== e.reason)
        expect(bondCorrect("evidence", { ...b, reason: other.reason })).toBe(
          false,
        );
    }
  }
});
test("numeric boards reject uncanonical, fractional, nonfinite, unknown and wrong-type entries", () => {
  for (const value of [
    "01",
    "+1",
    "1.0",
    "1e2",
    " 1 ",
    "-0",
    "NaN",
    "Infinity",
    "0x10",
    "20001",
    "-20001",
    1,
    true,
    null,
  ])
    expect(
      validBondBoard("ledger", {
        ...bondInitial("ledger", "water"),
        input: value,
      }),
    ).toBe(false);
  expect(
    validBondBoard("ledger", {
      ...bondInitial("ledger", "water"),
      change: "-486",
    }),
  ).toBe(true);
  expect(
    validBondBoard("count", {
      ...bondInitial("count", "water"),
      "broken-HH": "25",
    }),
  ).toBe(false);
});
test("count and cancellation histories permit exactly one one-unit move and retain wrong valid proposals", () => {
  const a = bondInitial("count", "water"),
    b = { ...a, "broken-HH": "1" },
    c = { ...b, "broken-HH": "2" };
  expect(validBondHistory("count", [a, b, c])).toBe(true);
  expect(bondHistoryStep("count", a, c)).toBe(false);
  expect(bondHistoryStep("count", a, { ...b, "broken-OO": "1" })).toBe(false);
  expect(bondHistoryStep("count", a, a)).toBe(false);
  expect(
    validHistory(
      { kind: "bond-energy", mode: "count", record: "water", instruction: "" },
      [a, b, c],
    ),
  ).toBe(true);
});
test("supplied-example changes reset all fields atomically and remain independent of object-key order", () => {
  const a = { ...bondInitial("ledger", "water"), input: "1370" },
    b = bondInitial("ledger", "methane");
  expect(bondHistoryStep("ledger", a, b)).toBe(true);
  expect(
    bondHistoryStep(
      "ledger",
      a,
      Object.fromEntries(Object.entries(b).reverse()),
    ),
  ).toBe(true);
  expect(bondHistoryStep("ledger", a, { ...b, input: "1370" })).toBe(false);
});
test("direct numeric predictions save wrong signs and reject duplicate or malformed histories", () => {
  const a = bondInitial("ledger", "water"),
    b = { ...a, change: "486" };
  expect(bondHistoryStep("ledger", a, b)).toBe(true);
  expect(bondCorrect("ledger", b)).toBe(false);
  expect(validBondHistory("ledger", [a, b])).toBe(true);
  expect(validBondHistory("ledger", [b])).toBe(false);
  expect(validBondHistory("ledger", [])).toBe(false);
  expect(validBondHistory("ledger", [a, a])).toBe(false);
  expect(validBondHistory("ledger", Array(501).fill(a))).toBe(false);
});

test("plausible wrong evidence choices remain valid saved steps without becoming correct", () => {
  const a = bondInitial("evidence", "breaking"),
    b = { ...a, claim: "Breaking releases energy" },
    c = { ...b, reason: "All chemical changes release energy" };
  expect(validBondBoard("evidence", c)).toBe(true);
  expect(validBondHistory("evidence", [a, b, c])).toBe(true);
  expect(bondCorrect("evidence", c)).toBe(false);
  expect(validBondBoard("evidence", { ...c, claim: "unrecognised" })).toBe(
    false,
  );
});
