import { test, expect } from "@playwright/test";
import {
  allSeparationTasks,
  separationJourney as j,
  separationRecoveryRoutes,
} from "../src/content/journeys/separation-practical";
import {
  checkSeparation,
  initialSeparation,
  separationRecords,
  separationFields,
  separationChoices,
  validSeparation,
  validSeparationHistory,
} from "../src/lib/separation-investigation";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
const lesson = lessons.find((l) => l.slug === "separation-practical")!;
test("individual investigation has distinct stages, reserved forms, legacy identities and specific recoveries", () => {
  expect(lesson.journey).toBe(j);
  expect(lesson.course).toBe("combined");
  expect(allSeparationTasks).toHaveLength(68);
  expect(new Set(allSeparationTasks.map((q) => q.id)).size).toBe(68);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "separation-practical-" + i),
  );
  for (const q of j.practice) {
    expect(separationRecoveryRoutes[q.id]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(q.model).toBeUndefined();
  for (const record of Object.keys(separationRecords))
    expect(
      allSeparationTasks.some(
        (q) =>
          q.model?.kind === "separation-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
});
test("all supplied original records validate correct single-edit construction and preserve wrong choices", () => {
  const original = JSON.stringify(separationRecords);
  for (const [record, r] of Object.entries(separationRecords)) {
    const model = {
        kind: "separation-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialSeparation(r.mode, record)];
    expect(initialBoard(model)).toEqual(h[0]);
    expect(checkSeparation(r.mode, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected)) {
      h.push({ ...h.at(-1)!, [f]: v });
      expect(validSeparationHistory(r.mode, record, h)).toBe(true);
    }
    expect(validHistory(model, h)).toBe(true);
    expect(checkSeparation(r.mode, h.at(-1)!).correct, record).toBe(true);
    expect(checkBoard(model, h.at(-1)!).correct).toBe(true);
    const f = separationFields[r.mode][0],
      wrong = {
        ...h.at(-1)!,
        [f]: ["net", "percent"].includes(f)
          ? "999"
          : separationChoices[f].find((v) => v !== r.expected[f])!,
      };
    expect(validBoard(model, wrong)).toBe(true);
    expect(checkSeparation(r.mode, wrong).correct).toBe(false);
    expect(checkSeparation(r.mode, wrong).message).toContain(
      "remains as entered",
    );
  }
  expect(JSON.stringify(separationRecords)).toBe(original);
});
test("history is exact-schema, source-specific, blank-anchored and one operation per step", () => {
  const b = initialSeparation("sequence", "salt-route");
  expect(validSeparation("sequence", { ...b, answer: "hidden" })).toBe(false);
  expect(validSeparation("sequence", { ...b, version: "2" })).toBe(false);
  expect(validSeparation("sequence", { ...b, mode: "setup" })).toBe(false);
  expect(
    validSeparation("sequence", { ...b, record: "sand-route" }, "salt-route"),
  ).toBe(false);
  expect(
    validSeparationHistory("sequence", "salt-route", [
      { ...b, first: "dissolve" },
    ]),
  ).toBe(false);
  expect(
    validSeparationHistory("sequence", "salt-route", [
      b,
      { ...b, first: "dissolve", second: "filter" },
    ]),
  ).toBe(false);
  expect(validSeparationHistory("sequence", "salt-route", [b, b])).toBe(false);
  expect(
    validSeparationHistory("sequence", "salt-route", [
      b,
      { ...b, first: "dissolve" },
      { ...b, first: "dissolve", second: "filter" },
    ]),
  ).toBe(true);
  expect(
    validSeparationHistory("sequence", "salt-route", Array(501).fill(b)),
  ).toBe(false);
  const other = {
    ...initialSeparation("sequence", "sand-route"),
    first: "dissolve",
    second: "filter",
    third: "drySand",
  };
  expect(
    checkBoard(
      {
        kind: "separation-investigation",
        mode: "sequence",
        record: "salt-route",
      },
      other,
    ).correct,
  ).toBe(false);
});
test("wet mass does not create salt and >100% remains an apparent calculation", () => {
  const r = separationRecords["wet-recovery"],
    b = { ...initialSeparation("recovery", "wet-recovery"), ...r.expected };
  expect(checkSeparation("recovery", b).correct).toBe(true);
  expect(checkSeparation("recovery", b).message).toContain("115%");
  expect(checkSeparation("recovery", { ...b, percent: "100" }).correct).toBe(
    false,
  );
  expect(checkSeparation("recovery", { ...b, claim: "pure" }).correct).toBe(
    false,
  );
  for (const v of ["1..2", "+", "-2", "999", "NaN", "1e3", "5 mol"]) {
    const x = { ...b, percent: v };
    expect(validSeparation("recovery", x)).toBe(true);
    expect(checkSeparation("recovery", x).correct).toBe(false);
    expect(x.percent).toBe(v);
  }
  expect(validSeparation("recovery", { ...b, percent: "1".repeat(17) })).toBe(
    false,
  );
});
test("independently evaluated arithmetic references use target, tare and the common origin", () => {
  const refs: Record<string, number> = {
    "w-subtract": 13.5 - 10,
    "w-ratio": 2 / 8,
    "r-recovery": ((28 - 24) / 5) * 100,
    "g-dry": (4 / 5) * 100,
    "g-wet": (4.6 / 4) * 100,
    "p-net": 28 - 24,
    "p-sand-recovery": ((22.5 - 16.5) / 8) * 100,
    "p-apparent": ((24.6 - 20) / 4) * 100,
    "p-rf": (4 - 1) / (7 - 1),
    "p-inverse": 0.65 * 12,
    "cA-recovery": ((22.5 - 18) / 6) * 100,
    "cA-rf": 3.6 / 9,
    "cA-distance": 0.7 * 8,
    "cB-recovery": ((18.3 - 15) / 3) * 100,
    "cB-rf": Number(((5 - 2) / (10 - 2)).toPrecision(2)),
    "cB-distance": 0.35 * 14,
    "vA-recovery": ((38.5 - 30) / 10) * 100,
    "vA-rf": 0.55 * 16,
    "vB-recovery": ((14.4 - 12) / 2) * 100,
    "vB-rf": (2.5 - 0.5) / (8.5 - 0.5),
  };
  const numeric = allSeparationTasks.filter((q) => q.inputMode === "decimal");
  expect(numeric).toHaveLength(20);
  for (const q of numeric) {
    const suffix = q.id.replace("separation-practical-v1-", "");
    expect(Number(q.answer), suffix).toBeCloseTo(refs[suffix], 8);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, String(Number(q.answer) + 0.05)).correct).toBe(false);
  }
});
test("chemical distinctions and all choice misconceptions mark honestly; writing never becomes automatic correctness", () => {
  for (const q of allSeparationTasks) {
    if (q.rubric) {
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(mark(q, "I do not know").correct).toBe(false);
    } else {
      expect(mark(q, q.answer).correct, q.id).toBe(true);
      for (const [wrong, feedback] of Object.entries(q.misconceptions ?? {})) {
        expect(mark(q, wrong)).toMatchObject({ correct: false });
        expect(mark(q, wrong).feedback).toContain(feedback);
      }
    }
  }
  expect(allSeparationTasks.filter((q) => q.rubric)).toHaveLength(10);
  expect(separationRecords["paper-comparison"].expected).toEqual({
    change: "paper",
    control: "solvent",
    conclusion: "attraction",
  });
  expect(separationRecords["spot-limit"].expected.decision).toBe(
    "notEstablished",
  );
  expect(separationRecords["sharp-purity"].note).toContain(
    "not real salt values",
  );
});
test("a unit-converted repeat and earlier front/purity evidence cannot be counted as fresh", () => {
  const q = (id: string) =>
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
      .find((q) => q.id === id)!;
  for (const [a, b] of [
    ["chromatography-v1-cA-inverse", "separation-practical-v1-p-inverse"],
    ["chromatography-v1-cB-front", "separation-practical-v1-cB-front"],
    ["chromatography-v1-cA-purity", "separation-practical-v1-cA-purity"],
  ]) {
    expect(q(a).exposureAliases).toContain(b);
    expect(q(b).exposureAliases).toContain(a);
  }
});

test("reserved ruler-ratio reporting checks both value and two significant figures", () => {
  const q = j.checkForms[1][4];
  expect(mark(q, "0.38").correct).toBe(true);
  expect(mark(q, "0.375").correct).toBe(false);
  expect(mark(q, "0.380").correct).toBe(false);
  expect(mark(q, "0.380").feedback).toContain("2 significant figures");
});
