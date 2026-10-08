import { test, expect } from "@playwright/test";
import { paper2Higher as paper } from "../src/content/extended-assessments";
import { questionById } from "../src/content/curriculum";
import { mark, displayResponse } from "../src/lib/marking";
import { emptyTangentDrawing } from "../src/lib/tangent-drawing";
import {
  emptyOrganicDrawing,
  drawingOrganicCounts,
} from "../src/lib/organic-drawing";
import { blankPolymerisationDrawing } from "../src/lib/polymerisation-board";
import {
  blankPolyesterDrawing,
  polyesterRepeatAtoms,
} from "../src/lib/polyester";
import { emptyHaberDrawing } from "../src/lib/haber-drawing";

test("the individually reviewed Higher Paper2 sample preserves scope, original identities and six tasks in each strand", () => {
  expect(paper.questions).toHaveLength(30);
  expect(paper.course).toBe("separate");
  expect(paper.tier).toBe("higher");
  expect(paper.questions.filter((q) => q.rubric)).toHaveLength(14);
  expect(new Set(paper.questions.map((q) => q.id)).size).toBe(30);
  expect(
    Object.fromEntries(
      [...new Set(paper.topics)].map((t) => [
        t,
        paper.topics.filter((x) => x === t).length,
      ]),
    ),
  ).toEqual({ rates: 6, organic: 6, analysis: 6, atmosphere: 6, resources: 6 });
  for (const q of paper.questions) {
    expect(q).toBe(questionById(q.id));
    expect("model" in q ? q.model : undefined).toBeUndefined();
  }
});

test("all sixteen automatic responses agree with independently calculated or chemically identified references", () => {
  const refs: Record<string, string | Record<string, string>> = {
    "tr-v1-B-calibration": String(((25 - 10) / (50 - 20)) * 6e-5),
    "es-v1-b-removal": String(15 + 5 - 4 - 12),
    "rp-v1-b-plan": "Use the same thiosulfate concentration",
    "alk-v1-b-balance": String((12 * 2 + 14) / 2),
    "crk-v1-b-control":
      "The identification is unreliable in this supplied comparison",
    "natural-v1-c-b-diagram": "Nucleotides",
    "purity-v1-cB-recovery": String((20 / 25) * 100),
    "chromatography-v1-cB-round": ((2.8 * 10) / 70).toFixed(2),
    "gas-tests-v1-cB-contact":
      "This record does not rule out CO2 because the requested bubbling contact never occurred",
    "instrumental-analysis-v1-cB-ca-cu": "Calcium and copper(II) ions",
    "greenhouse-v1-cB-ledger": {
      absorbed: String(240 - 60),
      net: String(240 - 60 - 168),
    },
    "climate-v1-cB-service": {
      perA: String(16 / 80),
      perB: String(9 / 150),
      reductionPercent: String(((16 / 80 - 9 / 150) / (16 / 80)) * 100),
    },
    "pollution-v1-cB-balance": { a: "2", b: "7", c: "6", d: "8" },
    "water-v1-cB-energy": {
      a: String(30 / 5),
      b: String(20 / 5),
      difference: String((20 - 30) / 5),
    },
    "lca-v1-cB-recovery": {
      recovered: String(200 * 0.9),
      other: String(250 - 200 * 0.9),
      new: String(220 - 200 * 0.9),
    },
    "haber-v1-cB-feed": { h: String(6 * 3), a: String(6 * 2) },
  };
  expect(Object.keys(refs)).toHaveLength(16);
  for (const [id, value] of Object.entries(refs))
    expect(
      mark(
        questionById(id)!,
        typeof value === "string" ? value : JSON.stringify(value),
      ).correct,
      id,
    ).toBe(true);
  // Both sides have C6 H16 O14; coefficients are coprime. Subscripting
  // different substances or doubling every coefficient is not this command.
  expect(2 * 3).toBe(6);
  expect(2 * 8).toBe(8 * 2);
  expect(7 * 2).toBe(6 + 8);
  for (const [id, value] of [
    ["tr-v1-B-calibration", "0.5"],
    ["chromatography-v1-cB-round", "0.4"],
    ["greenhouse-v1-cB-ledger", JSON.stringify({ absorbed: "240", net: "72" })],
    ["water-v1-cB-energy", JSON.stringify({ a: "6", b: "4", difference: "2" })],
    [
      "lca-v1-cB-recovery",
      JSON.stringify({ recovered: "225", other: "25", new: "-5" }),
    ],
    [
      "pollution-v1-cB-balance",
      JSON.stringify({ a: "4", b: "14", c: "12", d: "16" }),
    ],
  ])
    expect(mark(questionById(id)!, value).correct, id).toBe(false);
  expect(paper.questions[17].instrumentalGiven!.spectrum!.lines).toEqual([
    1, 4, 5, 7, 8, 12,
  ]);
  expect([...new Set([1, 5, 8, 4, 7, 12])].sort((a, b) => a - b)).toEqual([
    1, 4, 5, 7, 8, 12,
  ]);
});

