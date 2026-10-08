import { test, expect } from "@playwright/test";
import {
  graphiteAtoms,
  graphiteBonds,
  graphiteNeighbours,
  graphiteFocusSites,
  graphitePositions,
  initialGraphiteBoard,
  validGraphiteBoard,
  graphitePrediction,
  type GraphiteMode,
} from "../src/lib/graphite";
import { graphiteJourney } from "../src/content/journeys/graphite";
import { tasks } from "../src/content/journeys/helpers";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { exposureIds } from "../src/lib/progress";
test("graphite is three separate connected honeycomb sheets with planar three-neighbour sites and six-member cycles", () => {
  expect(graphiteAtoms).toHaveLength(96);
  expect(graphiteBonds).toHaveLength(120);
  for (let i = 0; i < 32; i++) {
    expect(
      graphiteAtoms[i + 32].position[1] - graphiteAtoms[i].position[1],
    ).toBeCloseTo(0.5);
    expect(graphiteAtoms[i + 64].position.slice(0, 2)).toEqual(
      graphiteAtoms[i].position.slice(0, 2),
    );
  }
  expect(new Set(graphiteAtoms.map((a) => a.position.join(","))).size).toBe(96);
  for (const b of graphiteBonds) {
    const a = graphiteAtoms[b.a],
      c = graphiteAtoms[b.b];
    expect(a.layer).toBe(c.layer);
    expect(
      a.position.reduce((s, v, i) => s + (v - c.position[i]) ** 2, 0),
    ).toBeCloseTo(0.25);
  }
  for (const site of graphiteFocusSites) {
    const neighbours = graphiteNeighbours(site.id);
    expect(neighbours).toHaveLength(3);
    const v = neighbours.map((a) =>
      a.position.map((x, i) => x - site.position[i]),
    );
    for (let i = 0; i < 3; i++) {
      expect(v[i][2]).toBe(0);
      for (let j = i + 1; j < 3; j++)
        expect(v[i].reduce((s, x, k) => s + x * v[j][k], 0)).toBeCloseTo(
          -0.125,
        );
    }
  }
  for (const layer of [0, 1, 2]) {
    const atoms = graphiteAtoms.filter((a) => a.layer === layer),
      reached = new Set([atoms[0].id]);
    for (let i = 0; i < 32; i++)
      for (const b of graphiteBonds) {
        if (reached.has(b.a)) reached.add(b.b);
        if (reached.has(b.b)) reached.add(b.a);
      }
    expect(reached.size).toBe(32);
    const cycles = new Set<string>();
    const walk = (path: number[]) => {
      const last = path.at(-1)!;
      for (const a of graphiteNeighbours(last)) {
        if (a.layer !== layer) continue;
        if (path.length === 6) {
          if (a.id === path[0])
            cycles.add([...path].sort((a, b) => a - b).join(","));
        } else if (!path.includes(a.id)) walk([...path, a.id]);
      }
    };
    for (const a of atoms) walk([a.id]);
    expect(cycles.size).toBe(9);
  }
});
test("whole-sheet displacement conserves positions of other sheets and every covalent bond length", () => {
  for (const shift of [1, 2, 3]) {
    const moved = graphitePositions(shift);
    for (const a of graphiteAtoms) {
      expect(moved[a.id].position[0] - a.position[0]).toBeCloseTo(
        a.layer === 2 ? shift * 0.22 : 0,
      );
      expect(moved[a.id].position.slice(1)).toEqual(a.position.slice(1));
    }
    for (const b of graphiteBonds)
      expect(
        moved[b.a].position.reduce(
          (s, v, i) => s + (v - moved[b.b].position[i]) ** 2,
          0,
        ),
      ).toBeCloseTo(0.25);
  }
});
test("graphite histories reject false fields multi-step drift and incomplete property predictions", () => {
  for (const mode of [
    "coordination",
    "sliding",
    "carriers",
    "melting",
  ] as GraphiteMode[]) {
    const initial = initialGraphiteBoard(mode);
    expect(validGraphiteBoard(mode, initial)).toBe(true);
    expect(validGraphiteBoard(mode, { ...initial, extra: 0 })).toBe(false);
    expect(graphitePrediction(mode, initial).correct).toBe(false);
  }
  const model = {
      kind: "graphite-properties" as const,
      mode: "carriers" as const,
      instruction: "Choose carriers and mobility.",
    },
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, drift: 1 }])).toBe(true);
  expect(validHistory(model, [b, { ...b, drift: 3 }])).toBe(false);
  expect(
    validHistory(model, [
      b,
      { ...b, carrier: "electrons", mobility: "mobile" },
    ]),
  ).toBe(false);
  expect(
    graphitePrediction("sliding", {
      force: "interlayer",
      effect: "break",
      shift: 1,
    }).correct,
  ).toBe(false);
  expect(
    graphitePrediction("sliding", {
      force: "interlayer",
      effect: "intact",
      shift: 1,
    }).correct,
  ).toBe(true);
  expect(
    graphitePrediction("carriers", {
      carrier: "electrons",
      mobility: "fixed",
      drift: 0,
    }).correct,
  ).toBe(false);
  expect(
    graphitePrediction("carriers", {
      carrier: "electrons",
      mobility: "mobile",
      drift: 0,
    }).correct,
  ).toBe(true);
  expect(
    graphitePrediction("melting", { force: "interlayer", energy: "high" })
      .correct,
  ).toBe(false);
  expect(
    graphitePrediction("melting", { force: "covalent", energy: "high" })
      .correct,
  ).toBe(true);
  expect(validGraphiteBoard("coordination", { site: 0, neighbours: "3" })).toBe(
    false,
  );
});
test("all original graphite demands have correct answer references targeted recovery and conservative coordination exposure", () => {
  const all = tasks(graphiteJourney);
  expect(all).toHaveLength(46);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.followUp)
      expect(graphiteJourney.refresher.some((r) => r.id === q.followUp)).toBe(
        true,
      );
  }
  const lesson = lessons.find((l) => l.slug === "graphite")!;
  expect(lesson.prerequisite).toBe("carbon-structures");
  expect(lesson.questions).toEqual([]);
  const ids = [
    "gr-v1-g-coordination",
    "gr-v1-r-coordination",
    "gr-v1-p-neighbours",
    "gr-v1-ca-neighbours",
    "gr-v1-ra-neighbours",
  ];
  for (const id of ids)
    for (const other of ids) expect(exposureIds([id])).toContain(other);
});
