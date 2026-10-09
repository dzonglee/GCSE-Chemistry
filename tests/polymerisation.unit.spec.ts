import { test, expect } from "@playwright/test";
import {
  polymerisationJourney as fullJourney,
  polymerisationRecovery,
} from "../src/content/journeys/polymerisation";
import {
  polymerisationRecords,
  additionRecords,
  repeatInventory,
  equivalentGroups,
  linkRecords,
  type PolymerisationMode,
} from "../src/lib/polymerisation";
import {
  initialPolymerisationBoard,
  expectedPolymerisationBoard,
  validPolymerisationBoard,
  checkPolymerisationBoard,
  polymerisationHistoryStep,
  blankPolymerisationDrawing,
  readPolymerisationDrawing,
} from "../src/lib/polymerisation-board";
import { polymerisationGeometry } from "../src/lib/polymerisation-asset";
import {
  blankPolyesterDrawing,
  readPolyesterDrawing,
  polyesterRepeatAtoms,
} from "../src/lib/polyester";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { mark, displayResponse } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
const j = fullJourney;
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.slice(0, 2).flat(),
  ...j.reviewForms.slice(0, 2).flat(),
].filter((q) => q.id.startsWith("pol-v1-"));
test("91 individual demands retain literal numerical references and honest independent drawing review", () => {
  expect(all).toHaveLength(91);
  expect(new Set(all.map((q) => q.id)).size).toBe(91);
  const refs: Record<string, string> = {
    "r-mass": "84",
    "r-spacer": "6",
    "r-links": "4",
    "r-symbolic": "6",
    "g-segment": "3",
    "g-inventory": "20",
    "g-polyester": "6",
    "g-links": "5",
    "p-C": "21",
    "p-H": "0",
    "p-Cl": "5",
    "p-Mr": "224",
    "p-mass": "12",
    "p-units": "9",
    "p-poly-C": "8",
    "p-poly-O": "4",
    "p-open": "9",
    "p-twochains": "6",
    "p-symbolic": "40",
    "a-Cl": "8",
    "a-C": "15",
    "b-Mr": "252",
    "b-units": "7",
    "ra-Cl": "4",
    "rb-C": "12",
  };
  expect(all.filter((q) => !q.options && !q.rubric)).toHaveLength(25);
  for (const [id, value] of Object.entries(refs)) {
    const q = all.find((q) => q.id === "pol-v1-" + id)!;
    expect(q.answer).toBe(value);
    expect(mark(q, value).correct).toBe(true);
  }
  expect(all.filter((q) => q.rubric)).toHaveLength(23);
  for (const q of all.filter((q) => q.rubric)) {
    const blank = q.polymerisationDrawing
      ? blankPolymerisationDrawing()
      : q.polyesterDrawing
        ? blankPolyesterDrawing()
        : null;
    if (blank)
      expect(mark(q, JSON.stringify(blank))).toMatchObject({
        correct: false,
        empty: true,
      });
    const raw = q.polymerisationDrawing
      ? JSON.stringify({ ...blank!, s0: "H" })
      : q.polyesterDrawing
        ? JSON.stringify({ ...blank!, diolC: "1" })
        : q.answer;
    expect(mark(q, raw)).toMatchObject({ correct: false, selfReview: true });
    if (q.polymerisationDrawing || q.polyesterDrawing) {
      expect(mark(q, "original broken bytes")).toMatchObject({
        correct: false,
        invalid: true,
      });
      expect(displayResponse(q, raw)).not.toContain("{");
    }
  }
});
for (const mode of Object.keys(polymerisationRecords) as PolymerisationMode[])
  test(
    mode +
      ": every supplied record preserves exact schema, blank initial response and its scientific answer",
    () => {
      for (const record of Object.keys(polymerisationRecords[mode])) {
        const e = expectedPolymerisationBoard(mode, record),
          z = initialPolymerisationBoard(mode, record);
        expect(validPolymerisationBoard(mode, e)).toBe(true);
        expect(validPolymerisationBoard(mode, z)).toBe(true);
        expect(checkPolymerisationBoard(mode, e).correct).toBe(true);
        expect(checkPolymerisationBoard(mode, z).correct).toBe(false);
        expect(validPolymerisationBoard(mode, { ...e, extra: "" })).toBe(false);
        expect(
          validPolymerisationBoard(mode, { ...e, record: "constructor" }),
        ).toBe(false);
        for (const k of Object.keys(e))
          expect(validPolymerisationBoard(mode, { ...e, [k]: null })).toBe(
            false,
          );
      }
    },
  );
