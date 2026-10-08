import { test, expect } from "@playwright/test";
import {
  grapheneAtoms,
  grapheneBonds,
  grapheneFocusSites,
  grapheneNeighbours,
  graphenePanels,
  initialGrapheneBoard,
  validGrapheneBoard,
  graphenePrediction,
  type GrapheneMode,
} from "../src/lib/graphene";
import { grapheneJourney } from "../src/content/journeys/graphene";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { exposureIds } from "../src/lib/progress";
test("graphene is one connected planar honeycomb sheet with equal coplanar three-neighbour sites", () => {
  expect(grapheneAtoms).toHaveLength(32);
  expect(grapheneBonds).toHaveLength(40);
  expect(new Set(grapheneAtoms.map((a) => a.position[2]))).toEqual(
    new Set([0]),
  );
  const reached = new Set([0]);
  for (let i = 0; i < 32; i++)
    for (const b of grapheneBonds) {
      if (reached.has(b.a)) reached.add(b.b);
      if (reached.has(b.b)) reached.add(b.a);
    }
  expect(reached.size).toBe(32);
  for (const site of grapheneFocusSites) {
    const v = grapheneNeighbours(site.id).map((a) =>
      a.position.map((x, i) => x - site.position[i]),
    );
    expect(v).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(v[i][2]).toBe(0);
      expect(v[i].reduce((s, x) => s + x * x, 0)).toBeCloseTo(0.25);
      for (let j = i + 1; j < 3; j++)
        expect(v[i].reduce((s, x, k) => s + x * v[j][k], 0)).toBeCloseTo(
          -0.125,
        );
    }
  }
});
test("supplied panel evidence meets both criteria for only B and supports mass reduction rather than a density claim", () => {
  expect(
    graphenePanels.filter((p) => p.mass <= 15 && p.load >= 15).map((p) => p.id),
  ).toEqual(["B"]);
  expect(
    ((graphenePanels[2].mass - graphenePanels[1].mass) /
      graphenePanels[2].mass) *
      100,
  ).toBe(40);
  for (const panel of ["A", "C"])
    expect(
      graphenePrediction("composite", { panel, cause: "covalent" }).correct,
    ).toBe(false);
  expect(
    graphenePrediction("composite", { panel: "B", cause: "mobile" }).correct,
  ).toBe(false);
  expect(
    graphenePrediction("composite", { panel: "B", cause: "covalent" }).correct,
  ).toBe(true);
  expect(
    graphenePrediction("electronics", {
      property: "thin-conducting",
      carrier: "fixed",
    }).correct,
  ).toBe(false);
  expect(
    graphenePrediction("electronics", {
      property: "thin-conducting",
      carrier: "mobile",
    }).correct,
  ).toBe(true);
  expect(
    graphenePrediction("sheet", { layers: 1, extent: "molecule" }).correct,
  ).toBe(false);
  expect(
    graphenePrediction("sheet", { layers: 1, extent: "network" }).correct,
  ).toBe(true);
});
test("native graphene predictions have strict saved fields and one-operation histories", () => {
  for (const mode of ["sheet", "electronics", "composite"] as GrapheneMode[]) {
    const b = initialGrapheneBoard(mode);
    expect(validGrapheneBoard(mode, b)).toBe(true);
    expect(validGrapheneBoard(mode, { ...b, extra: 1 })).toBe(false);
    expect(graphenePrediction(mode, b).correct).toBe(false);
  }
  expect(validGrapheneBoard("sheet", { layers: "1", extent: "network" })).toBe(
    false,
  );
  expect(validGrapheneBoard("sheet", { layers: 1.5, extent: "network" })).toBe(
    false,
  );
  const model = {
      kind: "graphene-properties" as const,
      mode: "sheet" as const,
      instruction: "Predict one sheet.",
    },
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, layers: 3 }])).toBe(true);
  expect(validHistory(model, [b, { ...b, layers: 1, extent: "network" }])).toBe(
    false,
  );
  expect(validHistory(model, [b, b])).toBe(false);
});
test("all forty-four graphene tasks have reviewed answer references and conservative repeated-layer exposure", () => {
  const all = tasks(grapheneJourney);
  expect(all).toHaveLength(44);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.followUp)
      expect(grapheneJourney.refresher.some((r) => r.id === q.followUp)).toBe(
        true,
      );
  }
  expect(lessons.find((l) => l.slug === "graphene")!.prerequisite).toBe(
    "graphite",
  );
  const ids = [
    "ge-v1-g-sheet",
    "ge-v1-r-sheet",
    "ge-v1-p-layer",
    "ge-v1-ca-layers",
    "ge-v1-ra-layers",
  ];
  for (const id of ids)
    for (const other of ids) expect(exposureIds([id])).toContain(other);
  for (const id of [
    "gr-v1-g-coordination",
    "gr-v1-ca-neighbours",
    "gr-v1-ra-neighbours",
  ]) {
    expect(exposureIds([id])).toContain("ge-v1-p-neighbours");
    expect(exposureIds(["ge-v1-p-neighbours"])).toContain(id);
  }
});
