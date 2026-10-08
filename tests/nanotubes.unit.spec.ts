import { test, expect } from "@playwright/test";
import {
  nanotubeAtoms as atoms,
  nanotubeBonds as bonds,
  nanotubeFocusSites,
  nanotubeNeighbours,
  initialNanotubeBoard,
  validNanotubeBoard,
  nanotubePrediction,
  nanotubeMaterials,
} from "../src/lib/nanotubes";
test("rolled honeycomb independently joins the seam, has no axis atom and preserves three neighbours at interior sites", () => {
  expect(atoms).toHaveLength(72);
  expect(bonds).toHaveLength(96);
  expect(new Set(atoms.map((a) => a.position.join(","))).size).toBe(72);
  const radii = atoms.map((a) => Math.hypot(a.position[0], a.position[2]));
  for (const r of radii)
    expect(r).toBeCloseTo(((6 * Math.sqrt(3)) / (2 * Math.PI)) * 0.45, 10);
  expect(Math.min(...radii)).toBeGreaterThan(0.7);
  const expected: string[] = [];
  // Independently recover bonds from the unrolled metric with the periodic
  // shortest circumference displacement, rather than reusing edge conditions.
  for (const a of atoms)
    for (const b of atoms)
      if (a.id < b.id) {
        const dk = Math.min(Math.abs(a.k - b.k), 12 - Math.abs(a.k - b.k));
        const dx = (dk * Math.sqrt(3)) / 2,
          dy = 1.5 * (a.row - b.row) + a.basis - b.basis;
        if (Math.abs(dx * dx + dy * dy - 1) < 1e-9)
          expected.push([a.id, b.id].sort((a, b) => a - b).join(","));
      }
  expect(
    bonds.map((b) => [b.a, b.b].sort((a, b) => a - b).join(",")).sort(),
  ).toEqual(expected.sort());
  expect(bonds.some((b) => Math.abs(atoms[b.a].k - atoms[b.b].k) === 11)).toBe(
    true,
  );
  for (const a of atoms)
    if (a.row > 0 && a.row < 5)
      expect(nanotubeNeighbours(a.id)).toHaveLength(3);
  for (const a of nanotubeFocusSites)
    expect(nanotubeNeighbours(a.id)).toHaveLength(3);
  const reached = new Set([0]);
  for (let i = 0; i < 72; i++)
    for (const b of bonds) {
      if (reached.has(b.a)) reached.add(b.b);
      if (reached.has(b.b)) reached.add(b.a);
    }
  expect(reached.size).toBe(72);
  // Every full hexagon closes in the seam-joined wall; no triangles or
  // pentagons arise from accidental circumferential connections.
  const cycles = (length: number) => {
    const found = new Set<string>();
    const walk = (p: number[]) => {
      for (const n of nanotubeNeighbours(p.at(-1)!)) {
        if (p.length === length) {
          if (n.id === p[0]) found.add([...p].sort((a, b) => a - b).join(","));
        } else if (!p.includes(n.id)) walk([...p, n.id]);
      }
    };
    for (const a of atoms) walk([a.id]);
    return found;
  };
  expect(cycles(3).size).toBe(0);
  expect(cycles(5).size).toBe(0);
  expect(cycles(6).size).toBe(24);
});
test("ratio predictions cover common-unit changes and reject inverted or multiplied ratios", () => {
  for (const length of [500, 1000, 2000])
    for (const diameter of [1, 2, 4]) {
      const b = { length, diameter, ratio: length / diameter };
      expect(validNanotubeBoard("ratio", b)).toBe(true);
      expect(nanotubePrediction("ratio", b).correct).toBe(true);
      expect(nanotubePrediction("ratio", { ...b, ratio: 0 }).correct).toBe(
        false,
      );
    }
  expect(
    nanotubePrediction("ratio", { length: 1000, diameter: 2, ratio: 2000 })
      .correct,
  ).toBe(false);
  expect(
    validNanotubeBoard("ratio", { length: "1000", diameter: 2, ratio: 500 }),
  ).toBe(false);
  expect(
    validNanotubeBoard("ratio", {
      length: 1000,
      diameter: 2,
      ratio: 500,
      extra: 1,
    }),
  ).toBe(false);
  expect(
    validNanotubeBoard("ratio", { length: 1000, diameter: 2.5, ratio: 500 }),
  ).toBe(false);
});
test("complete causal predictions separate wall bonds, material criteria and mobile electrical carriers", () => {
  for (const mode of ["tube", "ratio", "reinforcement", "electronics"] as const)
    expect(validNanotubeBoard(mode, initialNanotubeBoard(mode))).toBe(true);
  expect(
    nanotubePrediction("tube", { shape: "tube", neighbours: 3 }).correct,
  ).toBe(true);
  expect(
    nanotubePrediction("tube", { shape: "tube", neighbours: 6 }).correct,
  ).toBe(false);
  expect(
    nanotubePrediction("tube", { shape: "rod", neighbours: 3 }).correct,
  ).toBe(false);
  const passing = nanotubeMaterials.filter(
    (m) => m.density <= 1.8 && m.strength >= 30 && m.stiffness >= 25,
  );
  expect(passing.map((m) => m.id)).toEqual(["B"]);
  expect(
    nanotubePrediction("reinforcement", { material: "B", cause: "covalent" })
      .correct,
  ).toBe(true);
  for (const material of ["A", "C"])
    expect(
      nanotubePrediction("reinforcement", { material, cause: "covalent" })
        .correct,
    ).toBe(false);
  expect(
    nanotubePrediction("reinforcement", { material: "B", cause: "electrons" })
      .correct,
  ).toBe(false);
  expect(
    nanotubePrediction("electronics", {
      carrier: "electrons",
      mobility: "mobile",
    }).correct,
  ).toBe(true);
  expect(
    nanotubePrediction("electronics", {
      carrier: "electrons",
      mobility: "fixed",
    }).correct,
  ).toBe(false);
  expect(
    nanotubePrediction("electronics", { carrier: "ions", mobility: "mobile" })
      .correct,
  ).toBe(false);
});