test("full tangent, acid, addition, polyester and pressure graph constructions require manual review and reject untouched scaffolds", () => {
  const acid = {
    ...emptyOrganicDrawing(),
    n: "2",
    hydroxyl: "yes",
    carbonyl: "2",
    oxygenH: "yes",
    h0: "yes",
    h1: "yes",
    h2: "yes",
  };
  expect(drawingOrganicCounts(acid)).toMatchObject({ C: 2, H: 4, O: 2 });
  const addition = {
    ...blankPolymerisationDrawing(),
    s0: "H",
    s1: "F",
    s2: "H",
    s3: "F",
    bond: "1",
    left: "1",
    right: "1",
    brackets: "1",
    countMark: "n",
  };
  expect(paper.questions[9].polymerisationGiven!.groups).toEqual([
    "H",
    "F",
    "H",
    "F",
  ]);
  const polyester = {
    ...blankPolyesterDrawing(),
    diolC: "3",
    acidSpacerC: "1",
    leftO: "1",
    middleO: "1",
    carbonyl1: "2",
    carbonyl2: "2",
    left: "1",
    right: "1",
    brackets: "1",
    countMark: "n",
  };
  expect(polyesterRepeatAtoms(polyester)).toMatchObject({ C: 6, H: 8, O: 4 });
  const graph = {
    ...emptyHaberDrawing(),
    xMax: "500",
    xStep: "100",
    yMax: "50",
    yStep: "10",
  };
  const points = [
    [60, 4],
    [120, 11],
    [180, 17],
    [240, 22],
    [300, 26],
    [360, 29],
    [420, 31],
  ];
  expect(paper.questions[29].haberDrawing!.points).toEqual(points);
  points.forEach(([x, y], i) =>
    Object.assign(graph, {
      ["p" + i + "x"]: String(x),
      ["p" + i + "y"]: String(y),
      ["c" + i]: String(y),
    }),
  );
  const drafts: Record<string, object> = {
    "tr-v1-A-draw": { tx0: "10", ty0: "20", tx1: "30", ty1: "44" },
    "alc-v1-b-draw": acid,
    "pol-v1-b-draw": addition,
    "pol-v1-p-polyester2": polyester,
    "haber-v1-cB-freeGraph": graph,
  };
  for (const q of paper.questions.filter((q) => q.rubric))
    expect(
      mark(q, drafts[q.id] ? JSON.stringify(drafts[q.id]) : q.answer),
      q.id,
    ).toMatchObject({ correct: false, selfReview: true, empty: false });
  for (const [id, draft] of [
    ["tr-v1-A-draw", emptyTangentDrawing()],
    ["alc-v1-b-draw", emptyOrganicDrawing()],
    ["pol-v1-b-draw", blankPolymerisationDrawing()],
    ["pol-v1-p-polyester2", blankPolyesterDrawing()],
    ["haber-v1-cB-freeGraph", emptyHaberDrawing()],
  ] as const)
    expect(mark(questionById(id)!, JSON.stringify(draft)), id).toMatchObject({
      correct: false,
      empty: true,
    });
  // The supplied curve is -0.02t²+2t; at20s it is32cm³ with slope1.2.
  expect(-0.02 * 20 ** 2 + 2 * 20).toBe(32);
  expect((44 - 20) / (30 - 10)).toBeCloseTo(2 - 0.04 * 20);
  expect(
    mark(
      paper.questions[0],
      JSON.stringify({ tx0: "1..2", ty0: "20", tx1: "30", ty1: "44" }),
    ),
  ).toMatchObject({ correct: false, selfReview: true, empty: false });
  expect(
    displayResponse(
      paper.questions[0],
      JSON.stringify({ tx0: "1..2", ty0: "20", tx1: "30", ty1: "44" }),
    ),
  ).toContain("(1..2 s, 20 cm³)");
});
