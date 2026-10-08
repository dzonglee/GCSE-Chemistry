import { test, expect } from "@playwright/test";
import { paper1Higher as paper } from "../src/content/extended-assessments";
import { questionById } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import { emptyFuelDrawing } from "../src/lib/fuel-drawing";
import { exposureIds } from "../src/lib/progress";

test("the individually curated Higher set retains original task identities, separate-Chemistry scope and five Paper1 strands", () => {
  expect(paper.questions).toHaveLength(30);
  expect(paper.tier).toBe("higher");
  expect(paper.course).toBe("separate");
  expect(paper.questions.filter((q) => q.rubric)).toHaveLength(10);
  expect(new Set(paper.questions.map((q) => q.id)).size).toBe(30);
  expect(
    Object.fromEntries(
      [...new Set(paper.topics)].map((t) => [
        t,
        paper.topics.filter((x) => x === t).length,
      ]),
    ),
  ).toEqual({
    "atomic-structure": 6,
    bonding: 6,
    quantitative: 6,
    "chemical-changes": 6,
    energy: 6,
  });
  for (const q of paper.questions) {
    expect(q).toBe(questionById(q.id));
    expect(exposureIds([q.id])).toContain(q.id);
    expect("model" in q ? q.model : undefined).toBeUndefined();
  }
});

test("Higher numeric, ion and bonding diagrams match independent stoichiometry and electron references", () => {
  const refs: Record<string, string | Record<string, string>> = {
    "as-v1-cb-analogy": String((60 * 1000) / 30000),
    "iso-v1-cb-table": { p: "13", n: "14", e: "10" },
    "ram-v1-cb-count": String((40 * 9 + 42 * 3) / 12),
    "ib-v1-cb-draw": { dots: "6", crosses: "2", charge: "-2", brackets: "1" },
    "cb-v1-cb-water": {
      unsharedCentre: "4",
      centre0: "1",
      partner0: "1",
      unsharedPartner0: "0",
      centre1: "1",
      partner1: "1",
      unsharedPartner1: "0",
    },
    "if-v1-cb-nitrate": "Al(NO3)3",
    "np-v1-cb-ratio": String(6 / 8),
    "ae-v1-p-inverse-transfer": ((88 * 70.3) / (100 - 70.3)).toPrecision(3),
    "rm-v1-cb-working": {
      requested: String((4.2 / 28) * 2),
      mass: String((4.2 / 28) * 2 * 17),
    },
    "tc-v1-cb-volume": String((((15 / 1000) * 0.08 * 2) / 0.2) * 1000),
    "gv-v1-cb-steam": String(70 - (16 * 7) / 2 + (16 * 6) / 2),
    "ty-v1-cb-required": String((35.2 / 0.8 / 44) * 0.5 * 30),
    "he-v1-b-zinc-acid": "Zn + 2H+ -> Zn2+ + H2",
    "acid-v1-b-factor": String(10 ** (4 - 1)),
    "bond-v1-b-change": String(12 * 390 + 3 * 500 - 2 * 940 - 12 * 460),
    "bond-v1-b-inverse": String(-210 - 250 + 900),
    "fh-v1-B-oxygen": "O2 + 4H+ + 4e- -> 2H2O",
  };
  for (const [id, value] of Object.entries(refs)) {
    const q = paper.questions.find((q) => q.id === id)!;
    expect(
      mark(q, typeof value === "string" ? value : JSON.stringify(value))
        .correct,
      id,
    ).toBe(true);
  }
  expect(mark(questionById("ae-v1-p-inverse-transfer")!, "104").correct).toBe(
    false,
  );
  expect(
    mark(questionById("ae-v1-p-inverse-transfer")!, "208.296296").correct,
  ).toBe(false);
  expect(mark(questionById("gv-v1-cb-steam")!, "14").correct).toBe(false);
  expect(mark(questionById("bond-v1-b-change")!, "-305").correct).toBe(false);
  expect(
    mark(questionById("he-v1-b-zinc-acid")!, "Zn + H+ -> Zn2+ + H2").correct,
  ).toBe(false);
});

test("all complete methods, explanatory writing and temperature construction remain manually reviewed", () => {
  for (const q of paper.questions.filter((q) => q.rubric)) {
    const response = q.fuelDrawing
      ? JSON.stringify({ ...emptyFuelDrawing(q.fuelDrawing.data), p0x: "3" })
      : q.answer;
    expect(mark(q, response)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
  const graph = paper.questions[28];
  expect(graph.fuelDrawing!.data.points).toEqual([
    [3, 20.4],
    [6, 18.2],
    [9, 16.7],
    [12, 14.6],
    [15, 13.1],
    [18, 11.2],
  ]);
  expect(graph.fuelDrawing!.data.fitKind).toBe("straight");
  expect(
    mark(graph, JSON.stringify(emptyFuelDrawing(graph.fuelDrawing!.data)))
      .empty,
  ).toBe(true);
  const method = paper.questions[18];
  expect(method.answer.indexOf("Filter")).toBeLessThan(
    method.answer.indexOf("Concentrate"),
  );
  expect(method.answer.indexOf("cooling")).toBeLessThan(
    method.answer.indexOf("pat dry"),
  );
});