import { nanotubeJourney } from "../src/content/journeys/nanotubes";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { exposureIds } from "../src/lib/progress";
import { initialBoard, validHistory } from "../src/lib/workbench";
test("all forty-nine nanotube tasks have reviewed references, honest writing and retained single-field predictions", () => {
  const all = tasks(nanotubeJourney);
  expect(all).toHaveLength(49);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.followUp)
      expect(nanotubeJourney.refresher.some((r) => r.id === q.followUp)).toBe(
        true,
      );
  }
  expect(lessons.find((l) => l.slug === "carbon-nanotubes")!.prerequisite).toBe(
    "fullerenes",
  );
  const ids = [
    "nt-v1-g-tube",
    "nt-v1-r-shape",
    "nt-v1-p-recognise",
    "nt-v1-ca-shape",
    "nt-v1-ra-shape",
  ];
  for (const id of ids)
    for (const other of ids) expect(exposureIds([id])).toContain(other);
  for (const id of [
    "nt-v1-g-reinforce",
    "nt-v1-r-strength",
    "nt-v1-ca-strength",
    "nt-v1-rb-strength",
  ])
    for (const other of [
      "nt-v1-g-reinforce",
      "nt-v1-r-strength",
      "nt-v1-ca-strength",
      "nt-v1-rb-strength",
    ])
      expect(exposureIds([id])).toContain(other);
  const model = {
      kind: "nanotube-properties" as const,
      mode: "ratio" as const,
      instruction: "Compare dimensions.",
    },
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, length: 2000 }])).toBe(true);
  expect(validHistory(model, [b, { ...b, length: 2000, diameter: 4 }])).toBe(
    false,
  );
  expect(validHistory(model, [b, b])).toBe(false);
});
