import { test, expect } from "@playwright/test";
import { alkanesJourney as journey } from "../src/content/journeys/alkanes";
import {
  alkaneRecords,
  completeRatio,
  attachmentRequired,
  graphFacts,
  alkaneGraphs,
  type AlkaneMode,
} from "../src/lib/alkanes";
import {
  initialAlkaneBoard,
  expectedAlkaneBoard,
  validAlkaneBoard,
  checkAlkaneBoard,
} from "../src/lib/alkane-board";
import { initialBoard, validBoard, validHistory } from "../src/lib/workbench";
import {
  emptyAlkaneDrawing,
  readAlkaneDrawing,
} from "../src/lib/alkane-drawing";
import { mark, displayResponse } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
for (const mode of Object.keys(alkaneRecords) as AlkaneMode[])
  test(
    mode +
      " validates every selected schema and original-to-comparison history",
    () => {
      const model = {
        kind: "alkanes" as const,
        mode,
        instruction: "Construct",
      };
      for (const id of Object.keys(alkaneRecords[mode])) {
        const initial = initialAlkaneBoard(mode, id),
          expected = expectedAlkaneBoard(mode, id);
        expect(validBoard(model, initial)).toBe(true);
        expect(validAlkaneBoard(mode, { ...initial, extra: "" })).toBe(false);
        expect(
          validHistory(model, [
            initialBoard(model),
            ...(id === "initial" ? [] : [initial]),
          ]),
        ).toBe(true);
        expect(checkAlkaneBoard(mode, expected).correct).toBe(true);
        expect(
          validHistory(model, [
            initialBoard(model),
            { ...expected, record: id },
          ]),
        ).toBe(false);
      }
    },
  );
test("combustion ratios preserve both product identities and accept balanced multiples", () => {
  for (const [id, n] of [
    ["initial", 1],
    ["ethane", 2],
    ["propane", 3],
    ["butane", 4],
    ["pentane", 5],
    ["nonane", 9],
  ] as const) {
    const b = expectedAlkaneBoard("equation", id),
      ratio = completeRatio(n);
    expect([ratio.fuel, ratio.oxygen, ratio.carbon, ratio.water]).toEqual(
      n === 1
        ? [1, 2, 1, 2]
        : n === 2
          ? [2, 7, 4, 6]
          : n === 3
            ? [1, 5, 3, 4]
            : n === 4
              ? [2, 13, 8, 10]
              : n === 5
                ? [1, 8, 5, 6]
                : [1, 14, 9, 10],
    );
    for (const k of ["fuel", "oxygen", "carbon", "water"])
      b[k] = String(Number(b[k]) * 2);
    expect(checkAlkaneBoard("equation", b).correct).toBe(true);
    b.carbonProduct = "CO";
    expect(checkAlkaneBoard("equation", b).correct).toBe(false);
  }
});
test("limited oxygen accepts different balanced carbon allocations and retains unused O2", () => {
  const b = {
    ...initialAlkaneBoard("oxygen"),
    co2: "1",
    co: "0",
    soot: "1",
    water: "4",
    used: "3",
    left: "0",
  };
  expect(checkAlkaneBoard("oxygen", b).correct).toBe(true);
  const excess = expectedAlkaneBoard("oxygen", "excess");
  expect(excess.left).toBe("1");
  expect(checkAlkaneBoard("oxygen", { ...excess, left: "0" }).correct).toBe(
    false,
  );
  expect(checkAlkaneBoard("oxygen", { ...excess, co: "1" }).correct).toBe(
    false,
  );
});
test("structures distinguish rings, branches, methane and other elements", () => {
  expect(graphFacts(alkaneGraphs.ring)).toMatchObject({
    saturated: true,
    cyclic: true,
    openAlkane: false,
  });
  expect(graphFacts(alkaneGraphs.branch)).toMatchObject({
    saturated: true,
    cyclic: false,
    openAlkane: true,
  });
  expect(graphFacts(alkaneGraphs.double).saturated).toBe(false);
  expect(graphFacts(alkaneGraphs.oxygen).hydrocarbon).toBe(false);
  for (let n = 1; n <= 4; n++) {
    let count = 0;
    for (let c = 0; c < n; c++)
      for (let slot = 0; slot < 4; slot++)
        count += Number(attachmentRequired(n, c, slot));
    expect(count).toBe([4, 6, 8, 10][n - 1]);
  }
});
test("drawn structures are honestly self-reviewed and malformed originals remain distinguishable", () => {
  const q = journey.checkForms[0][2],
    b = emptyAlkaneDrawing();
  b.n = "3";
  b.h15 = "yes";
  expect(readAlkaneDrawing(JSON.stringify(b))).toEqual(b);
  expect(readAlkaneDrawing(JSON.stringify({ ...b, extra: "yes" }))).toBeNull();
  expect(readAlkaneDrawing("unreadable")).toBeNull();
  expect(mark(q, JSON.stringify(b))).toMatchObject({
    correct: false,
    selfReview: true,
  });
  expect(displayResponse(q, JSON.stringify(b))).toContain("3");
  expect(displayResponse(q, "unreadable")).toContain("retained");
});
test("92 tasks reserve the original and complete-equation forms and every practice task has direct recovery", () => {
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  expect(all).toHaveLength(92);
  expect(new Set(all.map((t) => t.id)).size).toBe(92);
  expect(journey.checkForms.map((x) => x.length)).toEqual([8, 8, 2]);
  expect(journey.reviewForms.map((x) => x.length)).toEqual([3, 3, 2]);
  for (const q of journey.practice)
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  expect(all.filter((q) => q.rubric)).toHaveLength(20);
  expect(all.filter((q) => q.alkaneDrawing)).toHaveLength(6);
  for (const q of all) {
    if (q.options) expect(q.options).toContain(q.answer);
    if (q.rubric)
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
  }
});
test("six legacy demands remain directly exposed without making identity tasks balancing evidence", () => {
  const lesson = lessons.find((l) => l.slug === "alkanes-and-combustion")!;
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "alkanes-and-combustion-" + i),
  );
  expect(
    journey.practice.find((q) => q.id === "alk-v1-p-formula-seven")!
      .exposureAliases,
  ).toContain("alkanes-and-combustion-0");
  expect(
    journey.practice.find((q) => q.id === "alk-v1-p-co-written")!
      .exposureAliases,
  ).toContain("alkanes-and-combustion-3");
  expect(journey.practice[0].exposureAliases).not.toContain("alk-v1-a-balance");
});

test("actual prior methane/ethane demands have direct edges without transitive propagation", () => {
  const all = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey
        ? [
            ...l.journey.warmup,
            ...l.journey.refresher,
            ...l.journey.guided,
            ...l.journey.practice,
            ...l.journey.checkForms.flat(),
            ...l.journey.reviewForms.flat(),
          ]
        : []),
    ]),
    get = (id: string) => all.find((q) => q.id === id)!;
  expect(get("cb-v1-p-methane").exposureAliases).toContain(
    "alk-v1-p-draw-methane",
  );
  expect(get("be-v1-p-ethane").exposureAliases).toContain(
    "alk-v1-p-ethane-oxygen",
  );
  expect(get("bm-v1-p-ethane").exposureAliases).toContain(
    "alk-v1-p-ethane-oxygen",
  );
  expect(get("cb-v1-p-methane").exposureAliases).not.toContain(
    "alk-v1-a-balance",
  );
  expect(get("cb-v1-p-methane").exposureAliases).not.toContain("alk-v1-b-draw");
  expect(get("heat-v1-p-combustion").exposureAliases).toContain(
    "alk-v1-r-energy",
  );
});
