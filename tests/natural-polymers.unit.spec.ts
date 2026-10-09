import { test, expect } from "@playwright/test";
import {
  naturalJourney as j,
  naturalRecovery,
} from "../src/content/journeys/natural-journey";
import {
  naturalRecords,
  initialNaturalBoard,
  expectedNaturalBoard,
  appendNaturalBoard,
  validNaturalBoard,
  validNaturalHistory,
  checkNaturalBoard,
  naturalNumber,
  massCases,
  describeNaturalDrawing,
  type NaturalMode,
} from "../src/lib/natural";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark, reviewSubject } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("the individually authored lesson has complete recovery routes and common-tier reserved forms", () => {
  expect(all).toHaveLength(112);
  expect(new Set(all.map((q) => q.id)).size).toBe(112);
  const grouped = j.practiceGroups!.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(45);
  expect(new Set(grouped).size).toBe(45);
  for (const q of j.practice) {
    expect(grouped).toContain(q.id);
    expect(naturalRecovery[q.id][0]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const form of [
    ...j.checkForms.slice(0, 2),
    ...j.reviewForms.slice(0, 2),
  ])
    for (const q of form) {
      expect(q.model).toBeUndefined();
      expect(q.tier).not.toBe("higher");
    }
  expect(
    j.checkForms.slice(0, 2).map((f) => f.filter((q) => !q.rubric).length),
  ).toEqual([7, 7]);
  expect(
    j.reviewForms.slice(0, 2).map((f) => f.filter((q) => !q.rubric).length),
  ).toEqual([2, 2]);
  const lesson = lessons.find((l) => l.slug === "natural-polymers")!;
  expect(lesson.tier).toBe("foundation");
  expect(lesson.course).toBe("separate");
  expect(lesson.journey).toBe(j);
  for (const q of all.filter((q) => q.title?.startsWith("Higher:")))
    expect(q.tier).toBe("higher");
});
test("all supplied cases survive main adapters and original-case strict histories", () => {
  let count = 0;
  for (const [key, records] of Object.entries(naturalRecords))
    for (const record of Object.keys(records)) {
      const mode = key as NaturalMode,
        model = { kind: "natural-polymers" as const, mode, record },
        z = initialNaturalBoard(mode, record),
        e = expectedNaturalBoard(mode, record);
      expect(initialBoard(model)).toEqual(z);
      expect(validNaturalBoard(mode, e)).toBe(true);
      let h = [z];
      for (const [k, v] of Object.entries(e))
        if (k !== "record")
          h = appendNaturalBoard(mode, h, { ...h.at(-1)!, [k]: v });
      expect(validHistory(model, h)).toBe(true);
      expect(checkBoard(model, e).correct).toBe(true);
      expect(validNaturalHistory(mode, h, record)).toBe(true);
      expect(validNaturalHistory(mode, [e], record)).toBe(false);
      expect(validNaturalBoard(mode, { ...e, unexpected: "value" })).toBe(
        false,
      );
      count++;
    }
  expect(count).toBe(42);
});
test("literal finite-chain inventories retain end groups and subtract one water per actual junction", () => {
  const expected = {
    initial: [4, 8, 2, 3, 132],
    three: [6, 11, 3, 4, 189],
    four: [8, 14, 4, 5, 246],
    mixed: [5, 10, 2, 3, 146],
    mixedThree: [7, 13, 3, 4, 203],
    alanine: [9, 17, 3, 4, 231],
  };
  for (const [id, values] of Object.entries(expected)) {
    const r = massCases[id as keyof typeof massCases];
    expect(r).toBeDefined();
    expect([r.C, r.H, r.N, r.O, r.mr]).toEqual(values);
    expect(r.links).toBe(r.units.length - 1);
    expect(12 * r.C + r.H + 14 * r.N + 16 * r.O).toBe(r.mr);
  }
});
test("repeat-unit choices preserve different original carbon sections without pretending finite ends are repeats", () => {
  for (const [record, core] of [
    ["initial", "CH2"],
    ["beta", "CH2CH2"],
    ["alanine", "CHCH3"],
  ]) {
    const e = expectedNaturalBoard("peptideUnit", record);
    expect(e.core).toBe(core);
    expect(e.nitrogen).toBe("NH");
    expect(e.carbonyl).toBe("double");
    expect(e.acidOH).toBe("removed");
    expect(e.continuation).toBe("both");
    expect(e.multiplier).toBe("n");
    expect(e.junction).toBe("CN");
    for (const [k, v] of [
      ["nitrogen", "NH2"],
      ["carbonyl", "single"],
      ["acidOH", "retained"],
      ["continuation", "left"],
      ["multiplier", "1"],
      ["junction", "CO"],
    ])
      expect(checkNaturalBoard("peptideUnit", { ...e, [k]: v }).correct).toBe(
        false,
      );
  }
});
test("single-purpose model feedback only assesses the requested quantity", () => {
  const b = { ...initialNaturalBoard("dna", "cg"), types: "4" };
  expect(
    checkBoard(
      { kind: "natural-polymers", mode: "dna", record: "cg", focus: "types" },
      b,
    ).correct,
  ).toBe(true);
  expect(checkNaturalBoard("dna", b).correct).toBe(false);
  const wrong = { ...b, types: "2" };
  expect(checkNaturalBoard("dna", wrong, "types").correct).toBe(false);
  const core = { ...initialNaturalBoard("core"), coreMr: "14" };
  expect(checkNaturalBoard("core", core, "core").correct).toBe(true);
});
test("blank, malformed and valid wrong drawings retain distinct honest review states", () => {
  const q = all.find((q) => q.naturalDrawing?.mode === "dna")!,
    data = q.naturalDrawing!;
  expect(mark(q, "").empty).toBe(true);
  expect(mark(q, "{broken").invalid).toBe(true);
  const raw = JSON.stringify({
    ...initialNaturalBoard(data.mode, data.record),
    unit: "rung",
    strands: "4",
    shape: "flatLadder",
    monomer: "glucose",
  });
  expect(mark(q, raw)).toMatchObject({ correct: false, selfReview: true });
  expect(reviewSubject(q)).toBe("structure");
  expect(describeNaturalDrawing(raw, data)).toContain(
    "a complete two-sided rung",
  );
  expect(describeNaturalDrawing(raw, data)).not.toContain("flatLadder");
  expect(
    mark({ ...q, naturalDrawing: { ...data, record: "eight" } }, raw).invalid,
  ).toBe(true);
});
test("partial decimal and exponent entries remain wrong without losing their original bytes", () => {
  for (const raw of ["", " ", "0.", "1e2", "Infinity", "-1"])
    expect(naturalNumber(raw)).toBeNull();
  const b = { ...expectedNaturalBoard("mass"), Mr: "132." };
  expect(validNaturalBoard("mass", b)).toBe(true);
  expect(checkNaturalBoard("mass", b).correct).toBe(false);
  expect(b.Mr).toBe("132.");
  expect(checkNaturalBoard("mass", { ...b, Mr: "132.0" }).correct).toBe(true);
  const short = { ...initialNaturalBoard("dna", "two"), p7: "A" };
  expect(validNaturalBoard("dna", short)).toBe(false);
});
test("direct exposure links cover diagram recognition, both type forms and retained construction without transitive closure", () => {
  const byId = new Map(all.map((q) => [q.id, q]));
  for (const [id, other] of [
    ["p-visual", "c-a-diagram"],
    ["p-visual", "c-b-diagram"],
    ["r-dna-types", "c-b-types"],
    ["p-ring-draw", "v-a-draw"],
    ["p-dna-draw", "v-b-draw"],
  ])
    expect(byId.get("natural-v1-" + id)!.exposureAliases).toContain(
      "natural-v1-" + other,
    );
  expect(byId.get("natural-v1-p-cellulose")!.exposureAliases).not.toContain(
    "natural-v1-c-a-glucose",
  );
  for (const q of all)
    for (const id of q.exposureAliases ?? [])
      expect(
        lessons
          .flatMap((l) => [
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
          ])
          .some((x) => x.id === id),
      ).toBe(true);
});
test("the independent amino-acid repeat uses an actual blank-start structure rather than an explanation input", () => {
  const q = all.find((q) => q.id === "natural-v1-p-amino-repeat-draw")!;
  expect(q.naturalDrawing).toEqual({ mode: "peptideUnit", record: "beta" });
  const blank = initialNaturalBoard("peptideUnit", "beta");
  expect(
    Object.entries(blank)
      .filter(([k]) => k !== "record")
      .every(([, v]) => v === ""),
  ).toBe(true);
  const wrong = {
    ...blank,
    nitrogen: "NH2",
    core: "CH2",
    carbonyl: "single",
    continuation: "left",
    multiplier: "1",
    junction: "CO",
  };
  expect(mark(q, JSON.stringify(wrong))).toMatchObject({
    correct: false,
    selfReview: true,
  });
  expect(
    describeNaturalDrawing(JSON.stringify(wrong), q.naturalDrawing!),
  ).toContain("left boundary only");
});
