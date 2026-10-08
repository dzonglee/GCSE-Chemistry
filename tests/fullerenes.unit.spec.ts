import { test, expect } from "@playwright/test";
import {
  fullereneAtoms,
  fullereneBonds,
  fullereneFaces,
  fullereneFocusRings,
  fullereneNeighbours,
  initialFullereneBoard,
  validFullereneBoard,
  fullerenePrediction,
  type FullereneMode,
} from "../src/lib/fullerenes";
import { fullereneJourney } from "../src/content/journeys/fullerenes";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { exposureIds } from "../src/lib/progress";
test("C60 is a genuine connected sixty-carbon closed cage with pentagons hexagons and two faces per edge", () => {
  expect(fullereneAtoms).toHaveLength(60);
  expect(fullereneBonds).toHaveLength(90);
  expect(fullereneFaces.filter((f) => f.length === 5)).toHaveLength(12);
  expect(fullereneFaces.filter((f) => f.length === 6)).toHaveLength(20);
  expect(60 - 90 + fullereneFaces.length).toBe(2);
  expect(new Set(fullereneAtoms.map((a) => a.position.join(","))).size).toBe(
    60,
  );
  const radius = fullereneAtoms[0].position.reduce((s, v) => s + v * v, 0);
  for (const a of fullereneAtoms) {
    expect(a.position.reduce((s, v) => s + v * v, 0)).toBeCloseTo(radius);
    expect(fullereneNeighbours(a.id)).toHaveLength(3);
  }
  const expected: string[] = [];
  for (const a of fullereneAtoms)
    for (const b of fullereneAtoms)
      if (
        a.id < b.id &&
        Math.abs(
          a.position.reduce((s, v, i) => s + (v - b.position[i]) ** 2, 0) -
            4 / 9,
        ) < 1e-9
      )
        expected.push(`${a.id},${b.id}`);
  expect(fullereneBonds.map((b) => `${b.a},${b.b}`).sort()).toEqual(
    expected.sort(),
  );
  const reached = new Set([0]);
  for (let i = 0; i < 60; i++)
    for (const b of fullereneBonds) {
      if (reached.has(b.a)) reached.add(b.b);
      if (reached.has(b.b)) reached.add(b.a);
    }
  expect(reached.size).toBe(60);
  const edgeCounts = new Map<string, number>();
  for (const ring of fullereneFaces) {
    expect(new Set(ring).size).toBe(ring.length);
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i],
        b = ring[(i + 1) % ring.length],
        key = `${Math.min(a, b)},${Math.max(a, b)}`;
      expect(expected).toContain(key);
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
    }
  }
  expect(edgeCounts.size).toBe(90);
  expect(new Set(edgeCounts.values())).toEqual(new Set([2]));
  expect(fullereneFocusRings.map((r) => r.length)).toEqual([5, 6, 6]);
});
test("cage faces are planar convex boundaries while the whole atom set has real depth and a hollow centre", () => {
  expect(
    new Set(fullereneAtoms.map((a) => a.position[2])).size,
  ).toBeGreaterThan(5);
  for (const face of fullereneFaces) {
    const a = fullereneAtoms[face[0]].position,
      u = fullereneAtoms[face[1]].position.map((v, i) => v - a[i]),
      v = fullereneAtoms[face[2]].position.map((v, i) => v - a[i]),
      n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ],
      distance = (p: number[]) =>
        p.reduce((s, v, i) => s + (v - a[i]) * n[i], 0);
    for (const id of face)
      expect(distance(fullereneAtoms[id].position)).toBeCloseTo(0);
    const others = fullereneAtoms.map((p) => distance(p.position));
    expect(
      others.every((d) => d >= -1e-9) || others.every((d) => d <= 1e-9),
    ).toBe(true);
  }
  expect(
    fullereneAtoms.some((a) => a.position.every((v) => Math.abs(v) < 1e-9)),
  ).toBe(false);
  for (let axis = 0; axis < 3; axis++)
    expect(
      fullereneAtoms.reduce((s, a) => s + a.position[axis], 0),
    ).toBeCloseTo(0);
});
test("fullerene wrong predictions persist in strict one-operation histories and require both causal conditions", () => {
  for (const mode of ["cage", "separation", "carrier"] as FullereneMode[]) {
    const b = initialFullereneBoard(mode);
    expect(validFullereneBoard(mode, b)).toBe(true);
    expect(validFullereneBoard(mode, { ...b, extra: 0 })).toBe(false);
    expect(fullerenePrediction(mode, b).correct).toBe(false);
  }
  expect(
    fullerenePrediction("cage", { ring: 0, count: 6, extent: "molecule" })
      .correct,
  ).toBe(false);
  expect(
    fullerenePrediction("cage", { ring: 1, count: 6, extent: "molecule" })
      .correct,
  ).toBe(true);
  expect(
    validFullereneBoard("cage", { ring: "0", count: 5, extent: "molecule" }),
  ).toBe(false);
  expect(
    fullerenePrediction("separation", {
      force: "between",
      internal: "break",
      gap: 1,
    }).correct,
  ).toBe(false);
  expect(
    fullerenePrediction("separation", {
      force: "between",
      internal: "intact",
      gap: 1,
    }).correct,
  ).toBe(true);
  expect(
    fullerenePrediction("carrier", {
      feature: "hollow",
      guarantee: "yes",
      payload: 1,
    }).correct,
  ).toBe(false);
  expect(
    fullerenePrediction("carrier", {
      feature: "hollow",
      guarantee: "no",
      payload: 1,
    }).correct,
  ).toBe(true);
  const model = {
      kind: "fullerene-properties" as const,
      mode: "separation" as const,
      instruction: "Separate intact molecules.",
    },
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, gap: 1 }])).toBe(true);
  expect(validHistory(model, [b, { ...b, gap: 3 }])).toBe(false);
  expect(
    validHistory(model, [b, { ...b, force: "between", internal: "intact" }]),
  ).toBe(false);
});
test("all thirty-nine fullerene tasks have reviewed references and shared repeated C60 count exposure", () => {
  const all = tasks(fullereneJourney);
  expect(all).toHaveLength(44);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.followUp)
      expect(fullereneJourney.refresher.some((r) => r.id === q.followUp)).toBe(
        true,
      );
  }
  expect(lessons.find((l) => l.slug === "fullerenes")!.prerequisite).toBe(
    "graphene",
  );
  const ids = [
    "fu-v1-g-cage",
    "fu-v1-r-type",
    "fu-v1-p-count",
    "fu-v1-ca-count",
    "fu-v1-ra-count",
  ];
  for (const id of ids)
    for (const other of ids) expect(exposureIds([id])).toContain(other);
});
