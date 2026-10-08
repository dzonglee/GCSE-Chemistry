import { test, expect } from "@playwright/test";
import {
  greenhouseJourney as j,
  allGreenhouseTasks as all,
  greenhouseRecoveryRoutes,
} from "../src/content/journeys/greenhouse-effect";
import {
  greenhouseRecords as records,
  greenhouseFields as fields,
  greenhouseChoices as choices,
  greenhouseNumeric as numeric,
  greenhouseNumber,
  initialGreenhouse,
  validGreenhouse,
  validGreenhouseHistory,
  checkGreenhouse,
} from "../src/lib/greenhouse";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
const lesson = lessons.find((l) => l.slug === "greenhouse-effect")!;
test("one authored lesson, six distinct activities, exact routes and unassisted reserved forms", () => {
  expect(lesson.journey).toBe(j);
  expect(lesson.course).toBe("combined");
  expect(all).toHaveLength(67);
  expect(new Set(all.map((q) => q.id)).size).toBe(67);
  expect(j.practice).toHaveLength(22);
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(greenhouseRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(q.model).toBeUndefined();
  for (const record of Object.keys(records))
    expect(
      all.some(
        (q) =>
          q.model?.kind === "greenhouse-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
  expect(Object.keys(records)).toHaveLength(14);
  expect(new Set(Object.values(records).map((r) => r.mode)).size).toBe(6);
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "greenhouse-effect-" + i),
  );
});
test("complete construction accepts each scientific record, wrong fields remain wrong and sources stay fixed", () => {
  const original = JSON.stringify(records);
  for (const [record, r] of Object.entries(records)) {
    const model = {
        kind: "greenhouse-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialGreenhouse(r.mode, record)];
    expect(initialBoard(model)).toEqual(h[0]);
    expect(checkGreenhouse(r.mode, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(model, h)).toBe(true);
    expect(checkBoard(model, h.at(-1)!).correct).toBe(true);
    for (const f of fields[r.mode]) {
      const wrong = numeric.includes(f)
        ? "999"
        : choices[f].find((v) => v !== r.expected[f])!;
      const b = { ...h.at(-1)!, [f]: wrong };
      expect(validBoard(model, b)).toBe(true);
      expect(checkBoard(model, b).correct).toBe(false);
      expect(checkBoard(model, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(wrong);
    }
  }
  expect(JSON.stringify(records)).toBe(original);
});
test("record binding rejects foreign sources, extra keys, prototype data and multi-edit histories", () => {
  const a = initialGreenhouse("budget", "gain"),
    m = {
      kind: "greenhouse-investigation" as const,
      mode: "budget" as const,
      record: "gain",
    };
  expect(validBoard(m, { ...a, record: "balance" })).toBe(false);
  expect(checkBoard(m, { ...a, record: "balance" }).correct).toBe(false);
  expect(validGreenhouse("budget", { ...a, escaping: "0" })).toBe(false);
  expect(
    validGreenhouse("budget", Object.assign(Object.create({ extra: 1 }), a)),
  ).toBe(false);
  expect(validHistory(m, [{ ...a, absorbed: "70" }])).toBe(false);
  expect(validHistory(m, [a, { ...a, absorbed: "70", net: "10" }])).toBe(false);
  expect(validHistory(m, [a, a])).toBe(false);
  expect(validHistory(m, [a, { ...a, absorbed: "1..2" }])).toBe(true);
  expect(validHistory(m, [a, { ...a, net: "-6" }])).toBe(true);
  expect(validHistory(m, [a, { ...a, net: "Infinity" }])).toBe(true);
  expect(checkBoard(m, { ...a, net: "Infinity" }).correct).toBe(false);
  expect(
    validGreenhouseHistory(
      "budget",
      "gain",
      Array.from({ length: 501 }, (_, i) => ({ ...a, net: String(i % 2) })),
    ),
  ).toBe(false);
});
test("malformed and negative numbers are retained without silent repair or zero coercion", () => {
  for (const raw of ["", "+", "1..2", "NaN", "1e3", "1/2"])
    expect(greenhouseNumber(raw)).toBeNull();
  for (const [raw, value] of [
    ["-6", -6],
    ["+10", 10],
    [".5", 0.5],
    ["70.0", 70],
  ] as const)
    expect(greenhouseNumber(raw)).toBe(value);
  const b = {
    ...initialGreenhouse("budget", "loss"),
    absorbed: "96",
    net: "-6",
  };
  expect(checkGreenhouse("budget", b).correct).toBe(true);
  for (const raw of ["1..2", "+", "999", "1e3", "5 mol", "NaN"]) {
    b.net = raw;
    expect(validGreenhouse("budget", b)).toBe(true);
    expect(checkGreenhouse("budget", b).correct).toBe(false);
    expect(b.net).toBe(raw);
  }
});
test("independently recomputed 13 scalar references use signed energy and stated whole", () => {
  const expected: Record<string, number> = {
    "w-whole": 70,
    "w-net": 0,
    "r-loss": -6,
    "r-gain": 10,
    "r-balance": 70,
    "g-balance": 0,
    "g-gain": 10,
    "p-loss": -8,
    "p-equilibrium": 72,
    "p-fraction": 75,
    "cA-balance": 105,
    "cB-balance": 112,
    "vB-loss": -5,
  };
  // There are thirteen scalar demands; construction adds eight independently entered fields.
  expect(all.filter((q) => !q.options && !q.parts && !q.rubric)).toHaveLength(
    13,
  );
  for (const [s, n] of Object.entries(expected)) {
    const q = all.find((q) => q.id === "greenhouse-v1-" + s)!;
    expect(Number(q.answer)).toBe(n);
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 1)).correct).toBe(false);
  }
});
test("four independent two-field ledgers, fraction/scientific values and wrong sign", () => {
  const refs = [
    ["p-ledger", 120, 20],
    ["cA-ledger", 135, 18],
    ["cB-ledger", 180, 12],
    ["vA-ledger", 120, 9],
  ] as const;
  expect(all.filter((q) => q.parts)).toHaveLength(4);
  for (const [s, absorbed, net] of refs) {
    const q = all.find((q) => q.id === "greenhouse-v1-" + s)!;
    expect(q.parts!.map((p) => p.answer)).toEqual([absorbed, net]);
    expect(
      mark(q, JSON.stringify({ absorbed: String(absorbed), net: String(net) }))
        .correct,
    ).toBe(true);
    expect(
      mark(
        q,
        JSON.stringify({ absorbed: `${2 * absorbed}/2`, net: `${net}e0` }),
      ).correct,
    ).toBe(true);
    expect(
      mark(q, JSON.stringify({ absorbed: String(absorbed), net: String(-net) }))
        .correct,
    ).toBe(false);
  }
});
test("radiation model conserves sources and avoids mirror, all-sunlight and perpetual trapping misconceptions", () => {
  expect(records.pathway.expected).toEqual({
    entry: "transmit",
    surface: "absorbEmit",
    gas: "absorbIR",
    release: "allDirections",
  });
  expect(records.enhanced.expected).toEqual({
    loss: "reduced",
    trend: "warms",
    equilibrium: "rebalance",
  });
  expect(records.mirror.expected.repair).toBe("absorbEmitIR");
  expect(records.ozone.expected.repair).toBe("notOzone");
  expect(records.balance.budget).toEqual({
    incoming: 100,
    reflected: 30,
    escaping: 70,
  });
  expect(records.gain.budget).toEqual({
    incoming: 100,
    reflected: 30,
    escaping: 60,
  });
  for (const r of Object.values(records).filter((r) => r.budget)) {
    const { incoming, reflected, escaping } = r.budget!;
    expect(Number(r.expected.absorbed)).toBe(incoming - reflected);
    expect(Number(r.expected.net)).toBe(incoming - reflected - escaping);
  }
});
test("two activities for each gas are distinct and tied to the appropriate process", () => {
  expect(records.fossil.expected).toEqual({ emission: "co2", process: "burn" });
  expect(records.forest.expected).toEqual({
    emission: "co2",
    process: "forest",
  });
  expect(records.cattle.expected).toEqual({
    emission: "ch4",
    process: "digest",
  });
  expect(records.landfill.expected).toEqual({
    emission: "ch4",
    process: "decay",
  });
  expect(
    all.find((q) => q.id === "greenhouse-v1-p-population")!.answer,
  ).toContain("more food");
  expect(
    all.find((q) => q.id === "greenhouse-v1-p-feedback")!.explanation,
  ).toContain("feedback");
});
test("all choice distractors diagnose their error and extended writing earns no automatic marks", () => {
  for (const q of all) {
    if (q.options) {
      expect(q.options).toContain(q.answer);
      for (const o of q.options.filter((o) => o !== q.answer))
        expect(q.misconceptions?.[o]?.length).toBeGreaterThan(20);
    }
    if (q.rubric) {
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(q.rubric.length).toBeGreaterThanOrEqual(3);
    }
  }
  expect(all.filter((q) => q.rubric)).toHaveLength(11);
});
test("legacy and repeated mechanisms share exposure; fresh numerical data remain separate", () => {
  const q = all.find((q) => q.id === "greenhouse-v1-p-mechanism")!;
  expect(q.exposureAliases).toContain("greenhouse-effect-5");
  expect(q.exposureAliases).toContain("greenhouse-v1-cA-mechanism");
  const a = all.find((q) => q.id === "greenhouse-v1-cA-ledger")!;
  expect(a.exposureAliases ?? []).not.toContain("greenhouse-v1-p-ledger");
  expect(lesson.questions[0].exposureAliases).toContain(
    "greenhouse-v1-p-absorb",
  );
});
