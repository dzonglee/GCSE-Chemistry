import { test, expect } from "@playwright/test";
import {
  gasTestsJourney as j,
  allGasTasks,
  gasRecoveryRoutes,
} from "../src/content/journeys/gas-tests-journey";
import { gasTestCases, type GasMode } from "../src/lib/gas-tests-cases";
import {
  type GasBoard,
  initialGas,
  expectedGas,
  updateGas,
  gasFields,
  gasChoices,
  checkGas,
  validGasHistory,
} from "../src/lib/gas-tests-domain";
import {
  gasDrawingSources,
  initialGasDrawing,
  referenceGasDrawing,
  writeGasDrawing,
  readGasDrawing,
} from "../src/lib/gas-tests-drawing";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { mark, displayResponse, reviewSubject } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import {
  exposureIds,
  dueReview,
  emptyWork,
  emptyProgress,
  decode,
  REVIEW_DELAY,
  type Run,
} from "../src/lib/progress";
import { gasReservedRecords } from "../src/lib/gas-tests-givens";
import {
  makeGasApparatus,
  disposeGasApparatus,
} from "../src/lib/gas-tests-asset";
const lesson = lessons.find((l) => l.slug === "gas-tests")!;
test("the individual gas journey covers its original cases, specific recovery and sealed forms", () => {
  expect(lesson.journey).toBe(j);
  expect(allGasTasks).toHaveLength(81);
  expect(new Set(allGasTasks.map((q) => q.id)).size).toBe(81);
  expect([
    j.warmup.length,
    j.refresher.length,
    j.guided.length,
    j.practice.length,
  ]).toEqual([4, 17, 10, 26]);
  const bindings = new Set(
    allGasTasks
      .filter((q) => q.model)
      .map((q) => `${q.model!.mode}:${q.model!.record}`),
  );
  expect(bindings.size).toBe(39);
  for (const [mode, records] of Object.entries(gasTestCases))
    for (const r of records) expect(bindings.has(`${mode}:${r.id}`)).toBe(true);
  expect(j.practiceGroups.flatMap((g) => g.taskIds).sort()).toEqual(
    j.practice.map((q) => q.id).sort(),
  );
  for (const q of j.practice) {
    expect(gasRecoveryRoutes[q.id][0]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const form of [...j.checkForms, ...j.reviewForms])
    for (const q of form) expect(q.model).toBeUndefined();
  expect(j.checkForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    6, 6,
  ]);
  expect(j.reviewForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    2, 2,
  ]);
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => `gas-tests-${i}`),
  );
});
test("independent literal chemistry contracts distinguish starting state, contact, observation and gas", () => {
  for (const [record, material, placement] of [
    ["hydrogen-mouth", "burningSplint", "mouth"],
    ["oxygen-insert", "glowingSplint", "inside"],
    ["co2-delivery", "limewater", "belowLiquid"],
    ["chlorine-damp", "dampBlueLitmus", "gasContact"],
  ]) {
    const model = {
      kind: "gas-test-investigation" as const,
      mode: "procedure" as const,
      record,
    };
    expect(
      checkBoard(model, { ...initialBoard(model), material, placement })
        .correct,
    ).toBe(true);
    expect(
      checkBoard(model, {
        ...initialBoard(model),
        material: "unlitSplint",
        placement,
      }).correct,
    ).toBe(false);
  }
  expect(expectedGas("observation", "relight-record")).toEqual({
    observation: "relights",
    gas: "oxygen",
  });
  expect(expectedGas("identification", "exhaust-mixture").claim).toBe(
    "present",
  );
  expect(
    checkGas("identification", {
      ...initialGas("identification", "exhaust-mixture"),
      ...expectedGas("identification", "exhaust-mixture"),
      claim: "pureMixture",
    }).correct,
  ).toBe(false);
  expect(
    gasTestCases.faults.find((r) => r.id === "dry-litmus-negative")!.expected
      .ruledOut,
  ).toBe("no");
});
test("all 39 actual adapters preserve wrong proposals, enforce one-step histories and permit scoped reset", () => {
  let cases = 0,
    wrongChecks = 0;
  for (const mode of Object.keys(gasTestCases) as GasMode[])
    for (const source of gasTestCases[mode]) {
      const model = {
          kind: "gas-test-investigation" as const,
          mode,
          record: source.id,
        },
        z = initialGas(mode, source.id),
        history = [z];
      expect(initialBoard(model)).toEqual(z);
      expect(checkBoard(model, z).correct).toBe(false);
      for (const [field, value] of Object.entries(expectedGas(mode, source.id)))
        history.push(updateGas(mode, history.at(-1)!, field, value));
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, history.at(-1)!).correct).toBe(true);
      for (const field of gasFields[mode])
        for (const value of gasChoices(mode, field, source.id))
          if (value !== history.at(-1)![field]) {
            const wrong = updateGas(mode, history.at(-1)!, field, value);
            expect(checkBoard(model, wrong).correct).toBe(false);
            expect(wrong[field]).toBe(value);
            wrongChecks++;
          }
      expect(validHistory(model, [...history, z])).toBe(true);
      expect(validHistory(model, [z, { ...z, extra: "" }])).toBe(false);
      expect(validHistory(model, [z, { ...z, ...source.expected }])).toBe(
        false,
      );
      cases++;
    }
  expect(cases).toBe(39);
  expect(wrongChecks).toBe(495);
});
test("a different same-mode source cannot become the current task's saved board or correct answer", () => {
  for (const mode of Object.keys(gasTestCases) as GasMode[]) {
    const [a, b] = gasTestCases[mode],
      model = { kind: "gas-test-investigation" as const, mode, record: a.id },
      foreign = { ...initialGas(mode, b.id), ...expectedGas(mode, b.id) };
    expect(validBoard(model, foreign)).toBe(false);
    expect(validHistory(model, [initialBoard(model), foreign])).toBe(false);
    expect(checkBoard(model, foreign).correct).toBe(false);
  }
  const source = "hydrogen-mouth",
    z = initialGas("procedure", source);
  expect(validGasHistory("procedure", source, Array(501).fill(z))).toBe(false);
  expect(
    validBoard(
      { kind: "gas-test-investigation", mode: "procedure", record: source },
      { ...z, placement: "belowLiquid" },
    ),
  ).toBe(false);
});
test("asked-only feedback never invents correctness for unchosen fields", () => {
  const model = {
      kind: "gas-test-investigation" as const,
      mode: "procedure" as const,
      record: "hydrogen-mouth",
      focus: "material" as const,
    },
    b: GasBoard = { ...initialBoard(model), material: "burningSplint" };
  expect(checkBoard(model, b).correct).toBe(true);
  expect(checkBoard({ ...model, focus: "all" }, b).correct).toBe(false);
  expect(b.placement).toBe("");
});
test("all six diagrams start blank, preserve wrong labels and require honest self-review", () => {
  const drawings = allGasTasks.filter((q) => q.gasDrawing);
  expect(drawings).toHaveLength(6);
  for (const q of drawings) {
    const data = q.gasDrawing!,
      z = initialGasDrawing(data),
      blank = writeGasDrawing(data, z),
      wrong = {
        ...z,
        placement: "away",
        material: "Cold wood",
        observation: "A pop",
        conclusion: "Pure oxygen",
      },
      raw = writeGasDrawing(data, wrong);
    expect(z).toEqual({
      record: data.record,
      placement: "",
      material: "",
      observation: "",
      conclusion: "",
    });
    expect(mark(q, blank).empty).toBe(true);
    expect(mark(q, raw)).toMatchObject({
      correct: false,
      empty: false,
      selfReview: true,
    });
    expect(reviewSubject(q)).toBe("gas-test diagram");
    expect(readGasDrawing(raw, data)).toEqual(wrong);
    expect(displayResponse(q, raw)).toContain("Pure oxygen");
    expect(mark(q, "{bad").invalid).toBe(true);
    expect(referenceGasDrawing(data).conclusion).not.toBe(wrong.conclusion);
    expect(JSON.stringify(readGasDrawing(raw, data))).toBe(
      JSON.stringify(wrong),
    );
    expect(gasDrawingSources[data.record].mode).toBe(data.mode);
  }
  for (const q of allGasTasks.filter((q) => q.rubric && !q.gasDrawing))
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
});
test("progress decoding retains legacy work and validates the specific new source history", () => {
  const q = j.guided[0],
    model = q.model!,
    z = initialBoard(model),
    p = emptyProgress();
  p.work[lesson.slug] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 0 },
    taskModels: { [q.id]: [z, { ...z, material: "glowingSplint" }] },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  p.work[lesson.slug].taskModels![q.id] = [{ ...z, record: "oxygen-insert" }];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("all six legacy facts and revealed limewater identity lose fresh status while paired transfer stays separate", () => {
  for (const [legacy, suffix] of [
    [0, "cA-h-method"],
    [1, "cB-o-method"],
    [2, "cB-reagent-result"],
    [3, "vA-chlorine"],
    [4, "p-distinguish"],
    [5, "p-supervision"],
  ] as [number, string][]) {
    expect(exposureIds([`gas-tests-${legacy}`])).toContain(
      `gas-tests-v1-${suffix}`,
    );
    expect(exposureIds([`gas-tests-v1-${suffix}`])).toContain(
      `gas-tests-${legacy}`,
    );
  }
  for (const suffix of ["g-co2", "p-explain-liquid", "p-draw-co2", "p-mixture"])
    expect(exposureIds([`gas-tests-v1-${suffix}`])).toContain(
      "gas-tests-v1-cA-reagent",
    );
  expect(exposureIds(["gas-tests-v1-g-hydrogen"])).not.toContain(
    "gas-tests-v1-cA-pair",
  );
  expect(exposureIds(["gas-tests-v1-g-hydrogen"])).not.toContain(
    "gas-tests-v1-g-oxygen",
  );
});
test("reserved figures contain only original methods and results", () => {
  for (const records of Object.values(gasReservedRecords))
    for (const r of records) {
      expect(Object.keys(r).sort()).toEqual([
        "label",
        "material",
        "placement",
        "result",
      ]);
      expect(Object.isFrozen(r)).toBe(true);
      expect(r.result).not.toMatch(/hydrogen|oxygen|carbon dioxide|chlorine/i);
    }
});
test("review waits seven days from the latest actual submission", () => {
  const w = emptyWork(),
    now = 2 * REVIEW_DELAY,
    old: Run = {
      kind: "check",
      ids: j.checkForms[0].map((q) => q.id),
      index: 0,
      responses: {},
      started: 0,
      submitted: 0,
    };
  w.history = [old];
  expect(dueReview(w, now)).toBe(true);
  w.history.push({ ...old, submitted: now - REVIEW_DELAY + 1 });
  expect(dueReview(w, now)).toBe(false);
  expect(dueReview(w, now + 1)).toBe(true);
});
test("actual apparatus metadata preserves unknown and wrong choices without simulated observations", () => {
  for (const fields of [
    { material: "", placement: "" },
    { material: "glowingSplint", placement: "inside" },
  ]) {
    const b: GasBoard = {
        ...initialGas("procedure", "hydrogen-mouth"),
        ...fields,
      },
      root = makeGasApparatus(b);
    expect(root.userData).toMatchObject({
      record: b.record,
      material: b.material || null,
      placement: b.placement || null,
      units: "metres",
      observationsSimulated: false,
    });
    expect(root.userData).not.toHaveProperty("expected");
    expect(root.userData).not.toHaveProperty("result");
    disposeGasApparatus(root);
  }
});