test("actual chains of two to four contributions conserve literal atoms, connections and local carbon valence", () => {
  const refs: Record<string, number[]> = {
    initial: [2, 4, 0, 0],
    propene: [3, 6, 0, 0],
    chloro: [2, 3, 1, 0],
    fluoro: [2, 0, 0, 4],
    but1: [4, 8, 0, 0],
    but2: [4, 8, 0, 0],
    dichloro11: [2, 2, 2, 0],
    dichloro12: [2, 2, 2, 0],
  };
  for (const [id, ref] of Object.entries(refs)) {
    expect(repeatInventory(additionRecords[id].groups)).toEqual(ref);
    const e = expectedPolymerisationBoard("addition", id);
    for (const n of [2, 3, 4]) {
      const g = polymerisationGeometry(e, n, false);
      expect(
        ["C", "H", "Cl", "F"].map(
          (el) => g.atoms.filter((a) => a.element === el).length,
        ),
      ).toEqual(ref.map((v) => v * n));
      expect(new Set(g.atoms.map((a) => a.id)).size).toBe(g.atoms.length);
      expect(g.continuations).toHaveLength(2);
      expect(
        g.atoms.every(
          (a) => !a.incomplete && a.point.toArray().every(Number.isFinite),
        ),
      ).toBe(true);
      for (const bond of g.bonds) {
        const a = g.atoms.find((a) => a.id === bond.a)!,
          b = g.atoms.find((a) => a.id === bond.b)!;
        expect(a.point.distanceTo(b.point)).toBeCloseTo(
          a.element === "H" || b.element === "H"
            ? 0.8
            : a.element === "Cl" ||
                b.element === "Cl" ||
                a.element === "F" ||
                b.element === "F"
              ? 1.02
              : 1.3,
          8,
        );
      }
    }
    const wrong = polymerisationGeometry({ ...e, bond: "2" }, 2, false);
    expect(
      wrong.atoms
        .filter((a) => /^backbone\d+$/.test(a.id))
        .every((a) => a.incomplete),
    ).toBe(true);
  }
  expect(
    equivalentGroups(
      additionRecords.dichloro11.groups,
      additionRecords.dichloro12.groups,
    ),
  ).toBe(false);
});
test("raw numeric attempts and crop changes survive valid one-step history without exponent masquerading as zero", () => {
  const e = expectedPolymerisationBoard("inventory", "fluoro");
  for (const raw of ["", " ", "0.", "0e0", ".", "NaN", "Infinity"]) {
    expect(validPolymerisationBoard("inventory", { ...e, H: raw })).toBe(true);
    expect(
      checkPolymerisationBoard("inventory", { ...e, H: raw }).correct,
    ).toBe(false);
  }
  const model = {
      kind: "polymerisation" as const,
      mode: "addition" as const,
      record: "initial",
    },
    z = initialBoard(model);
  expect(z.cropUnits).toBe("2");
  expect(validHistory(model, [z, { ...z, cropUnits: "4" }])).toBe(true);
  expect(validHistory(model, [z, { ...z, cropUnits: "4", bond: "1" }])).toBe(
    false,
  );
  expect(
    polymerisationHistoryStep("addition", z as Record<string, string>, {
      ...expectedPolymerisationBoard("addition", "propene"),
    }),
  ).toBe(false);
});
test("finite-link evidence is independently traversed; polyester retains both carbonyls and both alcohol oxygens", () => {
  for (const r of Object.values(linkRecords)) {
    const seen = new Set<number>();
    let components = 0;
    for (let i = 0; i < r.nodes; i++) {
      if (seen.has(i)) continue;
      components++;
      const queue = [i];
      while (queue.length) {
        const n = queue.pop()!;
        if (seen.has(n)) continue;
        seen.add(n);
        for (const [a, b] of r.edges) {
          if (a === n) queue.push(b);
          if (b === n) queue.push(a);
        }
      }
    }
    expect(components).toBe(r.components);
    expect(r.edges.length).toBe(r.nodes - components);
  }
  const b = {
    ...blankPolyesterDrawing(),
    diolC: "2",
    acidSpacerC: "4",
    leftO: "1",
    middleO: "1",
    carbonyl1: "2",
    carbonyl2: "2",
  };
  expect(polyesterRepeatAtoms(b)).toEqual({ C: 8, H: 12, O: 4 });
  for (const read of [readPolymerisationDrawing, readPolyesterDrawing]) {
    expect(read("original malformed bytes")).toBeNull();
    expect(read('{"constructor":1}')).toBeNull();
  }
});
test("every practice task has reviewed recovery, unique group placement and cold Foundation scope", () => {
  for (const q of j.practice) {
    expect(polymerisationRecovery[q.id].length).toBeGreaterThan(0);
    for (const id of polymerisationRecovery[q.id])
      expect([...j.refresher, ...j.guided].some((q) => q.id === id)).toBe(true);
  }
  const grouped = j.practiceGroups!.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(43);
  expect(new Set(grouped)).toEqual(new Set(j.practice.map((q) => q.id)));
  for (const q of [
    ...j.checkForms.slice(0, 2).flat(),
    ...j.reviewForms.slice(0, 2).flat(),
  ]) {
    expect(q.model).toBeUndefined();
    expect(q.title).not.toMatch(/Higher|condensation|polyester/);
  }
  const l = lessons.find((l) => l.slug === "polymers")!;
  expect(l.journey).toBe(j);
  expect(l.course).toBe("separate");
  expect(
    all.find((q) => q.id === "pol-v1-p-ethene")!.exposureAliases,
  ).toContain("polymers-0");
});
