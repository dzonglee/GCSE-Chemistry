import { test, expect } from "@playwright/test";
import {
  polymerChain,
  initialPolymerBoard,
  validPolymerBoard,
  polymerPrediction,
  readPolymerDrawing,
} from "../src/lib/polymer-structures";
import { polymerStructureJourney } from "../src/content/journeys/polymer-structures";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { exposureIds } from "../src/lib/progress";
test("whole-repeat growth has exact C2H4 contribution and genuinely tetrahedral interior carbon with singly bonded hydrogens", () => {
  for (const units of [2, 3, 4]) {
    const { atoms, bonds, continuation } = polymerChain(units);
    expect(atoms.filter((a) => a.element === "C")).toHaveLength(2 * units);
    expect(atoms.filter((a) => a.element === "H")).toHaveLength(4 * units);
    expect(bonds).toHaveLength(6 * units - 1);
    expect(continuation).toHaveLength(2);
    expect(new Set(atoms.map((a) => a.position.join(","))).size).toBe(
      6 * units,
    );
    const neighbours = (id: number) =>
      bonds
        .filter((b) => b.a === id || b.b === id)
        .map((b) => atoms[b.a === id ? b.b : b.a]);
    for (const a of atoms) {
      if (a.element === "H") {
        expect(neighbours(a.id)).toHaveLength(1);
        expect(neighbours(a.id)[0].element).toBe("C");
        continue;
      }
      const n = neighbours(a.id);
      expect(n.filter((a) => a.element === "H")).toHaveLength(2);
      const vectors = n.map((b) => b.position.map((v, i) => v - a.position[i]));
      if (a.id > 0 && a.id < units * 2 - 1) expect(n).toHaveLength(4);
      else {
        expect(n).toHaveLength(3);
        vectors.push(
          continuation
            .find((c) => c.from === a.id)!
            .position.map((v, i) => v - a.position[i]),
        );
      }
      expect(vectors).toHaveLength(4);
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++) {
          const dot =
            vectors[i].reduce((s, v, k) => s + v * vectors[j][k], 0) /
            (Math.hypot(...vectors[i]) * Math.hypot(...vectors[j]));
          expect(dot).toBeCloseTo(-1 / 3, 10);
        }
    }
    const reached = new Set([0]);
    for (let i = 0; i < atoms.length; i++)
      for (const b of bonds) {
        if (reached.has(b.a)) reached.add(b.b);
        if (reached.has(b.b)) reached.add(b.a);
      }
    expect(reached.size).toBe(atoms.length);
    expect(
      bonds.filter(
        (b) => atoms[b.a].element === "H" && atoms[b.b].element === "H",
      ),
    ).toHaveLength(0);
  }
});
test("strict saved prediction fields require complete causal choices and one whole-unit or spacing step", () => {
  for (const mode of ["chain", "repeat", "separation", "phase"] as const) {
    const b = initialPolymerBoard(mode);
    expect(validPolymerBoard(mode, b)).toBe(true);
    expect(validPolymerBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  expect(
    polymerPrediction("chain", {
      units: 3,
      extent: "molecule",
      bond: "covalent",
    }).correct,
  ).toBe(true);
  expect(
    polymerPrediction("chain", {
      units: 3,
      extent: "network",
      bond: "covalent",
    }).correct,
  ).toBe(false);
  expect(
    polymerPrediction("repeat", {
      backbone: "single",
      hydrogens: 2,
      continuation: "yes",
      countMark: "n",
    }).correct,
  ).toBe(true);
  for (const patch of [
    { backbone: "double" },
    { hydrogens: 1 },
    { continuation: "no" },
    { countMark: "N" },
  ])
    expect(
      polymerPrediction("repeat", {
        backbone: "single",
        hydrogens: 2,
        continuation: "yes",
        countMark: "n",
        ...patch,
      }).correct,
    ).toBe(false);
  expect(
    polymerPrediction("separation", {
      interaction: "between",
      internal: "intact",
      gap: 2,
    }).correct,
  ).toBe(true);
  expect(
    polymerPrediction("separation", {
      interaction: "between",
      internal: "break",
      gap: 2,
    }).correct,
  ).toBe(false);
  expect(
    polymerPrediction("phase", {
      size: "larger",
      forces: "stronger",
      energy: "more",
    }).correct,
  ).toBe(true);
  expect(
    polymerPrediction("phase", {
      size: "larger",
      forces: "covalent",
      energy: "more",
    }).correct,
  ).toBe(false);
  const model = {
      kind: "polymer-properties" as const,
      mode: "chain" as const,
      instruction: "Grow shown units.",
    },
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, units: 3 }])).toBe(true);
  expect(validHistory(model, [b, { ...b, units: 4 }])).toBe(false);
  expect(validHistory(model, [b, b])).toBe(false);
  expect(validHistory(model, [b, { ...b, units: 3, extent: "molecule" }])).toBe(
    false,
  );
});
test("independent repeat construction rejects monomer bonds missing continuation uppercase marker and malformed saved choices", () => {
  const task = polymerStructureJourney.practice.find(
    (q) => q.polymerRepeatDrawing,
  )!;
  const correct = {
    bondOrder: "1",
    hydrogens: "2",
    continuation: "1",
    countMark: "1",
  };
  expect(mark(task, JSON.stringify(correct)).correct).toBe(true);
  for (const patch of [
    { bondOrder: "2" },
    { hydrogens: "1" },
    { continuation: "0" },
    { countMark: "2" },
  ])
    expect(mark(task, JSON.stringify({ ...correct, ...patch })).correct).toBe(
      false,
    );
  for (const raw of [
    "{}",
    "null",
    "[]",
    JSON.stringify({ ...correct, extra: "1" }),
    JSON.stringify({ ...correct, hydrogens: 2 }),
    JSON.stringify({ ...correct, hydrogens: "2.0" }),
  ]) {
    expect(readPolymerDrawing(raw)).toBeNull();
    expect(mark(task, raw).invalid).toBe(true);
  }
});
test("all fifty polymer tasks have reviewed references and conservative repeated-fact exposure", () => {
  const all = tasks(polymerStructureJourney);
  expect(all).toHaveLength(50);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(
        polymerStructureJourney.refresher.some((r) => r.id === q.followUp),
      ).toBe(true);
  }
  expect(
    lessons.find((l) => l.slug === "polymer-structures")!.prerequisite,
  ).toBe("small-molecules-properties");
  const ids = ["ps-v1-g-repeat", "ps-v1-p-draw", "ps-v1-cb-draw", "ps-v1-ca-n"];
  for (const id of ids)
    for (const other of ids) expect(exposureIds([id])).toContain(other);
});
