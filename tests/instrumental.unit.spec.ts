import { test, expect } from "@playwright/test";
import {
  allInstrumentalTasks,
  instrumentalJourney as j,
  instrumentalRecoveryRoutes,
} from "../src/content/journeys/instrumental-analysis";
import {
  checkInstrumental,
  initialInstrumental,
  instrumentalFields,
  instrumentalChoices,
  instrumentalRecords,
  referenceLines,
  proposalLines,
  toggleMetal,
  validInstrumental,
  validInstrumentalHistory,
} from "../src/lib/instrumental";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
const lesson = lessons.find((l) => l.slug === "instrumental-analysis")!;
test("the individual journey retains legacy identities, distinct reserved forms and specific recovery", () => {
  expect(lesson.journey).toBe(j);
  expect(lesson.course).toBe("separate");
  expect(lesson.tier).toBe("foundation");
  expect(allInstrumentalTasks).toHaveLength(73);
  expect(new Set(allInstrumentalTasks.map((q) => q.id)).size).toBe(73);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  for (const q of j.practice) {
    expect(instrumentalRecoveryRoutes[q.id]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(q.model).toBeUndefined();
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "instrumental-analysis-" + i),
  );
  for (const record of Object.keys(instrumentalRecords))
    expect(
      allInstrumentalTasks.some(
        (q) =>
          q.model?.kind === "instrumental-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
});
test("supplied reference positions, overlaps and new reserved mixtures obey the stated evidence", () => {
  expect(referenceLines).toEqual({
    li: [1, 4, 10],
    na: [2, 6, 9],
    k: [3, 6, 11],
    ca: [1, 5, 8],
    cu: [4, 7, 12],
  });
  for (const [record, ions, positions] of [
    ["s-na", "na", [2, 6, 9]],
    ["s-k", "k", [3, 6, 11]],
    ["s-ca", "ca", [1, 5, 8]],
    ["s-cu", "cu", [4, 7, 12]],
    ["s-li", "li", [1, 4, 10]],
    ["s-ca-na", "na,ca", [1, 2, 5, 6, 8, 9]],
    ["s-li-cu", "li,cu", [1, 4, 7, 10, 12]],
  ] as const) {
    expect(instrumentalRecords[record].spectrum!.lines).toEqual(positions);
    expect(proposalLines(ions)).toEqual(positions);
    expect(
      checkInstrumental("spectrum", {
        ...initialInstrumental("spectrum", record),
        ions,
        basis: "positions",
      }).correct,
    ).toBe(true);
  }
  for (const [s, ions] of [
    ["cA-li-k", "li,k"],
    ["cA-k-ca", "k,ca"],
    ["cA-na-cu", "na,cu"],
    ["cB-k-cu", "k,cu"],
    ["cB-ca-cu", "ca,cu"],
    ["vA-li-ca", "li,ca"],
    ["vB-na-k", "na,k"],
  ]) {
    const q = allInstrumentalTasks.find((q) => q.id.endsWith(s))!;
    expect(q.instrumentalGiven!.spectrum!.lines).toEqual(proposalLines(ions));
  }
  const b = {
    ...initialInstrumental("spectrum", "s-shared"),
    ions: "unresolved",
    basis: "positions",
  };
  expect(checkInstrumental("spectrum", b).correct).toBe(true);
  for (const ions of ["na", "k", "na,k"]) {
    const wrong = { ...b, ions };
    expect(checkInstrumental("spectrum", wrong).correct).toBe(false);
    expect(wrong.ions).toBe(ions);
  }
  const before = JSON.stringify(instrumentalRecords);
  expect(toggleMetal("unresolved", "cu")).toBe("cu");
  expect(toggleMetal("na,ca", "na")).toBe("ca");
  expect(JSON.stringify(instrumentalRecords)).toBe(before);
});
test("numeric references independently interpolate the supplied standards including nonzero backgrounds", () => {
  const values: Record<string, number> = {
    "r-calibration": 4,
    "g-cal4": 4,
    "g-cal3": 3,
    "p-cal3": 3,
    "p-cal25": 2.5,
    "p-cal5": 5,
    "cA-concentration": 5,
    "cB-concentration": 6,
    "vA-cal": 3,
    "vB-cal": 4,
  };
  for (const [s, expected] of Object.entries(values)) {
    const q = allInstrumentalTasks.find((q) => q.id.endsWith(s))!;
    expect(Number(q.answer), s).toBe(expected);
    expect(mark(q, String(expected)).correct).toBe(true);
    expect(mark(q, String(expected + 1)).correct).toBe(false);
    const data =
      q.instrumentalGiven?.calibration ??
      (q.model?.kind === "instrumental-investigation"
        ? instrumentalRecords[q.model.record].calibration
        : undefined)!;
    const a = data.standards.findLast((p) => p.response <= data.unknown)!,
      z = data.standards.find((p) => p.response >= data.unknown)!;
    const x =
      a.response === z.response
        ? a.concentration
        : a.concentration +
          ((data.unknown - a.response) / (z.response - a.response)) *
            (z.concentration - a.concentration);
    expect(x).toBeCloseTo(expected, 8);
    expect(data.standards[0].response).toBeGreaterThan(0);
    expect(data.unknown).toBeLessThanOrEqual(data.standards.at(-1)!.response);
  }
  for (const entry of ["99", "-0.5", "+", "1..2"]) {
    const b = {
      ...initialInstrumental("calibration", "cal-4"),
      concentration: entry,
      claim: "calibrated",
    };
    expect(validInstrumental("calibration", b)).toBe(true);
    expect(checkInstrumental("calibration", b).correct).toBe(false);
    expect(b.concentration).toBe(entry);
  }
  expect(
    checkInstrumental("calibration", {
      ...initialInstrumental("calibration", "cal-4"),
      concentration: "4.0",
      claim: "calibrated",
    }).correct,
  ).toBe(true);
});
test("native adapters reject empty, wrong, foreign and multi-edit histories without repairing entries", () => {
  let choices = 0;
  for (const [record, r] of Object.entries(instrumentalRecords)) {
    const model = {
      kind: "instrumental-investigation" as const,
      mode: r.mode,
      record,
    };
    let b = initialInstrumental(r.mode, record);
    const history = [b];
    expect(initialBoard(model)).toEqual(b);
    expect(checkBoard(model, b).correct).toBe(false);
    for (const f of instrumentalFields[r.mode]) {
      b = { ...b, [f]: r.expected[f] };
      history.push(b);
    }
    expect(validHistory(model, history)).toBe(true);
    expect(checkBoard(model, b).correct).toBe(true);
    for (const f of instrumentalFields[r.mode])
      for (const v of f === "ions"
        ? ["unresolved", "li", "na", "k", "ca", "cu", "li,na,k,ca,cu"]
        : f === "concentration"
          ? ["99", "-1", "1..2"]
          : instrumentalChoices[f]) {
        if (v === r.expected[f]) continue;
        const bad = { ...b, [f]: v };
        expect(validBoard(model, bad)).toBe(true);
        expect(checkBoard(model, bad).correct).toBe(false);
        expect(bad[f]).toBe(v);
        choices++;
      }
    expect(validInstrumentalHistory(r.mode, record, [history[0], b])).toBe(
      false,
    );
    const other = Object.entries(instrumentalRecords).find(
      ([key, a]) => a.mode === r.mode && key !== record,
    )!;
    expect(validBoard(model, initialInstrumental(r.mode, other[0]))).toBe(
      false,
    );
    expect(validHistory(model, [initialInstrumental(r.mode, other[0])])).toBe(
      false,
    );
    expect(
      checkBoard(model, {
        ...initialInstrumental(r.mode, other[0]),
        ...other[1].expected,
      }).correct,
    ).toBe(false);
  }
  expect(choices).toBeGreaterThan(150);
});
test("quality and advantage conclusions remain specific to the actual comparisons", () => {
  for (const [record, fields] of [
    ["q-blank", { decision: "blank", reason: "background" }],
    ["q-settings", { decision: "freshStandards", reason: "conditions" }],
    ["q-range", { decision: "extendRange", reason: "outside" }],
    ["q-repeat", { decision: "repeat", reason: "precision" }],
    ["a-sensitive", { feature: "sensitive", reason: "sensitive" }],
    ["a-accurate", { feature: "accurate", reason: "accurate" }],
    ["a-rapid", { feature: "rapid", reason: "rapid" }],
  ] as const)
    expect(instrumentalRecords[record].expected).toEqual(fields);
  expect(
    checkInstrumental("quality", {
      ...initialInstrumental("quality", "q-repeat"),
      decision: "repeat",
      reason: "accurate",
    }).correct,
  ).toBe(false);
  expect(
    checkInstrumental("advantage", {
      ...initialInstrumental("advantage", "a-rapid"),
      feature: "sensitive",
      reason: "rapid",
    }).correct,
  ).toBe(false);
});
test("all authored answers, misconceptions and written self-reviews use honest marking", () => {
  let written = 0;
  for (const q of allInstrumentalTasks) {
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    if (q.rubric) {
      written++;
      expect(result.correct).toBe(false);
      expect(mark(q, "One valid advantage.").correct).toBe(false);
    }
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
  }
  expect(written).toBe(9);
  for (const s of ["p-oneadv", "cA-advantage", "vA-advantage"]) {
    const q = allInstrumentalTasks.find((q) => q.id.endsWith(s))!;
    expect(q.rubric!.join(" ")).toMatch(/concise|statement|enough/);
  }
});
test("progress accepts valid wrong histories, rejects source substitution and preserves malformed raw bytes", () => {
  const q = j.guided.find(
      (q) =>
        q.model?.kind === "instrumental-investigation" &&
        q.model.record === "s-na",
    )!,
    model = q.model!;
  const p = emptyProgress();
  p.work[lesson.slug] = emptyWork();
  p.work[lesson.slug].taskModels = {
    [q.id]: [initialBoard(model), { ...initialBoard(model), ions: "k" }],
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  p.work[lesson.slug].taskModels![q.id] = [
    initialInstrumental("spectrum", "s-k"),
  ];
  const raw = JSON.stringify(p);
  expect(decode(raw)).toBeNull();
  expect(raw).toContain('"record":"s-k"');
  for (const raw of [
    "{unreadable",
    JSON.stringify({
      ...p,
      work: {
        [lesson.slug]: {
          ...p.work[lesson.slug],
          taskModels: {
            [q.id]: [{ ...initialBoard(model), unknown: "unexpected" }],
          },
        },
      },
    }),
  ])
    expect(decode(raw)).toBeNull();
});
test("global exposure links legacy and exact repeated demands without equating every supplied reference", () => {
  for (const [legacy, s] of [
    [0, "p-fingerprint"],
    [1, "cB-sensitive"],
    [2, "cB-measurement"],
    [3, "vA-background"],
    [4, "r-positions"],
    [5, "p-limit"],
  ] as const) {
    expect(exposureIds(["instrumental-analysis-" + legacy])).toContain(
      "instrumental-analysis-v1-" + s,
    );
    expect(exposureIds(["instrumental-analysis-v1-" + s])).toContain(
      "instrumental-analysis-" + legacy,
    );
  }
  expect(exposureIds(["ion-tests-v1-g-mask"])).toContain(
    "instrumental-analysis-v1-cA-mask",
  );
  expect(exposureIds(["instrumental-analysis-v1-g-mixture"])).toContain(
    "instrumental-analysis-v1-p-cana",
  );
  expect(exposureIds(["instrumental-analysis-v1-g-na"])).not.toContain(
    "instrumental-analysis-v1-cA-li-k",
  );
  expect(exposureIds(["instrumental-analysis-v1-p-cal3"])).not.toContain(
    "instrumental-analysis-v1-cA-concentration",
  );
});
