import { test, expect } from "@playwright/test";
import {
  diamondAtoms,
  diamondBonds,
  diamondNeighbours,
  diamondFocusSites,
  interiorDiamondAtoms,
} from "../src/lib/diamond";
test("diamond fragment is connected carbon with tetrahedral four-neighbour sites, not separate molecules or a six-neighbour cube", () => {
  expect(diamondAtoms).toHaveLength(64);
  expect(new Set(diamondAtoms.map((a) => a.quarters.join(","))).size).toBe(64);
  const visited = new Set<number>([0]),
    queue = [0];
  while (queue.length) {
    for (const n of diamondNeighbours(queue.shift()!))
      if (!visited.has(n.id)) {
        visited.add(n.id);
        queue.push(n.id);
      }
  }
  expect(visited.size).toBe(64);
  expect(interiorDiamondAtoms.length).toBeGreaterThan(3);
  for (const atom of diamondAtoms) {
    expect(diamondNeighbours(atom.id).length).toBeGreaterThan(0);
    expect(diamondNeighbours(atom.id).length).toBeLessThanOrEqual(4);
  }
  expect(new Set(diamondBonds.map((b) => `${b.a},${b.b}`)).size).toBe(
    diamondBonds.length,
  );
  for (const bond of diamondBonds) {
    const a = diamondAtoms[bond.a],
      b = diamondAtoms[bond.b];
    expect(
      a.quarters.reduce((s, v, i) => s + (v - b.quarters[i]) ** 2, 0),
    ).toBe(3);
  }
  for (const focus of diamondFocusSites) {
    const vectors = diamondNeighbours(focus.id).map((n) =>
      n.quarters.map((v, i) => v - focus.quarters[i]),
    );
    expect(vectors).toHaveLength(4);
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        expect(vectors[i].reduce((s, v, k) => s + v * vectors[j][k], 0)).toBe(
          -1,
        );
    const [a, b, c] = vectors;
    const determinant =
      a[0] * (b[1] * c[2] - b[2] * c[1]) -
      a[1] * (b[0] * c[2] - b[2] * c[0]) +
      a[2] * (b[0] * c[1] - b[1] * c[0]);
    expect(Math.abs(determinant)).toBe(4);
  }
});

test("network predictions require full causal explanations and reject malformed saved states", async () => {
  const { diamondStructuresJourney: journey } =
    await import("../src/content/journeys/diamond-structures");
  const { initialBoard, validBoard, validHistory, checkBoard } =
    await import("../src/lib/workbench");
  for (const task of journey.guided) {
    const model = task.model!;
    if (model.kind !== "giant-covalent") throw Error("Wrong model");
    const start = initialBoard(model);
    expect(validBoard(model, start)).toBe(true);
    expect(checkBoard(model, start).correct).toBe(false);
    expect(validBoard(model, { ...start, injected: true })).toBe(false);
    expect(validHistory(model, [start, start])).toBe(false);
    const history =
      model.mode === "diamond"
        ? [
            start,
            { ...start, neighbours: 3 },
            { ...start, neighbours: 3, site: 2 },
            { ...start, neighbours: 4, site: 2 },
          ]
        : model.mode === "energy"
          ? [
              start,
              { ...start, force: "covalent" },
              { ...start, force: "covalent", extent: "many" },
              { force: "covalent", extent: "many", energy: "high" },
            ]
          : model.mode === "carriers"
            ? [
                start,
                { ...start, conducts: "no" },
                { conducts: "no", carrier: "none" },
              ]
            : [
                start,
                { ...start, extent: "giant" },
                { extent: "giant", bond: "covalent" },
              ];
    expect(validHistory(model, history)).toBe(true);
    expect(checkBoard(model, history.at(-1)!).correct).toBe(true);
    if (model.mode === "diamond") {
      expect(validBoard(model, { site: "0", neighbours: 4 })).toBe(false);
      expect(validBoard(model, { site: 0, neighbours: 4.1 })).toBe(false);
      expect(validHistory(model, [start, { site: 2, neighbours: 4 }])).toBe(
        false,
      );
    }
    if (model.mode === "energy")
      for (const wrong of [
        { force: "intermolecular", extent: "many", energy: "high" },
        { force: "covalent", extent: "one", energy: "high" },
        { force: "covalent", extent: "many", energy: "low" },
      ])
        expect(checkBoard(model, wrong).correct).toBe(false);
  }
});
test("all 46 reviewed demands have correct references and self-reviewed written work", async () => {
  const { diamondStructuresJourney: journey } =
    await import("../src/content/journeys/diamond-structures");
  const { tasks } = await import("../src/content/journeys/helpers");
  const { mark } = await import("../src/lib/marking");
  const all = tasks(journey);
  expect(all).toHaveLength(46);
  expect(new Set(all.map((q) => q.id)).size).toBe(46);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    if (q.misconceptions)
      for (const wrong of Object.keys(q.misconceptions))
        expect(mark(q, wrong).correct).toBe(false);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
});
test("identical coordination demands share exposure across legacy, teaching, check and delayed retrieval", async () => {
  const { lessons } = await import("../src/content/curriculum");
  const { exposureIds } = await import("../src/lib/progress");
  const lesson = lessons.find((l) => l.slug === "carbon-structures")!;
  expect(lesson.questions).toHaveLength(4);
  expect(lesson.checks).toHaveLength(2);
  expect(lesson.title).toBe("Diamond and covalent networks");
  const same = [
    "dn-v1-g-network",
    "dn-v1-r-four",
    "dn-v1-p-neighbours",
    "dn-v1-ca-neighbours",
    "dn-v1-ra-neighbours",
    lesson.questions[0].id,
  ];
  for (const id of same)
    for (const other of same) expect(exposureIds([id])).toContain(other);
});
